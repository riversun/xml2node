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

        Xml2Node.prototype._parseInternally = function (element, model, parentElementModel) {
            var me = this;

            //model["body"]=[];
            //model["body"][0]={tagName:"body",value="hogehoge",children:[],attr={}};

            if (!model[element.tagName]) {
                model[element.tagName] = [];
            }


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
                    parentElementModel.value = element.textContent;
                }


                return;
            }

            var elementModel =
                {
                    tagName: null,
                    children: null,
                    attr: null
                };
            elementModel.tagName = element.tagName;

            model[element.tagName].push(elementModel);


            var elementHasValueOrChildren = (element.children.length > 0);

            if (elementHasValueOrChildren) {
                elementModel.children = {};
            } else {
                if (element.textContent && element.textContent.length > 0) {
                    elementModel.value = element.textContent;
                    return;
                }
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


            for (var i = 0; i < element.childNodes.length; i++) {
                var child = element.childNodes[i];
                me._parseInternally(child, elementModel.children, elementModel);
            }


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

                    if ((typeof(childNode.value()) !== "undefined")) {

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