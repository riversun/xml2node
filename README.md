# Overview
'xml2node' is simple XML parser for javascript allows you to parse XML into JS and access values/attributes easily.

It is licensed under [MIT license](https://opensource.org/licenses/MIT).

# Quick start
## Access element of XML values/attributes like as follows.


### Example input-XML
```XML
<?xml version="1.0" encoding="utf-8"?>
<opml version="2.0">
  <head>
    <title>Original Title</title>
    <flavor>RSS Example App</flavor>
    <source>https://example.com</source>
  </head>
  <body>
    <outline text="Greeting">
      <outline text="We say good morning in the morning."/>
      <outline text="We say hello at noon."/>
      <outline text="We say good evening at night."/>
    </outline>
    <outline text="Thank">
      <outline text="Thank you."/>
      <outline text="Appreciate it."/>
    </outline>
  </body>
</opml>
```

You can access XML values/attributes like this.
```JavaScript
var parser = new Xml2Node.Parser();
var jsObject = parser.parseXML(xmlText);
var node=new Xml2Node.Node(jsObject);
console.log(node.get("opml").attr("version")); // -> 2.0
console.log(node.get("opml").get("head").get("title").value()); // ->Original Title
console.log(node.get("opml").get("head").get("flavor").value()); // ->RSS Example App
console.log(node.get("opml").get("head").get("source").value()); // ->https://example.com
console.log(node.get("opml").get("body").get("outline",0).attr("text")); // -> Greeting
console.log(node.get("opml").get("body").get("outline",0).get("outline",0).attr("text")); // -> We say good morning in the morning.
console.log(node.get("opml").get("body").get("outline",0).get("outline",1).attr("text")); // -> We say hello at noon.
console.log(node.get("opml").get("body").get("outline",0).get("outline",2).attr("text")); // -> We say good evening at night.
console.log(node.get("opml").get("body").get("outline",1).attr("text")); // -> Thank
console.log(node.get("opml").get("body").get("outline",1).get("outline",0).attr("text")); // -> Thank you.
console.log(node.get("opml").get("body").get("outline",1).get("outline",1).attr("text")); // -> Appreciate it.

```

