/* app.js — projects, main loop, rendering, UI */
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg",svg=document.getElementById("s");
function E(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e;}
function showErr(m){var el=document.getElementById("err");
el.style.display="block";el.textContent="ERROR: "+m;console.error(m);}
window.addEventListener("error",function(e){showErr(e.message+" @"+e.lineno);});

var CFG=CPU.cfg;
var SCR_W=CFG.SCR_W,SCR_H=CFG.SCR_H,LED_SZ=CFG.LED_SZ;
var CELL_COLS=CFG.CELL_COLS,CELL_ROWS=CFG.CELL_ROWS,SCR_BYTES=CFG.SCR_BYTES;
var RAM_SIZE=CFG.RAM_SIZE,PTR_BITS=CFG.PTR_BITS,SP_BITS=CFG.SP_BITS;

function PB(){
var p=[],labels={},patches=[];
function em(hi,lo,d,t,a){p.push([hi|0,lo|0,(d|0)&255,(t|0)&255,(a|0)&255]);return p.length-1;}
function lab(n){labels[n]=p.length;}
function jmp(n){var i=em(0x00,0x10,0,0,0);patches.push([i,n]);return i;}
function jz(t,n){var i=em(0x00,0x14,0,t,0);patches.push([i,n]);return i;}
function jnz(t,n){var i=em(0x00,0x15,0,t,0);patches.push([i,n]);return i;}
function jeq(n){var i=em(0x00,0x18,0,0,0);patches.push([i,n]);return i;}
function jne(n){var i=em(0x00,0x19,0,0,0);patches.push([i,n]);return i;}
function jlt(n){var i=em(0x00,0x16,0,0,0);patches.push([i,n]);return i;}
function fin(){for(var i=0;i<patches.length;i++)p[patches[i][0]][4]=labels[patches[i][1]];return p;}
return{
SET:function(d,t){return em(0x00,0x01,d,0,t);},
MOV:function(s,t){return em(0x00,0x02,0,s,t);},
ADD:function(d,tg,t){return em(0x00,0x04,d,tg,t);},
SUB:function(d,tg,t){return em(0x00,0x05,d,tg,t);},
MUL:function(d,tg,t){return em(0x00,0x06,d,tg,t);},
AND:function(d,tg,t){return em(0x00,0x08,d,tg,t);},
OR:function(d,tg,t){return em(0x00,0x09,d,tg,t);},
XOR:function(d,tg,t){return em(0x00,0x0A,d,tg,t);},
NOT:function(s,t){return em(0x00,0x0B,0,s,t);},
INC:function(s,t){return em(0x00,0x0C,0,s,t);},
DEC:function(s,t){return em(0x00,0x0D,0,s,t);},
JMP:jmp,CLR:function(t){return em(0x00,0x11,0,0,t);},
DELAY:function(d){return em(0x00,0x12,d,0,0);},
SCRCLR:function(){return em(0x00,0x13,0,0,0);},
JZ:jz,JNZ:jnz,JLT:jlt,JEQ:jeq,JNE:jne,
CMP:function(d,tg){return em(0x00,0x20,d,tg,0);},
SHL:function(s,t){return em(0x00,0x21,0,s,t);},
SHR:function(s,t){return em(0x00,0x22,0,s,t);},
HALT:function(){return em(0x00,0x23,0,0,0);},
RND:function(t){return em(0x00,0x2A,0,0,t);},
JOY:function(t){return em(0x00,0x2C,0,0,t);},
BYTE:function(d,tg){return em(0x00,0x2F,d,tg,0);},
TIME:function(t){return em(0x00,0x30,0,0,t);},
DRAWC:function(cellR,charR){return em(0x00,0x34,cellR,charR,0);},
label:lab,finish:fin
};}

