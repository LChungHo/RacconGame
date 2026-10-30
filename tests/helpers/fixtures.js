export const emptyInput = () => ({ left:false,right:false,up:false,down:false,jumpPressed:false });
export function createFlatLevel(overrides={}) {
 return { id:'test',width:288,height:224,timeLimitSeconds:120,spawn:{x:16,y:16},
 platforms:[{x:0,y:8,w:288,h:8}],ladders:[],
 foods:[{id:'food',x:270,y:16,w:8,h:8,points:100}],enemies:[],hazards:[],pots:[],...overrides };
}
export function makePlayer(overrides={}) {
 return {x:16,y:16,w:12,h:16,vx:0,vy:0,facing:1,mode:'grounded',supportY:16,fallStartY:16,...overrides};
}
