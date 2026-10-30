import test from 'node:test';
import assert from 'node:assert/strict';
import { NullEngine } from '@babylonjs/core/Engines/nullEngine.js';
import { createRenderer } from '../../wwwroot/js/game/renderer.js';
import { GameModel } from '../../wwwroot/js/game/model.js';
import { createFlatLevel } from '../helpers/fixtures.js';
test('render_reuses_meshes',()=>{const engine=new NullEngine();const levels=[createFlatLevel()];const renderer=createRenderer({canvas:{},levels,engine});const state=new GameModel(levels).snapshot();renderer.render(state);const count=engine.scenes[0].meshes.length;assert.ok(count>0);for(let i=0;i<100;i++)renderer.render(state);assert.equal(engine.scenes[0].meshes.length,count);assert.equal(state.player.x,16);renderer.dispose();});
test('dispose_is_idempotent',()=>{const engine=new NullEngine();const r=createRenderer({canvas:{},levels:[createFlatLevel()],engine});r.dispose();assert.doesNotThrow(()=>r.dispose());assert.equal(engine.scenes.length,0);});

test('renderer_accepts_newly_released_snakes_and_reuses_their_mesh',()=>{
 const engine=new NullEngine();const levels=[createFlatLevel({pots:[{id:'bag',x:16,y:16,w:10,h:12,outcome:'snake'}]})];
 const model=new GameModel(levels),renderer=createRenderer({canvas:{},levels,engine});
 renderer.render(model.snapshot());const before=engine.scenes[0].meshes.length;
 model.start();model.step({left:false,right:false,up:false,down:false,jumpPressed:false},1/60);
 assert.doesNotThrow(()=>renderer.render(model.snapshot()));
 assert.equal(engine.scenes[0].meshes.length,before+1);
 for(let i=0;i<10;i++)renderer.render(model.snapshot());assert.equal(engine.scenes[0].meshes.length,before+1);
 renderer.dispose();
});