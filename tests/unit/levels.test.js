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
test('all_levels_valid_and_solvable',()=>{assert.equal(levels.length,3);assert.equal(new Set(levels.map(l=>l.id)).size,3);for(const level of levels){assert.deepEqual(validateLevel(level),[]);const m=new GameModel([level]);m.start();assert.ok(solutions[level.id]?.length);for(const part of solutions[level.id])for(let t=0;t<part.ticks;t++)m.step(part.input,1/60);for(let t=0;t<60;t++)m.step({left:false,right:false,up:false,down:false,jumpPressed:false},1/60);assert.equal(m.snapshot().phase,'victory',level.id);assert.equal(m.snapshot().lives,3,level.id);}});
