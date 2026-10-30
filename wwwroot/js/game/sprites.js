import { createPainter,TILE_SIZE } from './pixel-art.js';
import { paintFood } from './food-sprites.js';
import { STAGE_FOODS } from './levels/catalog.js';

function raccoon(pose) {
 const p=createPainter(),{ellipse,rect,pixel}=p;
 const dark='#30363d',grey='#88959d',light='#c6cdd0',cream='#e2ddd0';
 // A broad banded tail, drawn behind the body rather than a thin upright silhouette.
 ellipse(5,17,5,5,dark);
 for(let y=13;y<=21;y++)for(let x=1;x<=10;x++)if(((x-5)/4.5)**2+((y-17)/4)**2<=1)pixel(x,y,Math.floor(x/3)%2?grey:dark);
 ellipse(13,17,7,6,dark);ellipse(13,16,6,6,grey);ellipse(15,17,4,4,cream);
 ellipse(10,3,3,3,dark);ellipse(20,3,3,3,dark);ellipse(10,3,1,1,light);ellipse(20,3,1,1,light);
 ellipse(15,8,8,6,grey);ellipse(16,11,6,3,light);
 if(pose!=='climb'){
  ellipse(16,8,7,3,dark);rect(14,7,2,2,'#fff8e6');rect(19,7,2,2,'#fff8e6');pixel(15,8,dark);pixel(20,8,dark);
  ellipse(19,12,4,2,cream);rect(21,10,2,2,dark);
 }else{ellipse(15,8,6,4,light);rect(8,13,3,4,dark);rect(20,12,3,4,dark);}
 const stride=pose==='walk'?2:0;
 rect(10-stride,21,4,3,dark);rect(17+stride,21,4,3,dark);
 if(pose==='jump'){rect(19,15,4,3,dark);rect(9,20,4,3,dark);}else rect(19,16,3,4,dark);
 if(pose==='dead'){
  const flipped=new Uint8Array(p.pixels.length);
  for(let y=0;y<TILE_SIZE;y++)for(let x=0;x<TILE_SIZE;x++)flipped.set(p.pixels.slice((y*TILE_SIZE+x)*4,(y*TILE_SIZE+x)*4+4),((TILE_SIZE-1-y)*TILE_SIZE+x)*4);
  return flipped;
 }
 return p.pixels;
}
function creature(kind) {
 const p=createPainter(),{ellipse,rect,line,polygon}=p;
 if(kind==='caterpillar'){
  for(const x of [5,10,15,20]){ellipse(x,14,4,5,'#d56188');rect(x-1,19,2,2,'#f1ba80');}
  ellipse(19,11,4,4,'#ed8b9b');rect(18,9,2,2,'#fff1ca');rect(21,10,2,2,'#282235');line(19,7,18,4,'#d56188');line(22,8,23,5,'#d56188');
 }else if(kind==='snake'){
  ellipse(8,18,7,3,'#a2c96b');ellipse(16,17,5,4,'#85b354');rect(16,10,4,8,'#a2c96b');ellipse(18,10,5,3,'#c8de8b');
  rect(19,8,2,2,'#202a26');line(22,11,23,12,'#f27875');line(4,17,11,17,'#496d3a');
 }else if(kind==='bag'){
  polygon([[8,5],[16,5],[19,10],[21,20],[17,23],[6,23],[3,20],[5,10]],'#cf9d59');rect(7,4,10,3,'#eacb8d');ellipse(12,16,7,7,'#efd5a0');
  rect(9,10,6,2,'#6b4b2d');rect(14,12,2,3,'#6b4b2d');rect(11,15,4,2,'#6b4b2d');rect(11,17,2,2,'#6b4b2d');rect(11,21,2,2,'#6b4b2d');
 }else{polygon([[1,23],[8,2],[13,18],[18,6],[23,23]],'#ece6b0');}
 return p.pixels;
}
export function createSpriteAtlas() {
 const tiles={};
 for(const pose of ['idle','walk','jump','climb','dead'])tiles[pose]=raccoon(pose);
 for(const kind of ['caterpillar','snake','bag','spike'])tiles[kind]=creature(kind);
 for(const food of STAGE_FOODS)tiles['food-'+food.id]=paintFood(food.id);
 const width=Object.keys(tiles).length*TILE_SIZE,height=TILE_SIZE,pixels=new Uint8Array(width*height*4),frames={};
 let index=0;
 for(const [name,tile]of Object.entries(tiles)){
  frames[name]={x:index*TILE_SIZE,y:0,w:TILE_SIZE,h:TILE_SIZE};
  for(let y=0;y<TILE_SIZE;y++)pixels.set(tile.subarray(y*TILE_SIZE*4,(y+1)*TILE_SIZE*4),(y*width+index*TILE_SIZE)*4);
  index++;
 }
 return {width,height,pixels,frames};
}
