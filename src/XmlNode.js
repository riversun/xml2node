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