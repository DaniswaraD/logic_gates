/* cpu.js — logic circuit builder + simulator */
(function(){
"use strict";
var NS="http://www.w3.org/2000/svg";
function E(t,a){var e=document.createElementNS(NS,t);for(var k in a)e.setAttribute(k,a[k]);return e;}

var SCR_W=80, SCR_H=24, LED_SZ=6;
var CELL_COLS=10, CELL_ROWS=3, CELLS=30, SCR_BYTES=240;
var RAM_SIZE=256, QUEUE_SLOTS=64, PTR_BITS=6, STACK_DEPTH=16, SP_BITS=4;

var OP={};
OP.NOP=0x0000;OP.SET=0x0001;OP.MOV=0x0002;OP.ADD=0x0004;OP.SUB=0x0005;OP.MUL=0x0006;OP.DIV=0x0007;
OP.AND=0x0008;OP.OR=0x0009;OP.XOR=0x000A;OP.NOT=0x000B;OP.INC=0x000C;OP.DEC=0x000D;
OP.JMP=0x0010;OP.CLR=0x0011;OP.DELAY=0x0012;OP.SCRCLR=0x0013;
OP.JZ=0x0014;OP.JNZ=0x0015;OP.JLT=0x0016;OP.JGT=0x0017;OP.JEQ=0x0018;OP.JNE=0x0019;
OP.CMP=0x0020;OP.SHL=0x0021;OP.SHR=0x0022;OP.HALT=0x0023;
OP.RND=0x002A;OP.SEED=0x002B;OP.JOY=0x002C;OP.CHR=0x002E;OP.BYTE=0x002F;OP.TIME=0x0030;
OP.DRAWC=0x0034;OP.PUSH=0x0100;OP.POP=0x0101;OP.DUP=0x0102;OP.SWAP=0x0103;
var ALL_OPS=[OP.NOP,OP.SET,OP.MOV,OP.ADD,OP.SUB,OP.MUL,OP.DIV,OP.AND,OP.OR,OP.XOR,OP.NOT,OP.INC,OP.DEC,
OP.JMP,OP.CLR,OP.DELAY,OP.SCRCLR,OP.JZ,OP.JNZ,OP.JLT,OP.JGT,OP.JEQ,OP.JNE,
OP.CMP,OP.SHL,OP.SHR,OP.HALT,OP.RND,OP.SEED,OP.JOY,OP.CHR,OP.BYTE,OP.TIME,OP.DRAWC,
OP.PUSH,OP.POP,OP.DUP,OP.SWAP];
var MN={};
MN[OP.NOP]="NOP";MN[OP.SET]="SET";MN[OP.MOV]="MOV";MN[OP.ADD]="ADD";MN[OP.SUB]="SUB";MN[OP.MUL]="MUL";
MN[OP.DIV]="DIV";MN[OP.AND]="AND";MN[OP.OR]="OR";MN[OP.XOR]="XOR";MN[OP.NOT]="NOT";MN[OP.INC]="INC";
MN[OP.DEC]="DEC";MN[OP.JMP]="JMP";MN[OP.CLR]="CLR";MN[OP.DELAY]="DELAY";MN[OP.SCRCLR]="SCRCLR";
MN[OP.JZ]="JZ";MN[OP.JNZ]="JNZ";MN[OP.JLT]="JLT";MN[OP.JGT]="JGT";MN[OP.JEQ]="JEQ";MN[OP.JNE]="JNE";
MN[OP.CMP]="CMP";MN[OP.SHL]="SHL";MN[OP.SHR]="SHR";MN[OP.HALT]="HALT";MN[OP.RND]="RND";MN[OP.SEED]="SEED";
MN[OP.JOY]="JOY";MN[OP.CHR]="CHR";MN[OP.BYTE]="BYTE";MN[OP.TIME]="TIME";MN[OP.DRAWC]="DRAWC";
MN[OP.PUSH]="PUSH";MN[OP.POP]="POP";MN[OP.DUP]="DUP";MN[OP.SWAP]="SWAP";

var FONT8=[
0x00,0x70,0x88,0x88,0xF8,0x88,0x88,0x00,0x00,0xF0,0x88,0x88,0xF0,0x88,0x88,0xF0,
0x00,0x78,0x80,0x80,0x80,0x80,0x80,0x78,0x00,0xF0,0x88,0x88,0x88,0x88,0x88,0xF0,
0x00,0xF8,0x80,0x80,0xF0,0x80,0x80,0xF8,0x00,0xF8,0x80,0x80,0xF0,0x80,0x80,0x80,
0x00,0x78,0x80,0x80,0xB8,0x88,0x88,0x78,0x00,0x88,0x88,0x88,0xF8,0x88,0x88,0x88,
0x00,0xF8,0x20,0x20,0x20,0x20,0x20,0xF8,0x00,0x08,0x08,0x08,0x08,0x88,0x88,0x70,
0x00,0x88,0x90,0xA0,0xC0,0xA0,0x90,0x88,0x00,0x80,0x80,0x80,0x80,0x80,0x80,0xF8,
0x00,0x88,0xD8,0xA8,0xA8,0x88,0x88,0x88,0x00,0x88,0xC8,0xA8,0x98,0x88,0x88,0x88,
0x00,0x70,0x88,0x88,0x88,0x88,0x88,0x70,0x00,0xF0,0x88,0x88,0xF0,0x80,0x80,0x80,
0x00,0x70,0x88,0x88,0x88,0xA8,0x90,0x68,0x00,0xF0,0x88,0x88,0xF0,0xA0,0x90,0x88,
0x00,0x78,0x80,0x80,0x70,0x08,0x08,0xF0,0x00,0xF8,0x20,0x20,0x20,0x20,0x20,0x20,
0x00,0x88,0x88,0x88,0x88,0x88,0x88,0x70,0x00,0x88,0x88,0x88,0x88,0x88,0x50,0x20,
0x00,0x88,0x88,0x88,0xA8,0xA8,0xD8,0x88,0x00,0x88,0x88,0x50,0x20,0x50,0x88,0x88,
0x00,0x88,0x88,0x88,0x70,0x20,0x20,0x20,0x00,0xF8,0x08,0x10,0x20,0x40,0x80,0xF8,
0x00,0x70,0x88,0x98,0xA8,0xC8,0x88,0x70,0x00,0x20,0x60,0x20,0x20,0x20,0x20,0x70,
0x00,0x70,0x88,0x08,0x30,0x40,0x80,0xF8,0x00,0xF0,0x08,0x08,0x70,0x08,0x08,0xF0,
0x00,0x10,0x30,0x50,0x90,0xF8,0x10,0x10,0x00,0xF8,0x80,0x80,0xF0,0x08,0x08,0xF0,
0x00,0x70,0x80,0x80,0xF0,0x88,0x88,0x70,0x00,0xF8,0x08,0x10,0x20,0x40,0x40,0x40,
0x00,0x70,0x88,0x88,0x70,0x88,0x88,0x70,0x00,0x70,0x88,0x88,0x78,0x08,0x08,0x70,
0x00,0x00,0x00,0x00,0x00,0x18,0x18,0x00,0x00,0x00,0x00,0x00,0x00,0x18,0x18,0x10,
0x00,0x20,0x20,0x20,0x20,0x20,0x00,0x20,0x00,0x00,0x00,0x00,0x00,0x00,0x00,0x00,
0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF,0xFF
];

var gates=[],sws=[],leds=[],latches=[],wires=[],sectionsData=[],screenLeds=[];
var groupStack=[],GAPX=4,GAPY=4,jseed=7,core={},_curSect="";
var K0={v:0,x:0,y:0,virtual:true},K1={v:1,x:0,y:0,virtual:true};

function jr(){jseed=(jseed*1103515245+12345)&0x7fffffff;return jseed/0x7fffffff;}
function reset(){gates=[];sws=[];leds=[];latches=[];wires=[];sectionsData=[];screenLeds=[];
jseed=7;core={};groupStack=[{x:20,y:80,rowH:0,maxW:60000,maxXUsed:0,maxYUsed:0,gStart:0,sStart:0,lStart:0,ltStart:0}];}
function curFrame(){return groupStack[groupStack.length-1];}
function framePlaceIn(f,w,h){if(f.x>0&&f.x+w>f.maxW){f.x=0;f.y+=f.rowH+GAPY;f.rowH=0;}
var p={x:f.x,y:f.y};f.x+=w+GAPX;if(h>f.rowH)f.rowH=h;if(f.x-GAPX>f.maxXUsed)f.maxXUsed=f.x-GAPX;
var yU=f.y+h;if(yU>f.maxYUsed)f.maxYUsed=yU;return p;}
function place(w,h){return framePlaceIn(curFrame(),w,h);}
function beginGroup(mw){groupStack.push({x:0,y:0,rowH:0,maxW:mw||200,maxXUsed:0,maxYUsed:0,gStart:gates.length,sStart:sws.length,lStart:leds.length,ltStart:latches.length});}
function endGroup(){var f=groupStack.pop();if(!f)return;var w=f.maxXUsed||10,h=f.maxYUsed||10;
var pos=framePlaceIn(curFrame(),w,h);var dx=pos.x,dy=pos.y,i;
for(i=f.gStart;i<gates.length;i++){var g=gates[i];g.px+=dx;g.py+=dy;g.o.x+=dx;g.o.y+=dy;}
for(i=f.sStart;i<sws.length;i++){var s=sws[i];s.px+=dx;s.py+=dy;s.o.x+=dx;s.o.y+=dy;}
for(i=f.lStart;i<leds.length;i++){var l=leds[i];l.px+=dx;l.py+=dy;}
for(i=f.ltStart;i<latches.length;i++){var lt=latches[i];lt.px+=dx;lt.py+=dy;lt.o.x+=dx;lt.o.y+=dy;}}
function forceNewRow(){var f=groupStack[0];if(!f)return;f.x=0;f.y+=f.rowH+30;f.rowH=0;}
function sectionColor(t){
if(/^INPUT/.test(t))return "#4a9eff";
if(/^(STORAGE|QUEUE|STACK|RAM|SCREEN|FONT|GPU)/.test(t))return "#a060ff";
if(/^(FETCH|CTRL|MUX)/.test(t))return "#ffb020";
if(/^ALU/.test(t))return "#39d353";
if(/^(OUTPUT|POP|HALT|JOY|RND|HW|DRAWC|BYTE)/.test(t))return "#ff4d4d";
return "#666";}
function section(title,mw,fn){_curSect=title;
var g0=gates.length,s0=sws.length,l0=leds.length,lt0=latches.length;
beginGroup(mw);fn();endGroup();
var mnx=Infinity,mny=Infinity,mxx=-Infinity,mxy=-Infinity;
function ext(x1,y1,x2,y2){if(x1<mnx)mnx=x1;if(y1<mny)mny=y1;if(x2>mxx)mxx=x2;if(y2>mxy)mxy=y2;}
for(var i=g0;i<gates.length;i++){var g=gates[i];ext(g.px-6,g.py-2,g.px+41,g.py+32);}
for(var i=lt0;i<latches.length;i++){var l=latches[i];ext(l.px-4,l.py-2,l.px+48,l.py+40);}
for(var i=s0;i<sws.length;i++){var s=sws[i];ext(s.px-2,s.py-2,s.px+52,s.py+59);}
for(var i=l0;i<leds.length;i++){var l=leds[i];var r=(l.sz||10)*0.55;
ext(l.px-r-3,l.py-r-3,l.px+r+3,l.py+r+3);}
if(!isFinite(mnx)){mnx=0;mny=0;mxx=10;mxy=10;}
var pad=12;sectionsData.push({x:mnx-pad,y:mny-pad-24,w:(mxx-mnx)+2*pad,h:(mxy-mny)+2*pad+24,
title:title,color:sectionColor(title),g0:g0,g1:gates.length,s0:s0,s1:sws.length,l0:l0,l1:leds.length,lt0:lt0,lt1:latches.length});
_curSect="";}
function N(v,d){return{v:v|0,d:d|0};}
function mkGate(t,ins){var d=0;for(var i=0;i<ins.length;i++)d=Math.max(d,(ins[i]&&ins[i].d)||0);d=d+1;
var p=place(44,36);var jy=Math.floor(jr()*4);
var g={t:t,i:ins,o:N(0,d),px:p.x,py:p.y+jy};g.o.x=g.px+34;g.o.y=g.py+15;
for(var i=0;i<ins.length;i++){var iy=ins.length===1?15:(i===0?10:20);
if(ins[i]&&ins[i].x!==undefined&&!ins[i].virtual)wires.push({s:ins[i],g:g,py:iy,sect:_curSect});}
gates.push(g);return g;}
function AND(a,b){return mkGate("AND",[a,b]).o;}
function OR(a,b){return mkGate("OR",[a,b]).o;}
function NOT(a){return mkGate("NOT",[a]).o;}
function XOR(a,b){return mkGate("XOR",[a,b]).o;}
function LAT(init){init=init|0;var p=place(46,40);
var w={t:"LATX",i:[K0,K0],o:N(init,1),px:p.x,py:p.y,prev:init,prevEn:0};
w.o.x=p.x+46;w.o.y=p.y+20;latches.push(w);return w;}
function setLat(wrapper,d,en){wrapper.i[0]=d;wrapper.i[1]=en;
if(d&&d.x!==undefined&&!d.virtual)wires.push({s:d,g:wrapper,py:15,sect:_curSect});
if(en&&en.x!==undefined&&!en.virtual)wires.push({s:en,g:wrapper,py:38,sect:_curSect});}
function latchReset(l,v){v=v|0;l.prev=v;l.o.v=v;}
function sw(lb){var p=place(50,58);var s={v:0,o:N(0,0),px:p.x,py:p.y,label:lb||"",osc:false};s.o.x=p.x+44;s.o.y=p.y+20;sws.push(s);return s;}
function osc(pr,lb){var p=place(50,58);var s={v:0,o:N(0,0),px:p.x,py:p.y,label:lb||"OSC",osc:true,period:pr|0||6,t:0};s.o.x=p.x+44;s.o.y=p.y+20;sws.push(s);return s;}

/* SCREEN LED: wired directly to RAM latch output; also registered in leds[]
   so it gets moved correctly by endGroup / relayout */
function screenLedFor(row,col){
var cy=row>>3,cx=col>>3,ipy=row&7,ipx=col&7;
var cell=cy*CELL_COLS+cx;
var byteIdx=cell*8+ipy;
var bit=7-ipx;
var srcNode=core.RAM[byteIdx][bit].o;
var p=place(LED_SZ+1,LED_SZ+1);
var led={i:srcNode,v:0,c:"#ff2020",px:p.x+LED_SZ/2,py:p.y+LED_SZ/2,sz:LED_SZ+1,screen:true,row:row,col:col,_lv:-1};
leds.push(led);
return led;}

function addN(a,b,cin,n){var c=cin||K0,s=[];
for(var i=0;i<n;i++){var ab=XOR(a[i],b[i]);var sum=XOR(ab,c);var g1=AND(a[i],b[i]);var g2=AND(ab,c);c=OR(g1,g2);s.push(sum);}
return {sum:s,carry:c};}
function add8(a,b){return addN(a,b,K0,8).sum;}
function sub8(a,b){var nb=[];for(var i=0;i<8;i++)nb.push(NOT(b[i]));return addN(a,nb,K1,8).sum;}
function sub8full(a,b){var nb=[];for(var i=0;i<8;i++)nb.push(NOT(b[i]));return addN(a,nb,K1,8);}
function subN(a,b,n){var nb=[];for(var i=0;i<n;i++)nb.push(NOT(b[i]));return addN(a,nb,K1,n).sum;}
function mul4low(a,b){var pp=[];
for(var i=0;i<4;i++){pp[i]=[];for(var j=0;j<4;j++)pp[i][j]=AND(a[j],b[i]);}
var s0=[pp[0][0],pp[0][1],pp[0][2],pp[0][3],K0,K0,K0,K0];
var s1=add8(s0,[K0,pp[1][0],pp[1][1],pp[1][2],pp[1][3],K0,K0,K0]);
var s2=add8(s1,[K0,K0,pp[2][0],pp[2][1],pp[2][2],pp[2][3],K0,K0]);
return add8(s2,[K0,K0,K0,pp[3][0],pp[3][1],pp[3][2],pp[3][3],K0]);}
function eqN(bits,val,n){var acc=null;
for(var i=0;i<n;i++){var b=(val>>i)&1;var s=b?bits[i]:NOT(bits[i]);acc=(acc===null)?s:AND(acc,s);}
return acc;}
function makeDecoder(bits){var n=bits.length;if(n===0)return[K1];if(n===1)return[NOT(bits[0]),bits[0]];
var half=n>>1;var lo=makeDecoder(bits.slice(0,half));var hi=makeDecoder(bits.slice(half));
var out=[],lm=(1<<half)-1;
for(var j=0;j<(1<<n);j++)out.push(AND(hi[j>>half],lo[j&lm]));
return out;}
function decodeOps(obHi,obLo){var d={};
for(var i=0;i<ALL_OPS.length;i++){var code=ALL_OPS[i];
d[code]=AND(eqN(obHi,(code>>8)&0xFF,8),eqN(obLo,code&0xFF,8));}
return d;}

function buildFrontend(){var OP_HI=[],OP_LO=[],D=[],T=[],A=[],i;
section("INPUT · OP_HI",920,function(){for(i=7;i>=0;i--)OP_HI[i]=sw("H"+i);});
section("INPUT · OP_LO",920,function(){for(i=7;i>=0;i--)OP_LO[i]=sw("L"+i);});
section("INPUT · DATA",920,function(){for(i=7;i>=0;i--)D[i]=sw("D"+i);});
section("INPUT · TAG",920,function(){for(i=7;i>=0;i--)T[i]=sw("T"+i);});
section("INPUT · DEST",920,function(){for(i=7;i>=0;i--)A[i]=sw("A"+i);});
section("INPUT · ACTION",900,function(){core.RUNo=sw("RUN_Q").o;core.CLRo=sw("CLR").o;});
section("INPUT · CLK",900,function(){core.CLKo=osc(1,"CLK").o;});
forceNewRow();
core.OP_HI=OP_HI;core.OP_LO=OP_LO;core.D=D;core.T=T;core.A=A;
core.RAM=[];
section("STORAGE · RAM "+RAM_SIZE+"×8",RAM_SIZE*100,function(){
for(i=0;i<RAM_SIZE;i++){beginGroup(140);core.RAM.push([]);
for(var b=0;b<8;b++){beginGroup(18);core.RAM[i].push(LAT(0));endGroup();}
endGroup();}});
forceNewRow();
core.hwTimer=[];
section("HW · TIMER 8-bit",900,function(){for(i=0;i<8;i++)core.hwTimer.push(LAT(0));});}

function buildJoystick(){var bw=50,bh=58,g=6,gridW=3*bw+2*g,gridH=3*bh+2*g;
var anchor=place(gridW,gridH),bx=anchor.x,by=anchor.y;
function mk(lb,px,py){var s={v:0,o:N(0,0),px:px,py:py,label:lb,osc:false};s.o.x=px+44;s.o.y=py+20;sws.push(s);return s;}
section("INPUT · JOYSTICK",gridW+8,function(){
core.BTN_UP=mk("UP",bx+bw+g,by);
core.BTN_LEFT=mk("LEFT",bx,by+bh+g);
core.BTN_POINT=mk("POINT",bx+bw+g,by+bh+g);
core.BTN_RIGHT=mk("RIGHT",bx+2*(bw+g),by+bh+g);
core.BTN_DOWN=mk("DOWN",bx+bw+g,by+2*(bh+g));});
forceNewRow();}

function buildQueue(){var slots=[],ptr=[],ptrSel=[],i,b,s;
section("QUEUE · "+QUEUE_SLOTS+"×5×8",QUEUE_SLOTS*400,function(){
for(s=0;s<QUEUE_SLOTS;s++){beginGroup(400);var sl={bytes:[]};
for(var bi=0;bi<5;bi++){beginGroup(80);var bb=[];
for(b=0;b<8;b++)bb.push(LAT(0));sl.bytes.push(bb);endGroup();}
slots.push(sl);endGroup();}});
forceNewRow();
section("QUEUE · POINTER",800,function(){for(i=0;i<PTR_BITS;i++)ptr[i]=LAT(0);core.ptr=ptr;});
section("QUEUE · PT DEC",2400,function(){
var np=[];for(i=0;i<PTR_BITS;i++)np.push(NOT(ptr[i].o));
for(s=0;s<QUEUE_SLOTS;s++){beginGroup(140);var acc=K1;
for(i=0;i<PTR_BITS;i++){var bv=(s>>i)&1?ptr[i].o:np[i];acc=AND(acc,bv);}
ptrSel.push(acc);endGroup();}});
core.slots=slots;core.ptrSel=ptrSel;forceNewRow();}

function buildExecutor(){var i,b,s;
var slotSel=core.slots,ptrSel=core.ptrSel;
function muxByte(bi){var bits=[];
for(b=0;b<8;b++){var acc=null;
for(s=0;s<QUEUE_SLOTS;s++){var t=AND(ptrSel[s],slotSel[s].bytes[bi][b].o);
acc=(acc===null)?t:OR(acc,t);}
bits.push(acc);}return bits;}
var qHi,qLo,qData,qTag,qDest;
section("FETCH · OP_HI",QUEUE_SLOTS*200,function(){qHi=muxByte(0);});
section("FETCH · OP_LO",QUEUE_SLOTS*200,function(){qLo=muxByte(1);});
section("FETCH · DATA",QUEUE_SLOTS*200,function(){qData=muxByte(2);});
section("FETCH · TAG",QUEUE_SLOTS*200,function(){qTag=muxByte(3);});
section("FETCH · DEST",QUEUE_SLOTS*200,function(){qDest=muxByte(4);});
forceNewRow();
var ms=core.RUNQo||K0,nms=NOT(ms);
var fHi=[],fLo=[],fData=[],fTag=[],fDest=[];
function muxFinal(q,ext){var out=[];for(i=0;i<8;i++)out.push(OR(AND(ms,q[i]),AND(nms,ext[i].o)));return out;}
section("MUX · OP_HI",1200,function(){fHi=muxFinal(qHi,core.OP_HI);});
section("MUX · OP_LO",1200,function(){fLo=muxFinal(qLo,core.OP_LO);});
section("MUX · DATA",1200,function(){fData=muxFinal(qData,core.D);});
section("MUX · TAG",1200,function(){fTag=muxFinal(qTag,core.T);});
section("MUX · DEST",1200,function(){fDest=muxFinal(qDest,core.A);});
core.finalHi=fHi;core.finalLo=fLo;core.finalData=fData;core.finalTag=fTag;core.finalDest=fDest;
forceNewRow();}

function buildBackend(){var i,b;
var opDec,destDec,tagDec,dataDec;var RAM=core.RAM;
var srcB=[],srcC=[],finalR=[];
/* =============== EDGE FIX ===============
   Sebelumnya runEdge = RUNo AND NOT(runPrev.o) -> hanya pulse sekali.
   Sekarang runEdge = RUNo AND CLKo -> pulse tiap CLK naik.
   Latch en input sudah edge-triggered (naik dari 0 ke 1), jadi
   instruksi jalan 1x per CLK cycle. */
section("CTRL · EDGE",900,function(){
core.runEdge = AND(core.RUNo, core.CLKo);
core.clrEdge = AND(core.CLRo, core.CLKo);});
section("CTRL · OP DEC",9000,function(){opDec=decodeOps(core.finalHi,core.finalLo);});
section("CTRL · DEST DEC",9000,function(){destDec=makeDecoder(core.finalDest);});
forceNewRow();
section("CTRL · TAG DEC",9000,function(){tagDec=makeDecoder(core.finalTag);});
section("CTRL · DATA DEC",9000,function(){dataDec=makeDecoder(core.finalData);});
var rndReg=[];for(i=0;i<8;i++)rndReg.push(LAT(i===0?1:0));core.rndReg=rndReg;
section("RND · LFSR",1600,function(){
var rndAct=AND(core.runEdge,opDec[OP.RND]);
var seedAct=AND(core.runEdge,opDec[OP.SEED]);
var newbit=XOR(XOR(rndReg[0].o,rndReg[2].o),XOR(rndReg[3].o,rndReg[4].o));
for(i=0;i<8;i++){var next=(i===0)?newbit:rndReg[i-1].o;
var seedBit=core.finalData[i];
var withSeed=OR(AND(seedAct,seedBit),AND(NOT(seedAct),next));
setLat(rndReg[i],withSeed,OR(rndAct,seedAct));}});
forceNewRow();
section("HW · TIMER INC",1600,function(){
var now=[];for(i=0;i<8;i++)now.push(core.hwTimer[i].o);
var plus1=add8(now,[K1,K0,K0,K0,K0,K0,K0,K0]);
var en=core.runEdge;
for(i=0;i<8;i++)setLat(core.hwTimer[i],plus1[i],en);});
section("CTRL · DELAY",1600,function(){core.delayReg=[];
for(i=0;i<4;i++)core.delayReg.push(LAT(0));core.delayOpPrev=LAT(0);
var db=[core.delayReg[0].o,core.delayReg[1].o,core.delayReg[2].o,core.delayReg[3].o];
var dAct=OR(OR(db[0],db[1]),OR(db[2],db[3]));var nDelay=NOT(dAct);
var delayRise=AND(opDec[OP.DELAY],NOT(core.delayOpPrev.o));
var dLoad=AND(delayRise,core.runEdge);var nLoad=NOT(dLoad);
var decBits=addN(db,[K1,K1,K1,K1],K0,4).sum;
for(i=0;i<4;i++){var keep=AND(dAct,decBits[i]);
var dd=OR(AND(dLoad,core.finalData[i]),AND(nLoad,keep));
setLat(core.delayReg[i],dd,core.runEdge);}
setLat(core.delayOpPrev,opDec[OP.DELAY],core.runEdge);
core.nDelay=nDelay;core.delayRise=delayRise;});
forceNewRow();
section("MUX · READ B (TAG)",RAM_SIZE*250,function(){
for(b=0;b<8;b++){beginGroup(RAM_SIZE*30);var acc=null;
for(i=0;i<RAM_SIZE;i++){var t=AND(tagDec[i],RAM[i][b].o);acc=(acc===null)?t:OR(acc,t);}
srcB[b]=acc;endGroup();}});
section("MUX · READ C (DATA)",RAM_SIZE*250,function(){
for(b=0;b<8;b++){beginGroup(RAM_SIZE*30);var acc=null;
for(i=0;i<RAM_SIZE;i++){var t=AND(dataDec[i],RAM[i][b].o);acc=(acc===null)?t:OR(acc,t);}
srcC[b]=acc;endGroup();}});
forceNewRow();
section("CTRL · TAG ZERO",400,function(){var a=K0;for(b=0;b<8;b++)a=OR(a,srcB[b]);core.srcBZero=NOT(a);});
var flagZ=LAT(0),flagLT=LAT(0),flagGT=LAT(0);
core.flagZ=flagZ;core.flagLT=flagLT;core.flagGT=flagGT;
section("CTRL · CMP FLAGS",1600,function(){
var full=sub8full(srcB,srcC);var z=null;
for(b=0;b<8;b++){var nz=NOT(full.sum[b]);z=(z===null)?nz:AND(z,nz);}
var borrow=NOT(full.carry);var gt=AND(full.carry,NOT(z));
var cp=AND(core.runEdge,opDec[OP.CMP]);
setLat(flagZ,z,cp);setLat(flagLT,borrow,cp);setLat(flagGT,gt,cp);});
core.dataStack=[];
section("STACK · DATA 16×8",2560,function(){
for(var s=0;s<STACK_DEPTH;s++){beginGroup(300);var entry=[];
for(b=0;b<8;b++)entry.push(LAT(0));core.dataStack.push(entry);endGroup();}});
core.sp=[];
section("STACK · SP (4)",300,function(){for(b=0;b<SP_BITS;b++)core.sp.push(LAT(0));});
forceNewRow();
section("STACK · CTRL",6000,function(){
var pushAct=AND(core.runEdge,opDec[OP.PUSH]);
var popAct=AND(core.runEdge,opDec[OP.POP]);
var dupAct=AND(core.runEdge,opDec[OP.DUP]);
var swapAct=AND(core.runEdge,opDec[OP.SWAP]);
var spBits=[];for(i=0;i<SP_BITS;i++)spBits.push(core.sp[i].o);
var spDec=makeDecoder(spBits);
var spM1=subN(spBits,[K1,K0,K0,K0],SP_BITS);
var spM1Dec=makeDecoder(spM1);
var spM2=subN(spM1,[K1,K0,K0,K0],SP_BITS);
var spM2Dec=makeDecoder(spM2);
for(b=0;b<8;b++){
var dacc=null;
for(var s=0;s<STACK_DEPTH;s++){var t=AND(spM1Dec[s],core.dataStack[s][b].o);dacc=(dacc===null)?t:OR(dacc,t);}
var bacc=null;
for(var s2=0;s2<STACK_DEPTH;s2++){var t2=AND(spM2Dec[s2],core.dataStack[s2][b].o);bacc=(bacc===null)?t2:OR(bacc,t2);}
var wrToTop=OR(AND(pushAct,core.finalDest[b]),AND(dupAct,dacc));
var wrToSp1=AND(swapAct,bacc);
var wrToSp2=AND(swapAct,dacc);
for(var s3=0;s3<STACK_DEPTH;s3++){
var weTop=AND(spDec[s3],wrToTop);
var weSwap1=AND(spM1Dec[s3],wrToSp1);
var weSwap2=AND(spM2Dec[s3],wrToSp2);
var weTot=OR(OR(weTop,weSwap1),weSwap2);
var dTot=OR(OR(AND(weTop,wrToTop),AND(weSwap1,wrToSp1)),AND(weSwap2,wrToSp2));
setLat(core.dataStack[s3][b],dTot,weTot);}}
core.dupRead=[];
for(b=0;b<8;b++){var dacc2=null;
for(var s4=0;s4<STACK_DEPTH;s4++){var t4=AND(spM1Dec[s4],core.dataStack[s4][b].o);dacc2=(dacc2===null)?t4:OR(dacc2,t4);}
core.dupRead.push(dacc2);}
var spP1=addN(spBits,[K1,K0,K0,K0],K0,SP_BITS).sum;
var spEn=OR(OR(pushAct,dupAct),popAct);
for(i=0;i<SP_BITS;i++){var vUp=AND(OR(pushAct,dupAct),spP1[i]);var vDn=AND(popAct,spM1[i]);
setLat(core.sp[i],OR(vUp,vDn),spEn);}});
var joyByte=[];
section("JOY · READ",700,function(){
joyByte.push(core.BTN_UP.o,core.BTN_DOWN.o,core.BTN_LEFT.o,core.BTN_RIGHT.o,core.BTN_POINT.o,K0,K0,K0);});
core.joyByte=joyByte;
core.halt=LAT(0);
section("HALT · LATCH",600,function(){
var haltSet=AND(AND(opDec[OP.HALT],core.runEdge),NOT(core.halt.o));
var next=OR(haltSet,core.halt.o);
setLat(core.halt,next,OR(haltSet,core.clrEdge));});
section("QUEUE · PT UPDATE",5000,function(){
var runEdge=core.runEdge;
var jb=opDec[OP.JMP];
var jzb=AND(opDec[OP.JZ],core.srcBZero);
var jnzb=AND(opDec[OP.JNZ],NOT(core.srcBZero));
var jltb=AND(opDec[OP.JLT],core.flagLT.o);
var jgtb=AND(opDec[OP.JGT],core.flagGT.o);
var jeqb=AND(opDec[OP.JEQ],core.flagZ.o);
var jneb=AND(opDec[OP.JNE],NOT(core.flagZ.o));
var anyJump=OR(OR(OR(jb,jzb),OR(jnzb,jltb)),OR(OR(jgtb,jeqb),jneb));
var haltEn=core.halt.o;
var runGate=AND(core.nDelay,NOT(haltEn));
var notRise=NOT(core.delayRise);
var jmpEn=AND(AND(anyJump,runEdge),AND(runGate,notRise));
var incEn=AND(AND(runEdge,core.runEdge),AND(runGate,notRise));
var en=OR(jmpEn,incEn);
var ptrNow=[];for(i=0;i<PTR_BITS;i++)ptrNow.push(core.ptr[i].o);
var incOne=[K1];for(i=1;i<PTR_BITS;i++)incOne.push(K0);
var incVal=addN(ptrNow,incOne,K0,PTR_BITS).sum;
for(i=0;i<PTR_BITS;i++){var jv=core.finalDest[i];
var v=OR(AND(jmpEn,jv),AND(NOT(jmpEn),incVal[i]));
setLat(core.ptr[i],v,en);}});
var opR={},opList=[];
function addOp(code,bits){opR[code]=bits;opList.push(code);}
section("ALU · SET·MOV",900,function(){var r0=[];
for(b=0;b<8;b++)r0.push(core.finalData[b]);
addOp(OP.SET,r0);addOp(OP.MOV,srcB.slice());});
section("ALU · ADD·SUB",1600,function(){addOp(OP.ADD,add8(srcB,srcC));addOp(OP.SUB,sub8(srcB,srcC));});
section("ALU · MUL",1000,function(){addOp(OP.MUL,mul4low([srcB[0],srcB[1],srcB[2],srcB[3]],[srcC[0],srcC[1],srcC[2],srcC[3]]));});
forceNewRow();
section("ALU · LOGIC",1400,function(){
var aR=[],oR=[],xR=[],nR=[];
for(b=0;b<8;b++){aR.push(AND(srcB[b],srcC[b]));oR.push(OR(srcB[b],srcC[b]));
xR.push(XOR(srcB[b],srcC[b]));nR.push(NOT(srcB[b]));}
addOp(OP.AND,aR);addOp(OP.OR,oR);addOp(OP.XOR,xR);addOp(OP.NOT,nR);});
section("ALU · INC·DEC",1600,function(){
addOp(OP.INC,add8(srcB,[K1,K0,K0,K0,K0,K0,K0,K0]));
addOp(OP.DEC,sub8(srcB,[K1,K0,K0,K0,K0,K0,K0,K0]));});
section("ALU · CLR",200,function(){addOp(OP.CLR,[K0,K0,K0,K0,K0,K0,K0,K0]);});
section("ALU · SHL·SHR",1600,function(){
var shl=[K0],shr=[K0];
for(b=0;b<7;b++)shl.push(srcB[b]);
for(b=1;b<8;b++)shr.push(srcB[b]);
addOp(OP.SHL,shl);addOp(OP.SHR,shr);});
section("ALU · JOY",500,function(){addOp(OP.JOY,joyByte.slice());});
section("ALU · RND",600,function(){var rr=[];
for(b=0;b<8;b++)rr.push(core.rndReg[b].o);addOp(OP.RND,rr);});
section("ALU · TIME",600,function(){var tt=[];
for(b=0;b<8;b++)tt.push(core.hwTimer[b].o);addOp(OP.TIME,tt);});
forceNewRow();
section("OUTPUT MUX",5000,function(){
for(b=0;b<8;b++){beginGroup(700);var acc=null;
for(var ii=0;ii<opList.length;ii++){var opv=opList[ii];
var t=AND(opDec[opv],opR[opv][b]);acc=(acc===null)?t:OR(acc,t);}
if(acc===null)acc=K0;finalR.push(acc);endGroup();}});

var fontOut=[];
section("FONT · ROM 41×8×8",5000,function(){
var charDec=makeDecoder(srcB);
for(var r=0;r<8;r++){fontOut[r]=[];
for(var bit=0;bit<8;bit++){var acc=K0;
for(var t=0;t<41;t++){
if((FONT8[t*8+r]>>(7-bit))&1)acc=OR(acc,charDec[t]);}
fontOut[r][bit]=acc;}}});
var cellDec=null;
section("DRAWC · CELL DEC",3000,function(){cellDec=makeDecoder(srcC);});

section("OUTPUT · WRITE",RAM_SIZE*100,function(){
var wrEnable=core.runEdge;
var scrClrAct=AND(core.runEdge,opDec[OP.SCRCLR]);
var drawcAct=AND(core.runEdge,opDec[OP.DRAWC]);
var noWrite=K0;
noWrite=OR(noWrite,opDec[OP.NOP]);noWrite=OR(noWrite,opDec[OP.JMP]);
noWrite=OR(noWrite,opDec[OP.JZ]);noWrite=OR(noWrite,opDec[OP.JNZ]);
noWrite=OR(noWrite,opDec[OP.JLT]);noWrite=OR(noWrite,opDec[OP.JGT]);
noWrite=OR(noWrite,opDec[OP.JEQ]);noWrite=OR(noWrite,opDec[OP.JNE]);
noWrite=OR(noWrite,opDec[OP.DELAY]);noWrite=OR(noWrite,opDec[OP.HALT]);
noWrite=OR(noWrite,opDec[OP.CMP]);noWrite=OR(noWrite,opDec[OP.PUSH]);
noWrite=OR(noWrite,opDec[OP.POP]);noWrite=OR(noWrite,opDec[OP.DUP]);
noWrite=OR(noWrite,opDec[OP.SWAP]);noWrite=OR(noWrite,opDec[OP.BYTE]);
noWrite=OR(noWrite,opDec[OP.SCRCLR]);noWrite=OR(noWrite,opDec[OP.DRAWC]);
noWrite=OR(noWrite,opDec[OP.CHR]);
var doWrite=NOT(noWrite);
for(i=0;i<RAM_SIZE;i++){beginGroup(100);
var wEn=AND(AND(wrEnable,destDec[i]),doWrite);
var clrEn=(i<SCR_BYTES)?scrClrAct:K0;
var drawcEn=K0;
if(i<SCR_BYTES){
var myCell=i>>3;
var cellMatch=(myCell<256)?cellDec[myCell]:K0;
drawcEn=AND(drawcAct,cellMatch);}
var en=OR(OR(OR(wEn,core.clrEdge),clrEn),drawcEn);
for(b=0;b<8;b++){
var useW=AND(wEn,finalR[b]);
var useC=AND(clrEn,K0);
var drawBit=(i<SCR_BYTES)?AND(drawcEn,fontOut[i&7][b]):K0;
var d=OR(OR(useW,useC),drawBit);
setLat(RAM[i][b],d,en);}
endGroup();}});
section("BYTE · INDIRECT",RAM_SIZE*100,function(){
var byteAct=AND(core.runEdge,opDec[OP.BYTE]);
var pokeDec=makeDecoder(srcB);
for(i=0;i<RAM_SIZE;i++){beginGroup(80);var we=AND(byteAct,pokeDec[i]);
for(b=0;b<8;b++)setLat(RAM[i][b],srcC[b],we);endGroup();}});
forceNewRow();}

function buildScreen(){
section("SCREEN · GRID "+SCR_W+"×"+SCR_H,SCR_W*(LED_SZ+1)+8,function(){
for(var row=0;row<SCR_H;row++){
beginGroup(SCR_W*(LED_SZ+1)+8);
var rowArr=[];
for(var col=0;col<SCR_W;col++)rowArr.push(screenLedFor(row,col));
screenLeds.push(rowArr);
endGroup();
}});}

function tickOsc(){for(var i=0;i<sws.length;i++){var s=sws[i];
if(s.osc){s.t++;if(s.t>=s.period){s.t=0;s.v=s.v?0:1;}}}}

function evalComb(g){var a=g.i[0]?g.i[0].v:0,b=g.i[1]?g.i[1].v:0;
switch(g.t){case "AND":return a&b;case "OR":return a|b;case "NOT":return a?0:1;case "XOR":return a^b;}return 0;}
function simulate(){
for(var it=0;it<10;it++){var ch=false;
for(var i=0;i<sws.length;i++){var s=sws[i];if(s.o.v!==s.v){s.o.v=s.v;ch=true;}}
for(var i=0;i<gates.length;i++){var g=gates[i];var nv=evalComb(g);
if(g.o.v!==nv){g.o.v=nv;ch=true;}}
for(var i=0;i<latches.length;i++){var l=latches[i];if(l.o.v!==l.prev){l.o.v=l.prev;ch=true;}}
if(!ch)break;}
var snap=[];
for(var i=0;i<latches.length;i++){var l=latches[i];
var d=l.i[0]?l.i[0].v:0,en=l.i[1]?l.i[1].v:0;snap.push({l:l,d:d,en:en});}
for(var i=0;i<snap.length;i++){var s=snap[i];
if(s.en&&!s.l.prevEn)s.l.prev=s.d;
s.l.prevEn=s.en;s.l.o.v=s.l.prev;}
for(var it=0;it<10;it++){var ch2=false;
for(var i=0;i<sws.length;i++){var s2=sws[i];if(s2.o.v!==s2.v){s2.o.v=s2.v;ch2=true;}}
for(var i=0;i<gates.length;i++){var g2=gates[i];var nv2=evalComb(g2);
if(g2.o.v!==nv2){g2.o.v=nv2;ch2=true;}}
for(var i=0;i<latches.length;i++){var l2=latches[i];if(l2.o.v!==l2.prev){l2.o.v=l2.prev;ch2=true;}}
if(!ch2)break;}}

function build(){reset();
buildFrontend();buildJoystick();buildQueue();buildExecutor();buildBackend();buildScreen();
return {gates:gates,sws:sws,leds:leds,latches:latches,wires:wires,
sectionsData:sectionsData,core:core,screenLeds:screenLeds};}

function loadProgram(proj){
for(var q=0;q<latches.length;q++)latchReset(latches[q],0);
var prog=proj.program||[];
var NOOP=[0,0,0,0,0];
for(var i=0;i<QUEUE_SLOTS;i++){var ins=(i<prog.length)?prog[i]:NOOP;
for(var bi=0;bi<5;bi++){var byteVal=(ins[bi]|0)&255;
var slot=core.slots[i];if(!slot)continue;
var bb=slot.bytes[bi];
for(var b=0;b<8;b++)latchReset(bb[b],(byteVal>>b)&1);}}
for(var j=0;j<sws.length;j++)if(sws[j].label==="RUN_Q")sws[j].v=1;}

window.CPU={
build:build,simulate:simulate,tickOsc:tickOsc,loadProgram:loadProgram,
OP:OP,MN:MN,ALL_OPS:ALL_OPS,FONT8:FONT8,
cfg:{SCR_W:SCR_W,SCR_H:SCR_H,LED_SZ:LED_SZ,RAM_SIZE:RAM_SIZE,QUEUE_SLOTS:QUEUE_SLOTS,
PTR_BITS:PTR_BITS,SP_BITS:SP_BITS,SCR_BYTES:SCR_BYTES,CELL_COLS:CELL_COLS,CELL_ROWS:CELL_ROWS}
};
})();
