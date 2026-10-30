import { createClock } from './clock.js';
export function createGameApp({model,input,renderer,audio,scheduler,hud,onError=()=>{}}){
 let disposed=false,frameId=null,last=scheduler.now();
 const clock=createClock(dt=>{for(const event of model.step(input.read(),dt))audio.play(event);});
 function dispose(){if(disposed)return;disposed=true;if(frameId!==null)scheduler.cancel(frameId);frameId=null;clock.reset();input.dispose();renderer.dispose();audio.dispose();}
 function paint(){const snapshot=model.snapshot();renderer.render(snapshot);hud(snapshot);}
 function safelyPaint(){try{paint();}catch(error){dispose();onError(error);}}
 function resetTime(){clock.reset();last=scheduler.now();input.clear();}
 function frame(now){
  if(disposed)return;
  frameId=null;
  try{clock.advance(Math.max(0,(now-last)/1000));last=now;paint();}
  catch(error){dispose();onError(error);return;}
  if(!disposed)frameId=scheduler.request(frame);
 }
 frameId=scheduler.request(frame);safelyPaint();
 return {
  start(){if(disposed)return;resetTime();model.start();safelyPaint();},
  pause(){if(disposed)return;model.pause();resetTime();safelyPaint();},
  resume(){if(disposed)return;model.resume();resetTime();safelyPaint();},
  restart(){if(disposed)return;model.restart();resetTime();safelyPaint();},
  snapshot(){return model.snapshot();},dispose
 };
}
