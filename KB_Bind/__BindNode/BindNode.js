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
      , _pipedAttributes = {}

    function BindNode(node)
    {
      _node = node;
      _initialText = node.textContent;
      if(_isAttr)
      {
        _initialText = node.value;
      }
      _textMap = BindNode.splitBind(_initialText);

      _textMap.map(function(k,i){
        if(typeof k === 'string' && k.indexOf(_startBind) > -1 && k.indexOf(_endBind) > -1)
        {
          _Binds.push(CreateBind().bindName(k.split('|')[0].replace(_startBind,'').replace(/\s/g,''))
          .bindStartPosition((_isAttr ? _node.value : _node.textContent).indexOf(k))
          .bindText(k)
          .textMap(_textMap)
          .attributes(k.split('|')[1].replace(_endBind,"").split(';').filter(function(d,x){
            return (d.length > 0);
          }).reduce(function(ret,d,x,a){
            ret[d.split('=')[0]] = d.split('=')[1];
            return ret;
          }),{}));
          if(_isAttr)
          {
            _node.value = _Binds[_Binds.length-1].value();
          }
          else
          {
            _node.textContent = _Binds[_Binds.length-1].value();
          }
          return _Binds[_Binds.length-1];
        }
        return k;
      });
      _updatedText = (_isAttr ? _node.value : _node.textContent);
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

    BindNode.pipedAttributes = function(v)
    {
      if(v === undefined)
      {
        return _pipedAttributes;
      }
      _pipedAttributes = (typeof v === 'object' ? v : _pipedAttributes);
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


    //rules for checking, if value still exists we move binds position,if bind has been deleted, we check if one has been added to the same pos, if the same pos was a move
    //we can attach to the value of the opposite of the move eg bind at pos 3 move from 4 to 3, we check pos 2 if it was an add, if so this is the new bind else if deleted
    //bind was unsynced, can be synced again by adding bind

    BindNode.compareCheck = function()
    {
      var diff = _diff(_textMap,(_isAttr ? _node.value : _node.textContent));
      console.log(diff);
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
