define([],function(){
  function CreateDiff()
  {
    function Diff(o,n)
    {
      //o = o.replace(/\s+$/,'');
      //n = n.replace(/\s+$/,'');

      o = (typeof o === 'string' ? (o == "" ? [] : o.split(/\s+/)) : o);
      n = (typeof n === 'string' ? (n == "" ? [] : n.split(/\s+/)) : n);

      return Diff.diffString(o,n);
    }

    Diff.convertWordArrToObj = function(arr,otherStr)
    {
      return arr.reduce(function(o,v,i){
       o[v] = (o[v] === undefined ? Object.defineProperty({rows:[i]},otherStr,{value:null,writable:true}) : (o[v].rows.push(i) ? o[v] : Object.defineProperty({rows:[i]},otherStr,{value:null,writable:true})));
       return o;
      },{});
    }

    Diff.diffString = function(o,n)
    {
      var ns = Diff.convertWordArrToObj(n,'o'),
          os = Diff.convertWordArrToObj(o,'n'),
          i = 0,
          valn = "",
          valo = "",
          isBind = false;

      Object.keys(ns).forEach(function(k){
        if ( ns[k].rows.length == 1 && typeof(os[k]) != "undefined" && os[k].rows.length == 1 ) {
          isBind = (typeof n[ns[k].rows[0]] === 'string');
          valn = (typeof n[ns[k].rows[0]] === 'string' ? n[ns[k].rows[0]] : n[ns[k].rows[0]].value());
          valo = (typeof o[os[k].rows[0]] === 'string' ? o[os[k].rows[0]] : o[os[k].rows[0]].value());
          n[ns[k].rows[0]] = { text: valn, row: os[k].rows[0], bind:(isBind ? n[ns[k].rows[0]] : undefined) };
          o[os[k].rows[0]] = { text: valo, row: ns[k].rows[0], bind:(isBind ? o[os[k].rows[0]] : undefined) };
        }
      });

      for (i=0;i< n.length-1;i+=1)
      {
        if ( n[i].text != null && n[i+1].text == null && n[i].row + 1 < o.length && o[ n[i].row + 1 ].text == null && n[i+1] == o[ n[i].row + 1 ] )
        {
          n[i+1] = { text: n[i+1], row: n[i].row + 1 };
          o[n[i].row+1] = { text: o[n[i].row+1], row: i + 1 };
        }
      }

      for (i=n.length-1;i>0;i-=1)
      {
        if ( n[i].text != null && n[i-1].text == null && n[i].row > 0 && o[ n[i].row - 1 ].text == null && n[i-1] == o[ n[i].row - 1 ] )
        {
          n[i-1] = { text: n[i-1], row: n[i].row - 1 };
          o[n[i].row-1] = { text: o[n[i].row-1], row: i - 1 };
        }
      }
      console.log(o,n);
      //no closures!!!
      return Array.prototype.concat.apply([],[o,n])
      .map(function(k,i){
        return (i < (o.length) ?
                {pos:i,change:(typeof k === 'string' && (n[i] !== k) ? 'delete' : 'none'),value:(typeof k === 'string' ? k : k.text),rowObj:(typeof k === 'object' ? k : null)} :
                {pos:(i-(o.length)),change:(typeof k === 'string' && (o[i-(o.length)] !== k) ? 'add' : 'none'),value:(typeof k === 'string' ? k : k.text),rowObj:(typeof k === 'object' ? k : null)});
      })
      .filter(function(k,i){
        return ((i > (o.length-1) && k.rowObj !== null) ?
                (typeof n[(i-(o.length))] === 'object' ? (o[n[(i-(o.length))].row].text !== n[(i-(o.length))].text) : true) :
                (i > (o.length-1)) ? (n[(i-(o.length))] !== o[(i-(o.length))]) : true);
      })
      .sort(function(a,b){
        return (a.pos > b.pos ? 1 : -1);
      });
    }
    return Diff;
  }
  return CreateDiff;
})
