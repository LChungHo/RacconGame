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
