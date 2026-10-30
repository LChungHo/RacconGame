import { STAGE_FOODS } from './catalog.js';

// Fixed coordinates, not a random level generator. Entries are [left ladder, right ladder, top gap x/width, lower gap offset].
const LAYOUTS = [
 [24,232,null,0],[28,236,[104,12],0],[20,228,[132,16],8],[32,240,[156,8],16],
 [24,236,[92,20],24],[28,232,[116,16],4],[20,240,[148,12],12],[32,228,[164,20],20],
 [24,240,[100,16],28],[28,228,[124,24],6],[20,232,[144,8],14],[32,236,[160,16],22],
 [24,228,[96,24],30],[28,240,[120,12],2],[20,236,[140,20],10],[32,232,[156,24],18],
 [24,236,[108,8],26],[28,232,[128,20],5],[20,228,[152,16],13],[32,240,[164,24],21]
];
function platformRow(y,gaps) {
 const segments=[];let x=0;
 for(const [start,width] of gaps.toSorted((a,b)=>a[0]-b[0])){
  if(start>x)segments.push({x,y:y-8,w:start-x,h:8});
  x=start+width;
 }
 if(x<288)segments.push({x,y:y-8,w:288-x,h:8});
 return segments;
}
export function buildLevels() {
 return STAGE_FOODS.map((food,index)=>{
  const number=index+1,[left,right,topGap,offset]=LAYOUTS[index];
  const lowerGaps=index===0?[[],[],[]]:[
   [[104+offset,8+index%3*4]],
   [[144-offset%16,12+index%4*4]],
   index<3?[]:[[96+offset%24,8+index%3*4],[172,8]]
  ];
  const platforms=[16,64,112].flatMap((y,i)=>platformRow(y,lowerGaps[i]));
  platforms.push(...platformRow(160,topGap?[topGap]:[]));
  const ladders=[16,64,112].flatMap(y=>[{x:left,y,w:12,h:48},{x:right,y,w:12,h:48}]);
  const foods=[16,64,112,160].flatMap(y=>[48,64,200].map(x=>({id:'food-'+y+'-'+x,x,y,w:8,h:8,type:food.id})));
  const bonusCount=[3,9].includes(number)?1:[4,12,13].includes(number)?3:2;
  const bonusIndices=Array.from({length:bonusCount},(_,i)=>(index+i*2+i%2)%4);
  // Avoid repeated indices when three score bags are required.
  const bonusSet=new Set(bonusCount===3?[index%4,(index+1)%4,(index+2)%4]:bonusIndices);
  const pots=[[80,16],[168,64],[80,112],[264,160]].map(([x,y],i)=>({
   id:'bag-'+i,x,y,w:10,h:12,outcome:bonusSet.has(i)?'bonus':'snake',points:[100,200,500,1000][(index+i)%4]
  }));
  const enemies=Array.from({length:1+Math.floor(index/7)},(_,i)=>({
   id:'caterpillar-'+i,kind:'caterpillar',x:112+i*8,y:[16,64,112][i],
   w:12,h:12,minX:92+index%3*4,maxX:160+index%3*4,speed:24+index*1.5,direction:i%2?-1:1
  }));
  const hazards=index<4?[]:[16,112].filter((_,i)=>index>9||i===0).map((y,i)=>({id:'spike-'+i,x:156+i*8,y,w:8,h:8}))
   .filter(h=>platforms.some(p=>p.y+p.h===h.y&&h.x>=p.x&&h.x+h.w<=p.x+p.w));
  return {id:'stage-'+String(number).padStart(2,'0'),number,foodType:food.id,foodName:food.name,
   width:288,height:224,timeLimitSeconds:120,spawn:{x:16,y:16},platforms,ladders,foods,enemies,hazards,pots};
 });
}
