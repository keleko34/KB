define(['./__Bind','./__Diff'],function(CreateBind,CreateDiff){
  function CreateBindNode()
  {
    var _node = {}
      , _Binds = []
      , _initialText = ""
      , _textMap = []
      , _updatedText = ""
      , _isAttr = false
      , _startBind = "{{"
      , _endBind = "}}"
      , _diff = CreateDiff()

    function BindNode(node)
    {
      _node = node;
      _initialText = node.textContent;
      if(_isAttr)
      {
        _initialText = node.value;
      }
      _textMap = BindNode.splitBind(_initialText);

      _textMap.forEach(function(k,i){
        if(k.indexOf(_startBind) > -1 && k.indexOf(_endBind) > -1)
        {
          _Binds.push(CreateBind().bindName(k.split('|')[0].replace(_startBind,'').replace(/\s/g,''))
          .bindStartPosition((_isAttr ? _node.value : _node.textContent).indexOf(k))
          .bindText(k)
          .attributes(k.split('|')[1].replace(_endBind).split(';').filter(function(d,x){
            return (d.length > 0);
          }).map(function(d,x){
            var ret = {};
            ret[d.split('=')[0]] = d.split('=')[1];
            return ret;
          })));
          if(_isAttr)
          {
            _node.value = _Binds[_Binds.length-1](_node.value);
          }
          else
          {
            _node.textContent = _Binds[_Binds.length-1](_node.textContent);
          }
        }
      });
      _updatedText = (_isAttr ? _node.value : _node.textContent);
      /// currently working on mapping objects to text spots:
      _textMap.map(function(k,i){
        return (k.indexOf(_startBind) > -1 && k.indexOf(_endBind) ? BindNode.getBindById(k.split('|')[0].replace(_startBind,'').replace(/\s/g,'')) : k);
      });
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

    BindNode.splitBind = function(t)
    {
      return Array.prototype.concat.apply([],t.split(_startBind).map(function(k,i){
        return (k.indexOf(_endBind) > -1 ? (_startBind+k).split(_endBind).map(function(d,x){
          return (d.indexOf(_startBind) > -1 ? d+_endBind : d);
        }) : k);
      })).filter(function(k,i){
        return (k.length > 0);
      });
    }

    BindNode.getBindById = function(id)
    {
      return _Binds.map(function(k,i){
        return (k.bindName() !== id ? null : k);
      }).filter(function(k,i){
        return (k !== null);
      });
    }

    BindNode.compareCheck = function()
    {
      var diff = _diff(_textMap,(_isAttr ? _node.value : _node.textContent));
    }

    BindNode.updateCheck = function()
    {
      var curText = _initialText;
      _Binds.forEach(function(k,i){
        curText = k(curText,(_isAttr ? _node.value : _node.textContent));
      });
    }



    return BindNode;
  }
  return CreateBindNode;
});
