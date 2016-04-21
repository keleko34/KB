# KB
DOM Attr Binding Library

IE 9+,Chrome,Firefox

This library allows for adding attribute/property change listeners

###### Install

`npm install KB`

###### Start

`var kb = CreateKB();` -- Creates new KB same as 'new Method();'
`kb.addAttrListener('innerHTML',function(e){console.log(e);});` -- Works in the same way as addEventListener
`kb.call();` -- Starts the listening, Constructor

###### Event Properties

- stopPropogration: (Function) stops all future added events from firing
- preventDefault: (Function) stops the attribute/property from changing
- value: (Any) The value that is trying to be set
- oldValue (Any) The current value that is set prior to change
- attr (String) the name of the attribute that changed
- target (DOM Node) the node that had the change happen

###### Methods

 - addAttrListener (*String 'Property',*Function Callback) Adds an event to the event chain for the change of that attribute
 - removeAttrListener (*String 'Property',*Function Callback) Removes event from event chain that matches
 - inject (*Object Object, *Function setFunction) injects object prototypes with the setFunction, includes prototype functions