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

        function Xml2Node() {
            this.parser = new DOMParser();

        }

        /**
         * Parse specified XML text
         * @param xmlText XML text
         * @returns {{children: {}}}
         */
        Xml2Node.prototype.parseXML = function (xmlText) {
            var me = this;

            var doc = me.parser.parseFromString(xmlText, "text/xml");

            var model = {};
            me._parseInternally(doc.children[0], model, {stack: [], index: []});

            return {
                children: model
            };
        };

        Xml2Node.prototype._parseInternally = function (element, model) {
            var me = this;

            if (!model[element.tagName]) {
                model[element.tagName] = [];
            }

            var elementModel = {};
            elementModel.tagName = element.tagName;

            model[element.tagName].push(elementModel);


            var isIndependentNode = !(element.children.length > 0);

            if (isIndependentNode) {
                if (element.textContent && element.textContent.length > 0) {
                    elementModel.value = element.textContent;
                }
            } else {
                elementModel.children = {};
            }


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


            for (var i = 0; i < element.children.length; i++) {

                var child = element.children[i];
                me._parseInternally(child, elementModel.children);
            }
            //


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
                                attrStr += " // -> " + childNode.attr(childNodeAttrName);
                            }


                            //add attribute showing code
                            hint.hintCode += attrStr + "\n";

                        }
                    }
                    if (childNode.getChildTagNames().length == 0 && (typeof(childNode.value()) !== "undefined")) {

                        var valueStr = hintCodePrefix + _tmpStr + ".value()";
                        valueStr += hintCodeSuffix;
                        if (printWithValue) {
                            valueStr += " // ->" + childNode.value();
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
