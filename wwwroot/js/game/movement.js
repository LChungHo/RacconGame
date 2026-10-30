import { CONFIG } from './config.js';
const EPS=1e-7;
const horizontal=(a,b)=>a.x<b.x+b.w-EPS&&a.x+a.w>b.x+EPS;
export function stepPlayer(p,input,level,dt){
 if(p.mode==='dead'||!Number.isFinite(dt)||dt<=0)return;
 const climb=Number(input.up)-Number(input.down);
 let ladder=level.ladders.find(l=>Math.abs(p.x+p.w/2-(l.x+l.w/2))<=4&&p.y>=l.y-EPS&&p.y<=l.y+l.h+EPS&&
  (p.mode==='climbing'||climb>0&&p.y<l.y+l.h-EPS||climb<0&&p.y>l.y+EPS));
 if(ladder&&(p.mode==='climbing'||climb)){
  p.mode='climbing';p.x=ladder.x+(ladder.w-p.w)/2;p.vx=0;p.vy=climb*CONFIG.climbSpeed;
  p.y=Math.max(ladder.y,Math.min(ladder.y+ladder.h,p.y+p.vy*dt));
  if(p.y<=ladder.y+EPS||p.y>=ladder.y+ladder.h-EPS){p.mode='grounded';p.vy=0;p.supportY=p.y;p.fallStartY=p.y;}
  return;
 }
 if(p.mode==='climbing')p.mode='airborne';
 p.vx=(Number(input.right)-Number(input.left))*CONFIG.moveSpeed;
 if(p.vx)p.facing=Math.sign(p.vx);
 p.x=Math.max(0,Math.min(level.width-p.w,p.x+p.vx*dt));
 const support=level.platforms.find(r=>horizontal(p,r)&&Math.abs(p.y-(r.y+r.h))<EPS);
 if(p.mode==='grounded'){
  if(support){p.fallStartY=p.y;p.supportY=p.y;if(input.jumpPressed){p.mode='airborne';p.vy=CONFIG.jumpSpeed;}}
  else{p.mode='airborne';p.fallStartY=p.supportY??p.y;p.vy=0;}
 }
 if(p.mode==='airborne'){
  const oldY=p.y;
  p.vy-=CONFIG.gravity*dt;p.y+=p.vy*dt;
  if(p.vy<=0){
   const landing=level.platforms.filter(r=>horizontal(p,r)&&oldY>=r.y+r.h-EPS&&p.y<=r.y+r.h+EPS).sort((a,b)=>(b.y+b.h)-(a.y+a.h))[0];
   if(landing){p.y=landing.y+landing.h;p.vy=0;p.mode='grounded';p.supportY=p.y;}
  }
 }
}