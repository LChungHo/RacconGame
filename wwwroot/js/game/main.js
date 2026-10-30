import { levels } from './levels/index.js';
import { GameModel } from './model.js';
import { createRenderer } from './renderer.js';
const canvas=document.querySelector('#game-canvas');
try{
 const model=new GameModel(levels);const renderer=createRenderer({canvas,levels});
 renderer.render(model.snapshot());requestAnimationFrame(()=>renderer.render(model.snapshot()));
 window.addEventListener('resize',()=>{renderer.resize();renderer.render(model.snapshot());});
 window.addEventListener('pagehide',()=>renderer.dispose(),{once:true});
}catch(error){
 const message=document.querySelector('#game-error');message.hidden=false;
 message.textContent='그래픽을 시작할 수 없습니다. WebGL을 지원하는 브라우저에서 다시 시도해 주세요.';
 document.querySelector('#screen-overlay').hidden=true;document.querySelector('#start').disabled=true;
}
