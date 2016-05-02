define([],function(){
  function CreateBind()
  {
    var _value = ""
      , _bindName = ""
      , _bindText = ""
      , _textMap = []
      , _startPos = 0
      , _attributes = {}

    function Bind()
    {

    }

    Bind.value = function(v)
    {
      if(typeof v === undefined)
      {
        return _value;
      }
      _value = (typeof v === 'string' ? v : _value);
      return Bind;
    }

    Bind.bindName = function(v)
    {
      if(typeof v === undefined)
      {
        return _bindName;
      }
      _bindName = (typeof v === 'string' ? v : _bindName);
      return Bind;
    }

    Bind.bindText = function(v)
    {
      if(typeof v === undefined)
      {
        return _bindText;
      }
      _bindText = (typeof v === 'string' ? v : _bindText);
      return Bind;
    }

    Bind.textMap = function(v)
    {
      if(typeof v === undefined)
      {
        return _textMap;
      }
      _textMap = (v.constructor.toString() === Array.toString() ? v : _textMap);
      return Bind;
    }

    Bind.bindStartPosition = function(v)
    {
      if(typeof v === undefined)
      {
        return _startPos;
      }
      _startPos = (typeof v === 'number' ? v : _startPos);
      return Bind;
    }

    Bind.attributes = function(v)
    {
      if(typeof v === undefined)
      {
        return _attributes;
      }
      _attributes = (typeof v === 'object' ? v : _attributes);
      return Bind;
    }

    return Bind;
  }
  return CreateBind;
});