function buildCharSel(){
var B=PB();
var CX=240,TX=241,JY=242,PV=243,T1=244,T2=245,T3=246;
var CR=247,CH=248;
B.SCRCLR();
B.SET(0,CX);B.SET(0,TX);B.SET(0,PV);
for(var i=0;i<8;i++){
B.SET(i,CH);
B.SET(10+i,CR);
B.DRAWC(CR,CH);
}
B.SET(40,CH);B.SET(18,CR);B.DRAWC(CR,CH);
for(var i=0;i<8;i++){
B.SET(39,CH);B.SET(20+i,CR);B.DRAWC(CR,CH);
}
B.label("MAIN");
B.JOY(JY);
B.SET(8,T1);B.AND(JY,T1,T2);B.AND(PV,T1,T3);B.NOT(T3,T3);B.AND(T2,T3,T2);
B.JZ(T2,"SKR");
B.INC(CX,CX);
B.SET(9,T1);B.CMP(CX,T1);B.JEQ("WR");
B.JMP("SKR");
B.label("WR");B.SET(0,CX);
B.label("SKR");
B.SET(4,T1);B.AND(JY,T1,T2);B.AND(PV,T1,T3);B.NOT(T3,T3);B.AND(T2,T3,T2);
B.JZ(T2,"SKL");
B.SET(0,T1);B.CMP(CX,T1);B.JEQ("SKL");
B.DEC(CX,CX);
B.label("SKL");
B.SET(16,T1);B.AND(JY,T1,T2);B.AND(PV,T1,T3);B.NOT(T3,T3);B.AND(T2,T3,T2);
B.JZ(T2,"SKP");
B.SET(8,T1);B.CMP(CX,T1);B.JEQ("ENTER");
B.MOV(CX,CH);
B.SET(20,T1);B.ADD(TX,T1,T2);
B.MOV(T2,CR);
B.DRAWC(CR,CH);
B.INC(TX,TX);
B.SET(8,T1);B.CMP(TX,T1);B.JNE("SKP");
B.SET(0,TX);
B.JMP("SKP");
B.label("ENTER");
for(var i=0;i<8;i++){B.SET(39,CH);B.SET(20+i,CR);B.DRAWC(CR,CH);}
B.SET(0,TX);
B.label("SKP");
B.MOV(JY,PV);
B.DELAY(2);
B.JMP("MAIN");
return B.finish();}

function buildPlasma(){
var B=PB();var I=240,T=241,V=242,LIM=243;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(0,I);
B.label("I");
B.TIME(T);B.XOR(I,T,V);B.BYTE(V,I);
B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(2);B.JMP("L");
return B.finish();}
function buildNoise(){
var B=PB();var I=240,R=241,LIM=242;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(0,I);
B.label("I");
B.RND(R);B.BYTE(R,I);
B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(2);B.JMP("L");
return B.finish();}
function buildMoire(){
var B=PB();var I=240,T=241,V=242,LIM=243;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(0,I);
B.label("I");
B.SHR(I,V);B.XOR(I,V,V);B.SHR(V,V);
B.TIME(T);B.XOR(V,T,V);B.BYTE(V,I);
B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(2);B.JMP("L");
return B.finish();}
function buildWave(){
var B=PB();var I=240,T=241,V=242,LIM=243;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(0,I);
B.label("I");
B.TIME(T);B.XOR(I,T,V);B.SHL(V,V);B.SHL(V,V);
B.XOR(I,V,V);B.SHR(V,V);B.XOR(T,V,V);
B.BYTE(V,I);B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(2);B.JMP("L");
return B.finish();}
function buildMandel(){
var B=PB();var I=240,T=241,V=242,LIM=243;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(0,I);
B.label("I");
B.TIME(T);B.XOR(I,T,V);B.ADD(T,V,V);B.MUL(I,V,V);B.SHR(V,V);B.XOR(T,V,V);
B.BYTE(V,I);B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(2);B.JMP("L");
return B.finish();}
function buildFire(){
var B=PB();var I=240,T=241,V=242,LIM=243;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(0,I);
B.label("I");
B.SHL(I,V);B.ADD(I,V,V);B.TIME(T);B.ADD(T,V,V);B.XOR(I,V,V);B.SHR(V,V);
B.BYTE(V,I);B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(2);B.JMP("L");
return B.finish();}
function buildInvert(){
var B=PB();var I=240,T=241,V=242,LIM=243;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(0,I);
B.label("I");
B.TIME(T);B.XOR(I,T,V);B.NOT(V,V);B.BYTE(V,I);
B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(2);B.JMP("L");
return B.finish();}
function buildScroll(){
var B=PB();var I=240,T=241,V=242,LIM=243;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(0,I);
B.label("I");
B.TIME(T);B.ADD(T,I,V);B.XOR(I,V,V);B.SHL(V,V);B.XOR(T,V,V);
B.BYTE(V,I);B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(2);B.JMP("L");
return B.finish();}
function buildHyperspace(){
var B=PB();var I=240,R=241,T=242,M=243;
B.SET(15,M);
B.label("L");
B.RND(R);B.AND(R,M,R);B.SHL(R,R);B.SHL(R,R);B.SHL(R,R);B.SHL(R,R);
B.TIME(T);B.AND(T,M,T);B.INC(T,T);B.BYTE(T,R);
B.DELAY(1);B.JMP("L");
return B.finish();}
function buildLife(){
var B=PB();var I=240,T=241,V=242,LIM=243,L=244,R=245;
B.SET(SCR_BYTES,LIM);
B.label("L");B.SET(1,I);
B.label("I");
B.SET(1,T);B.SUB(T,I,T);B.MOV(T,L);
B.SET(1,T);B.ADD(T,I,T);B.MOV(T,R);
B.XOR(L,R,V);B.TIME(T);B.XOR(T,V,V);B.BYTE(V,I);
B.INC(I,I);B.CMP(LIM,I);B.JNE("I");
B.DELAY(3);B.JMP("L");
return B.finish();}

