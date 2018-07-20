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