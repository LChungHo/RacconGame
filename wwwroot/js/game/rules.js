import { CONFIG } from './config.js';

const FOOD_SCORES = Object.freeze([10,20,30,50,100,200,300,500,1000,2000,3000]);
export const scoreForFood = index => FOOD_SCORES[Math.min(Math.max(0,index),FOOD_SCORES.length-1)];
export const overlaps = (a,b) => a.x<b.x+b.w && a.x+a.w>b.x && a.y<b.y+b.h && a.y+a.h>b.y;

export function resetAttempt(state,level) {
 state.secondsLeft=level.timeLimitSeconds;
 state.timeLimitSeconds=level.timeLimitSeconds;
 state.foodType=level.foodType??'apple';
 state.foodName=level.foodName??'먹거리';
 state.phaseSeconds=0;
 state.deathReason=null;
 state.player={...level.spawn,w:CONFIG.playerWidth,h:CONFIG.playerHeight,vx:0,vy:0,facing:1,mode:'grounded',supportY:level.spawn.y,fallStartY:level.spawn.y};
 state.enemies=structuredClone(level.enemies);
 state.collectedFoodIds=[];
 state.openedPotIds=[];
}
export function stepEnemies(enemies,dt) {
 for(const enemy of enemies) {
  enemy.ageSeconds=(enemy.ageSeconds??0)+dt;
  const span=enemy.maxX-enemy.minX;
  if(span<=0||enemy.speed===0)continue;
  const position=enemy.x-enemy.minX+enemy.direction*enemy.speed*dt;
  const wrapped=((position%(2*span))+(2*span))%(2*span);
  enemy.x=enemy.minX+(wrapped<=span?wrapped:2*span-wrapped);
  enemy.direction=wrapped===0?1:wrapped===span?-1:wrapped<span?enemy.direction:-enemy.direction;
 }
}
function touchesEnemy(player,enemy) {
 if(player.mode==='climbing'||(enemy.ageSeconds??0)<(enemy.graceSeconds??0))return false;
 const horizontal=player.x<enemy.x+enemy.w&&player.x+player.w>enemy.x;
 const sameFloor=player.y>=enemy.y-1e-6&&player.y<enemy.y+48;
 return horizontal&&(sameFloor||overlaps(player,enemy));
}
function die(state,reason) {
 state.lives--;
 state.player.mode='dead';
 state.player.vy=reason==='timeout'?-80:0;
 state.phase='dying';
 state.deathReason=reason;
 state.phaseSeconds=0;
 return [{type:'death'}];
}
function releaseSnake(state,level,pot) {
 const width=12;
 const x=Math.min(level.width-width,Math.max(0,pot.x+pot.w+8));
 state.enemies.push({id:'snake-'+pot.id,kind:'snake',x,y:pot.y,w:width,h:10,minX:0,maxX:level.width-width,speed:6,direction:1,ageSeconds:0,graceSeconds:.4});
}
export function resolveInteractions(state,level) {
 if(state.phase!=='running')return [];
 const player=state.player;
 if(state.secondsLeft<=1+1e-9)return die(state,'timeout');
 if(player.y+player.h<0||player.mode==='grounded'&&(player.fallStartY??player.y)-player.y>CONFIG.maxFall)return die(state,'fall');
 if(state.enemies.some(enemy=>touchesEnemy(player,enemy)))return die(state,'enemy');
 if(level.hazards.some(hazard=>overlaps(player,hazard)))return die(state,'hazard');
 const events=[];
 for(const food of level.foods) {
  if(state.collectedFoodIds.includes(food.id)||!overlaps(player,food))continue;
  state.score+=scoreForFood(state.collectedFoodIds.length);
  state.collectedFoodIds.push(food.id);
  events.push({type:'food'});
 }
 for(const pot of level.pots) {
  if(state.openedPotIds.includes(pot.id)||!overlaps(player,pot))continue;
  state.openedPotIds.push(pot.id);
  if(pot.outcome==='snake')releaseSnake(state,level,pot);
  else {state.score+=pot.points??CONFIG.bonusPoints;events.push({type:'bonus'});}
 }
 if(state.collectedFoodIds.length===level.foods.length) {
  state.score+=Math.floor(Math.max(0,state.secondsLeft))*10;
  state.phase='stageClear';
  state.phaseSeconds=0;
  events.push({type:'stageClear'});
 }
 return events;
}
export function tickSession(state,levels,dt) {
 if(!['dying','stageClear'].includes(state.phase))return [];
 state.phaseSeconds+=dt;
 if(state.phase==='dying'&&state.deathReason==='timeout') {
  state.player.vy-=CONFIG.gravity*dt;
  state.player.y+=state.player.vy*dt;
 }
 if(state.phaseSeconds+1e-9<CONFIG.transitionSeconds)return [];
 if(state.phase==='dying') {
  if(state.lives===0){state.phase='gameOver';return [];}
  state.score=state.stageStartScore;
  resetAttempt(state,levels[state.levelIndex]);
  state.phase='running';
  return [];
 }
 if(state.levelIndex===levels.length-1) {
  state.phase='victory';state.phaseSeconds=0;
  return [{type:'victory'}];
 }
 state.levelIndex++;
 state.stageStartScore=state.score;
 resetAttempt(state,levels[state.levelIndex]);
 state.phase='running';
 return [];
}