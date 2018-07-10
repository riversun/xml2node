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
},{"./XmlNode.js":3}],3:[function(require,module,exports){
var XmlNode =
    (function () {
        'use strict';

        function XmlNode(node) {
            this.node = node;
        }

        XmlNode.prototype.getTagName = function () {
            var me=this;
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

        XmlNode.prototype.hasChild = function (name) {
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


        return XmlNode;


    })();


module.exports = XmlNode;
},{}]},{},[1])(1)
});
