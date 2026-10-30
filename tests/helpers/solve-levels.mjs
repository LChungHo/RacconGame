import {levels} from '../../wwwroot/js/game/levels/index.js';
import {resetAttempt,stepEnemies,resolveInteractions} from '../../wwwroot/js/game/rules.js';
import {stepPlayer} from '../../wwwroot/js/game/movement.js';
import {solutions} from '../fixtures/solutions.js';
import {writeFile} from 'node:fs/promises';

const input=keys=>({left:keys.includes('L'),right:keys.includes('R'),up:keys.includes('U'),down:keys.includes('D'),jumpPressed:keys.includes('J')});
const clone=s=>({...s,player:{...s.player},enemies:s.enemies.map(e=>({...e})),collectedFoodIds:[...s.collectedFoodIds],openedPotIds:[...s.openedPotIds]});
function initial(level){const state={phase:'running',levelIndex:0,stageCount:1,score:0,highScore:0,lives:3,stageStartScore:0,extraLivesAwarded:0};resetAttempt(state,level);return state;}
function simulate(state,keys,ticks,level){
 const next=clone(state),frame=input(keys);
 let used=0;for(let i=0;i<ticks;i++){
  used++;
  next.secondsLeft-=1/60;
  stepPlayer(next.player,{...frame,jumpPressed:frame.jumpPressed&&i===0},level,1/60);stepEnemies(next.enemies,1/60);resolveInteractions(next,level);
  if(next.phase!=='running')break;
 }
 return {state:next,ticks:used};
}
class Heap{
 data=[];
 push(node){const a=this.data;a.push(node);let i=a.length-1;while(i){const p=(i-1)>>1;if(a[p].f<=node.f)break;a[i]=a[p];i=p;}a[i]=node;}
 pop(){const a=this.data,first=a[0],last=a.pop();if(a.length){let i=0;while(i*2+1<a.length){let c=i*2+1;if(c+1<a.length&&a[c+1].f<a[c].f)c++;if(last.f<=a[c].f)break;a[i]=a[c];i=c;}a[i]=last;}return first;}
}
function sameRoom(level,a,b){
 if(a.y!==b.y)return false;
 const low=Math.min(a.x,b.x),high=Math.max(a.x,b.x)+12;
 const rows=level.platforms.filter(p=>p.y+p.h===a.y&&p.x<high&&p.x+p.w>low).toSorted((a,b)=>a.x-b.x);
 if(!rows.length)return false;
 return rows.every((p,i)=>!i||p.x-rows[i-1].x-rows[i-1].w<=40);
}
function makeHeuristic(level,food){
 const points=[{x:food.x,y:food.y},...level.ladders.flatMap(l=>[{x:l.x,y:l.y},{x:l.x,y:l.y+l.h}])];
 const dist=points.map((_,i)=>i?Infinity:0),done=new Set();
 while(done.size<points.length){
  let at=-1;for(let i=0;i<points.length;i++)if(!done.has(i)&&(at<0||dist[i]<dist[at]))at=i;
  if(!Number.isFinite(dist[at]))break;done.add(at);
  for(let j=0;j<points.length;j++){
   let edge=Infinity;
   if(sameRoom(level,points[at],points[j]))edge=Math.abs(points[at].x-points[j].x)/72;
   if(level.ladders.some(l=>l.x===points[at].x&&l.x===points[j].x&&points[at].y>=l.y&&points[at].y<=l.y+l.h&&points[j].y>=l.y&&points[j].y<=l.y+l.h))edge=Math.min(edge,Math.abs(points[at].y-points[j].y)/56);
   dist[j]=Math.min(dist[j],dist[at]+edge);
  }
 }
 return p=>{
  let best=Infinity;
  for(let i=0;i<points.length;i++){
   const q=points[i];if(!Number.isFinite(dist[i]))continue;
   if(sameRoom(level,p,q))best=Math.min(best,Math.abs(p.x-q.x)/72+dist[i]);
   if(Math.abs(p.x-q.x)<5&&level.ladders.some(l=>l.x===q.x&&p.y>=l.y&&p.y<=l.y+l.h&&q.y>=l.y&&q.y<=l.y+l.h))best=Math.min(best,Math.abs(p.y-q.y)/56+dist[i]);
  }
  if(!Number.isFinite(best))best=Math.abs(p.x-food.x)/72+Math.abs(p.y-food.y)/80;
  return best*60;
 };
}
function stateKey(s){
 const p=s.player;
 return [Math.round(p.x/2),Math.round(p.y/2),p.mode,Math.round(p.vy/12),s.collectedFoodIds.join(','),s.openedPotIds.join(','),...s.enemies.map(e=>Math.round(e.x/4)+':'+e.direction+':'+Math.min(1,Math.floor((e.ageSeconds??1)*3)))].join('|');
}
function findFood(start,food,level,maxNodes=65000){
 const heuristic=makeHeuristic(level,food),heap=new Heap(),seen=new Map();
 heap.push({state:start,g:0,f:heuristic(start.player),parent:null});let searched=0;
 while(heap.data.length&&searched++<maxNodes){
  const node=heap.pop(),key=stateKey(node.state);if((seen.get(key)??Infinity)<=node.g)continue;seen.set(key,node.g);
  if(node.state.phase==='stageClear'||node.state.collectedFoodIds.includes(food.id)&&['R','L','U','D',''].some(keys=>simulate(node.state,keys,8,level).state.phase==='running')){
   const parts=[];let cursor=node;while(cursor.parent){parts.push([cursor.keys,cursor.ticks]);cursor=cursor.parent;}return {state:node.state,parts:parts.reverse(),searched};
  }
  if(node.g>2400)continue;
  const p=node.state.player;
  const choices=p.mode==='climbing'?['U','D']:p.mode==='airborne'?['R','L','', 'U','D']:['R','L','U','D','RJ','LJ',''];
  for(const keys of choices)for(const duration of [4,8]){
   const {state:next,ticks}=simulate(node.state,keys,duration,level);
   if(!['running','stageClear'].includes(next.phase))continue;
   if(next.player.x===p.x&&next.player.y===p.y&&keys)continue;
   const g=node.g+ticks,f=g+heuristic(next.player)*1.7-next.collectedFoodIds.length*2;
   heap.push({state:next,g,f,parent:node,keys,ticks});
  }
 }
 return null;
}
function compress(parts){
 const output=[];
 function append(keys,ticks){if(!ticks)return;const last=output.at(-1);if(last&&last[0]===keys&&!keys.includes('J'))last[1]+=ticks;else output.push([keys,ticks]);}
 for(const [keys,ticks]of parts){if(keys.includes('J')){append(keys,1);append(keys.replace('J',''),ticks-1);}else append(keys,ticks);}
 return output;
}
const old=Object.fromEntries(Object.entries(solutions).map(([id,parts])=>[id,parts.map(p=>[Object.entries(p.input).filter(([,value])=>value).map(([key])=>({left:'L',right:'R',up:'U',down:'D',jumpPressed:'J'}[key])).join(''),p.ticks])]));
const selected=process.argv.slice(2).map(Number),routes={...old};
for(const level of levels.filter(l=>!selected.length||selected.includes(l.number))){
 let state=initial(level),parts=[];
 // Keep an existing witness when it still clears with no death.
 for(const [keys,ticks]of old[level.id]??[]){const result=simulate(state,keys,ticks,level);state=result.state;parts.push([keys,result.ticks]);if(state.phase!=='running')break;}
 if(state.phase==='stageClear'){routes[level.id]=compress(parts);console.log(level.id+' retained');continue;}
 parts=[];
 state=initial(level);let failed=false;
 while(state.phase==='running'){
  const remaining=level.foods.filter(f=>!state.collectedFoodIds.includes(f.id));
  const ranked=remaining.toSorted((a,b)=>makeHeuristic(level,a)(state.player)-makeHeuristic(level,b)(state.player));
  let result;
  for(const food of ranked){result=findFood(state,food,level);if(result)break;}
  if(!result){failed=true;break;}
  state=result.state;parts.push(...result.parts);
  console.log(level.id+' '+state.collectedFoodIds.length+'/12 ticks '+Math.round((120-state.secondsLeft)*60)+' nodes '+result.searched);
 }
 if(failed)throw new Error('No route: '+level.id+' '+JSON.stringify({player:state.player,food:state.collectedFoodIds,enemies:state.enemies}));
 routes[level.id]=compress(parts);
 await writeFile(new URL('../../artifacts/difficulty-routes.json',import.meta.url),JSON.stringify(routes,null,2)+'\n');
}
const code='// Verified keyboard input witnesses; generated with tests/helpers/solve-levels.mjs.\nconst routes = '+JSON.stringify(routes,null,1)+';\nexport const solutions = Object.fromEntries(Object.entries(routes).map(([id,route])=>[id,route.map(([keys,ticks])=>({input:{left:keys.includes("L"),right:keys.includes("R"),up:keys.includes("U"),down:keys.includes("D"),jumpPressed:keys.includes("J")},ticks}))]));\n';
await writeFile(new URL('../fixtures/solutions.js',import.meta.url),code);
