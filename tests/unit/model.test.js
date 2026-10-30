import test from 'node:test';
import assert from 'node:assert/strict';
import { GameModel } from '../../wwwroot/js/game/model.js';
import { createFlatLevel,emptyInput } from '../helpers/fixtures.js';
test('model_starts_and_restarts',()=>{const m=new GameModel([createFlatLevel()]);m.start();assert.equal(m.snapshot().phase,'running');assert.equal(m.snapshot().lives,3);assert.equal(m.snapshot().score,0);assert.equal(m.snapshot().secondsLeft,120);m.pause();m.step(emptyInput(),1);assert.equal(m.snapshot().phase,'paused');m.resume();assert.equal(m.snapshot().phase,'running');m.restart();assert.equal(m.snapshot().phase,'ready');assert.equal(m.snapshot().levelIndex,0);});
test('snapshot_cannot_mutate_live_state',()=>{const m=new GameModel([createFlatLevel()]);const s=m.snapshot();s.player.x=999;s.enemies.push({});assert.equal(m.snapshot().player.x,16);assert.deepEqual(m.snapshot().enemies,[]);});
test('model_rejects_invalid_levels',()=>assert.throws(()=>new GameModel([createFlatLevel({timeLimitSeconds:0})])));
