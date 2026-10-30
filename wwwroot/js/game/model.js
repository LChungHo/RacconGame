import { CONFIG } from './config.js';
import { validateLevel } from './levels/index.js';
import { stepPlayer } from './movement.js';
import { resetAttempt,stepEnemies,resolveInteractions,tickSession } from './rules.js';
export class GameModel {
 constructor(levels) {
  if(!Array.isArray(levels)||!levels.length||new Set(levels.map(l=>l.id)).size!==levels.length||levels.some(l=>validateLevel(l).length))throw new Error('Invalid levels');
  this.levels=structuredClone(levels);this.restart();
 }
 restart(){this.state={phase:'ready',levelIndex:0,score:0,lives:CONFIG.lives,stageStartScore:0};resetAttempt(this.state,this.levels[0]);this.previousPhase=null;}
 start(){if(this.state.phase==='ready')this.state.phase='running';}
 pause(){if(['running','dying','stageClear'].includes(this.state.phase)){this.previousPhase=this.state.phase;this.state.phase='paused';}}
 resume(){if(this.state.phase==='paused'&&this.previousPhase){this.state.phase=this.previousPhase;this.previousPhase=null;}}
 snapshot(){return structuredClone(this.state);}
 step(input,dt){
  if(!Number.isFinite(dt)||dt<=0)return [];
  const s=this.state;
  if(s.phase==='running'){
   const level=this.levels[s.levelIndex];
   s.secondsLeft=Math.max(0,s.secondsLeft-dt);
   stepPlayer(s.player,input,level,dt);stepEnemies(s.enemies,dt);
   return resolveInteractions(s,level);
  }
  return tickSession(s,this.levels,dt);
 }
}
