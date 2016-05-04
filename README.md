# KB
DOM Attr/Property Binding Library - A library for Prototype Binding and Events!

IE 9+,Chrome,Firefox,Safari

This library allows for adding attribute/property change listeners on the front end

###### Install

`npm install KB`

###### Start

`var kb = CreateKB();` -- Creates new KB same as 'new Method();'

`kb.addAttrListener('innerHTML',function(e){console.log(e);});` -- Works in the same way as addEventListener //prevalueset

`kb.addAttrUpdateListener('innerHTML',function(e){console.log(e);});` -- Works in the same way as addEventListener //postvalueset

`kb.call();` -- Starts the listening, Constructor

###### Use With DOM

`var kb = CreateKB();'

`var username = "";`

`/* bind username value */` -- Set username var to the value in the field, if value is admin prevent the set
`kb.addAttrListener('value',function(e){if(e.value === 'admin'){e.stopPropogration();e.preventDefault();return;};if(e.target.name === 'username'){username = e.value;}});`

`/* filter name changes in html */` -- If added HTML contains fred, stop the set
`kb.addAttrListener('innerHTML',function(e){if(e.value.indexOf('fred') > -1){e.stopPropogation();e.prevemtDefault();}});`

`/* Watch for DOM additions */` -- Log all added dom nodes using appendChild
`kb.addAttrUpdateListener('appendChild',function(e){console.log("DOM node: ",e.action);})`

`/* Watch for class changes */` -- If element thats class is changing has an id of main prveent all class changes
`kb.addAttrListener('class',function(e){if(e.target.getAttribute('id') === 'main'){e.preventDefault();});`

`kb.call();`

###### Use With Custom Objects

`var kb = CreateKB();`

`function myObject(){};`

`myObject.prototype.add = function(a,b){return a+b;};`

`kb.inject(myObject);`

`/* listen to add method */` -- Log add method argumetns when ran, if argument 0 conatins 5 prevent method from running
`kb.addAttrListener('add',function(e){console.log('first #',e.arguments[0],'second #',e.arguments[1]);if(e.arguments[0] === 5){e.preventDefault();}})`

`kb.call();`

`var calc = new myObject(); calc.add(10,20);`
`Logs: "first # 10 second # 20"`

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
 - removeAttrListener (*String 'Property',*Function Callback) Removes event from the event chain that matches //prevalueset
 - addAttrUpdateListener (*String 'Property',*Function Callback) Adds an event to the event chain for the post change of that attribute //postvalueset
 - removeAttrUpdateListener (*String 'Property',*Function Callback) Removes event from the event chain that matches in the post events //postvalueset
 - injectproperty (*Function Constructor w/prototype, *String key, *Function set, *Function update) injects single property on the objects prototype, set and update are optional and will be applied as the set and update for entire Object Constructor, located in .injected()
 - inject (*Function Constructor w/prototype, *Function set, *Function update) injects object constructor prototypes with the set Function, and update Function, functions optional, constructor will auto put defaults if none exist note* inject only works with (function name(){}) type objects formats and not (var name = function(){}) as these type functions are named as "";
 - injected () returns an object of all injected objects