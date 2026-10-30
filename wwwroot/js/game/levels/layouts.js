import { STAGE_FOODS } from './catalog.js';

// Fixed coordinates. Entries are [left ladder, right ladder, top gap x/width, lower gap offset].
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
function supported(platforms,item){
 return platforms.find(p=>p.y+p.h===item.y&&item.x>=p.x&&item.x+item.w<=p.x+p.w);
}
function isClear(hazard,items,ladders){
 if(items.some(item=>item.y===hazard.y&&hazard.x<item.x+item.w+4&&hazard.x+hazard.w>item.x-4))return false;
 return !ladders.some(l=>hazard.y>=l.y&&hazard.y<=l.y+l.h&&hazard.x<l.x+l.w+4&&hazard.x+hazard.w>l.x-4);
}
export function buildLevels() {
 return STAGE_FOODS.map((food,index)=>{
  const number=index+1,[left,right,topGap,offset]=LAYOUTS[index];
  const detour=index>=4,wideGap=[96+index%3*4,64+Math.floor(Math.max(0,index-4)/4)*8];
  const lowerGaps=detour?[[],[],index>=8?[wideGap]:[]]:index===0?[[],[],[]]:[
   [[104+offset,8+index%3*4]],[[144-offset%16,12+index%4*4]],index<3?[]:[[96+offset%24,8+index%3*4],[172,8]]
  ];
  const platforms=[16,64,112].flatMap((y,i)=>platformRow(y,lowerGaps[i]));
  platforms.push(...platformRow(160,detour?[wideGap]:topGap?[topGap]:[]));
  const ladders=[16,64,112].flatMap((y,row)=>[
   {x:left+[0,12,4][row],y,w:12,h:48},{x:right+[0,-12,4][row],y,w:12,h:48},
   ...(detour?[{x:80,y,w:12,h:48},{x:196,y,w:12,h:48}]:[])
  ]);
  if(detour)ladders.push({x:132,y:16,w:12,h:48});
  const foods=[16,64,112,160].flatMap(y=>[48,64,200].map(x=>({id:'food-'+y+'-'+x,x,y,w:8,h:8,type:food.id})));
  const bonusCount=[3,9].includes(number)?1:[4,12,13].includes(number)?3:2;
  const bonusIndices=Array.from({length:bonusCount},(_,i)=>(index+i*2+i%2)%4);
  const bonusSet=new Set(bonusCount===3?[index%4,(index+1)%4,(index+2)%4]:bonusIndices);
  const pots=[[80,16],[168,64],[80,112],[264,160]].map(([x,y],i)=>({
   id:'bag-'+i,x,y,w:10,h:12,outcome:bonusSet.has(i)?'bonus':'snake',points:[100,200,500,1000][(index+i)%4]
  }));
  const enemies=Array.from({length:1+Math.floor(index/7)},(_,i)=>{
   const y=[16,64,112][i],w=12;
   const platform=platforms.filter(p=>p.y+p.h===y).toSorted((a,b)=>b.w-a.w)[0];
   const available=platform.w-w,span=Math.min(68+index*8,available);
   const minX=platform.x+(available-span)/2,maxX=minX+span;
   return {id:'caterpillar-'+i,kind:'caterpillar',x:Math.min(maxX,Math.max(minX,112+i*8)),y,w,h:12,minX,maxX,speed:24+index*1.5,direction:i%2?-1:1};
  });
  const candidates=[160,112,64,16].flatMap(y=>[216,100,252,132,164,112].map(x=>({x,y,w:8,h:8})));
  const hazards=candidates.filter(h=>supported(platforms,h)&&isClear(h,[...foods,...pots],ladders))
   .slice(0,Math.floor(index/2)).map((h,i)=>({...h,id:'spike-'+i}));
  return {id:'stage-'+String(number).padStart(2,'0'),number,foodType:food.id,foodName:food.name,
   width:288,height:224,timeLimitSeconds:120,spawn:{x:16,y:16},platforms,ladders,foods,enemies,hazards,pots};
 });
}
