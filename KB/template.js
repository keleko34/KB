define([],function(){

  var _templates = {},
      _reNodes = /(<\/.*?>)/g;

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

  function templates()
  {

    return templates;
  }

  templates.checkUnkownElements = getUnkownTemplates;

  templates.isRegistered =  function(name)
  {
    return (_templates[name] !== undefined);
  }

  templates.register = function(name,template)
  {
    if(_templates[name] === undefined)
    {
      _templates[name] = template;
    }
    else
    {
      console.error('A template with the name',name,' already exists');
    }
    return getUnkownTemplates(template);
  }

  templates.getTemplate = function(name)
  {
    return _templates[name];
  }
  return templates;
});
