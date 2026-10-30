/** @typedef {{x:number,y:number,w:number,h:number}} Rect */
/** @typedef {{left:boolean,right:boolean,up:boolean,down:boolean,jumpPressed:boolean}} InputFrame */
/** @typedef {Rect & {id:string,type?:string,points?:number}} Food */
/** @typedef {Rect & {id:string,kind?:'caterpillar'|'snake',minX:number,maxX:number,speed:number,direction:1|-1,ageSeconds?:number,graceSeconds?:number}} EnemyState */
/** @typedef {Rect & {id:string,outcome:'bonus'|'snake',points?:number}} Pot */
/** @typedef {{id:string,number?:number,foodType?:string,foodName?:string,width:number,height:number,timeLimitSeconds:number,spawn:{x:number,y:number},platforms:Rect[],ladders:Rect[],foods:Food[],enemies:EnemyState[],hazards:Array<Rect & {id:string}>,pots:Pot[]}} LevelData */
/** @typedef {Rect & {vx:number,vy:number,facing:1|-1,mode:'grounded'|'airborne'|'climbing'|'dead',supportY:number|null,fallStartY:number|null}} PlayerState */
/** @typedef {'ready'|'running'|'paused'|'dying'|'stageClear'|'gameOver'|'victory'} GamePhase */
/** @typedef {{phase:GamePhase,levelIndex:number,stageCount:number,score:number,highScore:number,lives:number,secondsLeft:number,timeLimitSeconds:number,foodType:string,foodName:string,phaseSeconds:number,stageStartScore:number,deathReason:null|'timeout'|'enemy'|'fall'|'hazard',player:PlayerState,enemies:EnemyState[],collectedFoodIds:string[],openedPotIds:string[]}} GameState */
/** @typedef {{type:'food'|'bonus'|'death'|'stageClear'|'victory'}} GameEvent */
/** @typedef {{render(state:GameState):void,resize():void,dispose():void}} Renderer */
/** @typedef {{unlock():Promise<void>,play(event:GameEvent):void,setMuted(value:boolean):void,dispose():void}} Audio */
/** @typedef {{read():InputFrame,clear():void,dispose():void}} Input */
/** @typedef {{request(callback:(nowMs:number)=>void):number,cancel(id:number):void,now():number}} Scheduler */
export {};