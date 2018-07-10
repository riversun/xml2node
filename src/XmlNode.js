
var XmlNode =
    (function () {
        'use strict';

        function XmlNode(node) {
            this.node = node;
        }

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

        XmlNode.prototype.numOfChildren = function (name) {
            var me = this;
            if (me.node.children && me.node.children[name]) {
                return me.node.children[name].length;
            } else {
                return -1;
            }
        };

        XmlNode.prototype.hasChild = function (name) {
            var me = this;
            return (me.numOfChildren(name) > 0);
        };

        XmlNode.prototype.value = function (name) {
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