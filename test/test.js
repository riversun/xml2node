var assert = require('assert');
var DOMParser = require('xmldom').DOMParser;
var Xml2Node = require('../src/Xml2Node.js');
var XmlNode = require('../src/XmlNode.js');


var xml =
    '<html>\n' +
    '    <body version="2.0">\n' +
    '        <!--StartFragment-->\n' +
    '        <ul>\n' +
    '            <li>Today\'s menu\n' +
    '                <ul>\n' +
    '                    <li>Pasta</li>\n' +
    '                    <li>Pizza</li>\n' +
    '                </ul>\n' +
    '            </li>\n' +
    '            <li>Today\'s Drink\n' +
    '                <ul>\n' +
    '                    <li>Sake</li>\n' +
    '                    <li>Orange juice</li>\n' +
    '                    <li>Glass of water</li>\n' +
    '                    <li>Special Drink\n' +
    '                        <ul>\n' +
    '                            <li power="200">Green Water</li>\n' +
    '                            <li power="500">Red Water</li>\n' +
    '                        </ul>\n' +
    '                    </li>\n' +
    '                </ul>\n' +
    '            </li>\n' +
    '        </ul>\n' +
    '        <!--EndFragment-->\n' +
    '    </body>\n' +
    '</html>';

var parser = new Xml2Node(new DOMParser());
var jsObject = parser.parseXML(xml);
var node = new XmlNode(jsObject);

describe('xml2node', function () {

    describe('node', function () {

        it('xml attribute', function () {
            assert.strictEqual(node.get("html").get("body").attr("version"), "2.0");
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).get("ul").get("li", 3).get("ul").get("li", 0).attr("power"), "200");
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).get("ul").get("li", 3).get("ul").get("li", 1).attr("power"), "500");

        });

        it('xml element placed on child element', function () {
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 0).value(), "Today's menu")
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).value(), "Today's Drink")
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).get("ul").get("li", 0).value(), "Sake")
        });

        it('xml element placed normally', function () {
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 0).get("ul").get("li", 0).value(), "Pasta")
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 0).get("ul").get("li", 1).value(), "Pizza")

            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).get("ul").get("li", 1).value(), "Orange juice")
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).get("ul").get("li", 2).value(), "Glass of water")
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).get("ul").get("li", 3).value(), "Special Drink")

            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).get("ul").get("li", 3).get("ul").get("li", 0).value(), "Green Water")
            assert.strictEqual(node.get("html").get("body").get("ul").get("li", 1).get("ul").get("li", 3).get("ul").get("li", 1).value(), "Red Water")

        });
    });

});