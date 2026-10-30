import test from 'node:test';
import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { createRenderer } from '../../wwwroot/js/game/renderer.js';
import { GameModel } from '../../wwwroot/js/game/model.js';
import { createFlatLevel } from '../helpers/fixtures.js';
test('render_reuses_meshes',()=>{const engine=new NullEngine();const levels=[createFlatLevel()];const renderer=createRenderer({canvas:{},levels,engine});const state=new GameModel(levels).snapshot();renderer.render(state);const count=engine.scenes[0].meshes.length;assert.ok(count>0);for(let i=0;i<100;i++)renderer.render(state);assert.equal(engine.scenes[0].meshes.length,count);assert.equal(state.player.x,16);renderer.dispose();});
test('dispose_is_idempotent',()=>{const engine=new NullEngine();const r=createRenderer({canvas:{},levels:[createFlatLevel()],engine});r.dispose();assert.doesNotThrow(()=>r.dispose());assert.equal(engine.scenes.length,0);});