var PROJECTS=[
{id:"charsel",name:"CHAR SELECTOR",program:buildCharSel()},
{id:"plasma",name:"PLASMA",program:buildPlasma()},
{id:"noise",name:"NOISE",program:buildNoise()},
{id:"moire",name:"MOIRE",program:buildMoire()},
{id:"wave",name:"WAVE",program:buildWave()},
{id:"mandel",name:"MANDELBROT",program:buildMandel()},
{id:"fire",name:"FIRE",program:buildFire()},
{id:"invert",name:"INVERT",program:buildInvert()},
{id:"scroll",name:"SCROLL",program:buildScroll()},
{id:"hyper",name:"HYPERSPACE",program:buildHyperspace()},
{id:"life",name:"CELLULAR",program:buildLife()}
];

var state=CPU.build();
var gates=state.gates,sws=state.sws,leds=state.leds,latches=state.latches;
var wires=state.wires,sectionsData=state.sectionsData,core=state.core;
var screenLeds=state.screenLeds;

function routeWires(){var STEP=2,buckets={},list=[],i,w;
for(i=0;i<wires.length;i++){w=wires[i];delete w.mx;if(!w.s||w.s.x===undefined)continue;
if(w.l){w.ex=w.l.px-(w.l.sz||22)*0.4-2;w.ey=w.l.py;}
else if(w.g&&w.g.px!==undefined){w.ex=w.g.px-6;w.ey=w.g.py+w.py;}else{continue;}
if(Math.abs(w.s.y-w.ey)<3)continue;list.push(w);}
list.sort(function(a,b){return Math.abs(b.ey-b.s.y)-Math.abs(a.ey-a.s.y);});
for(i=0;i<list.length;i++){w=list[i];
var y1=Math.min(w.s.y,w.ey)-1,y2=Math.max(w.s.y,w.ey)+1;
var ideal=w.s.x+(w.ex-w.s.x)/2,base=Math.round(ideal/STEP),pick=null;
for(var d=0;d<400&&pick===null;d++){
for(var sg=(d===0?1:-1);sg<=1&&pick===null;sg+=2){
var key=base+sg*d,arr=buckets[key],ok=true;
if(arr)for(var m=0;m<arr.length;m++){var o=arr[m];
if(o.n!==w.s&&o.a<y2&&o.b>y1){ok=false;break;}}
if(ok)pick=key;}}
if(pick===null)pick=base;
(buckets[pick]||(buckets[pick]=[])).push({a:y1,b:y2,n:w.s});w.mx=pick*STEP;}}

