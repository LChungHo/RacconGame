import { CONFIG } from './config.js';
import { drawScore } from './pixel-score.js';
import { STAGE_FOODS } from './levels/catalog.js';
import { createSpriteAtlas } from './sprites.js';

const cache=new WeakMap();
const messages={
 ready:['시작을 눌러주세요','먹거리 탐험을 시작해요','그 판의 먹거리를 모두 모으면 다음 스테이지!','READY TO PLAY?'],
 running:['먹거리를 모두 모아보세요','','',''],
 paused:['잠깐 쉬어가는 중','잠시 쉬어가요','P 키나 계속하기 버튼으로 돌아오세요.','TAKE A BREATH'],
 dying:['한 번 더 도전해요','앗! 다시 도전해요','현재 스테이지의 처음으로 돌아갑니다.','ONE MORE TRY'],
 stageClear:['스테이지 클리어!','맛있는 성공!','남은 시간만큼 보너스! 다음 스테이지로 이동합니다.','STAGE CLEAR'],
 gameOver:['게임 오버 · 다시 도전해보세요','다음엔 더 멀리!','다시 시작을 누르면 새 모험이 시작됩니다.','GAME OVER'],
 victory:['20개 스테이지 모두 클리어!','모험을 완주했어요!','당근부터 맥주까지, 모든 먹거리를 모았어요.','YOU DID IT!']
};
function paintIcon(canvas,frame,atlas) {
 canvas.width=frame.w;canvas.height=frame.h;canvas.setAttribute('aria-hidden','true');
 const data=new Uint8ClampedArray(frame.w*frame.h*4);
 for(let y=0;y<frame.h;y++)data.set(atlas.pixels.subarray(((frame.y+y)*atlas.width+frame.x)*4,((frame.y+y)*atlas.width+frame.x+frame.w)*4),y*frame.w*4);
 canvas.getContext('2d').putImageData(new ImageData(data,frame.w,frame.h),0,0);
}
function initialize(root) {
 const nodes={};for(const id of ['score','top-score','score-display','top-score-display','stage','stage-label','lives','time','time-fill','food-strip','life-strip','life-panel','life-status','game-status','start','pause','screen-overlay','overlay-title','overlay-copy'])nodes[id]=root.querySelector('#'+id);
 const atlas=createSpriteAtlas();
 for(const [index,food]of STAGE_FOODS.entries()) {
  const item=document.createElement('li'),canvas=document.createElement('canvas');
  item.title=(index+1)+'. '+food.name;
  item.setAttribute('aria-label',item.title);
  paintIcon(canvas,atlas.frames['food-'+food.id],atlas);
  item.append(canvas);nodes['food-strip'].append(item);
 }
 for(let i=0;i<CONFIG.lives;i++){const item=document.createElement('li'),canvas=document.createElement('canvas');paintIcon(canvas,atlas.frames.idle,atlas);item.append(canvas);nodes['life-strip'].append(item);}
 nodes.kicker=root.querySelector('.overlay-kicker');nodes.hint=root.querySelector('.start-hint');
 cache.set(root,nodes);return nodes;
}
export function renderHud(root,state) {
 const nodes=cache.get(root)??initialize(root);
 nodes.score.textContent=String(state.score);
 nodes['top-score'].textContent=String(state.highScore??state.score);
 drawScore(nodes['score-display'],state.score);drawScore(nodes['top-score-display'],state.highScore??state.score);
 nodes.lives.textContent=String(state.lives);
 nodes['life-panel'].setAttribute('aria-label','남은 기회 '+state.lives+'번');
 nodes['life-status'].textContent=state.lives===0?'게임 종료':'남은 기회';
 [...nodes['life-strip'].children].forEach((item,index)=>item.hidden=index>=state.lives);
 nodes.stage.textContent=String(state.levelIndex+1);
 nodes['stage-label'].textContent=(state.levelIndex+1)+' / '+state.stageCount+' · '+state.foodName;
 const ratio=Math.max(0,Math.min(1,(state.secondsLeft-1)/Math.max(1,state.timeLimitSeconds-1)));
 nodes['time-fill'].style.transform='scaleX('+ratio+')';
 nodes.time.setAttribute('aria-valuenow',String(Math.round(ratio*100)));
 nodes.time.setAttribute('aria-valuetext','남은 시간 '+Math.round(ratio*100)+'퍼센트');
 nodes.time.classList.toggle('is-low',ratio<.2);
 if(nodes['food-strip'].dataset.stage!==String(state.levelIndex)) {
  nodes['food-strip'].dataset.stage=String(state.levelIndex);
  [...nodes['food-strip'].children].forEach((item,index)=>{
   item.hidden=index>state.levelIndex;
   item.classList.toggle('is-current',index===state.levelIndex);
   item.classList.toggle('is-complete',index<state.levelIndex);
   if(index===state.levelIndex)item.setAttribute('aria-current','step');else item.removeAttribute('aria-current');
  });
 }
 const [status,title,copy,kicker]=messages[state.phase];
 if(nodes['game-status'].dataset.phase!==state.phase){nodes['game-status'].dataset.phase=state.phase;nodes['game-status'].textContent=status;}
 nodes.start.disabled=state.phase!=='ready';
 nodes.pause.disabled=!['running','paused','dying','stageClear'].includes(state.phase);
 nodes.pause.textContent=state.phase==='paused'?'계속하기 · P':'일시정지 · P';
 nodes['screen-overlay'].hidden=state.phase==='running';
 nodes['overlay-title'].textContent=title;nodes['overlay-copy'].textContent=copy;nodes.kicker.textContent=kicker;nodes.hint.hidden=state.phase!=='ready';
}
