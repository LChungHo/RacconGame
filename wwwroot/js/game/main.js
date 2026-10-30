import { levels } from './levels/index.js';
import { GameModel } from './model.js';
import { createRenderer } from './renderer.js';
import { createInput } from './input.js';
import { createAudio } from './audio.js';
import { createGameApp } from './app.js';
import { renderHud } from './hud.js';
import { createResults } from './results.js';
import { createScoreStore } from './score-store.js';
const root=document.querySelector('#game-root'),canvas=root.querySelector('#game-canvas');
const listeners=[];let app,renderer,input,audio,results;
function listen(target,name,handler){target.addEventListener(name,handler);listeners.push(()=>target.removeEventListener(name,handler));}
function cleanup(){results?.dispose();listeners.splice(0).forEach(remove=>remove());if(app)app.dispose();else{input?.dispose();audio?.dispose();renderer?.dispose();}}
function showError(){
 cleanup();const message=root.querySelector('#game-error');message.hidden=false;
 message.textContent='그래픽을 시작할 수 없습니다. WebGL을 지원하는 브라우저에서 다시 시도해 주세요.';
 root.querySelector('#screen-overlay').hidden=true;
 for(const id of ['start','pause','restart'])root.querySelector('#'+id).disabled=true;
}
try{
 const config=JSON.parse(document.querySelector('#game-config').textContent);
 if(config.logicalWidth!==288||config.logicalHeight!==224)throw new Error('Invalid board size');
 let storage;try{storage=window.localStorage;}catch{}
 const scores=createScoreStore(storage);let savedHighScore=scores.read();
 const model=new GameModel(levels,{highScore:savedHighScore});renderer=createRenderer({canvas,levels});audio=createAudio(window);
 const togglePause=()=>app.snapshot().phase==='paused'?app.resume():app.pause();
 input=createInput({target:window,canvas,onPause:togglePause});
 results=createResults({root,assetBaseUrl:config.assetBaseUrl});
 app=createGameApp({model,input,renderer,audio,scheduler:{request:fn=>requestAnimationFrame(fn),cancel:id=>cancelAnimationFrame(id),now:()=>performance.now()},hud:state=>{renderHud(root,state);results.render(state);if(state.highScore>savedHighScore){scores.save(state.highScore);savedHighScore=state.highScore;}},onError:showError});
 const start=()=>{void audio.unlock();app.start();canvas.focus({preventScroll:true});};
 listen(root.querySelector('#start'),'click',start);
 listen(root.querySelector('#pause'),'click',()=>{togglePause();canvas.focus({preventScroll:true});});
 listen(root.querySelector('#restart'),'click',()=>{app.restart();canvas.focus({preventScroll:true});});
 let muted=false;listen(root.querySelector('#mute'),'click',event=>{muted=!muted;audio.setMuted(muted);event.currentTarget.setAttribute('aria-pressed',String(muted));event.currentTarget.textContent=muted?'♪ 소리 꺼짐':'♪ 소리 켜짐';});
 listen(window,'keydown',event=>{if(event.code==='Enter'&&!event.repeat&&document.activeElement===canvas&&app.snapshot().phase==='ready'){event.preventDefault();start();}});
 listen(window,'blur',()=>app.pause());listen(document,'visibilitychange',()=>{if(document.hidden)app.pause();});
 listen(window,'resize',()=>{try{renderer.resize();renderer.render(app.snapshot());}catch{showError();}});
 listen(window,'pagehide',event=>{if(event.persisted)app.pause();else cleanup();});
 listen(window,'pageshow',event=>{if(event.persisted){try{renderer.resize();app.pause();}catch{showError();}}});
 canvas.focus({preventScroll:true});
}catch{showError();}
