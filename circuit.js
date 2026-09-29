(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
var svg=document.getElementById("s");
function E(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e;}

var FONT={};
FONT[32]=[0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00];
FONT[48]=[0x3C,0x66,0x6E,0x76,0x66,0x66,0x3C,0x00];
FONT[49]=[0x18,0x38,0x18,0x18,0x18,0x18,0x7E,0x00];
FONT[50]=[0x3C,0x66,0x06,0x0C,0x18,0x30,0x7E,0x00];
FONT[51]=[0x3C,0x66,0x06,0x1C,0x06,0x66,0x3C,0x00];
FONT[52]=[0x0C,0x1C,0x3C,0x6C,0x7E,0x0C,0x0C,0x00];
FONT[53]=[0x7E,0x60,0x7C,0x06,0x06,0x66,0x3C,0x00];
FONT[54]=[0x1C,0x30,0x60,0x7C,0x66,0x66,0x3C,0x00];
FONT[55]=[0x7E,0x06,0x0C,0x18,0x30,0x30,0x30,0x00];
FONT[56]=[0x3C,0x66,0x66,0x3C,0x66,0x66,0x3C,0x00];
FONT[57]=[0x3C,0x66,0x66,0x3E,0x06,0x0C,0x38,0x00];
FONT[65]=[0x18,0x3C,0x66,0x66,0x7E,0x66,0x66,0x00];
FONT[66]=[0x7C,0x66,0x66,0x7C,0x66,0x66,0x7C,0x00];
FONT[67]=[0x3C,0x66,0x60,0x60,0x60,0x66,0x3C,0x00];
FONT[68]=[0x78,0x6C,0x66,0x66,0x66,0x6C,0x78,0x00];
FONT[69]=[0x7E,0x60,0x60,0x7C,0x60,0x60,0x7E,0x00];
FONT[70]=[0x7E,0x60,0x60,0x7C,0x60,0x60,0x60,0x00];
FONT[71]=[0x3C,0x66,0x60,0x6E,0x66,0x66,0x3E,0x00];
FONT[72]=[0x66,0x66,0x66,0x7E,0x66,0x66,0x66,0x00];
FONT[73]=[0x3C,0x18,0x18,0x18,0x18,0x18,0x3C,0x00];
FONT[74]=[0x1E,0x0C,0x0C,0x0C,0x0C,0x6C,0x38,0x00];
FONT[75]=[0x66,0x6C,0x78,0x70,0x78,0x6C,0x66,0x00];
FONT[76]=[0x60,0x60,0x60,0x60,0x60,0x60,0x7E,0x00];
FONT[77]=[0x63,0x77,0x7F,0x6B,0x63,0x63,0x63,0x00];
FONT[78]=[0x66,0x76,0x7E,0x7E,0x6E,0x66,0x66,0x00];
FONT[79]=[0x3C,0x66,0x66,0x66,0x66,0x66,0x3C,0x00];
FONT[80]=[0x7C,0x66,0x66,0x7C,0x60,0x60,0x60,0x00];
FONT[81]=[0x3C,0x66,0x66,0x66,0x66,0x3C,0x0E,0x00];
FONT[82]=[0x7C,0x66,0x66,0x7C,0x78,0x6C,0x66,0x00];
FONT[83]=[0x3C,0x66,0x60,0x3C,0x06,0x66,0x3C,0x00];
FONT[84]=[0x7E,0x18,0x18,0x18,0x18,0x18,0x18,0x00];
FONT[85]=[0x66,0x66,0x66,0x66,0x66,0x66,0x3C,0x00];
FONT[86]=[0x66,0x66,0x66,0x66,0x66,0x3C,0x18,0x00];
FONT[87]=[0x63,0x63,0x63,0x6B,0x7F,0x77,0x63,0x00];
FONT[88]=[0x66,0x66,0x3C,0x18,0x3C,0x66,0x66,0x00];
FONT[89]=[0x66,0x66,0x66,0x3C,0x18,0x18,0x18,0x00];
FONT[90]=[0x7E,0x06,0x0C,0x18,0x30,0x60,0x7E,0x00];
var SUPPORTED=Object.keys(FONT).map(Number);

var gates=[],sws=[],leds=[],labels=[],wires=[];
var vp,lW,lG,lL,lU,lS;
var K0={v:0,x:0,y:0,virtual:true},K1={v:1,x:0,y:0,virtual:true};
var groupStack;
var sectionsData=[];
var frame43=null;
var GAPX=4,GAPY=4,jseed=7;
function jr(){jseed=(jseed*1103515245+12345)&0x7fffffff;return jseed/0x7fffffff;}

function reset(){
  while(svg.firstChild)svg.removeChild(svg.firstChild);
  gates=[];sws=[];leds=[];labels=[];wires=[];sectionsData=[];frame43=null;jseed=7;
  groupStack=[{x:20,y:80,rowH:0,maxW:60000,maxXUsed:0,maxYUsed:0,gStart:0,sStart:0,lStart:0}];
  vp=E("g",{});svg.appendChild(vp);
  lS=E("g",{});lW=E("g",{});lG=E("g",{});lL=E("g",{});lU=E("g",{});
  vp.appendChild(lS);vp.appendChild(lW);vp.appendChild(lG);vp.appendChild(lL);vp.appendChild(lU);
}
function curFrame(){return groupStack[groupStack.length-1];}
function framePlaceIn(f,w,h){
  if(f.x>0 && f.x+w>f.maxW){f.x=0;f.y+=f.rowH+GAPY;f.rowH=0;}
  var p={x:f.x,y:f.y};
  f.x+=w+GAPX;
  if(h>f.rowH)f.rowH=h;
  if(f.x-GAPX>f.maxXUsed)f.maxXUsed=f.x-GAPX;
  var yU=f.y+h;if(yU>f.maxYUsed)f.maxYUsed=yU;
  return p;
}
function place(w,h){return framePlaceIn(curFrame(),w,h);}
function beginGroup(maxW){
  groupStack.push({x:0,y:0,rowH:0,maxW:maxW||200,maxXUsed:0,maxYUsed:0,gStart:gates.length,sStart:sws.length,lStart:leds.length});
}
function endGroup(){
  var f=groupStack.pop();
  var w=f.maxXUsed||10,h=f.maxYUsed||10;
  var pos=framePlaceIn(curFrame(),w,h);
  var dx=pos.x,dy=pos.y,i;
  for(i=f.gStart;i<gates.length;i++){var g=gates[i];g.px+=dx;g.py+=dy;g.o.x+=dx;g.o.y+=dy;}
  for(i=f.sStart;i<sws.length;i++){var s=sws[i];s.px+=dx;s.py+=dy;s.o.x+=dx;s.o.y+=dy;}
  for(i=f.lStart;i<leds.length;i++){var l=leds[i];l.px+=dx;l.py+=dy;}
}
function forceNewRow(){
  var f=groupStack[0];if(!f)return;
  f.x=0;f.y+=f.rowH+30;f.rowH=0;
}
function section(title,maxW,fn){
  var g0=gates.length,s0=sws.length,l0=leds.length;
  beginGroup(maxW);fn();endGroup();
  var minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
  function ext(x1,y1,x2,y2){
    if(x1<minX)minX=x1;if(y1<minY)minY=y1;
    if(x2>maxX)maxX=x2;if(y2>maxY)maxY=y2;
  }
  for(var i=g0;i<gates.length;i++){var g=gates[i];ext(g.px-6,g.py-2,g.px+41,g.py+32);}
  for(var i=s0;i<sws.length;i++){var s=sws[i];ext(s.px-2,s.py-2,s.px+52,s.py+59);}
  for(var i=l0;i<leds.length;i++){var l=leds[i];var r=l.sz?l.sz*0.4:10;ext(l.px-r-3,l.py-r-11,l.px+r+3,l.py+r+3);}
  if(!isFinite(minX))return;
  var pad=8;
  sectionsData.push({
    x:minX-pad, y:minY-pad-18,
    w:(maxX-minX)+2*pad, h:(maxY-minY)+2*pad+18,
    title:title,
    g0:g0,g1:gates.length,s0:s0,s1:sws.length,l0:l0,l1:leds.length
  });
}
function N(v,d){return{v:v|0,d:d|0};}
function mkGate(t,ins){
  var d=0;for(var i=0;i<ins.length;i++)d=Math.max(d,ins[i].d||0);d=d+1;
  var p=place(44,36);
  var jy=Math.floor(jr()*7);
  var g={t:t,i:ins,o:N(0,d),px:p.x,py:p.y+jy};
  g.o.x=g.px+34;g.o.y=g.py+15;
  for(var i=0;i<ins.length;i++){
    var iy=ins.length===1?15:(i===0?10:20);
    if(ins[i].x!==undefined && !ins[i].virtual)wires.push({s:ins[i],g:g,py:iy});
  }
  gates.push(g);return g;
}
function AND(a,b){return mkGate("AND",[a,b]).o;}
function OR(a,b){return mkGate("OR",[a,b]).o;}
function NOT(a){return mkGate("NOT",[a]).o;}
function XOR(a,b){return mkGate("XOR",[a,b]).o;}
function LAT(init){
  var p=place(44,36);
  var jy=Math.floor(jr()*7);
  var g={t:"LAT",i:[K0,K0],o:N(0,1),px:p.x,py:p.y+jy,prev:init|0,prevEn:0};
  g.o.x=g.px+34;g.o.y=g.py+15;
  gates.push(g);return g;
}
function setLat(g,d,en){
  g.i[0]=d;g.i[1]=en;
  if(d.x!==undefined && !d.virtual)wires.push({s:d,g:g,py:10});
  if(en.x!==undefined && !en.virtual)wires.push({s:en,g:g,py:20});
}
function sw(label_,group){
  var p=place(50,58);
  var s={v:0,o:N(0,0),px:p.x,py:p.y,label:label_||"",osc:false,group:group||null};
  s.o.x=p.x+44;s.o.y=p.y+20;
  sws.push(s);return s;
}
function osc(period,label_){
  var p=place(50,58);
  var s={v:0,o:N(0,0),px:p.x,py:p.y,label:label_||"OSC",osc:true,period:period|0||6,t:0};
  s.o.x=p.x+44;s.o.y=p.y+20;
  sws.push(s);return s;
}
function led(inputNode,color,label_,size){
  var sz=size||22;
  var p=place(sz,sz);
  var l={i:inputNode,v:0,c:color||"#39d353",px:p.x+sz/2,py:p.y+sz/2,label:label_||"",sz:sz};
  if(inputNode.x!==undefined && !inputNode.virtual)wires.push({s:inputNode,l:l});
  leds.push(l);return l;
}
function ledPending(color,label_,size){
  var sz=size||22;
  var p=place(sz,sz);
  var ph={v:0,x:p.x-2,y:p.y,virtual:true};
  var l={i:ph,v:0,c:color||"#39d353",px:p.x+sz/2,py:p.y+sz/2,label:label_||"",sz:sz,_ph:true,ph:ph};
  wires.push({s:ph,l:l});
  leds.push(l);return l;
}
function rewireLed(l,newInput){
  for(var i=0;i<wires.length;i++){
    if(wires[i].l===l){wires[i].s=newInput;l.i=newInput;return true;}
  }
  return false;
}
function label(t,x,y,sz,col){labels.push({t:t,x:x|0,y:y|0,s:sz||12,c:col||"#333"});}

function clearLayer(g){ while(g.firstChild) g.removeChild(g.firstChild); }

function gateBody(t){
  switch(t){
    case "AND":return "M0,0 L14,0 A17,17 0 0 1 14,30 L0,30 Z";
    case "OR":return "M0,0 Q12,0 30,15 Q12,30 0,30 Q10,15 0,0 Z";
    case "NOT":return "M0,0 L30,15 L0,30 Z";
    case "XOR":return "M4,0 Q17,0 34,15 Q17,30 4,30 Q15,15 4,0 Z";
  }
  return "M0,0 L34,0 L34,30 L0,30 Z";
}
function renderSection(s){
  lS.appendChild(E("rect",{x:s.x,y:s.y,width:s.w,height:s.h,fill:"#fafafa",stroke:"#d4d4d4","stroke-width":0.5,"stroke-dasharray":"4 3"}));
  var t=E("text",{x:s.x+10,y:s.y+13,"font-size":10,"font-weight":700,fill:"#666","letter-spacing":"1px"});
  t.textContent=s.title;lS.appendChild(t);
}
function renderGate(g){
  var grp=E("g",{transform:"translate("+g.px+","+g.py+")"});
  grp.appendChild(E("path",{d:gateBody(g.t),fill:"#fff",stroke:"#222","stroke-width":1,"stroke-linejoin":"round"}));
  if(g.t==="XOR")grp.appendChild(E("path",{d:"M0,0 Q10,15 0,30",fill:"none",stroke:"#222","stroke-width":1}));
  if(g.t==="NOT")grp.appendChild(E("circle",{cx:33,cy:15,r:3,fill:"#fff",stroke:"#222","stroke-width":1}));
  var n=g.t==="NOT"?1:2;
  for(var i=0;i<n;i++){
    var y=n===1?15:(i===0?10:20);
    grp.appendChild(E("line",{x1:-6,y1:y,x2:0,y2:y,stroke:"#222","stroke-width":1}));
  }
  grp.appendChild(E("line",{x1:34,y1:15,x2:40,y2:15,stroke:"#222","stroke-width":1}));
  if(g.t==="LAT"){
    var t=E("text",{x:16,y:18,"text-anchor":"middle","font-size":7,fill:"#222","font-weight":700});
    t.textContent="D";grp.appendChild(t);
  }
  lG.appendChild(grp);
}
function renderSwitch(s){
  var w=38,h=46;
  var grp=E("g",{transform:"translate("+s.px+","+s.py+")"});
  if(s.osc){
    grp.appendChild(E("rect",{x:0,y:0,width:w,height:h,fill:s.v?"#8ab4ff":"#dbe9ff",stroke:"#222","stroke-width":1}));
    grp.appendChild(E("path",{d:"M5,23 H10 L14,11 L22,35 L26,23 H33",fill:"none",stroke:"#1a56db","stroke-width":1}));
  }else{
    grp.appendChild(E("rect",{x:0,y:0,width:w,height:h,fill:"#c8c8c8",stroke:"#222","stroke-width":1}));
    var ky=s.v?4:h-20;
    grp.appendChild(E("rect",{x:4,y:ky,width:w-8,height:15,fill:"#fff",stroke:"#222","stroke-width":1}));
  }
  grp.appendChild(E("line",{x1:w,y1:23,x2:w+12,y2:23,stroke:"#222","stroke-width":1}));
  if(s.label){
    var t=E("text",{x:w/2,y:h+11,"text-anchor":"middle","font-size":8,"font-weight":700,fill:"#222"});
    t.textContent=s.label;grp.appendChild(t);
  }
  if(!s.osc){
    var hit=E("rect",{x:0,y:0,width:w,height:h,fill:"#000","fill-opacity":0,cursor:"pointer","pointer-events":"all"});
    hit.setAttribute("class","swhit");
    grp.appendChild(hit);
    hit.addEventListener("pointerdown",function(ev){
      ev.stopPropagation();
      ev.preventDefault();
      s.v=s.v?0:1;
      if(s.v && s.group){
        for(var q=0;q<sws.length;q++){
          if(sws[q]!==s && sws[q].group===s.group) sws[q].v=0;
        }
      }
      if(s.label==="RUN" && s.v){
        setTimeout(function(){
          for(var q=0;q<sws.length;q++){
            var o=sws[q];
            if(o!==s && !o.osc && o.label!=="DESTRUCT") o.v=0;
          }
        },150);
      }
      if(s.label==="RUN_Q" && s.v){
        setTimeout(function(){
          for(var q=0;q<sws.length;q++){
            var o=sws[q];
            if(o!==s && !o.osc && o.label!=="DESTRUCT" && o.label!=="RUN_Q") o.v=0;
          }
        },400);
      }
      if(s.label==="DESTRUCT" && s.v){
        for(var q=0;q<gates.length;q++){ if(gates[q].t==="LAT") gates[q].prev=0; }
        setTimeout(function(){s.v=0;},200);
      }
    });
  }
  lU.appendChild(grp);
}
function renderLed(l){
  var sz=l.sz||22,rOut=sz*0.4,rIn=sz*0.22;
  var on=l.i.v;
  var grp=E("g",{transform:"translate("+l.px+","+l.py+")"});
  if(sz<28)grp.appendChild(E("line",{x1:-rOut-2,y1:0,x2:-rOut,y2:0,stroke:"#222","stroke-width":1.2}));
  grp.appendChild(E("circle",{cx:0,cy:0,r:rOut,fill:"#fff",stroke:"#222","stroke-width":sz>28?1.4:1}));
  grp.appendChild(E("circle",{cx:0,cy:0,r:rIn,fill:on?l.c:"#e8e8e8"}));
  if(l.label && sz>=20){
    var t=E("text",{x:0,y:-rOut-3,"text-anchor":"middle","font-size":7,fill:"#555"});
    t.textContent=l.label;grp.appendChild(t);
  }
  lL.appendChild(grp);
}
function renderLabel(L){
  var t=E("text",{x:L.x,y:L.y,"font-size":L.s,fill:L.c,"font-weight":600,"text-anchor":"middle"});
  t.textContent=L.t;lU.appendChild(t);
}
function renderWire(sx,sy,dx,dy,on,mxo){
  var path;
  if(Math.abs(sy-dy)<3) path="M"+sx+","+sy+"H"+dx;
  else { var mx=(mxo===undefined)?sx+(dx-sx)/2:mxo; path="M"+sx+","+sy+"H"+mx+"V"+dy+"H"+dx; }
  lW.appendChild(E("path",{d:path,fill:"none",stroke:on?"#111":"#cfcfcf","stroke-width":on?1.5:1,"stroke-linecap":"round","stroke-linejoin":"round"}));
}

function evalComb(g){
  var a=g.i[0]?g.i[0].v:0,b=g.i[1]?g.i[1].v:0;
  switch(g.t){
    case "AND":return a&b;
    case "OR":return a|b;
    case "NOT":return a?0:1;
    case "XOR":return a^b;
  }
  return 0;
}
function simulate(){
  var iter,i,g;
  for(iter=0;iter<14;iter++){
    for(i=0;i<sws.length;i++)sws[i].o.v=sws[i].v;
    for(i=0;i<gates.length;i++){
      g=gates[i];
      if(g.t==="LAT"){g.o.v=g.prev;continue;}
      g.o.v=evalComb(g);
    }
  }
  var snap=[];
  for(i=0;i<gates.length;i++){
    g=gates[i];if(g.t!=="LAT")continue;
    snap.push({g:g,d:g.i[0]?g.i[0].v:0,en:g.i[1]?g.i[1].v:0});
  }
  for(i=0;i<snap.length;i++){
    var s=snap[i];
    if(s.en && !s.g.prevEn) s.g.prev=s.d;
    s.g.prevEn=s.en;
    s.g.o.v=s.g.prev;
  }
  for(iter=0;iter<8;iter++){
    for(i=0;i<sws.length;i++)sws[i].o.v=sws[i].v;
    for(i=0;i<gates.length;i++){
      g=gates[i];
      if(g.t==="LAT"){g.o.v=g.prev;continue;}
      g.o.v=evalComb(g);
    }
  }
}
function tickOsc(){
  for(var i=0;i<sws.length;i++){
    var s=sws[i];
    if(s.osc){s.t++;if(s.t>=s.period){s.t=0;s.v=s.v?0:1;}}
  }
}
function addN(a,b,cin,n){
  var c=cin||K0,s=[];
  for(var i=0;i<n;i++){
    var ab=XOR(a[i],b[i]);
    var sum=XOR(ab,c);
    var g1=AND(a[i],b[i]);
    var g2=AND(ab,c);
    c=OR(g1,g2);
    s.push(sum);
  }
  return {sum:s,carry:c};
}
function add8(a,b){return addN(a,b,K0,8).sum;}
function sub8(a,b){
  var nb=[];for(var i=0;i<8;i++)nb.push(NOT(b[i]));
  return addN(a,nb,K1,8).sum;
}
function mul4low(a,b){
  var pp=[];
  for(var i=0;i<4;i++){pp[i]=[];for(var j=0;j<4;j++)pp[i][j]=AND(a[j],b[i]);}
  var s0=[pp[0][0],pp[0][1],pp[0][2],pp[0][3],K0,K0,K0,K0];
  var s1=add8(s0,[K0,pp[1][0],pp[1][1],pp[1][2],pp[1][3],K0,K0,K0]);
  var s2=add8(s1,[K0,K0,pp[2][0],pp[2][1],pp[2][2],pp[2][3],K0,K0]);
  var s3=add8(s2,[K0,K0,K0,pp[3][0],pp[3][1],pp[3][2],pp[3][3],K0]);
  return s3;
}
function div4(a,b){
  var R=[K0,K0,K0,K0],Q=[K0,K0,K0,K0];
  var nb=[NOT(b[0]),NOT(b[1]),NOT(b[2]),NOT(b[3])];
  for(var i=3;i>=0;i--){
    var Rn=[a[i],R[0],R[1],R[2]];
    var d=addN(Rn,nb,K1,4);
    Q[i]=d.carry;
    var nB=NOT(d.carry);
    var Rn2=[];
    for(var j=0;j<4;j++)Rn2.push(OR(AND(d.sum[j],d.carry),AND(Rn[j],nB)));
    R=Rn2;
  }
  return [Q[0],Q[1],Q[2],Q[3],K0,K0,K0,K0];
}
function dec6(bits){
  var low3=[NOT(bits[0]),NOT(bits[1]),NOT(bits[2])];
  var high3=[NOT(bits[3]),NOT(bits[4]),NOT(bits[5])];
  var lowOut=[],highOut=[];
  for(var v=0;v<8;v++){
    var b0=(v&1)?bits[0]:low3[0],b1=(v&2)?bits[1]:low3[1],b2=(v&4)?bits[2]:low3[2];
    lowOut.push(AND(AND(b0,b1),b2));
  }
  for(var v=0;v<8;v++){
    var b3=(v&1)?bits[3]:high3[0],b4=(v&2)?bits[4]:high3[1],b5=(v&4)?bits[5]:high3[2];
    highOut.push(AND(AND(b3,b4),b5));
  }
  var out=[];
  for(var i=0;i<64;i++) out.push(AND(highOut[i>>3],lowOut[i&7]));
  return out;
}
function dec5(bits){
  var low3=[NOT(bits[0]),NOT(bits[1]),NOT(bits[2])];
  var high2=[NOT(bits[3]),NOT(bits[4])];
  var lowOut=[],highOut=[];
  for(var v=0;v<8;v++){
    var b0=(v&1)?bits[0]:low3[0],b1=(v&2)?bits[1]:low3[1],b2=(v&4)?bits[2]:low3[2];
    lowOut.push(AND(AND(b0,b1),b2));
  }
  for(var v=0;v<4;v++){
    var b3=(v&1)?bits[3]:high2[0],b4=(v&2)?bits[4]:high2[1];
    highOut.push(AND(b3,b4));
  }
  var out=[];
  for(var i=0;i<32;i++) out.push(AND(highOut[(i>>3)&3],lowOut[i&7]));
  return out;
}
function readRAM(addrBits){
  var dec=dec6(addrBits);
  var out=[];
  for(var b=0;b<8;b++){
    var acc=null;
    for(var i=0;i<48;i++){
      var t=AND(dec[i],window.__globalRAM[i][b].o);
      acc=(acc===null)?t:OR(acc,t);
    }
    out.push(acc);
  }
  return out;
}
function swapInRange(oldN,newN,maxG){
  for(var w=0;w<wires.length;w++){
    var wo=wires[w];
    if(wo.s===oldN){
      if(wo.g){
        var idx=gates.indexOf(wo.g);
        if(idx>=0 && idx<maxG) wo.s=newN;
      }
    }
  }
  for(var g=0;g<maxG;g++){
    var gi=gates[g].i;
    for(var j=0;j<gi.length;j++){
      if(gi[j]===oldN) gi[j]=newN;
    }
  }
}

function buildCPU48(){
  var OP=new Array(5),D=new Array(8),T=new Array(8),A=new Array(6);
  var WRo,RDo,RUNo,CLRo,LDo,CLKo,DESTo;
  var runPrev,clrPrev,runEdge,clrEdge;
  var opDec,destDec,tagDec,dataDec;
  var RAM=[],TAGS=[];
  var srcB=new Array(8),srcC=new Array(8),finalR=new Array(8);
  var delayReg=new Array(4);
  var screenLeds=[],ramViewLeds=[];
  var fontNodes={};
  var i,b,c,r;
  for(var key in FONT){
    fontNodes[key]=[];
    for(r=0;r<8;r++)for(c=0;c<8;c++){
      var bitv=(FONT[key][r]>>(7-c))&1;
      fontNodes[key].push(bitv?K1:K0);
    }
  }
  section("OPCODE (5)",600,function(){
    for(i=4;i>=0;i--) OP[i]=sw("O"+i);
    beginGroup(160);for(i=4;i>=0;i--) led(OP[i].o,"#4a9eff","O"+i,22);endGroup();
  });
  forceNewRow();
  section("DATA (8)",900,function(){
    for(i=7;i>=0;i--) D[i]=sw("D"+i);
    beginGroup(200);for(i=7;i>=0;i--) led(D[i].o,"#39d353","D"+i,22);endGroup();
  });
  forceNewRow();
  section("TAG (8)",900,function(){
    for(i=7;i>=0;i--) T[i]=sw("T"+i);
    beginGroup(200);for(i=7;i>=0;i--) led(T[i].o,"#ffb020","T"+i,22);endGroup();
  });
  forceNewRow();
  section("DEST ADDR (6)",700,function(){
    for(i=5;i>=0;i--) A[i]=sw("A"+i);
    beginGroup(200);for(i=5;i>=0;i--) led(A[i].o,"#a060ff","A"+i,22);endGroup();
  });
  forceNewRow();
  section("ACTION",1000,function(){
    WRo=sw("WR","wr").o;RDo=sw("RD","wr").o;
    RUNo=sw("RUN").o;CLRo=sw("CLR").o;LDo=sw("LOAD").o;DESTo=sw("DESTRUCT").o;
    beginGroup(340);
    led(WRo,"#39d353","W",22);led(RDo,"#4a9eff","R",22);
    led(RUNo,"#ff4d4d","N",22);led(CLRo,"#ff4d4d","C",22);
    led(LDo,"#ffb020","L",22);led(DESTo,"#000","D",22);
    endGroup();
  });
  section("CLK",240,function(){ CLKo=osc(2,"CLK").o; });
  forceNewRow();
  section("SCREEN 16 × 16",620,function(){
    for(r=0;r<16;r++){
      beginGroup(600);screenLeds.push([]);
      for(c=0;c<16;c++){beginGroup(34);screenLeds[r].push(ledPending("#111","",22));endGroup();}
      endGroup();
    }
  });
  section("RAM VIEW 48 × 8",320,function(){
    for(b=0;b<48;b++){
      beginGroup(300);ramViewLeds.push([]);
      for(i=7;i>=0;i--){beginGroup(34);ramViewLeds[b].push(ledPending("#ffb020","",22));endGroup();}
      endGroup();
    }
  });
  forceNewRow();
  section("EDGE DETECT",800,function(){
    runPrev=LAT(0);setLat(runPrev,RUNo,CLKo);
    clrPrev=LAT(0);setLat(clrPrev,CLRo,CLKo);
    runEdge=AND(RUNo,NOT(runPrev.o));
    clrEdge=AND(CLRo,NOT(clrPrev.o));
  });
  section("OPCODE DECODE 5→32",2000,function(){
    opDec=dec5([OP[0].o,OP[1].o,OP[2].o,OP[3].o,OP[4].o]);
  });
  section("DEST DECODE 6→64",2400,function(){
    destDec=dec6([A[0].o,A[1].o,A[2].o,A[3].o,A[4].o,A[5].o]);
  });
  forceNewRow();
  section("TAG DECODE 6→64",2400,function(){
    tagDec=dec6([T[0].o,T[1].o,T[2].o,T[3].o,T[4].o,T[5].o]);
  });
  section("DATA DECODE 6→64",2400,function(){
    dataDec=dec6([D[0].o,D[1].o,D[2].o,D[3].o,D[4].o,D[5].o]);
  });
  section("DELAY 4-bit",600,function(){
    for(i=0;i<4;i++) delayReg[i]=LAT(0);
    var db=[delayReg[0].o,delayReg[1].o,delayReg[2].o,delayReg[3].o];
    var nz=OR(OR(db[0],db[1]),OR(db[2],db[3]));
    var decBits=addN(db,[K1,K0,K0,K0],K0,4).sum;
    var delayLoad=AND(opDec[18],runEdge);
    var nLoad=NOT(delayLoad);
    for(i=0;i<4;i++){
      var dd=OR(AND(delayLoad,D[i].o),AND(nLoad,decBits[i]));
      setLat(delayReg[i],dd,CLKo);
    }
  });
  forceNewRow();
  section("RAM 48 × 8",4800,function(){
    for(i=0;i<48;i++){
      beginGroup(140);RAM.push([]);
      for(b=0;b<8;b++){beginGroup(18);RAM[i].push(LAT(0));endGroup();}
      endGroup();
    }
  });
  forceNewRow();
  section("TAG MEM 48 × 8",4800,function(){
    for(i=0;i<48;i++){
      beginGroup(140);TAGS.push([]);
      for(b=0;b<8;b++){beginGroup(18);TAGS[i].push(LAT(0));endGroup();}
      endGroup();
    }
  });
  forceNewRow();
  section("READ MUX B",4800,function(){
    for(b=0;b<8;b++){
      beginGroup(400);var acc=null;
      for(i=0;i<48;i++){var t=AND(tagDec[i],RAM[i][b].o);acc=(acc===null)?t:OR(acc,t);}
      srcB[b]=acc;endGroup();
    }
  });
  section("READ MUX C",4800,function(){
    for(b=0;b<8;b++){
      beginGroup(400);var acc=null;
      for(i=0;i<48;i++){var t=AND(dataDec[i],RAM[i][b].o);acc=(acc===null)?t:OR(acc,t);}
      srcC[b]=acc;endGroup();
    }
  });
  forceNewRow();
  var opR=new Array(24);
  section("SET · MOV · LINK",900,function(){
    var r0=[];for(b=0;b<8;b++)r0.push(D[b].o);
    opR[1]=r0;opR[2]=srcB.slice();
    var r2=[];for(b=0;b<8;b++) r2.push(b<4?srcC[b]:srcB[b]);
    opR[3]=r2;
  });
  section("ADD · SUB",1600,function(){
    opR[4]=add8(srcB,srcC);opR[5]=sub8(srcB,srcC);
  });
  section("MUL · DIV",2000,function(){
    opR[6]=mul4low([srcB[0],srcB[1],srcB[2],srcB[3]],[srcC[0],srcC[1],srcC[2],srcC[3]]);
    opR[7]=div4([srcB[0],srcB[1],srcB[2],srcB[3]],[srcC[0],srcC[1],srcC[2],srcC[3]]);
  });
  forceNewRow();
  section("AND · OR · XOR · NOT",1400,function(){
    var aR=[],oR=[],xR=[],nR=[];
    for(b=0;b<8;b++){
      aR.push(AND(srcB[b],srcC[b]));oR.push(OR(srcB[b],srcC[b]));
      xR.push(XOR(srcB[b],srcC[b]));nR.push(NOT(srcB[b]));
    }
    opR[8]=aR;opR[9]=oR;opR[10]=xR;opR[11]=nR;
  });
  section("SHL · SHR · INC · DEC · NEG",1600,function(){
    var lR=[],rR=[];
    for(b=0;b<8;b++){lR.push(b===0?K0:srcB[b-1]);rR.push(b===7?K0:srcB[b+1]);}
    opR[12]=lR;opR[13]=rR;
    opR[14]=add8(srcB,[K1,K0,K0,K0,K0,K0,K0,K0]);
    opR[15]=sub8(srcB,[K1,K0,K0,K0,K0,K0,K0,K0]);
    var nB=[];for(b=0;b<8;b++)nB.push(NOT(srcB[b]));
    opR[16]=addN(nB,[K1,K0,K0,K0,K0,K0,K0,K0],K0,8).sum;
  });
  section("CLR · DELAY",400,function(){
    var z=[K0,K0,K0,K0,K0,K0,K0,K0];opR[17]=z;opR[18]=z;
  });
  opR[0]=[K0,K0,K0,K0,K0,K0,K0,K0];
  forceNewRow();
  section("OUTPUT MUX",3200,function(){
    for(b=0;b<8;b++){
      beginGroup(400);var acc=null;
      for(i=0;i<19;i++){
        if(!opR[i]) continue;
        var t=AND(opDec[i],opR[i][b]);
        acc=(acc===null)?t:OR(acc,t);
      }
      finalR[b]=acc;endGroup();
    }
  });
  forceNewRow();
  section("WRITE ENABLE",1600,function(){
    var delayActive=OR(OR(delayReg[0].o,delayReg[1].o),OR(delayReg[2].o,delayReg[3].o));
    var runOk=AND(runEdge,NOT(delayActive));
    var wrPulse=AND(runOk,WRo);
    var nClr=NOT(clrEdge);
    for(i=0;i<48;i++){
      beginGroup(50);
      var wEn=AND(wrPulse,destDec[i]);
      var en=OR(wEn,clrEdge);
      for(b=0;b<8;b++){
        var dB=AND(finalR[b],nClr);
        setLat(RAM[i][b],dB,en);
        var tB=AND(T[b].o,nClr);
        setLat(TAGS[i][b],tB,en);
      }
      endGroup();
    }
  });
  forceNewRow();
  var byteBits=[[],[],[],[]];
  for(i=0;i<4;i++) for(b=0;b<8;b++) byteBits[i].push(RAM[i][b].o);
  var charSels=[];
  section("CHAR DETECT",4000,function(){
    for(var bi=0;bi<4;bi++){
      beginGroup(1000);
      for(var ci=0;ci<SUPPORTED.length;ci++){
        var cval=SUPPORTED[ci];
        beginGroup(70);
        var bits=[];
        for(b=0;b<8;b++){
          var bv=(cval>>b)&1;
          bits.push(bv?byteBits[bi][b]:NOT(byteBits[bi][b]));
        }
        var a1=AND(bits[0],bits[1]);var a2=AND(bits[2],bits[3]);
        var a3=AND(bits[4],bits[5]);var a4=AND(bits[6],bits[7]);
        charSels.push(AND(AND(a1,a2),AND(a3,a4)));
        endGroup();
      }
      endGroup();
    }
  });
  forceNewRow();
  section("SCREEN LOGIC",7000,function(){
    for(var bi=0;bi<4;bi++){
      beginGroup(7000);
      for(r=0;r<8;r++){
        beginGroup(700);
        for(c=0;c<8;c++){
          beginGroup(80);
          var contribs=[];
          for(var ci=0;ci<SUPPORTED.length;ci++){
            var sel=charSels[bi*SUPPORTED.length+ci];
            var fbit=fontNodes[SUPPORTED[ci]][r*8+c];
            if(fbit===K0) continue;
            contribs.push(AND(sel,fbit));
          }
          if(contribs.length===0){endGroup();continue;}
          var acc=contribs[0];
          for(var k=1;k<contribs.length;k++) acc=OR(acc,contribs[k]);
          var qr=(bi>=2)?8:0;var qc=(bi&1)?8:0;
          rewireLed(screenLeds[qr+r][qc+c],acc);
          endGroup();
        }
        endGroup();
      }
      endGroup();
    }
  });
  forceNewRow();
  for(i=0;i<48;i++) for(b=0;b<8;b++) rewireLed(ramViewLeds[i][7-b],RAM[i][b].o);
  window.__globalRAM=RAM;
  window.__cpuRefs={
    OP:OP,D:D,T:T,A:A,
    RUNo:RUNo,WRo:WRo,
    gateCount:gates.length
  };
}

function buildQueue(){
  var QADDR=new Array(6),QORD=new Array(6);
  var CLRQo,QUEUEo,RUNQo,QCLKo;
  var queuePrev,clrqPrev,runqPrev,qclkPrev;
  var queueEdge,clrqEdge,runqEdge,qclkEdge;
  var slots=[],ptr=[],ptrSel=[],qAddr=[];
  var slotDec=[],visLogic=[];
  var i,b,s;

  section("QUEUE ADDR (6)",700,function(){
    for(i=5;i>=0;i--) QADDR[i]=sw("QA"+i);
    beginGroup(200);for(i=5;i>=0;i--) led(QADDR[i].o,"#a060ff","QA"+i,22);endGroup();
  });
  section("QUEUE ORDER (6)",700,function(){
    for(i=5;i>=0;i--) QORD[i]=sw("QO"+i);
    beginGroup(200);for(i=5;i>=0;i--) led(QORD[i].o,"#4a9eff","QO"+i,22);endGroup();
  });
  section("QUEUE ACTION",700,function(){
    CLRQo=sw("CLR_Q").o;QUEUEo=sw("QUEUE").o;RUNQo=sw("RUN_Q").o;
    beginGroup(240);
    led(CLRQo,"#ff4d4d","CQ",22);led(QUEUEo,"#39d353","Q",22);
    led(RUNQo,"#ffb020","RQ",22);endGroup();
  });
  section("QCLK",240,function(){ QCLKo=osc(12,"QCLK").o; });
  forceNewRow();

  section("QUEUE EDGE DETECT",1400,function(){
    queuePrev=LAT(0);setLat(queuePrev,QUEUEo,QCLKo);
    clrqPrev=LAT(0);setLat(clrqPrev,CLRQo,QCLKo);
    runqPrev=LAT(0);setLat(runqPrev,RUNQo,QCLKo);
    qclkPrev=LAT(0);setLat(qclkPrev,QCLKo,QCLKo);
    queueEdge=AND(QUEUEo,NOT(queuePrev.o));
    clrqEdge=AND(CLRQo,NOT(clrqPrev.o));
    runqEdge=AND(RUNQo,NOT(runqPrev.o));
    qclkEdge=AND(QCLKo,NOT(qclkPrev.o));
  });
  forceNewRow();

  section("QUEUE STORAGE 8 × 7",900,function(){
    for(s=0;s<8;s++){
      beginGroup(90);
      var slot={addr:[],valid:null};
      for(b=0;b<6;b++) slot.addr.push(LAT(0));
      slot.valid=LAT(0);
      slots.push(slot);
      endGroup();
    }
  });
  section("QUEUE PUSH & CLEAR",1400,function(){
    var cum=K1;
    for(s=0;s<8;s++){
      beginGroup(130);
      var valid=slots[s].valid.o;
      var nValid=NOT(valid);
      var push=AND(AND(queueEdge,cum),nValid);
      var en=OR(push,clrqEdge);
      setLat(slots[s].valid,AND(push,K1),en);
      for(b=0;b<6;b++) setLat(slots[s].addr[b],QADDR[b].o,push);
      cum=AND(cum,valid);
      endGroup();
    }
  });
  forceNewRow();

  section("QUEUE POINTER (3-bit)",700,function(){
    for(i=0;i<3;i++) ptr[i]=LAT(0);
    var next=addN([ptr[0].o,ptr[1].o,ptr[2].o],[K1,K0,K0],K0,3).sum;
    var incOn=OR(qclkEdge,runqEdge);
    for(i=0;i<3;i++){
      var d=OR(AND(runqEdge,K0),AND(NOT(runqEdge),next[i]));
      setLat(ptr[i],d,incOn);
    }
    beginGroup(120);
    for(i=2;i>=0;i--) led(ptr[i].o,"#ffb020","p"+i,22);
    endGroup();
  });
  section("POINTER DECODE 3→8",1200,function(){
    var np0=NOT(ptr[0].o),np1=NOT(ptr[1].o),np2=NOT(ptr[2].o);
    for(s=0;s<8;s++){
      beginGroup(140);
      var b0=(s&1)?ptr[0].o:np0;
      var b1=(s&2)?ptr[1].o:np1;
      var b2=(s&4)?ptr[2].o:np2;
      ptrSel.push(AND(AND(b0,b1),b2));
      endGroup();
    }
  });
  forceNewRow();

  section("QUEUE ADDR MUX (6 × 8:1)",1400,function(){
    for(b=0;b<6;b++){
      beginGroup(400);
      var acc=null;
      for(s=0;s<8;s++){
        var t=AND(ptrSel[s],slots[s].addr[b].o);
        acc=(acc===null)?t:OR(acc,t);
      }
      qAddr.push(acc);
      endGroup();
    }
  });

  section("QUEUE VIS LOGIC (48 cell)",3800,function(){
    for(s=0;s<8;s++){
      beginGroup(400);
      var ab=[slots[s].addr[0].o,slots[s].addr[1].o,slots[s].addr[2].o,
              slots[s].addr[3].o,slots[s].addr[4].o,slots[s].addr[5].o];
      slotDec.push(dec6(ab));
      endGroup();
    }
    for(var p=0;p<48;p++){
      beginGroup(380);
      var acc=null;
      for(s=0;s<8;s++){
        var hit=AND(slotDec[s][p],slots[s].valid.o);
        acc=(acc===null)?hit:OR(acc,hit);
      }
      visLogic.push(acc);
      endGroup();
    }
  });
  forceNewRow();

  section("QUEUE VIS 1 × 48",700,function(){
    for(var p=0;p<48;p++){
      beginGroup(28);
      led(visLogic[p],"#ff4d4d","",22);
      endGroup();
    }
  });
  forceNewRow();

  section("QUEUE EXECUTOR (fetch · mux · swap)",9000,function(){
    var R=window.__cpuRefs;
    var qA1=addN(qAddr,[K1,K0,K0,K0,K0,K0],K0,6).sum;
    var qA2=addN(qA1,[K1,K0,K0,K0,K0,K0],K0,6).sum;
    var qA3=addN(qA2,[K1,K0,K0,K0,K0,K0],K0,6).sum;
    var fOP=readRAM(qAddr);
    var fD=readRAM(qA1);
    var fT=readRAM(qA2);
    var fA=readRAM(qA3);
    var nRQ=NOT(RUNQo);
    var eOP=[],eD=[],eT=[],eA=[];
    for(i=0;i<5;i++) eOP.push(OR(AND(RUNQo,fOP[i]),AND(nRQ,R.OP[i].o)));
    for(i=0;i<8;i++) eD.push(OR(AND(RUNQo,fD[i]),AND(nRQ,R.D[i].o)));
    for(i=0;i<8;i++) eT.push(OR(AND(RUNQo,fT[i]),AND(nRQ,R.T[i].o)));
    for(i=0;i<6;i++) eA.push(OR(AND(RUNQo,fA[i]),AND(nRQ,R.A[i].o)));
    var eRUN=OR(AND(RUNQo,qclkEdge),AND(nRQ,R.RUNo));
    var eWR=OR(RUNQo,AND(nRQ,R.WRo));
    var mG=R.gateCount;
    for(i=0;i<5;i++) swapInRange(R.OP[i].o,eOP[i],mG);
    for(i=0;i<8;i++) swapInRange(R.D[i].o,eD[i],mG);
    for(i=0;i<8;i++) swapInRange(R.T[i].o,eT[i],mG);
    for(i=0;i<6;i++) swapInRange(R.A[i].o,eA[i],mG);
    swapInRange(R.RUNo,eRUN,mG);
    swapInRange(R.WRo,eWR,mG);
  });
}

function relayout43(){
  var GX=14,GY=16,M=40,TOP=90,RATIO=4/3,CG=90,RG=36;
  var secs=sectionsData,n=secs.length,i,k,maxW=0,totW=0,idx={};
  if(!n)return null;
  for(i=0;i<n;i++){idx[secs[i].title]=i;if(secs[i].w>maxW)maxW=secs[i].w;totW+=secs[i].w+GX;}
  var fixed=[],isFixed={},y=0,inW=0;
  var INP=["OPCODE (5)","DATA (8)","TAG (8)","DEST ADDR (6)","ACTION","CLK",
           "QUEUE ADDR (6)","QUEUE ORDER (6)","QUEUE ACTION","QCLK"];
  for(k=0;k<INP.length;k++){var a=idx[INP[k]];if(a===undefined)continue;fixed.push({i:a,x:0,y:y});y+=secs[a].h+RG;if(secs[a].w>inW)inW=secs[a].w;}
  var x0=inW+CG,sc=idx["SCREEN 16 × 16"],rv=idx["RAM VIEW 48 × 8"],qv=idx["QUEUE VIS 1 × 48"];
  if(sc!==undefined){
    fixed.push({i:sc,x:x0,y:0});
    var xa=x0+secs[sc].w+CG;
    if(rv!==undefined){fixed.push({i:rv,x:xa,y:0});}
    var xb=xa+(rv!==undefined?secs[rv].w+CG:0);
    if(qv!==undefined){fixed.push({i:qv,x:xb,y:0});}
  }
  for(k=0;k<fixed.length;k++)isFixed[fixed[k].i]=1;
  function pack(Wp){
    var placed=[],pos=[],usedW=0,usedH=0,j,c,r;
    for(j=0;j<fixed.length;j++){
      var f=fixed[j],q=secs[f.i];
      placed.push({x:f.x,y:f.y,w:q.w,h:q.h});pos[f.i]={x:f.x,y:f.y};
      if(f.x+q.w>usedW)usedW=f.x+q.w;if(f.y+q.h>usedH)usedH=f.y+q.h;
    }
    for(j=0;j<n;j++){
      if(isFixed[j])continue;
      var s=secs[j],cand=[0],bx=0,by=Infinity;
      for(k=0;k<placed.length;k++){cand.push(placed[k].x);cand.push(placed[k].x+placed[k].w+GX);}
      for(c=0;c<cand.length;c++){
        var x=cand[c];
        if(x>0&&x+s.w>Wp)continue;
        var yy=0;
        for(k=0;k<placed.length;k++){
          r=placed[k];
          if(r.x<x+s.w+GX&&r.x+r.w+GX>x){var yb=r.y+r.h+GY;if(yb>yy)yy=yb;}
        }
        if(yy<by||(yy===by&&x<bx)){by=yy;bx=x;}
      }
      placed.push({x:bx,y:by,w:s.w,h:s.h});pos[j]={x:bx,y:by};
      if(bx+s.w>usedW)usedW=bx+s.w;if(by+s.h>usedH)usedH=by+s.h;
    }
    return {pos:pos,w:usedW,h:usedH};
  }
  function fit(p){
    var wN=p.w+2*M,hN=p.h+TOP+M,W,H;
    if(wN/hN<RATIO){H=hN;W=hN*RATIO;}else{W=wN;H=wN/RATIO;}
    return {W:W,H:H};
  }
  var best=null,bestArea=Infinity;
  for(var t=0;t<=60;t++){
    var Wp=maxW*Math.pow(totW/maxW,t/60);
    var p=pack(Wp),f2=fit(p),ar=f2.W*f2.H;
    if(ar<bestArea){bestArea=ar;best={p:p,f:f2};}
  }
  for(i=0;i<n;i++){
    var sc2=secs[i],nx=M+best.p.pos[i].x,ny=TOP+best.p.pos[i].y;
    var dx=nx-sc2.x,dy=ny-sc2.y;
    for(k=sc2.g0;k<sc2.g1;k++){var g=gates[k];g.px+=dx;g.py+=dy;g.o.x+=dx;g.o.y+=dy;}
    for(k=sc2.s0;k<sc2.s1;k++){var q2=sws[k];q2.px+=dx;q2.py+=dy;q2.o.x+=dx;q2.o.y+=dy;}
    for(k=sc2.l0;k<sc2.l1;k++){
      var l=leds[k];l.px+=dx;l.py+=dy;
      if(l.ph){l.ph.x=l.px-(l.sz||22)*0.4-2;l.ph.y=l.py;}
    }
    sc2.x=nx;sc2.y=ny;
  }
  return {x:0,y:0,w:best.f.W,h:best.f.H};
}

function routeWires(){
  var STEP=2,buckets={},list=[],i,w;
  for(i=0;i<wires.length;i++){
    w=wires[i];delete w.mx;
    if(w.s.x===undefined)continue;
    if(w.l){w.ex=w.l.px-(w.l.sz||22)*0.4-2;w.ey=w.l.py;}
    else{w.ex=w.g.px-6;w.ey=w.g.py+w.py;}
    if(Math.abs(w.s.y-w.ey)<3)continue;
    list.push(w);
  }
  list.sort(function(a,b){return Math.abs(b.ey-b.s.y)-Math.abs(a.ey-a.s.y);});
  for(i=0;i<list.length;i++){
    w=list[i];
    var y1=Math.min(w.s.y,w.ey)-1,y2=Math.max(w.s.y,w.ey)+1;
    var ideal=w.s.x+(w.ex-w.s.x)/2,base=Math.round(ideal/STEP),pick=null;
    for(var d=0;d<400&&pick===null;d++){
      for(var sg=(d===0?1:-1);sg<=1&&pick===null;sg+=2){
        var key=base+sg*d,arr=buckets[key],ok=true;
        if(arr)for(var m=0;m<arr.length;m++){
          var o=arr[m];
          if(o.n!==w.s&&o.a<y2&&o.b>y1){ok=false;break;}
        }
        if(ok)pick=key;
      }
    }
    if(pick===null)pick=base;
    (buckets[pick]||(buckets[pick]=[])).push({a:y1,b:y2,n:w.s});
    w.mx=pick*STEP;
  }
}

window.__cpu={
  reset:reset,
  buildCPU48:buildCPU48,
  buildQueue:buildQueue,
  relayout43:relayout43,
  routeWires:routeWires,
  simulate:simulate,
  tickOsc:tickOsc,
  renderFrame:function(view,lodEl){
    var r=svg.getBoundingClientRect();
    var vx1=-view.x/view.k,vy1=-view.y/view.k;
    var vx2=vx1+r.width/view.k,vy2=vy1+r.height/view.k;
    var lod=view.k,pad=40;
    clearLayer(lW);clearLayer(lG);clearLayer(lL);clearLayer(lU);clearLayer(lS);
    if(frame43) lS.appendChild(E("rect",{x:frame43.x,y:frame43.y,width:frame43.w,height:frame43.h,
      fill:"none",stroke:"#aaa","stroke-width":0.4,"vector-effect":"non-scaling-stroke"}));
    for(var i=0;i<sectionsData.length;i++){
      var s=sectionsData[i];
      if(s.x+s.w<vx1||s.x>vx2||s.y+s.h<vy1||s.y>vy2)continue;
      renderSection(s);
    }
    if(lod>0.03){
      for(var i=0;i<wires.length;i++){
        var w=wires[i];
        var sx=w.s.x,sy=w.s.y;
        if(sx===undefined||sy===undefined)continue;
        var dx,dy;
        if(w.l){dx=w.l.px-(w.l.sz||22)*0.4-2;dy=w.l.py;}
        else{dx=w.g.px-6;dy=w.g.py+w.py;}
        var mxw=(w.mx===undefined?sx:w.mx);
        var minx=Math.min(sx,dx,mxw),maxx=Math.max(sx,dx,mxw);
        var miny=Math.min(sy,dy),maxy=Math.max(sy,dy);
        if(maxx<vx1-pad||minx>vx2+pad||maxy<vy1-pad||miny>vy2+pad)continue;
        renderWire(sx,sy,dx,dy,w.s.v,w.mx);
      }
    }
    if(lod>0.08){
      for(var i=0;i<gates.length;i++){
        var g=gates[i];
        if(g.px+50<vx1-pad||g.px>vx2+pad)continue;
        if(g.py+44<vy1-pad||g.py>vy2+pad)continue;
        renderGate(g);
      }
    }
    if(lod>0.10){
      for(var i=0;i<sws.length;i++){
        var s=sws[i];
        if(s.px+70<vx1-pad||s.px>vx2+pad)continue;
        if(s.py+86<vy1-pad||s.py>vy2+pad)continue;
        renderSwitch(s);
      }
    }
    if(lod>0.12){
      for(var i=0;i<leds.length;i++){
        var l=leds[i];
        var rad=(l.sz||22)*0.5+4;
        if(l.px+rad<vx1||l.px-rad>vx2)continue;
        if(l.py+rad<vy1||l.py-rad>vy2)continue;
        renderLed(l);
      }
    }
    for(var i=0;i<labels.length;i++){
      var L=labels[i];
      if(L.x+300<vx1||L.x-300>vx2||L.y+50<vy1||L.y-50>vy2)continue;
      renderLabel(L);
    }
    if(lodEl){
      var lodText=lod>0.12?"full":lod>0.08?"no-LED":lod>0.05?"gates":lod>0.03?"wires":"sections";
      if(lodEl.textContent!=="LOD: "+lodText) lodEl.textContent="LOD: "+lodText;
    }
  },
  bounds:function(){
    var minX=Infinity,minY=Infinity,maxX=-Infinity,maxY=-Infinity;
    for(var i=0;i<sectionsData.length;i++){
      var s=sectionsData[i];
      if(s.x<minX)minX=s.x;if(s.y<minY)minY=s.y;
      if(s.x+s.w>maxX)maxX=s.x+s.w;if(s.y+s.h>maxY)maxY=s.y+s.h;
    }
    return {minX:minX,minY:minY,maxX:maxX,maxY:maxY};
  },
  frameInfo:function(){ return frame43; },
  addLabel:function(t,x,y,sz,c){ label(t,x,y,sz,c); },
  svg:svg,
  NS:NS
};
})();
