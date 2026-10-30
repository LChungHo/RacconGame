export function createAudio(window){
 let context,muted=false,usable=false,disposed=false;const active=new Set();
 function stopTones(){for(const {osc,gain} of active){try{osc.stop();}catch{}osc.disconnect();gain.disconnect();}active.clear();}
 return {
  async unlock(){
   if(disposed)return;
   try{const AudioContext=window.AudioContext??window.webkitAudioContext;if(!AudioContext)return;context??=new AudioContext();await context.resume();usable=!disposed;}catch{usable=false;}
  },
  play(event){
   if(disposed||muted||!usable)return;
   const frequency={food:659,bonus:880,death:110,stageClear:1047,victory:1320}[event.type];if(!frequency)return;
   try{
    const osc=context.createOscillator(),gain=context.createGain(),tone={osc,gain};const now=context.currentTime;
    osc.type='square';osc.frequency.setValueAtTime(frequency,now);gain.gain.setValueAtTime(.045,now);gain.gain.exponentialRampToValueAtTime(.0001,now+.13);
    osc.connect(gain);gain.connect(context.destination);active.add(tone);osc.onended=()=>{osc.disconnect();gain.disconnect();active.delete(tone);};
    osc.start(now);osc.stop(now+.15);
   }catch{usable=false;}
  },
  setMuted(value){muted=Boolean(value);if(muted)stopTones();},
  dispose(){if(disposed)return;disposed=true;stopTones();if(context)Promise.resolve(context.close()).catch(()=>{});}
 };
}
