export const TILE_SIZE=24;
export function createPainter() {
 const pixels=new Uint8Array(TILE_SIZE*TILE_SIZE*4),colors=new Map();
 function pixel(x,y,color){
  x=Math.round(x);y=Math.round(y);if(x<0||x>=TILE_SIZE||y<0||y>=TILE_SIZE)return;
  const offset=(y*TILE_SIZE+x)*4;
  if(color===null){pixels.fill(0,offset,offset+4);return;}
  if(!colors.has(color))colors.set(color,[parseInt(color.slice(1,3),16),parseInt(color.slice(3,5),16),parseInt(color.slice(5,7),16),255]);
  pixels.set(colors.get(color),offset);
 }
 function rect(x,y,w,h,color){for(let py=y;py<y+h;py++)for(let px=x;px<x+w;px++)pixel(px,py,color);}
 function ellipse(cx,cy,rx,ry,color){for(let y=Math.floor(cy-ry);y<=cy+ry;y++)for(let x=Math.floor(cx-rx);x<=cx+rx;x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)pixel(x,y,color);}
 function line(x1,y1,x2,y2,color,width=1){const steps=Math.max(Math.abs(x2-x1),Math.abs(y2-y1),1);for(let i=0;i<=steps;i++)rect(Math.round(x1+(x2-x1)*i/steps),Math.round(y1+(y2-y1)*i/steps),width,width,color);}
 function polygon(points,color){for(let y=0;y<TILE_SIZE;y++)for(let x=0;x<TILE_SIZE;x++){
  let inside=false;for(let i=0,j=points.length-1;i<points.length;j=i++){
   const [xi,yi]=points[i],[xj,yj]=points[j];if((yi>y)!==(yj>y)&&x<(xj-xi)*(y-yi)/(yj-yi)+xi)inside=!inside;
  }if(inside)pixel(x,y,color);
 }}
 return {pixels,pixel,rect,ellipse,line,polygon};
}
