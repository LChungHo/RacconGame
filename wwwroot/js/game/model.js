import { CONFIG } from './config.js';
import { validateLevel } from './levels/index.js';
import { stepPlayer } from './movement.js';
import { resetAttempt,stepEnemies,resolveInteractions,tickSession } from './rules.js';

export class GameModel {
 constructor(levels,{highScore=0}={}) {
  if(!Array.isArray(levels)||!levels.length||new Set(levels.map(level=>level.id)).size!==levels.length||levels.some(level=>validateLevel(level).length))throw new Error('Invalid levels');
  this.levels=structuredClone(levels);
  this.bestScore=Number.isSafeInteger(highScore)&&highScore>=0?highScore:0;
  this.restart();
 }
 restart() {
  this.state={phase:'ready',levelIndex:0,stageCount:this.levels.length,score:0,highScore:this.bestScore,lives:CONFIG.lives,stageStartScore:0,extraLivesAwarded:0};
  resetAttempt(this.state,this.levels[0]);
  this.previousPhase=null;this.moveDistance=0;
 }
 start(){if(this.state.phase==='ready')this.state.phase='running';}
 pause(){if(['running','dying','stageClear'].includes(this.state.phase)){this.previousPhase=this.state.phase;this.state.phase='paused';}}
 resume(){if(this.state.phase==='paused'&&this.previousPhase){this.state.phase=this.previousPhase;this.previousPhase=null;this.moveDistance=0;}}
 snapshot(){return structuredClone(this.state);}
 step(input,dt) {
  if(!Number.isFinite(dt)||dt<=0)return [];
  const state=this.state;
  let events;const motionEvents=[];
  if(state.phase==='running') {
   const level=this.levels[state.levelIndex];
   state.secondsLeft=Math.max(0,state.secondsLeft-dt);
   const before={...state.player};
   stepPlayer(state.player,input,level,dt);
   stepEnemies(state.enemies,dt);
   events=resolveInteractions(state,level);
   if(state.phase==='running'){
    const player=state.player;
    if(before.mode==='grounded'&&player.mode==='airborne'&&input.jumpPressed&&player.vy>0)motionEvents.push({type:'jump'});
    const walking=before.mode==='grounded'&&player.mode==='grounded';
    const climbing=before.mode==='climbing'||player.mode==='climbing';
    const distance=walking?Math.abs(player.x-before.x):climbing?Math.abs(player.y-before.y):0;
    if(distance>0){this.moveDistance+=distance;if(this.moveDistance>=8){this.moveDistance%=8;motionEvents.push({type:'move'});}}
    else this.moveDistance=0;
   }else this.moveDistance=0;
  } else {this.moveDistance=0;events=tickSession(state,this.levels,dt);}
  this.bestScore=Math.max(this.bestScore,state.score);
  state.highScore=this.bestScore;
  return [...motionEvents,...events];
 }
}
