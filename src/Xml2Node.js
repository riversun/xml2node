var XmlNode = require("./XmlNode.js");

var Xml2Node =
    (function () {
        'use strict';

        function Xml2Node() {
            this.parser = new DOMParser();

        }

        Xml2Node.prototype.createHint = function (xmlText) {
            var me = this;
            var jsObject = me.parseXML(xmlText);
            var node = new XmlNode(jsObject);
            me._createHintInternally(node, {stack: []});

        };
        Xml2Node.prototype._createHintInternally = function (node, hint) {
            var me = this;

            var tagNames = node.getChildTagNames();


            for (var idx = 0; idx < tagNames.length; idx++) {

                var childTagName = tagNames[idx];

                var childCount = node.getNumOfChildren(childTagName);


                for (var i = 0; i < childCount; i++) {


                    var childNode = node.get(childTagName, i);


                    var hintStr = ".get(" + childNode.getTagName()
                    if (childCount - 1 > 0) {
                        hintStr += "[" + i + "]";
                    }
                    hintStr += ")";

                    hint.stack.push(hintStr);

                    var str = "";
                    for (var j in hint.stack) {
                        str += hint.stack[j];
                    }

                    console.log(str);

                    me._createHintInternally(childNode, hint);

                    hint.stack.pop();

                }

            }


        }

        /**
         * 指定されてxmlテキストをパースする
         * @param xmlText XMLテキスト
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

        return Xml2Node;


    })();

module.exports = Xml2Node;