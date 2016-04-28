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

    //iterate word array ex ['word','word2','word3'] to object: {word:{rows:[{pos:0,bind:undefined}]},word2:{rows:[{pos:1,bind:undefined}]},word3:{rows:[{pos:2,bind:undefined}]}}
    // if word in array has binding it will be format as {value:func,bind:func}, bind is passed along to the bind for the position
    Diff.convertWordArrToObj = function(arr)
    {
      var currValue = '',
          currBind;
      return arr.reduce(function(o,v,i){
        currValue = (typeof v.value === 'function' ? v.value() : v);
        currBind = (typeof v.bind === 'function' ? v.bind() : undefined);
        if(o[currValue] === undefined)
        {
          o[currValue] = {rows:[i],binds:[currBind]};
        }
        else
        {
          o[currValue].rows.push(i);
          o[currValue].binds.push(currBind);
        }
       return o;
      },{});
    }

    Diff.diffString = function(oldS,newS)
    {
      var ns = Diff.convertWordArrToObj(newS),
          os = Diff.convertWordArrToObj(oldS),
          n = [],
          o = [],
          t = [],
          change = 'none';

      Object.keys(ns).forEach(function(k){
        if(os[k] !== undefined)
        {
          ns[k].rows.forEach(function(d,x){
            if(os[k].rows.indexOf(d) > -1)
            {
              change = 'none';
              o.push({change:'none',pos:d,from:'n',text:k,bind:os[k].binds[os[k].rows.indexOf(d)]});
              n.push({change:change,pos:d,from:'self',text:k,bind:os[k].binds[os[k].rows.indexOf(d)]});
            }
            else if(os[k].rows.indexOf(d+1) > -1)
            {
              change = 'add';
              n.push({change:'delete',pos:d+1,from:'o',text:k,bind:os[k].binds[os[k].rows.indexOf(d+1)]});
              o.push({change:'delete',pos:d+1,from:'self',text:k,bind:os[k].binds[os[k].rows.indexOf(d+1)]});
              o.push({change:'add',pos:d,from:'n',text:k,bind:os[k].binds[os[k].rows.indexOf(d+1)]});
              n.push({change:change,pos:d,from:'self',text:k,bind:os[k].binds[os[k].rows.indexOf(d+1)]});
            }
            else if(os[k].rows.indexOf(d-1) > -1)
            {
              change = 'add';
              n.push({change:'delete',pos:d-1,from:'o',text:k,bind:os[k].binds[os[k].rows.indexOf(d-1)]});
              o.push({change:'delete',pos:d-1,from:'self',text:k,bind:os[k].binds[os[k].rows.indexOf(d-1)]});
              o.push({change:'add',pos:d,from:'n',text:k,bind:os[k].binds[os[k].rows.indexOf(d-1)]});
              n.push({change:change,pos:d,from:'self',text:k,bind:os[k].binds[os[k].rows.indexOf(d-1)]});
            }
            else
            {
              change = 'add';
              o.push({change:'add',pos:d,from:'n',text:k,bind:os[k].binds[os[k].rows.indexOf(d)]});
              n.push({change:change,pos:d,from:'self',text:k,bind:os[k].binds[os[k].rows.indexOf(d)]});
            }
          });
        }
        else
        {
          ns[k].rows.forEach(function(d,x){
            n.push({change:'add',pos:d,from:'self',text:k,bind:ns[k].binds[x]});
            o.push({change:'add',pos:d,from:'n',text:k,bind:undefined});
          });
        }
      });

      Object.keys(os).forEach(function(k){
        if(ns[k] !== undefined)
        {
          os[k].rows.forEach(function(d,x){
            if(ns[k].rows.indexOf(d) > -1)
            {
              change = 'none';
              n.push({change:'none',pos:d,from:'o',text:k,bind:os[k].binds[x]});
            }
            else if(ns[k].rows.indexOf(d+1) > -1)
            {
              change = 'delete';
              n.push({change:'delete',pos:d,from:'o',text:k,bind:os[k].binds[x]});
              n.push({change:'add',pos:(d+1),from:'self',text:k,bind:os[k].binds[x]});
              o.push({change:'add',pos:(d+1),from:'n',text:k,bind:os[k].binds[x]});
            }
            else if(ns[k].rows.indexOf(d-1) > -1)
            {
              change = 'delete';
              n.push({change:'delete',pos:d,from:'o',text:k,bind:os[k].binds[x]});
              n.push({change:'add',pos:(d-1),from:'self',text:k,bind:os[k].binds[x]});
              o.push({change:'add',pos:(d-1),from:'n',text:k,bind:os[k].binds[x]});
            }
            else
            {
              change = 'delete';
              n.push({change:'delete',pos:d,from:'o',text:k,bind:os[k].binds[x]});
            }
            o.push({change:change,pos:d,from:'self',text:k,bind:os[k].binds[x]});
          });
        }
        else
        {
          os[k].rows.forEach(function(d,x){
            n.push({change:'delete',pos:d,text:k,bind:os[k].binds[x]});
            o.push({change:'delete',pos:d,text:k,bind:undefined});
          });
        }
      });

        o = o.sort(function(a,b){
          return (a.pos > b.pos ? 1 : -1);
        });
        n = n.sort(function(a,b){
          return (a.pos > b.pos ? 1 : -1);
        });
        console.log(os,ns,o,n);
      return;
      /*
        if ( ns[k].rows.length == 1 && typeof(os[k]) != "undefined" && os[k].rows.length == 1 ) {
          isBindn = (typeof n[ns[k].rows[0].row] === 'string');
          isBindo = (typeof o[os[k].rows[0].row] === 'string');
          valn = (typeof n[ns[k].rows[0].row] === 'string' ? n[ns[k].rows[0].row] : n[ns[k].rows[0].row].value());
          valo = (typeof o[os[k].rows[0].row] === 'string' ? o[os[k].rows[0].row] : o[os[k].rows[0].row].value());
          n[ns[k].rows[0].row] = { text: valn, row: os[k].rows[0].row, bind:(isBindn ? n[ns[k].rows[0].row].bind : undefined) };
          o[os[k].rows[0].row] = { text: valo, row: ns[k].rows[0].row, bind:(isBindo ? o[os[k].rows[0].row].bind : undefined) };
        }
      });*/

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
          n[i-1] = { text: n[i-1], row: n[i].row - 1};
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
