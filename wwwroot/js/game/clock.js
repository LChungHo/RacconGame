import { CONFIG } from './config.js';
export function createClock(step) {
 let accumulator=0;
 return {
  advance(elapsed) {
   if(!Number.isFinite(elapsed)||elapsed<0)return 0;
   accumulator+=elapsed;
   const available=Math.floor((accumulator+1e-10)/CONFIG.step);
   const count=Math.min(available,CONFIG.maxSteps);
   accumulator=Math.max(0,accumulator-available*CONFIG.step);
   for(let i=0;i<count;i++)step(CONFIG.step);
   return count;
  },
  reset(){accumulator=0;}
 };
}
