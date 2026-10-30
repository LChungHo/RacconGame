import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { createSpriteAtlas } from '../../wwwroot/js/game/sprites.js';
import { STAGE_FOODS } from '../../wwwroot/js/game/levels/catalog.js';
test('all_twenty_foods_have_distinct_visible_sprite_frames',()=>{
 const atlas=createSpriteAtlas(),hashes=new Set();
 for(const food of STAGE_FOODS){
  const frame=atlas.frames['food-'+food.id];assert.ok(frame,food.name);
  const bytes=[];for(let y=0;y<frame.h;y++){const offset=((frame.y+y)*atlas.width+frame.x)*4;bytes.push(...atlas.pixels.slice(offset,offset+frame.w*4));}
  assert.ok(bytes.filter((n,i)=>i%4===3&&n>0).length>20,food.name);
  hashes.add(createHash('sha256').update(new Uint8Array(bytes)).digest('hex'));
 }
 assert.equal(hashes.size,20);
 for(const name of ['idle','walk','jump','climb','dead','caterpillar','snake','bag'])assert.ok(atlas.frames[name],name);
});
