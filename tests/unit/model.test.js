import test from 'node:test';
import assert from 'node:assert/strict';
import { GameModel } from '../../wwwroot/js/game/model.js';
import { createFlatLevel,emptyInput } from '../helpers/fixtures.js';
test('model_starts_and_restarts',()=>{const m=new GameModel([createFlatLevel()]);m.start();assert.equal(m.snapshot().phase,'running');assert.equal(m.snapshot().lives,3);assert.equal(m.snapshot().score,0);assert.equal(m.snapshot().secondsLeft,120);m.pause();m.step(emptyInput(),1);assert.equal(m.snapshot().phase,'paused');m.resume();assert.equal(m.snapshot().phase,'running');m.restart();assert.equal(m.snapshot().phase,'ready');assert.equal(m.snapshot().levelIndex,0);});
test('snapshot_cannot_mutate_live_state',()=>{const m=new GameModel([createFlatLevel()]);const s=m.snapshot();s.player.x=999;s.enemies.push({});assert.equal(m.snapshot().player.x,16);assert.deepEqual(m.snapshot().enemies,[]);});
test('model_rejects_invalid_levels',()=>assert.throws(()=>new GameModel([createFlatLevel({timeLimitSeconds:0})])));

import { levels } from '../../wwwroot/js/game/levels/index.js';
import { solutions } from '../fixtures/solutions.js';
test('all_twenty_levels_complete_then_restart',()=>{assert.equal(levels.length,20);const m=new GameModel(levels);m.start();for(const level of levels){for(const part of solutions[level.id])for(let t=0;t<part.ticks;t++)m.step(part.input,1/60);for(let t=0;t<300;t++)m.step(emptyInput(),1/60);}assert.equal(m.snapshot().phase,'victory');assert.equal(m.snapshot().lives,3+Math.floor(m.snapshot().score/30000));m.restart();assert.equal(m.snapshot().phase,'ready');assert.equal(m.snapshot().score,0);assert.equal(m.snapshot().lives,3);});

test('high_score_survives_session_restart',()=>{
 const foods=[{id:'near',x:16,y:16,w:8,h:8,points:100},{id:'far',x:200,y:16,w:8,h:8,points:100}];
 const model=new GameModel([createFlatLevel({foods})]);model.start();model.step(emptyInput(),1/60);
 assert.equal(model.snapshot().score,10);assert.equal(model.snapshot().highScore,10);
 model.restart();assert.equal(model.snapshot().score,0);assert.equal(model.snapshot().highScore,10);
 const restored=new GameModel([createFlatLevel()],{highScore:500});assert.equal(restored.snapshot().highScore,500);
});