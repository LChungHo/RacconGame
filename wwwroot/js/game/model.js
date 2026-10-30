import { CONFIG } from './config.js';
import { validateLevel } from './levels/index.js';
export class GameModel {
 constructor(levels) {
  if(!Array.isArray(levels)||!levels.length||new Set(levels.map(l=>l.id)).size!==levels.length||levels.some(l=>validateLevel(l).length))throw new Error('Invalid levels');
  this.levels=structuredClone(levels);
  this.restart();
 }
 restart(){
  const level=this.levels[0];
  this.state={phase:'ready',levelIndex:0,score:0,lives:CONFIG.lives,secondsLeft:level.timeLimitSeconds,phaseSeconds:0,stageStartScore:0,
   player:{...level.spawn,w:12,h:16,vx:0,vy:0,facing:1,mode:'grounded',supportY:level.spawn.y,fallStartY:level.spawn.y},
   enemies:structuredClone(level.enemies),collectedFoodIds:[],openedPotIds:[]};
  this.previousPhase=null;
 }
 start(){if(this.state.phase==='ready')this.state.phase='running';}
 pause(){if(['running','dying','stageClear'].includes(this.state.phase)){this.previousPhase=this.state.phase;this.state.phase='paused';}}
 resume(){if(this.state.phase==='paused'&&this.previousPhase){this.state.phase=this.previousPhase;this.previousPhase=null;}}
 snapshot(){return structuredClone(this.state);}
 step(input,dt){return [];}
}
