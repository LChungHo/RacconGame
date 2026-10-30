import test from 'node:test';import assert from 'node:assert/strict';
import { createAudio } from '../../wwwroot/js/game/audio.js';
function recordingContext(){
 const notes=[];class Context{currentTime=2;destination={};async resume(){}async close(){}
 createGain(){return{gain:{setValueAtTime(){},exponentialRampToValueAtTime(){}},connect(){},disconnect(){}};}
 createOscillator(){const note={};notes.push(note);return{frequency:{setValueAtTime(value){note.frequency=value;},linearRampToValueAtTime(value){note.ramp=value;}},connect(){},disconnect(){},start(time){note.start=time;},stop(time){note.stop=time;},onended:null};}}
 return {notes,Context};
}
test('jump_and_movement_have_distinct_short_sound_cues',async()=>{
 const {notes,Context}=recordingContext();const audio=createAudio({AudioContext:Context});await audio.unlock();
 audio.play({type:'jump'});assert.equal(notes.length,1);assert.ok(notes[0].ramp>notes[0].frequency);
 audio.play({type:'move'});assert.equal(notes.length,2);assert.ok(notes[1].stop-notes[1].start<.08);audio.dispose();
});
test('stage_clear_plays_a_short_multi_note_melody_and_mute_stops_it',async()=>{
 const {notes,Context}=recordingContext();const audio=createAudio({AudioContext:Context});await audio.unlock();audio.play({type:'stageClear'});
 assert.ok(notes.length>=4);assert.ok(new Set(notes.map(n=>n.frequency)).size>=3);assert.ok(notes.at(-1).start-notes[0].start>=.5);
 audio.setMuted(true);assert.ok(notes.every(note=>note.stop===undefined));const count=notes.length;audio.play({type:'move'});assert.equal(notes.length,count);audio.dispose();
});

test('clear_music_lasts_through_the_raccoon_dance',async()=>{
 const {notes,Context}=recordingContext();const audio=createAudio({AudioContext:Context});await audio.unlock();audio.play({type:'stageClear'});
 assert.ok(Math.max(...notes.map(n=>n.stop))-notes[0].start>=4,'celebration needs a full dance melody');audio.dispose();
});
