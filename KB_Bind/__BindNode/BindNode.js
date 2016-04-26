define(['./__Bind'],function(CreateBind){
  function CreateBindNode()
  {
    var _node = {}
      , _Binds = []
      , _initialText = ""
      , _hasChildren = false
      , _children = []
      , _initialTextSplit = []
      , _hasAttrBinds = false
      , _startBind = "{{"
      , _endBind = "}}"

    function BindNode(node)
    {
      var checkTextContent = function(textContent,children)
      {
        if(textContent.indexOf(_startBind) > -1 && textContent.indexOf(_endBind) > -1)
        {

        }
      }


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

    BindNode.hasChildren = function()
    {
      return _hasChildren;
    }

    BindNode.children = function()
    {
      return _children;
    }

    BindNode.initialTextSplit = function()
    {
      return _initialTextSplit;
    }

    BindNode.hasAttributeBinds = function()
    {
      return _hasAttrBinds;
    }

    BindNode.getBindById = function(id)
    {
      return _Binds.map(function(k,i){
        return (k.bindName() !== id ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });
    }

    BindNode.refreshBinds = function()
    {
      _Binds.forEach(function(k,i){
        k.call();
      });
    }

    return BindNode;
  }
  return CreateBindNode;
});
