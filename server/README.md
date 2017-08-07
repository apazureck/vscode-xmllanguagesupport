# README

This is an xml language server providing

1. Well-Formed XMl Checks
1. XSD Schema validation

Language features it provides for xml and xsd files:

1. Diagnostics based on xsd files
1. Code Actions, if possible
1. Code Completion for elements and attributes
1. Hover Provider for elements, attributes and their values

This server is not covering the whole XSD spec, but will be extended in the future. See the changelog of the client project to see al changes made on the server.

The linter is trying to be as close to the W3C recommendations as possible. Check out the W3C recommendations on [the W3C website](https://www.w3.org/TR/xmlschema-0/)

## Parsing

This language server contains a custom XML parser, which is coded with the goal to provide as much information as possible on the xml structure. This means it will neither be fast nor memory saving and may be very slow on large files (xsd as well as xml). It is written entirely in typescript, but if you like to use this parser just compile it and use the js output. It uses ES5 language features, too.

### Architecture

The parser can be created with an XML string and will split the document in XML Elements using regex. Thus the parser always returns one root element (XML does not allow multiple root elements). See parsertests.ts for more information how to use the parser.

The parser creates XML Element classes, which contain information about

1. The absoulte location of the element (start/end)
1. Its parent
1. Its closing/opening tag
1. Its children (if not self closing or closing tag)
1. Its content (as string representation)
1. Its type
1. Its attributes



## Linting