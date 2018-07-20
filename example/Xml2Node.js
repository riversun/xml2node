(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.Xml2Node = f()}})(function(){var define,module,exports;return (function(){function r(e,n,t){function o(i,f){if(!n[i]){if(!e[i]){var c="function"==typeof require&&require;if(!f&&c)return c(i,!0);if(u)return u(i,!0);var a=new Error("Cannot find module '"+i+"'");throw a.code="MODULE_NOT_FOUND",a}var p=n[i]={exports:{}};e[i][0].call(p.exports,function(r){var n=e[i][1][r];return o(n||r)},p,p.exports,r,e,n,t)}return n[i].exports}for(var u="function"==typeof require&&require,i=0;i<t.length;i++)o(t[i]);return o}return r})()({1:[function(require,module,exports){
var Xml2Node = require('./src/Xml2Node.js');
var XmlNode = require('./src/XmlNode.js');

module.exports = {
    Parser: Xml2Node,
    Node: XmlNode
};
},{"./src/Xml2Node.js":2,"./src/XmlNode.js":3}],2:[function(require,module,exports){
var XmlNode = require("./XmlNode.js");

var Xml2Node =
    (function () {
        'use strict';

        function Xml2Node(domParser) {
            this.parser = null;
            if (domParser) {
                this.parser = domParser;
            } else {
                this.parser = new DOMParser();
            }
        }


        /**
         * Parse specified XML text
         * @param xmlText XML text
         * @returns {{children: {}}}
         */
        Xml2Node.prototype.parseXML = function (xmlText, contentType) {
            var me = this;

            var doc;

            if (!contentType) {
                contentType = me.detectDocumentType(xmlText);
            }

            doc = me.parser.parseFromString(xmlText, contentType);

            var model = {};

            var firstElement;

            for (var i = 0; i < doc.childNodes.length; i++) {
                var tagName = doc.childNodes[i].nodeName;
                if (tagName && tagName != "#text" && tagName != "#comment") {
                    firstElement = doc.childNodes[i];
                    break;
                }
            }

            me._parseInternally(firstElement, model, {stack: [], index: []});

            return {
                children: model
            };
        };

        Xml2Node.prototype._parseInternally = function (element, model, parentElementModel) {
            var me = this;

            //model["body"]=[];
            //model["body"][0]={tagName:"body",value="hogehoge",children:[],attr={}};

            if (element.nodeName == "#comment") {
                //-if element node is comment node
                return;
            }

            if (element.nodeName == "#text") {
                //-if element node is text node

                var blankReplacedElementContent = element.textContent.replace(/ /g, '').replace(/\r?\n/g, '').replace(/\n/g, '').replace(/\t/g, '');
                if (blankReplacedElementContent.length == 0) {
                    //-if text node is empty

                } else {
                    //-if text node is not empty
                    var elementTextContent = me.removeUnnecessaryTail(element.textContent);

                    if (!parentElementModel.value) {
                        //- parentElement has only one child-text-node.
                        parentElementModel.value = elementTextContent;
                    } else {
                        //- parentElement has multiple child-text-node.
                        parentElementModel.value += ("\n" + elementTextContent);
                    }
                }


                return;
            }
            if (!model[element.tagName]) {
                model[element.tagName] = [];
            }

            var elementModel =
                {
                    tagName: null,
                    children: null,
                    attr: null
                };
            elementModel.tagName = element.tagName;

            model[element.tagName].push(elementModel);

            var elementHasValueOrChildren = false;

            for (var nodeIdx = 0; nodeIdx < element.childNodes.length; nodeIdx++) {
                if (element.childNodes[nodeIdx].nodeName == "#text") {

                    var blankReplacedElementContent = element.textContent.replace(/ /g, '').replace(/\r?\n/g, '').replace(/\n/g, '').replace(/\t/g, '');
                    if (blankReplacedElementContent.length == 0) {
                    } else {
                        //-if text node is not empty
                        elementHasValueOrChildren = true;
                    }

                }
                else if (element.childNodes[nodeIdx].nodeName == "#comment") {

                } else {
                    elementHasValueOrChildren = true;
                }
            }


            if (elementHasValueOrChildren) {
                elementModel.children = {};
            }
            // else {
            //     if (element.textContent && element.textContent.length > 0) {
            //         elementModel.value = element.textContent;
            //         return;
            //     }
            // }


            //start of handling attributes
            var attrsModel;


            if (element.attributes.length > 0) {
                attrsModel = {};
            }

            for (var i = 0; i < element.attributes.length; i++) {

                var attr = element.attributes[i];

                var attrModel = {
                    name: attr.name,
                    value: attr.textContent
                };

                if (!attrsModel[attrModel.name]) {
                    attrsModel[attrModel.name] = [];
                }
                attrsModel[attrModel.name].push(attrModel);

            }
            elementModel.attr = attrsModel;
            //end of handling attribute


            for (var i = 0; i < element.childNodes.length; i++) {
                var child = element.childNodes[i];
                me._parseInternally(child, elementModel.children, elementModel);
            }


        };

        /**
         * Do document type detection
         * @param xmlText
         * @returns {string}
         */
        Xml2Node.prototype.detectDocumentType = function (xmlText) {
            var me = this;
            var doc = me.parser.parseFromString(xmlText, "text/xml");

            var model = {};

            var firstElement;

            for (var i = 0; i < doc.childNodes.length; i++) {
                var tagName = doc.childNodes[i].nodeName;
                if (tagName && tagName != "#text" && tagName != "#comment") {
                    firstElement = doc.childNodes[i];
                    break;
                }
            }
            if ("html" === firstElement.tagName.toLowerCase()) {
                return "text/html";
            }
            return "text/xml";
        };

        /**
         * Remove unncessary space or newline chars
         * @param text
         * @returns {string}
         */
        Xml2Node.prototype.removeUnnecessaryTail = function (text) {
            var textLen = text.length;
            var tailIndex = textLen;
            for (var charIdx = textLen - 1; charIdx >= 0; charIdx--) {
                var charAtIdx = text.charAt(charIdx);
                if (charAtIdx == ' ' || charAtIdx == '\n' || charAtIdx == '\r') {
                    //- if space or new line
                } else {
                    //- if concrete char
                    tailIndex = charIdx;
                    break;
                }

            }
            var resultText = text.substr(0, tailIndex + 1);

            return resultText;

        };
        Xml2Node.prototype.generateExampleSourceCode = function (xmlText) {
            var me = this;
            var jsObject = me.parseXML(xmlText);
            var node = new XmlNode(jsObject);

            var hintCodeBase =
                "var parser = new Xml2Node.Parser();\n" +
                "var jsObject = parser.parseXML(xml);\n" +
                "var node=new Xml2Node.Node(jsObject);\n";


            var hint = {stack: [], hintCode: hintCodeBase};

            me._generateExampleSourceCode(node, hint);

            return hint.hintCode;

        };

        /**
         * Generate an example of parsing XML into JS code.
         * @param node
         * @param hint
         * @private
         */
        Xml2Node.prototype._generateExampleSourceCode = function (node, hint) {
            var me = this;

            var printWithValue = true;

            var hintCodePrefix = "console.log(node";
            var hintCodeSuffix = ");";

            var tagNames = node.getChildTagNames();


            for (var idx = 0; idx < tagNames.length; idx++) {

                var childTagName = tagNames[idx];


                var childCount = node.getNumOfChildren(childTagName);


                for (var i = 0; i < childCount; i++) {


                    var childNode = node.get(childTagName, i);


                    var hintStr = ".get(\"" + childNode.getTagName() + "\"";
                    if (childCount - 1 > 0) {
                        hintStr += "," + i + "";
                    }
                    hintStr += ")";


                    hint.stack.push(hintStr);

                    var _tmpStr = "";
                    for (var j in hint.stack) {
                        _tmpStr += hint.stack[j];
                    }

                    //start of handling attribute
                    var childNodeAttrNames = childNode.getAttrNames();
                    if (childNodeAttrNames.length > 0) {
                        for (var attrIdx in childNodeAttrNames) {
                            var childNodeAttrName = childNodeAttrNames[attrIdx];
                            var attrStr = hintCodePrefix + _tmpStr + '.attr("' + childNodeAttrName + '")';
                            attrStr += hintCodeSuffix;
                            if (printWithValue) {
                                attrStr += " // -> " + '"' + childNode.attr(childNodeAttrName) + '"';
                            }

                            //add attribute showing code
                            hint.hintCode += attrStr + "\n";

                        }
                    }

                    if ((typeof(childNode.value()) !== "undefined")) {

                        var valueStr = hintCodePrefix + _tmpStr + ".value()";
                        valueStr += hintCodeSuffix;
                        if (printWithValue) {
                            valueStr += " // -> " + '"' + childNode.value() + '"';
                        }

                        //add value showing code
                        hint.hintCode += valueStr + "\n";

                    }

                    me._generateExampleSourceCode(childNode, hint);

                    hint.stack.pop();

                }

            }


        };

        return Xml2Node;


    })();

module.exports = Xml2Node;
},{"./XmlNode.js":3}],3:[function(require,module,exports){
var XmlNode =
    (function () {
        'use strict';

        function XmlNode(node) {
            this.node = node;
        }

        XmlNode.prototype.getTagName = function () {
            var me = this;
            return me.node.tagName;
        };

        XmlNode.prototype.get = function (name, index) {
            var me = this;

            var targetArray;

            if (me.node.children && me.node.children[name]) {
                targetArray = me.node.children[name];
            } else {
                targetArray = [{value: "PARSER_ERROR"}];
            }

            if (typeof index === "undefined") {
                return new XmlNode(targetArray[0]);
            } else {
                return new XmlNode(targetArray[index]);
            }
        };

        XmlNode.prototype.getChildTagNames = function () {
            var me = this;
            var tagNames = [];
            for (var key in me.node.children) {

                tagNames.push(key);
            }

            return tagNames;
        }

        XmlNode.prototype.getNumOfChildren = function (name) {
            var me = this;
            if (me.node.children && me.node.children[name]) {
                return me.node.children[name].length;
            } else {
                return -1;
            }
        };


        XmlNode.prototype.hasChildOf = function (name) {
            var me = this;
            return (me.getNumOfChildren(name) > 0);
        };

        XmlNode.prototype.value = function () {
            var me = this;
            return me.node.value;
        };


        XmlNode.prototype.attr = function (name, index) {
            var me = this;

            if (me.hasAttr(name)) {
                if (typeof index === "undefined") {
                    return me.node.attr[name][0].value;
                } else {
                    return me.node.attr[name][index].value;
                }
            } else {
                return;
            }
        };
        XmlNode.prototype.hasAttr = function (name) {

            var me = this;

            if (me.node.attr && me.node.attr[name]) {
                return true;
            }
            return false;
        };

        XmlNode.prototype.getAttrNames = function () {
            var me = this;
            var attrNames = [];
            if (me.node.attr) {
                for (var key in me.node.attr) {
                    attrNames.push(key);
                }
            }
            return attrNames;

        };


        return XmlNode;


    })();


module.exports = XmlNode;
},{}]},{},[1])(1)
});
