import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLevel } from '../../wwwroot/js/game/levels/index.js';
import { createFlatLevel } from '../helpers/fixtures.js';
test('level_accepts_valid_data',()=>assert.deepEqual(validateLevel(createFlatLevel()),[]));
test('level_rejects_invalid_data',()=>{const cases=[
 {width:0},{spawn:{x:-1,y:16}},{spawn:{x:287,y:16}},{timeLimitSeconds:0},
 {foods:[{id:'a',x:1,y:16,w:8,h:8,points:100},{id:'a',x:20,y:16,w:8,h:8,points:100}]},
 {platforms:[{x:NaN,y:8,w:10,h:8}]},
 {enemies:[{id:'e',x:20,y:16,w:12,h:12,minX:30,maxX:10,speed:20,direction:1}]}
 ];for(const c of cases)assert.ok(validateLevel(createFlatLevel(c)).length>0,JSON.stringify(c));});

import { levels } from '../../wwwroot/js/game/levels/index.js';
import { GameModel } from '../../wwwroot/js/game/model.js';
import { solutions } from '../fixtures/solutions.js';
test('all_levels_valid_and_solvable',()=>{assert.equal(levels.length,20);assert.equal(new Set(levels.map(l=>l.id)).size,20);for(const level of levels){assert.deepEqual(validateLevel(level),[]);const m=new GameModel([level]);m.start();assert.ok(solutions[level.id]?.length);for(const part of solutions[level.id])for(let t=0;t<part.ticks;t++)m.step(part.input,1/60);for(let t=0;t<60;t++)m.step({left:false,right:false,up:false,down:false,jumpPressed:false},1/60);assert.equal(m.snapshot().phase,'victory',level.id);assert.equal(m.snapshot().lives,3,level.id);}});

test('twenty_stages_follow_requested_food_order_and_fixed_bag_patterns',()=>{
 const names=['당근','앵두','버섯','감','옥수수','파인애플','수박','가지','멜론','밤','바나나','딸기','오렌지','무','사과','포도','땅콩','복숭아','완두콩','맥주'];
 assert.equal(levels.length,20);
 assert.deepEqual(levels.map(level=>level.foodName),names);
 const shapes=new Set();
 levels.forEach((level,index)=>{
  assert.equal(level.number,index+1);assert.equal(level.pots.length,4);
  const expected=[3,9].includes(index+1)?1:[4,12,13].includes(index+1)?3:2;
  assert.equal(level.pots.filter(bag=>bag.outcome==='bonus').length,expected);
  assert.ok(level.enemies.every(enemy=>enemy.kind==='caterpillar'));
  if(index)assert.ok(level.enemies[0].speed>levels[index-1].enemies[0].speed);
  shapes.add(JSON.stringify([level.platforms,level.ladders]));
  for(const food of level.foods)assert.equal(food.type,level.foodType);
 });
 assert.equal(shapes.size,20);
});
test('authored_ladder_landings_allow_a_normal_hold_then_horizontal_exit',()=>{
 for(const level of levels){
  const model=new GameModel([level]);model.start();const startX=level.ladders[0].x;model.state.player.x=startX;
  for(let tick=0;tick<60;tick++)model.step({left:false,right:false,up:true,down:false,jumpPressed:false},1/60);
  model.step({left:false,right:true,up:false,down:false,jumpPressed:false},1/60);
  assert.equal(model.snapshot().player.y,64,level.id);assert.equal(model.snapshot().player.mode,'grounded',level.id);
  assert.ok(model.snapshot().player.x>startX,level.id);
 }
});