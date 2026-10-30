export function createAudio(window) {
 let context,muted=false,usable=false,disposed=false,footstep=0;
 const active=new Set();
 function stopTones() {
  for(const {osc,gain}of active){try{osc.stop();}catch{}osc.disconnect();gain.disconnect();}
  active.clear();
 }
 function tone(frequency,offset,duration,volume=.035,ramp) {
  const osc=context.createOscillator(),gain=context.createGain(),entry={osc,gain};
  const start=context.currentTime+offset;
  osc.type='square';
  osc.frequency.setValueAtTime(frequency,start);
  if(ramp)osc.frequency.linearRampToValueAtTime(ramp,start+duration);
  gain.gain.setValueAtTime(volume,start);
  gain.gain.exponentialRampToValueAtTime(.0001,start+duration);
  osc.connect(gain);gain.connect(context.destination);active.add(entry);
  osc.onended=()=>{osc.disconnect();gain.disconnect();active.delete(entry);};
  osc.start(start);osc.stop(start+duration+.01);
 }
 return {
  async unlock(){
   if(disposed)return;
   try{const AudioContext=window.AudioContext??window.webkitAudioContext;if(!AudioContext)return;context??=new AudioContext();await context.resume();usable=!disposed;}catch{usable=false;}
  },
  play(event){
   if(disposed||muted||!usable)return;
   try{
    if(['stageClear','victory','death'].includes(event.type))stopTones();
    if(event.type==='jump')tone(260,0,.12,.035,680);
    else if(event.type==='move')tone(footstep++%2?220:180,0,.025,.012);
    else if(event.type==='stageClear'||event.type==='victory'){
     const tune=[523,659,784,1047,784,659,698,880,1047,1397,1047,880,784,988,1175,1568,1319,1175,1047,784,659,784,1047];
     const melody=tune.map((frequency,index)=>[frequency,index*.19,index===tune.length-1?.43:.14]);
     for(const [frequency,offset,duration]of melody)tone(frequency,offset,duration,.032);
    } else {
     const frequency={food:659,bonus:880,death:110}[event.type];
     if(frequency)tone(frequency,0,event.type==='death'?.20:.10,.035);
    }
   }catch{usable=false;}
  },
  stop:stopTones,
  setMuted(value){muted=Boolean(value);if(muted)stopTones();},
  dispose(){if(disposed)return;disposed=true;stopTones();if(context)Promise.resolve(context.close()).catch(()=>{});}
 };
}