function relayout(){
var M=80,GX=30,GY=30;
var byTitle={};var i,k;
for(i=0;i<sectionsData.length;i++)byTitle[sectionsData[i].title]=sectionsData[i];
function move(s,nx,ny){var dx=nx-s.x,dy=ny-s.y;
for(k=s.g0;k<s.g1;k++){var g=gates[k];g.px+=dx;g.py+=dy;g.o.x+=dx;g.o.y+=dy;}
for(k=s.s0;k<s.s1;k++){var q=sws[k];q.px+=dx;q.py+=dy;q.o.x+=dx;q.o.y+=dy;}
for(k=s.l0;k<s.l1;k++){var l=leds[k];l.px+=dx;l.py+=dy;}
for(k=s.lt0;k<s.lt1;k++){var lt=latches[k];lt.px+=dx;lt.py+=dy;lt.o.x+=dx;lt.o.y+=dy;}
s.x=nx;s.y=ny;}
var inT=["INPUT · OP_HI","INPUT · OP_LO","INPUT · DATA","INPUT · TAG","INPUT · DEST","INPUT · ACTION","INPUT · CLK"];
var x=M,y=M,inW=0;
for(i=0;i<inT.length;i++){var sc=byTitle[inT[i]];if(!sc)continue;
move(sc,x,y);y+=sc.h+GY;if(sc.w>inW)inW=sc.w;}
var scrX=M+inW+GX*2,scrY=M;
var screenSec=byTitle["SCREEN · GRID "+SCR_W+"×"+SCR_H];
var joySec=byTitle["INPUT · JOYSTICK"];
var rightH=0;
if(screenSec){move(screenSec,scrX,scrY);scrY+=screenSec.h+GY;rightH+=screenSec.h+GY;}
if(joySec){move(joySec,scrX,scrY);rightH+=joySec.h;}
var logicTop=Math.max(y,M+rightH)+GY*3;
var logicX=M,logicY=logicTop,rowH=0;
var maxW=Math.max(3000,window.innerWidth*4);
var used={};
for(i=0;i<inT.length;i++)used[inT[i]]=1;
used["SCREEN · GRID "+SCR_W+"×"+SCR_H]=1;
used["INPUT · JOYSTICK"]=1;
var logic=[];
for(i=0;i<sectionsData.length;i++)if(!used[sectionsData[i].title])logic.push(sectionsData[i]);
logic.sort(function(a,b){return b.h-a.h;});
for(i=0;i<logic.length;i++){var s2=logic[i];
if(logicX+s2.w>maxW&&logicX>M){logicX=M;logicY+=rowH+GY;rowH=0;}
move(s2,logicX,logicY);
logicX+=s2.w+GX;if(s2.h>rowH)rowH=s2.h;}
var mnx=Infinity,mny=Infinity,mxx=-Infinity,mxy=-Infinity;
for(i=0;i<sectionsData.length;i++){var ss=sectionsData[i];
if(ss.x<mnx)mnx=ss.x;if(ss.y<mny)mny=ss.y;
if(ss.x+ss.w>mxx)mxx=ss.x+ss.w;if(ss.y+ss.h>mxy)mxy=ss.y+ss.h;}
return{x:mnx,y:mny,w:mxx-mnx,h:mxy-mny};}

var vp=E("g",{});svg.appendChild(vp);
var lS=E("g",{}),lWo=E("g",{}),lWn=E("g",{}),lScr=E("g",{}),lG=E("g",{}),lL=E("g",{}),lU=E("g",{});
vp.appendChild(lS);vp.appendChild(lWo);vp.appendChild(lWn);
vp.appendChild(lScr);
vp.appendChild(lG);vp.appendChild(lL);vp.appendChild(lU);

var pixEls=[];
var LED_R=LED_SZ*0.52, LED_RI=LED_SZ*0.32;
function ensurePixelEls(){
if(pixEls.length)return;
for(var r=0;r<SCR_H;r++){pixEls.push([]);
for(var c=0;c<SCR_W;c++){
var led=screenLeds[r][c];
var g=E("g",{transform:"translate("+led.px+","+led.py+")"});
g.appendChild(E("circle",{cx:0,cy:0,r:LED_R,fill:"#e0e0e0",stroke:"#555","stroke-width":0.4}));
var inner=E("circle",{cx:0,cy:0,r:LED_RI,fill:"#f6f6f6",stroke:"none"});
g.appendChild(inner);
lScr.appendChild(g);
pixEls[r].push(inner);
}}}
function refreshScreen(){
for(var r=0;r<SCR_H;r++)for(var c=0;c<SCR_W;c++){
var led=screenLeds[r][c];
var on=led.i.v?1:0;
if(led._lv!==on){
led._lv=on;
var el=pixEls[r][c];
if(el)el.setAttribute("fill",on?"#ff2020":"#f6f6f6");
}}}

