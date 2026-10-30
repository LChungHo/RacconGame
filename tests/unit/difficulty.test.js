import test from 'node:test';import assert from 'node:assert/strict';
import {levels,validateLevel} from '../../wwwroot/js/game/levels/index.js';
import {GameModel} from '../../wwwroot/js/game/model.js';
import {resolveInteractions,stepEnemies} from '../../wwwroot/js/game/rules.js';
import {stepPlayer} from '../../wwwroot/js/game/movement.js';
import {createFlatLevel,makePlayer} from '../helpers/fixtures.js';
function gaps(level,y){const rows=level.platforms.filter(p=>p.y+p.h===y).toSorted((a,b)=>a.x-b.x);return rows.slice(1).map((p,index)=>({x:rows[index].x+rows[index].w,w:p.x-rows[index].x-rows[index].w}));}
test('later_stages_add_pins_and_real_unjumpable_detours',()=>{
 const counts=levels.map(level=>level.hazards.length);assert.equal(counts[0],0);assert.ok(counts[19]>=9);
 for(let i=1;i<20;i++)assert.ok(counts[i]>=counts[i-1],'stage '+(i+1));
 for(const level of levels.slice(4)){
  const gap=gaps(level,160).find(g=>g.w>=64);assert.ok(gap,level.id);
  const player=makePlayer({x:gap.x-12,y:160,supportY:160,fallStartY:160});
  for(let tick=0;tick<80;tick++)stepPlayer(player,{right:true,left:false,up:false,down:false,jumpPressed:tick===0},level,1/60);
  assert.ok(player.y<160,level.id+' must require a detour');
  assert.ok(level.ladders.length>6);
 }
});
test('stage_entities_remain_on_safe_supported_positions',()=>{
 for(const level of levels){
  assert.deepEqual(validateLevel(level),[]);
  for(const item of [...level.foods,...level.pots,...level.hazards]){
   assert.ok(level.platforms.some(p=>p.y+p.h===item.y&&item.x>=p.x&&item.x+item.w<=p.x+p.w),level.id+' unsupported '+item.id);
  }
  for(const hazard of level.hazards)for(const item of [...level.foods,...level.pots,...level.ladders]){
   const overlap=hazard.x<item.x+item.w&&hazard.x+hazard.w>item.x&&hazard.y<item.y+item.h&&hazard.y+hazard.h>item.y;
   assert.equal(overlap,false,level.id+' blocked '+item.id);
  }
 }
});
test('snake_patrol_grows_with_stage_and_stays_on_its_platform',()=>{
 const spans=[];
 for(const number of [1,5,10,15,20]){
  const level=createFlatLevel({number,pots:[{id:'snake',x:128,y:16,w:10,h:12,outcome:'snake'}]});
  const model=new GameModel([level]);model.start();model.state.player.x=128;resolveInteractions(model.state,level);
  const snake=model.snapshot().enemies[0];spans.push(snake.maxX-snake.minX);assert.equal(snake.speed,6);
 }
 for(let i=1;i<spans.length;i++)assert.ok(spans[i]>spans[i-1]);assert.ok(spans.at(-1)>spans[0]*3);
 for(const level of levels)for(const pot of level.pots.filter(p=>p.outcome==='snake')){
  const model=new GameModel([level]);model.start();Object.assign(model.state.player,{x:pot.x,y:pot.y});model.state.enemies=[];resolveInteractions(model.state,level);
  const snake=model.snapshot().enemies.find(e=>e.kind==='snake');assert.ok(snake,level.id);
  const platform=level.platforms.find(p=>p.y+p.h===pot.y&&pot.x>=p.x&&pot.x+pot.w<=p.x+p.w);
  for(let t=0;t<120;t++){stepEnemies([snake],.5);assert.ok(snake.x>=platform.x&&snake.x+snake.w<=platform.x+platform.w,level.id);}
 }
});
