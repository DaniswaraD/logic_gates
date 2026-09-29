(function(){
"use strict";
var CPU=window.__cpu;
var svg=CPU.svg;
var lodEl=document.getElementById("lod");

var view={x:0,y:0,k:1};
var MIN_K=0.0008,MAX_K=30;

function applyView(){}
function setZoomAt(nk,cx,cy){
  nk=Math.min(MAX_K,Math.max(MIN_K,nk));
  var s=nk/view.k;
  view.x=cx-(cx-view.x)*s;view.y=cy-(cy-view.y)*s;view.k=nk;
}
function zoomAtCenter(f){
  var r=svg.getBoundingClientRect();
  setZoomAt(view.k*f,r.width/2,r.height/2);
}
function fitView(){
  var b=CPU.bounds();
  if(!isFinite(b.minX))return;
  var pad=60;
  var cw=window.innerWidth,ch=window.innerHeight;
  var w=b.maxX-b.minX+pad*2,h=b.maxY-b.minY+pad*2;
  var k=Math.min(cw/w,ch/h);
  view.k=k;
  view.x=cw/2-(b.minX+b.maxX)/2*k;
  view.y=ch/2-(b.minY+b.maxY)/2*k;
}

svg.addEventListener("wheel",function(e){
  e.preventDefault();
  var r=svg.getBoundingClientRect();
  setZoomAt(view.k*(e.deltaY<0?1.12:1/1.12),e.clientX-r.left,e.clientY-r.top);
},{passive:false});

var pointers={},panStart=null,pinchStart=null,mode=null;

svg.addEventListener("pointerdown",function(e){
  var t=e.target;
  while(t && t!==svg){
    if(t.classList && t.classList.contains("swhit"))return;
    t=t.parentNode;
  }
  if(e.button!==undefined && e.button!==0 && e.pointerType==="mouse")return;
  pointers[e.pointerId]={x:e.clientX,y:e.clientY};
  try{svg.setPointerCapture(e.pointerId);}catch(err){}
  var ids=Object.keys(pointers);
  if(ids.length===1){
    mode="pan";
    panStart={x:e.clientX,y:e.clientY,ox:view.x,oy:view.y,moved:false};
    svg.classList.add("drag");
  }else if(ids.length===2){
    mode="pinch";
    var p0=pointers[ids[0]],p1=pointers[ids[1]];
    pinchStart={d:Math.hypot(p0.x-p1.x,p0.y-p1.y),cx:(p0.x+p1.x)/2,cy:(p0.y+p1.y)/2,k:view.k,x:view.x,y:view.y};
    panStart=null;
  }
});

svg.addEventListener("pointermove",function(e){
  if(!pointers[e.pointerId])return;
  pointers[e.pointerId].x=e.clientX;
  pointers[e.pointerId].y=e.clientY;
  if(mode==="pinch"){
    var ids=Object.keys(pointers);
    if(ids.length<2)return;
    var p0=pointers[ids[0]],p1=pointers[ids[1]];
    var d=Math.hypot(p0.x-p1.x,p0.y-p1.y);
    var cx=(p0.x+p1.x)/2,cy=(p0.y+p1.y)/2;
    var r=svg.getBoundingClientRect();
    var factor=d/pinchStart.d;
    var nk=Math.min(MAX_K,Math.max(MIN_K,pinchStart.k*factor));
    var s=nk/pinchStart.k;
    var mx=pinchStart.cx-r.left,my=pinchStart.cy-r.top;
    var nmx=cx-r.left,nmy=cy-r.top;
    view.x=nmx-(mx-pinchStart.x)*s;
    view.y=nmy-(my-pinchStart.y)*s;
    view.k=nk;
  } else if(mode==="pan"&&panStart){
    var dx=e.clientX-panStart.x,dy=e.clientY-panStart.y;
    if(Math.abs(dx)>3||Math.abs(dy)>3)panStart.moved=true;
    if(panStart.moved){view.x=panStart.ox+dx;view.y=panStart.oy+dy;}
  }
});

function endPointer(e){
  delete pointers[e.pointerId];
  var ids=Object.keys(pointers);
  if(ids.length===0){
    mode=null;panStart=null;pinchStart=null;
    svg.classList.remove("drag");
  } else if(ids.length===1){
    mode="pan";
    var id=ids[0];
    panStart={x:pointers[id].x,y:pointers[id].y,ox:view.x,oy:view.y,moved:false};
    pinchStart=null;
  }
}
svg.addEventListener("pointerup",endPointer);
svg.addEventListener("pointercancel",endPointer);
svg.addEventListener("pointerleave",function(e){if(pointers[e.pointerId])endPointer(e);});
svg.addEventListener("dblclick",function(){fitView();});

document.getElementById("zoomIn").addEventListener("click",function(){zoomAtCenter(1.3);});
document.getElementById("zoomOut").addEventListener("click",function(){zoomAtCenter(1/1.3);});
document.getElementById("zoomReset").addEventListener("click",function(){fitView();});

var cheatEl=document.getElementById("cheat");
var cheatMin=document.getElementById("cheatMin");
document.getElementById("cheatBar").addEventListener("click",function(){
  cheatEl.classList.toggle("min");
  cheatMin.textContent=cheatEl.classList.contains("min")?"+":"−";
});

function loadProject(){
  CPU.reset();
  CPU.buildCPU48();
  CPU.buildQueue();
  var f=CPU.relayout43();
  CPU.routeWires();
  if(f){
    CPU.addLabel("CPU 48 · queue 4-byte instr · 16×16 screen",
      Math.round(f.w/2),60,18,"#222");
  }
  CPU.simulate();
  fitView();
  CPU.renderFrame(view,lodEl);
}

loadProject();

setInterval(function(){CPU.tickOsc();CPU.simulate();},60);
requestAnimationFrame(function loop(){
  CPU.renderFrame(view,lodEl);
  requestAnimationFrame(loop);
});
})();