function clearLayer(g){while(g.firstChild)g.removeChild(g.firstChild);}
function renderSection(s){
lS.appendChild(E("rect",{x:s.x,y:s.y,width:s.w,height:s.h,fill:"#fafafa",stroke:s.color,"stroke-width":1.5,"stroke-dasharray":"6 3"}));
lS.appendChild(E("rect",{x:s.x,y:s.y,width:s.w,height:22,fill:s.color,opacity:0.20}));
lS.appendChild(E("line",{x1:s.x,y1:s.y+22,x2:s.x+s.w,y2:s.y+22,stroke:s.color,"stroke-width":1}));
var t=E("text",{x:s.x+10,y:s.y+15,"font-size":11,"font-weight":700,fill:s.color});
t.textContent=s.title;lS.appendChild(t);}
function gateBody(t){switch(t){
case "AND":return "M0,0 L14,0 A17,17 0 0 1 14,30 L0,30 Z";
case "OR":return "M0,0 Q12,0 30,15 Q12,30 0,30 Q10,15 0,0 Z";
case "NOT":return "M0,0 L30,15 L0,30 Z";
case "XOR":return "M4,0 Q17,0 34,15 Q17,30 4,30 Q15,15 4,0 Z";}
return "M0,0 L34,0 L34,30 L0,30 Z";}
function renderGate(g){var grp=E("g",{transform:"translate("+g.px+","+g.py+")"});
grp.appendChild(E("path",{d:gateBody(g.t),fill:"#fff",stroke:"#222","stroke-width":1}));
if(g.t==="XOR")grp.appendChild(E("path",{d:"M0,0 Q10,15 0,30",fill:"none",stroke:"#222","stroke-width":1}));
if(g.t==="NOT")grp.appendChild(E("circle",{cx:33,cy:15,r:3,fill:"#fff",stroke:"#222","stroke-width":1}));
var n=(g.t==="NOT")?1:2;
for(var i=0;i<n;i++){var y=n===1?15:(i===0?10:20);
grp.appendChild(E("line",{x1:-6,y1:y,x2:0,y2:y,stroke:"#222","stroke-width":1}));}
grp.appendChild(E("line",{x1:34,y1:15,x2:40,y2:15,stroke:"#222","stroke-width":1}));
lG.appendChild(grp);}
function renderLatch(l){var grp=E("g",{transform:"translate("+l.px+","+l.py+")"});
grp.appendChild(E("rect",{x:0,y:0,width:46,height:40,fill:"#fff",stroke:"#222","stroke-width":1}));
grp.appendChild(E("line",{x1:-6,y1:15,x2:0,y2:15,stroke:"#222","stroke-width":1}));
grp.appendChild(E("line",{x1:-6,y1:38,x2:0,y2:38,stroke:"#222","stroke-width":1}));
grp.appendChild(E("line",{x1:46,y1:20,x2:52,y2:20,stroke:"#222","stroke-width":1}));
var dot=E("circle",{cx:23,cy:20,r:2,fill:l.prev?"#0a7":"#ccc"});
grp.appendChild(dot);lG.appendChild(grp);}
function renderSwitch(s){var w=38,h=46;
var grp=E("g",{transform:"translate("+s.px+","+s.py+")"});
if(s.osc){
grp.appendChild(E("rect",{x:0,y:0,width:w,height:h,fill:s.v?"#8ab4ff":"#dbe9ff",stroke:"#222","stroke-width":1}));
grp.appendChild(E("path",{d:"M5,23 H10 L14,11 L22,35 L26,23 H33",fill:"none",stroke:"#1a56db","stroke-width":1}));}
else{
grp.appendChild(E("rect",{x:0,y:0,width:w,height:h,fill:s.v?"#a7f3a7":"#c8c8c8",stroke:"#222","stroke-width":1}));
var ky=s.v?4:h-20;
grp.appendChild(E("rect",{x:4,y:ky,width:w-8,height:15,fill:"#fff",stroke:"#222","stroke-width":1}));}
grp.appendChild(E("line",{x1:w,y1:23,x2:w+12,y2:23,stroke:"#222","stroke-width":1}));
if(s.label){var t=E("text",{x:w/2,y:h+11,"text-anchor":"middle","font-size":8,"font-weight":700,fill:"#222"});
t.textContent=s.label;grp.appendChild(t);}
if(!s.osc){var hit=E("rect",{x:0,y:0,width:w,height:h,fill:"transparent",cursor:"pointer",class:"swhit"});
grp.appendChild(hit);
hit.addEventListener("pointerdown",function(ev){ev.stopPropagation();ev.preventDefault();
s.v=s.v?0:1;
if(s.v&&(s.label==="UP"||s.label==="DOWN"||s.label==="LEFT"||s.label==="RIGHT"||s.label==="POINT"))
setTimeout(function(){s.v=0;},180);});}
lU.appendChild(grp);}
function renderIndicatorLed(l){var sz=l.sz||10;
if(l.screen)return;
var on=l.i?l.i.v:0;
var fill=on?(l.c||"#39d353"):"#e8e8e8";
var grp=E("g",{transform:"translate("+l.px+","+l.py+")"});
grp.appendChild(E("circle",{cx:0,cy:0,r:sz*0.4,fill:"#fff",stroke:"#222","stroke-width":1}));
grp.appendChild(E("circle",{cx:0,cy:0,r:sz*0.22,fill:fill}));
lL.appendChild(grp);}

