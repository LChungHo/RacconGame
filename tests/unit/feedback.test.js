import test from 'node:test';
import assert from 'node:assert/strict';
import { GameModel } from '../../wwwroot/js/game/model.js';
import { createFlatLevel,emptyInput } from '../helpers/fixtures.js';
test('low_jump_clears_a_pin_without_high_arc',()=>{
 const model=new GameModel([createFlatLevel({spawn:{x:44,y:16},hazards:[{id:'pin',x:64,y:16,w:8,h:8}]})]);model.start();
 let peak=16;for(let i=0;i<36;i++){model.step({...emptyInput(),right:true,jumpPressed:i===0},1/60);peak=Math.max(peak,model.snapshot().player.y);assert.equal(model.snapshot().lives,3);}
 assert.ok(peak-16>=8);assert.ok(peak-16<=18,'jump should only rise enough to clear a pin');assert.equal(model.snapshot().player.y,16);
});
test('movement_and_jump_audio_events_follow_actual_motion',()=>{
 const model=new GameModel([createFlatLevel()]);model.start();let steps=0;
 for(let i=0;i<60;i++)steps+=model.step({...emptyInput(),right:true},1/60).filter(e=>e.type==='move').length;
 assert.ok(steps>=8&&steps<=10);
 let jumps=0;for(let i=0;i<6;i++)jumps+=model.step({...emptyInput(),jumpPressed:true},1/60).filter(e=>e.type==='jump').length;
 assert.equal(jumps,1);model.pause();assert.deepEqual(model.step({...emptyInput(),right:true},1/60),[]);
});
test('walking_into_a_wall_does_not_make_step_sounds',()=>{
 const model=new GameModel([createFlatLevel({spawn:{x:276,y:16}})]);model.start();
 for(let i=0;i<60;i++)assert.ok(!model.step({...emptyInput(),right:true},1/60).some(e=>e.type==='move'));
});
