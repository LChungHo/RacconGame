import test from 'node:test';
import assert from 'node:assert/strict';
import { createScoreStore } from '../../wwwroot/js/game/score-store.js';
test('high_score_survives_reload_and_never_decreases',()=>{const data=new Map();const storage={getItem:key=>data.get(key)??null,setItem:(key,value)=>data.set(key,value)};const first=createScoreStore(storage);assert.equal(first.read(),0);first.save(120);first.save(50);assert.equal(createScoreStore(storage).read(),120);});
test('unavailable_or_corrupt_storage_does_not_stop_game',()=>{const store=createScoreStore({getItem(){throw Error('blocked');},setItem(){throw Error('blocked');}});assert.equal(store.read(),0);assert.doesNotThrow(()=>store.save(100));assert.equal(createScoreStore({getItem:()=>'-50'}).read(),0);});
