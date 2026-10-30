import level1 from './level-01.js';
import { CONFIG } from '../config.js';
import level2 from './level-02.js';
import level3 from './level-03.js';
export const levels=[level1,level2,level3];
export function validateLevel(level) {
 const errors=[];
 if(!level||typeof level!=='object')return ['level must be an object'];
 const positive=n=>Number.isFinite(n)&&n>0;
 if(typeof level.id!=='string'||!level.id.trim())errors.push('id');
 if(!positive(level.width)||!positive(level.height)||!positive(level.timeLimitSeconds))errors.push('dimensions/time');
 const rectValid=r=>r&&[r.x,r.y,r.w,r.h].every(Number.isFinite)&&r.x>=0&&r.y>=0&&r.w>0&&r.h>0&&r.x+r.w<=level.width&&r.y+r.h<=level.height;
 const spawn=level.spawn;
 if(!spawn||!rectValid({...spawn,w:CONFIG.playerWidth,h:CONFIG.playerHeight}))errors.push('spawn');
 const ids=new Set();
 for(const kind of ['platforms','ladders','foods','enemies','hazards','pots']) {
  const items=level[kind];
  if(!Array.isArray(items)){errors.push(kind);continue;}
  if(kind==='foods'&&items.length===0)errors.push('food required');
  for(const item of items){
   if(!rectValid(item)){errors.push(kind+' bounds');continue;}
   if(['foods','enemies','hazards','pots'].includes(kind)){
    if(typeof item.id!=='string'||!item.id||ids.has(item.id))errors.push(kind+' id');
    ids.add(item.id);
   }
   if(kind==='foods'&&!positive(item.points))errors.push('food points');
   if(kind==='pots'&&!['bonus','snake'].includes(item.outcome))errors.push('pot outcome');
   if(kind==='enemies'&&(![item.minX,item.maxX,item.speed].every(Number.isFinite)||item.minX<0||item.minX>item.maxX||item.maxX+item.w>level.width||item.x<item.minX||item.x>item.maxX||item.speed<0||![1,-1].includes(item.direction)))errors.push('enemy patrol');
  }
 }
 return errors;
}
