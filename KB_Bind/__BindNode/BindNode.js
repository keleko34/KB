define(['./__Bind'],function(CreateBind){
  function CreateBindNode()
  {
    var _node = {}
      , _Binds = []
      , _initialText = ""
      , _initialTextSplit = []
      , _isAttr = false
      , _startBind = "{{"
      , _endBind = "}}"

    function BindNode(node)
    {


    }

    BindNode.startBind = function(v)
    {
      if(v === undefined)
      {
        return _startBind;
      }
      _startBind = (typeof v === 'string' ? v : _startBind);
      return BindNode;
    }

    BindNode.endBind = function(v)
    {
      if(v === undefined)
      {
        return _endBind;
      }
      _endBind = (typeof v === 'string' ? v : _endBind);
      return BindNode;
    }

    BindNode.node = function()
    {
      return _node;
    }

    BindNode.Binds = function()
    {
      return _Binds;
    }

    BindNode.initialText = function()
    {
      return _initialText;
    }

    BindNode.initialTextSplit = function()
    {
      return _initialTextSplit;
    }

    BindNode.isAttr = function(v)
    {
      if(v === undefined)
      {
        return _isAttr;
      }
      _isAttr = !!v;
      return BindNode;
    }

    BindNode.getBindById = function(id)
    {
      return _Binds.map(function(k,i){
        return (k.bindName() !== id ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });
    }

    BindNode.updateCheck = function()
    {
      _Binds.forEach(function(k,i){
        k.call();
      });
    }

    return BindNode;
  }
  return CreateBindNode;
});