var _cachedRect=null,_cacheT=0;
function getRect(){var n=performance.now();
if(!_cachedRect||n-_cacheT>200){_cachedRect=svg.getBoundingClientRect();_cacheT=n;}
return _cachedRect;}
function renderFrame(){
var r=getRect();
var vx1=-view.x/view.k,vy1=-view.y/view.k,vx2=vx1+r.width/view.k,vy2=vy1+r.height/view.k;
var lod=view.k,pad=80;
var showSections=lod>0.0018,showGates=lod>0.020,showSwitches=lod>0.028,showWires=lod>0.006;
var minimal=lod<0.025;
clearLayer(lG);clearLayer(lL);clearLayer(lU);clearLayer(lS);clearLayer(lWn);clearLayer(lWo);
if(showSections)for(var i=0;i<sectionsData.length;i++){var s=sectionsData[i];
if(s.x+s.w<vx1||s.x>vx2||s.y+s.h<vy1||s.y>vy2)continue;renderSection(s);}
if(showWires){
var offD="";
var busPaths={"#4a9eff":"","#ffb020":"","#a060ff":"","#39d353":"","#ff4d4d":"","#888":""};
for(var i=0;i<wires.length;i++){var w=wires[i];
var sx=w.s.x,sy=w.s.y;if(sx===undefined||sy===undefined)continue;
var dx,dy;
if(w.l){dx=w.l.px-(w.l.sz||10)*0.4-2;dy=w.l.py;}
else{dx=w.g.px-6;dy=w.g.py+w.py;}
var mxw=(w.mx===undefined?sx:w.mx);
var minx=Math.min(sx,dx,mxw),maxx=Math.max(sx,dx,mxw);
var miny=Math.min(sy,dy),maxy=Math.max(sy,dy);
if(maxx<vx1-pad||minx>vx2+pad||maxy<vy1-pad||miny>vy2+pad)continue;
var p;
if(minimal)p="M"+sx+","+sy+"L"+dx+","+dy;
else if(Math.abs(sy-dy)<3)p="M"+sx+","+sy+"H"+dx;
else p="M"+sx+","+sy+"H"+mxw+"V"+dy+"H"+dx;
var col;
if(w.s.v){
if(/^INPUT/.test(w.sect||""))col="#4a9eff";
else if(/^ALU/.test(w.sect||""))col="#39d353";
else if(/^(FETCH|MUX|CTRL)/.test(w.sect||""))col="#ffb020";
else if(/^(STORAGE|QUEUE|STACK|RAM|SCREEN|FONT)/.test(w.sect||""))col="#a060ff";
else if(/^(OUTPUT|POP|HALT|JOY|RND|HW|DRAWC|BYTE)/.test(w.sect||""))col="#ff4d4d";
else col="#888";
busPaths[col]+=p;}
else offD+=p;}
if(offD){
lWo.appendChild(E("path",{d:offD,fill:"none",stroke:"#999","stroke-width":minimal?1.4:2.0,"stroke-linejoin":"round","stroke-linecap":"round"}));
lWo.appendChild(E("path",{d:offD,fill:"none",stroke:"#fff","stroke-width":minimal?0.7:1.0,"stroke-linejoin":"round","stroke-linecap":"round"}));}
for(var col in busPaths)if(busPaths[col])
lWn.appendChild(E("path",{d:busPaths[col],fill:"none",stroke:col,"stroke-width":minimal?1.2:1.9,"stroke-linejoin":"round","stroke-linecap":"round",opacity:0.95}));}
if(showGates){for(var i=0;i<gates.length;i++){var g=gates[i];
if(g.px+50<vx1-pad||g.px>vx2+pad)continue;
if(g.py+44<vy1-pad||g.py>vy2+pad)continue;renderGate(g);}
for(var i=0;i<latches.length;i++){var l=latches[i];
if(l.px+54<vx1-pad||l.px-8>vx2+pad)continue;
if(l.py+44<vy1-pad||l.py-4>vy2+pad)continue;renderLatch(l);}}
if(showSwitches)for(var i=0;i<sws.length;i++){var s=sws[i];
if(s.px+70<vx1-pad||s.px>vx2+pad)continue;
if(s.py+86<vy1-pad||s.py>vy2+pad)continue;renderSwitch(s);}
for(var i=0;i<leds.length;i++){var l=leds[i];
if(l.screen)continue;
var rad=(l.sz||10)*0.5+4;
if(l.px+rad<vx1||l.px-rad>vx2)continue;
if(l.py+rad<vy1||l.py-rad>vy2)continue;renderIndicatorLed(l);}}

