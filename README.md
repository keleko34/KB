# KB
DOM Attr/Property Binding Library - A library for Prototype Binding and Events!

IE 9+,Chrome,Firefox,Safari

This library allows for adding attribute/property change listeners on the front end

###### Install

`npm install KB`

###### Start
*note: order of operation does not matter, Methods are chainable, constructor can be called whenever, and script tag can be added anywhere*

    /* Creates new KB, same as 'new method();' */
    var kb = CreateKB();
    
    /* Pre Value Set */
    kb.addAttrListener('innerHTML',function(e){console.log(e);});
    
    /* Post Value Set */
    kb.addAttrUpdateListener('innerHTML',function(e){console.log(e);});
    
    /* Constructor */
    kb.call();

###### Use With DOM *Global*

    var kb = CreateKB();
    
    /* Binding to input value */
    var username = "";
    kb.addAttrListener('value',function(e){
      switch(e.target.name){
        case 'username':
          if(e.value === 'admin'){
            e.stopPropogration();
            e.preventDefault();
            return;
          };
          username = e.value;
        break;
      }
    });
    
    /* Filter innerHTML Changes */
    kb.addAttrListener('innerHTML',function(e){
      if(e.value.indexOf('fred') > -1){
        e.stopPropogation();
        e.prevemtDefault();
      }
    });
    
    /* Watch for appended elements */
    kb.addAttrUpdateListener('appendChild',function(e){
      console.log("DOM node: ",e.action);
    });
    
    /* Prevent class additions */
    kb.addAttrListener('class',function(e){
      if(e.target.getAttribute('id') === 'main'){
        e.preventDefault();
      }
    });
    
    kb.call();
    
###### Use With DOM *Element*

    var kb = CreateKB();
    
    var myNode = document.querySelector('#myNode'),
        myVar = myNode.innerHTML;
    
    /* Prevent class additions */
    myNode.addAttrListener('class',function(e){
      e.preventDefault();
    })
    .addAttrListener('className',function(e){
      e.preventDefault();
    });
    
    /* set variable to innerText of this node */
    myNode.addAttrUpdateListener('innerHTML',function(e){
      myVar = e.value;
    });
    
    kb.call();


###### Use With Custom Objects

    var kb = CreateKB();
    
    /* Custom Object */
    function myObject(){};
    myObject.prototype.add = function(a,b){return a+b;};
    
    /* Inject Prototype */
    kb.injectPrototypes(myObject);
    
    kb.addAttrListener('add',function(e){
      console.log('first #',e.arguments[0],'second #',e.arguments[1]);
      if(e.arguments[0] + e.arguments[1] === 10){
        e.preventDefault();
      }
    });
    
    kb.call();

    var calc = new myObject(); 
    calc.add(10,20);
    
    Logs: "first # 10 second # 20"

###### Event Properties

- stopPropogration: (Function) stops all future added listeners from firing on this event
- preventDefault: (Function) stops the attribute/property from changing *Pre Only*
- value: (Any) The value that is trying to be set
- oldValue (Any) The current value that is set prior to change
- attr (String) the name of the attribute that changed
- target (DOM Node) the node that had the change happen
- arguments (Argument Array) if attr is a function this the arguments that was passed to the function
- action: (Any) if attr is a function this is the outcome of that function *Post Only*

###### Methods

 addAttrListener (*String 'Property',Function Callback*)<br />
 **Adds an event to the event chain for the change of that attribute** *Pre Value Set*
 
 removeAttrListener (*String 'Property',Function Callback*)<br />
 **Removes event from the event chain that matches** *Pre Value Set*
 
 addAttrUpdateListener (*String 'Property',Function Callback*)<br />
 **Adds an event to the event chain for the post change of that attribute** *Post Value Set*
 
 removeAttrUpdateListener (*String 'Property',Function Callback*)<br />
 **Removes event from the event chain that matches in the post events** *Post Value Set*
 
 injectPrototypeProperty (*Function Constructor with  prototype, String 'key', Function set, Function update*)<br />
 **injects single property on the objects prototype, set and update are optional and will be applied as the set and update for entire Object Constructor, located in `.injected()`**
 
 injectPrototypes (*Function Constructor with prototype, Function set, Function update*)<br />
 **injects object constructor prototypes with the set Function, and update Function, functions optional, constructor will auto put defaults if none exist note* inject only works with `(function name(){})` type objects formats and not `(var name = function(){})` as these type functions are named as an empty string**
 
 injectedPrototypes ()<br />
 **returns an object of all injected objects**
 
#### Contributing

###### Build Tool *Gulp*

NPM: `npm i`<br />
CLI: `Gulp Build`<br />
Component `KB`