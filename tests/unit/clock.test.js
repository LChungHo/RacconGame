import test from 'node:test';
import assert from 'node:assert/strict';
import { createClock } from '../../wwwroot/js/game/clock.js';
test('clock_equivalent_frame_rates',()=>{for(const rate of [30,60,120]){let ticks=0;const c=createClock(()=>ticks++);for(let i=0;i<rate;i++)c.advance(1/rate);assert.equal(ticks,60);}});
test('clock_clamps_long_gap',()=>{let ticks=0;const c=createClock(()=>ticks++);assert.equal(c.advance(10),5);c.advance(0);assert.equal(ticks,5);});
test('clock_ignores_invalid_time_and_reset_discards_partial',()=>{let ticks=0;const c=createClock(()=>ticks++);for(const n of [-1,NaN,Infinity])c.advance(n);assert.equal(ticks,0);c.advance(1/120);c.reset();c.advance(1/120);assert.equal(ticks,0);});