function fitAll(){var r=svg.getBoundingClientRect();
var k=Math.min(r.width/frame43.w,r.height/frame43.h)*0.95;
if(k<0.0015)k=0.0015;
view.k=k;view.x=(r.width-frame43.w*k)/2-frame43.x*k;
view.y=(r.height-frame43.h*k)/2-frame43.y*k;applyView();}
function fitScreen(){var r=svg.getBoundingClientRect();
var x1=Infinity,y1=Infinity,x2=-Infinity,y2=-Infinity,found=false;
for(var i=0;i<sectionsData.length;i++){var s=sectionsData[i];
if(s.title==="SCREEN · GRID "+SCR_W+"×"+SCR_H||s.title==="INPUT · JOYSTICK"){
found=true;if(s.x<x1)x1=s.x;if(s.y<y1)y1=s.y;
if(s.x+s.w>x2)x2=s.x+s.w;if(s.y+s.h>y2)y2=s.y+s.h;}}
if(!found){fitAll();return;}
var w=x2-x1,h=y2-y1,cx=(x1+x2)/2,cy=(y1+y2)/2;
var k=Math.min(r.width/(w+120),r.height/(h+120))*0.92;
if(k<0.03)k=0.03;if(k>2.5)k=2.5;
view.k=k;view.x=r.width/2-cx*k;view.y=r.height/2-cy*k;applyView();}

function readLatches8(arr,idx){var v=0;if(!arr[idx])return 0;
for(var b=0;b<8;b++)if(arr[idx][b]&&arr[idx][b].o.v)v|=(1<<b);
return v;}
function readPTR(){var v=0;
for(var b=0;b<PTR_BITS;b++)if(core.ptr[b]&&core.ptr[b].o.v)v|=(1<<b);
return v;}
function readSP(){var v=0;
for(var b=0;b<SP_BITS;b++)if(core.sp[b]&&core.sp[b].o.v)v|=(1<<b);
return v;}
function readTMR(){var v=0;
for(var b=0;b<8;b++)if(core.hwTimer[b]&&core.hwTimer[b].o.v)v|=(1<<b);
return v;}
function readIR(){var hi=0,lo=0;
for(var b=0;b<8;b++)if(core.finalHi[b]&&core.finalHi[b].v)hi|=(1<<b);
for(var b=0;b<8;b++)if(core.finalLo[b]&&core.finalLo[b].v)lo|=(1<<b);
return (hi<<8)|lo;}
function updateHUD(){
document.getElementById("hudPTR").textContent=readPTR();
document.getElementById("hudSP").textContent=readSP();
document.getElementById("hudTMR").textContent=readTMR();
document.getElementById("hudCUR").textContent=
readLatches8(core.RAM,240)+","+readLatches8(core.RAM,241);
var ir=readIR(),hex=ir.toString(16).toUpperCase();
while(hex.length<4)hex="0"+hex;
document.getElementById("hudIR").textContent=hex;
document.getElementById("hudMN").textContent=CPU.MN[ir]||"?";}
function updateGateCount(){var total=gates.length+sws.length+leds.length;
document.getElementById("gcount").textContent=
"· "+total.toLocaleString()+" gates · "+latches.length.toLocaleString()+" FFs";}

function initProj(){
var box=document.getElementById("projSel");
var dd=document.getElementById("projDropdown");
while(dd.firstChild)dd.removeChild(dd.firstChild);
for(var i=0;i<PROJECTS.length;i++){
var o=document.createElement("option");o.value=PROJECTS[i].id;o.textContent=PROJECTS[i].name;
dd.appendChild(o);}
dd.onchange=function(){
for(var j=0;j<PROJECTS.length;j++)if(PROJECTS[j].id===dd.value){
CPU.loadProgram(PROJECTS[j]);
for(var b=0;b<PTR_BITS;b++)if(core.ptr[b]){core.ptr[b].prev=0;core.ptr[b].o.v=0;core.ptr[b].prevEn=0;}
if(core.halt){core.halt.prev=0;core.halt.o.v=0;core.halt.prevEn=0;}
for(var k=0;k<40;k++){CPU.tickOsc();CPU.simulate();}
updateHUD();refreshScreen();
return;}};
box.style.display="flex";}

