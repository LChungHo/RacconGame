import test from 'node:test';
import assert from 'node:assert/strict';
import { GameModel } from '../../wwwroot/js/game/model.js';
import { stepEnemies, resolveInteractions, scoreForFood } from '../../wwwroot/js/game/rules.js';
import { createFlatLevel, emptyInput } from '../helpers/fixtures.js';

const food={id:'near',x:16,y:16,w:8,h:8,points:100};
const enemy={id:'e',kind:'caterpillar',x:16,y:16,w:12,h:12,minX:16,maxX:80,speed:0,direction:1};
const model=(patch={})=>{const m=new GameModel([createFlatLevel(patch)]);m.start();return m;};

test('food_chain_uses_pickup_order_and_caps_after_eleventh',()=>{
 const foods=Array.from({length:14},(_,i)=>({...food,id:'f'+i,x:8+16*i}));
 const m=model({foods});
 const totals=[10,30,60,110,210,410,710,1210,2210,4210,7210,10210,13210];
 for(let i=0;i<13;i++){m.state.player.x=foods[i].x;resolveInteractions(m.state,m.levels[0]);assert.equal(m.snapshot().score,totals[i]);}
 assert.equal(scoreForFood(10),3000);assert.equal(scoreForFood(19),3000);
});
test('food_and_bonus_score_once_without_advancing_chain',()=>{
 const m=model({foods:[food,{...food,id:'far',x:200}],pots:[{id:'b',x:16,y:16,w:8,h:8,outcome:'bonus',points:500}]});
 m.step(emptyInput(),1/60);m.step(emptyInput(),1/60);assert.equal(m.snapshot().score,510);assert.equal(m.snapshot().collectedFoodIds.length,1);
 m.state.player.x=200;const before=m.state.score;resolveInteractions(m.state,m.levels[0]);assert.equal(m.state.score-before,20+1190);
});
test('enemy_patrol_reflects_at_bounds',()=>{const e={...enemy,x:79,speed:24};stepEnemies([e],.1);assert.ok(e.x<=80);assert.equal(e.direction,-1);for(let i=0;i<100;i++){stepEnemies([e],.1);assert.ok(e.x>=16&&e.x<=80);}});
test('simultaneous_hazards_cost_one_life',()=>{const m=model({enemies:[enemy],hazards:[{id:'spike',x:16,y:16,w:8,h:8}],timeLimitSeconds:.01});const events=m.step(emptyInput(),1/60);assert.equal(m.snapshot().lives,2);assert.equal(m.snapshot().phase,'dying');assert.equal(events.filter(e=>e.type==='death').length,1);m.step(emptyInput(),1/60);assert.equal(m.snapshot().lives,2);});
test('lethal_tick_precedes_last_food',()=>{const m=model({enemies:[enemy],foods:[food]});m.step(emptyInput(),1/60);assert.equal(m.snapshot().score,0);assert.equal(m.snapshot().phase,'dying');});
test('jump_cannot_pass_floor_enemies_but_ladder_can',()=>{
 const jumping=model({enemies:[enemy]});Object.assign(jumping.state.player,{y:48,mode:'airborne'});resolveInteractions(jumping.state,jumping.levels[0]);assert.equal(jumping.snapshot().phase,'dying');
 const climbing=model({enemies:[enemy]});Object.assign(climbing.state.player,{y:32,mode:'climbing'});resolveInteractions(climbing.state,climbing.levels[0]);assert.equal(climbing.snapshot().phase,'running');
});
test('fall_64_survives_65_dies',()=>{for(const [height,want] of [[64,'running'],[65,'dying']]){const m=model();m.state.player.fallStartY=16+height;resolveInteractions(m.state,m.levels[0]);assert.equal(m.snapshot().phase,want);}const m=model();m.state.player.y=-17;resolveInteractions(m.state,m.levels[0]);assert.equal(m.snapshot().phase,'dying');});
test('snake_bag_spawns_one_persistent_slow_enemy_instead_of_instant_death',()=>{
 const m=model({pots:[{id:'s',x:16,y:16,w:10,h:12,outcome:'snake'}]});m.step(emptyInput(),1/60);
 assert.equal(m.snapshot().phase,'running');assert.equal(m.snapshot().enemies.length,1);
 const snake=m.snapshot().enemies[0];assert.equal(snake.kind,'snake');assert.equal(snake.speed,6);
 m.step(emptyInput(),1/60);assert.equal(m.snapshot().enemies.length,1);assert.notEqual(m.snapshot().enemies[0].x,snake.x);
 const safe=model({foods:[food],pots:[{id:'s',x:100,y:16,w:8,h:8,outcome:'snake'}]});safe.step(emptyInput(),1/60);assert.equal(safe.snapshot().phase,'stageClear');
});
test('snake_becomes_lethal_after_emergence_grace',()=>{
 const m=model({pots:[{id:'s',x:16,y:16,w:10,h:12,outcome:'snake'}]});m.step(emptyInput(),1/60);
 const snake=m.state.enemies[0];stepEnemies([snake],.5);m.state.player.x=snake.x;resolveInteractions(m.state,m.levels[0]);assert.equal(m.snapshot().phase,'dying');
});
test('timer_one_causes_one_falling_death_even_on_last_life',()=>{
 const m=model();m.state.secondsLeft=1.01;m.state.lives=1;m.step(emptyInput(),1/60);
 assert.equal(m.snapshot().phase,'dying');assert.equal(m.snapshot().deathReason,'timeout');assert.equal(m.snapshot().lives,0);
 const y=m.snapshot().player.y;m.step(emptyInput(),.2);assert.ok(m.snapshot().player.y<y);assert.equal(m.snapshot().lives,0);
 for(let i=0;i<60;i++)m.step(emptyInput(),1/60);assert.equal(m.snapshot().phase,'gameOver');
});
test('retry_restores_checkpoint_and_food_chain',()=>{const m=model({enemies:[enemy]});m.state.stageStartScore=700;m.state.score=900;m.state.collectedFoodIds=['other'];m.step(emptyInput(),1/60);for(let i=0;i<60;i++)m.step(emptyInput(),1/60);const s=m.snapshot();assert.equal(s.phase,'running');assert.equal(s.score,700);assert.equal(s.secondsLeft,120);assert.deepEqual(s.collectedFoodIds,[]);assert.equal(s.enemies[0].x,16);});
test('clear_bonus_uses_remaining_timer_and_advances_to_victory',()=>{
 const levels=[0,1,2].map(n=>createFlatLevel({id:'level'+n,foods:[food]}));const m=new GameModel(levels);m.start();m.state.secondsLeft=12.9;
 const events=m.step(emptyInput(),1/60);assert.equal(m.snapshot().score,130);assert.equal(events.filter(e=>e.type==='stageClear').length,1);
 for(let l=0;l<3;l++){for(let i=0;i<60;i++)m.step(emptyInput(),1/60);if(l<2){assert.equal(m.snapshot().levelIndex,l+1);m.step(emptyInput(),1/60);}}assert.equal(m.snapshot().phase,'victory');
});
test('pause_preserves_transition_timer',()=>{const m=model({foods:[food]});m.step(emptyInput(),1/60);m.step(emptyInput(),.5);m.pause();m.step(emptyInput(),10);m.resume();assert.equal(m.snapshot().phase,'stageClear');assert.equal(m.snapshot().phaseSeconds,.5);});