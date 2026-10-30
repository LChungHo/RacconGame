import test from 'node:test';import assert from 'node:assert/strict';
import { createGameApp } from '../../wwwroot/js/game/app.js';
import { GameModel } from '../../wwwroot/js/game/model.js';
import { createFlatLevel,emptyInput } from '../helpers/fixtures.js';
function setup(level=createFlatLevel()){
 let time=0,id=0;const queue=new Map();const disposed={input:0,renderer:0,audio:0};let lastState;
 const scheduler={request(fn){queue.set(++id,fn);return id;},cancel(i){queue.delete(i);},now(){return time;},get pendingCount(){return queue.size;},advance(ms){time+=ms;const callbacks=[...queue.values()];queue.clear();callbacks.forEach(fn=>fn(time));}};
 const app=createGameApp({model:new GameModel([level]),input:{read:emptyInput,clear(){},dispose(){disposed.input++;}},renderer:{render(){},resize(){},dispose(){disposed.renderer++;}},audio:{async unlock(){},play(){},setMuted(){},dispose(){disposed.audio++;}},scheduler,hud(s){lastState=s;}});
 return {app,scheduler,disposed,get last(){return lastState;}};
}
test('paused_app_does_not_advance',()=>{const {app,scheduler}=setup();app.start();scheduler.advance(20);app.pause();const remaining=app.snapshot().secondsLeft;scheduler.advance(10000);app.resume();scheduler.advance(16);assert.equal(app.snapshot().secondsLeft,remaining);app.dispose();});
test('repeated_restart_has_one_loop',()=>{const {app,scheduler,disposed}=setup();for(let i=0;i<20;i++)app.restart();assert.equal(scheduler.pendingCount,1);app.dispose();app.dispose();assert.equal(scheduler.pendingCount,0);assert.deepEqual(disposed,{input:1,renderer:1,audio:1});});
test('app_renders_terminal_states',()=>{const ctx=setup(createFlatLevel({timeLimitSeconds:.02}));ctx.app.start();for(let i=0;i<210;i++)ctx.scheduler.advance(20);assert.equal(ctx.last.phase,'gameOver');assert.equal(ctx.last.lives,0);ctx.app.dispose();});