var view={x:0,y:0,k:1};
var MIN_K=0.0002,MAX_K=40;
function applyView(){vp.setAttribute("transform","translate("+view.x+","+view.y+") scale("+view.k+")");}
function setZoomAt(nk,cx,cy){nk=Math.min(MAX_K,Math.max(MIN_K,nk));
var s=nk/view.k;view.x=cx-(cx-view.x)*s;view.y=cy-(cy-view.y)*s;view.k=nk;applyView();}
function zoomC(f){var r=svg.getBoundingClientRect();
setZoomAt(view.k*f,r.width/2,r.height/2);}
svg.addEventListener("wheel",function(e){e.preventDefault();
var r=svg.getBoundingClientRect();
setZoomAt(view.k*(e.deltaY<0?1.12:1/1.12),e.clientX-r.left,e.clientY-r.top);},{passive:false});
var ptrs={},panS=null,pinchS=null,mode=null;
svg.addEventListener("pointerdown",function(e){
if(e.target&&e.target.classList&&e.target.classList.contains("swhit"))return;
if(e.button!==undefined&&e.button!==0&&e.pointerType==="mouse")return;
ptrs[e.pointerId]={x:e.clientX,y:e.clientY};
try{svg.setPointerCapture(e.pointerId);}catch(err){}
var ids=Object.keys(ptrs);
if(ids.length===1){mode="pan";panS={x:e.clientX,y:e.clientY,ox:view.x,oy:view.y,moved:false};
svg.classList.add("drag");}
else if(ids.length===2){mode="pinch";
var p0=ptrs[ids[0]],p1=ptrs[ids[1]];
pinchS={d:Math.hypot(p0.x-p1.x,p0.y-p1.y),cx:(p0.x+p1.x)/2,cy:(p0.y+p1.y)/2,
k:view.k,x:view.x,y:view.y};panS=null;}});
svg.addEventListener("pointermove",function(e){
if(!ptrs[e.pointerId])return;
ptrs[e.pointerId].x=e.clientX;ptrs[e.pointerId].y=e.clientY;
if(mode==="pinch"){var ids=Object.keys(ptrs);if(ids.length<2)return;
var p0=ptrs[ids[0]],p1=ptrs[ids[1]];
var d=Math.hypot(p0.x-p1.x,p0.y-p1.y);
var cx=(p0.x+p1.x)/2,cy=(p0.y+p1.y)/2;
var r=svg.getBoundingClientRect();
var f=d/pinchS.d,nk=Math.min(MAX_K,Math.max(MIN_K,pinchS.k*f)),s=nk/pinchS.k;
var mx=pinchS.cx-r.left,my=pinchS.cy-r.top;
var nmx=cx-r.left,nmy=cy-r.top;
view.x=nmx-(mx-pinchS.x)*s;view.y=nmy-(my-pinchS.y)*s;view.k=nk;applyView();}
else if(mode==="pan"&&panS){
var dx=e.clientX-panS.x,dy=e.clientY-panS.y;
if(Math.abs(dx)>3||Math.abs(dy)>3)panS.moved=true;
if(panS.moved){view.x=panS.ox+dx;view.y=panS.oy+dy;applyView();}}});
function endPtr(e){delete ptrs[e.pointerId];var ids=Object.keys(ptrs);
if(ids.length===0){mode=null;panS=null;pinchS=null;svg.classList.remove("drag");}
else if(ids.length===1){mode="pan";var id=ids[0];
panS={x:ptrs[id].x,y:ptrs[id].y,ox:view.x,oy:view.y,moved:false};pinchS=null;}}
svg.addEventListener("pointerup",endPtr);
svg.addEventListener("pointercancel",endPtr);
svg.addEventListener("pointerleave",function(e){if(ptrs[e.pointerId])endPtr(e);});
svg.addEventListener("dblclick",function(){fitScreen();});
document.getElementById("zoomIn").addEventListener("click",function(){zoomC(1.3);});
document.getElementById("zoomOut").addEventListener("click",function(){zoomC(1/1.3);});
document.getElementById("zoomReset").addEventListener("click",function(){fitAll();});

routeWires();
var frame43=relayout();
ensurePixelEls();
initProj();
CPU.loadProgram(PROJECTS[0]);
for(var k=0;k<60;k++){CPU.tickOsc();CPU.simulate();}
updateHUD();
refreshScreen();
updateGateCount();
fitScreen();
renderFrame();

setInterval(function(){
try{
  for(var i=0;i<14;i++){
    CPU.tickOsc();
    CPU.simulate();
  }
  updateHUD();
  refreshScreen();
}catch(e){showErr((e&&e.message)||String(e));}},25);
var _lastR=0;
requestAnimationFrame(function loop(t){
requestAnimationFrame(loop);
if(t-_lastR<40)return;_lastR=t;
try{renderFrame();}catch(e){showErr((e&&e.message)||String(e));}});
})();
