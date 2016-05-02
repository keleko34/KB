# KB
DOM Attr Binding Library

IE 9+,Chrome,Firefox,Safari

This library allows for adding attribute/property change listeners on the front end

###### Install

`npm install KB`

###### Start

`var kb = CreateKB();` -- Creates new KB same as 'new Method();'

`kb.addAttrListener('innerHTML',function(e){console.log(e);});` -- Works in the same way as addEventListener //prevalueset

`kb.addAttrUpdateListener('innerHTML',function(e){console.log(e);});` -- Works in the same way as addEventListener //postvalueset

`kb.call();` -- Starts the listening, Constructor

###### Event Properties

- stopPropogration: (Function) stops all future added listeners from firing on this event
- preventDefault: (Function) stops the attribute/property from changing //preonly
- value: (Any) The value that is trying to be set
- oldValue (Any) The current value that is set prior to change
- attr (String) the name of the attribute that changed
- target (DOM Node) the node that had the change happen
- arguments (Argument Array) if attr is a function this the arguments that was passed to the function
- action: (Any) if attr is a function this is the outcome of that function //postonly

###### Methods

 - addAttrListener (*String 'Property',*Function Callback) Adds an event to the event chain for the change of that attribute //prevalueset
 - removeAttrListener (*String 'Property',*Function Callback) Removes event from event chain that matches //prevalueset
 - addAttrUpdateListener (*String 'Property',*Function Callback) Adds an event to the event chain for the post change of that attribute //postvalueset
 - removeAttrUpdateListener (*String 'Property',*Function Callback) Removes event from event chain that matches in the post events //postvalueset
 - inject (*Object Object, *Function setFunction) injects object prototypes with the setFunction, includes prototype functions
 - injected () returns an array of all injected objects