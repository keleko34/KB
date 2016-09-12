define([],function(){

  var _templates = {},
      _unkownTemplateListeners = [],
      _reNodes = /(<\/.*?>)/g,
      _timeout = 5000;

  function getUnkownTemplates(template)
  {
    var matched = template.match(_reNodes);
    return matched.map(function(k){
      return k.replace(/[<\/>]/g,"");
    })
    .filter(function(k,i){
      return (document.createElement(k) instanceof HTMLUnknownElement && matched.indexOf(k,(i+1) === -1) && _templates[k] === undefined);
    });
  }

  function onUnownTemplate(names,template,name,cb)
  {
    var _total = names.length,
        _count = 0;
    function count()
    {
      _count += 1;
      if(_count === _total)
      {
        cb();
      }
    }

    function timer()
    {
      var self = this;
      if(self.timeout >= _timeout)
      {
        count();
        console.warn("A timeout has occured when attempting to listen for callback on ",self.component," unkown component listener");
      }
      return setTimeout(function(){
        timer.call(self);
      },1);
    }

    for(var x=0,len=names.length;x<len;x++)
    {
      var e = {callback:count,component:names[x],template:template,name:name,timeout:0};

      timer.call(e);

      for(var i=0,lenn=_unkownTemplateListeners.length;i<lenn;i++)
      {
        _unkownTemplateListeners[x](e);
      }
    }
  }

  function templates()
  {

    return templates;
  }

  templates.isRegistered =  function(name)
  {
    return (_templates[name] !== undefined);
  }

  templates.register = function(name,template)
  {
    if(_templates[name] === undefined)
    {
      var unkown = getUnkownTemplates(template);
      if(unkown.length !== 0){
        onUnownTemplate(unkown,template,name,function(){
          _templates[name] = template;
        });
      }
      else
      {
        _templates[name] = template;
      }
    }
    else
    {
      console.error('A template with the name',name,' already exists');
    }
    return templates;
  }

  templates.getTemplate = function(name)
  {
    return _templates[name];
  }

  templates.addUnkownElementListener = function(func)
  {
    if(typeof func === 'function') _unkownTemplateListeners.push(func);
    return templates;
  }

  templates.removeUnkownElementListener = function(func)
  {
    for(var x=0,len=_unkownTemplateListeners.length;x<len;x++)
    {
      if(_unkownTemplateListeners[x].toString() === func.toString())
      {
        _unkownTemplateListeners.splice(x,1);
        return templates;
      }
    }
    return templates;
  }

});
