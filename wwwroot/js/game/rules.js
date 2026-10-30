import { CONFIG } from './config.js';
export const overlaps=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;
export function resetAttempt(state,level){
 state.secondsLeft=level.timeLimitSeconds;state.phaseSeconds=0;
 state.player={...level.spawn,w:CONFIG.playerWidth,h:CONFIG.playerHeight,vx:0,vy:0,facing:1,mode:'grounded',supportY:level.spawn.y,fallStartY:level.spawn.y};
 state.enemies=structuredClone(level.enemies);state.collectedFoodIds=[];state.openedPotIds=[];
}
export function stepEnemies(enemies,dt){
 for(const e of enemies){
  const span=e.maxX-e.minX;
  if(span<=0||e.speed===0)continue;
  const position=(e.x-e.minX)+e.direction*e.speed*dt;
  const wrapped=((position%(2*span))+(2*span))%(2*span);
  e.x=e.minX+(wrapped<=span?wrapped:2*span-wrapped);
  // Reflect the incoming direction on the mirrored half of the interval.
  e.direction=wrapped===0?1:wrapped===span?-1:wrapped<span?e.direction:-e.direction;
 }
}
function die(state){
 state.lives--;state.player.mode='dead';state.phase=state.lives>0?'dying':'gameOver';state.phaseSeconds=0;
 return [{type:'death'}];
}
export function resolveInteractions(state,level){
 if(state.phase!=='running')return [];
 const p=state.player;
 const unopened=level.pots.filter(pot=>!state.openedPotIds.includes(pot.id)&&overlaps(p,pot));
 if(state.secondsLeft<=1e-9||p.y+p.h<0||p.mode==='grounded'&&(p.fallStartY??p.y)-p.y>CONFIG.maxFall||
  state.enemies.some(e=>overlaps(p,e))||level.hazards.some(h=>overlaps(p,h))||unopened.some(pot=>pot.outcome==='snake'))return die(state);
 const events=[];
 for(const food of level.foods)if(!state.collectedFoodIds.includes(food.id)&&overlaps(p,food)){
  state.collectedFoodIds.push(food.id);state.score+=food.points;events.push({type:'food'});
 }
 for(const pot of unopened){state.openedPotIds.push(pot.id);state.score+=CONFIG.bonusPoints;events.push({type:'bonus'});}
 if(state.collectedFoodIds.length===level.foods.length){
  state.score+=Math.floor(Math.max(0,state.secondsLeft))*10;state.phase='stageClear';state.phaseSeconds=0;events.push({type:'stageClear'});
 }
 return events;
}
export function tickSession(state,levels,dt){
 if(!['dying','stageClear'].includes(state.phase))return [];
 state.phaseSeconds+=dt;
 if(state.phaseSeconds+1e-9<CONFIG.transitionSeconds)return [];
 if(state.phase==='dying'){state.score=state.stageStartScore;resetAttempt(state,levels[state.levelIndex]);state.phase='running';return [];}
 if(state.levelIndex===levels.length-1){state.phase='victory';state.phaseSeconds=0;return [{type:'victory'}];}
 state.levelIndex++;state.stageStartScore=state.score;resetAttempt(state,levels[state.levelIndex]);state.phase='running';return [];
}
