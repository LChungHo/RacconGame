const text={
 ready:['시작을 눌러주세요','먹거리 탐험을 시작해요','모든 먹거리를 모으면 다음 스테이지!','READY TO PLAY?'],
 running:['먹거리를 모두 모아보세요','','',''],
 paused:['잠깐 쉬어가는 중','잠시 쉬어가요','P 키나 계속하기 버튼으로 돌아오세요.','TAKE A BREATH'],
 dying:['한 번 더 도전해요','앗! 다시 도전해요','현재 스테이지의 처음으로 돌아갑니다.','ONE MORE TRY'],
 stageClear:['스테이지 클리어!','맛있는 성공!','잠시 후 다음 스테이지로 이동합니다.','STAGE CLEAR'],
 gameOver:['게임 오버 · 다시 도전해보세요','다음엔 더 멀리!','다시 시작을 누르면 새 모험이 시작됩니다.','GAME OVER'],
 victory:['세 스테이지 모두 클리어!','모험을 완주했어요!','멋진 플레이였어요. 다시 한번 도전해볼까요?','YOU DID IT!']
};
export function renderHud(root,state){
 const find=id=>root.querySelector('#'+id);
 find('score').textContent=String(state.score);find('lives').textContent=String(state.lives);find('time').textContent=String(Math.ceil(state.secondsLeft));
 find('stage').textContent=String(state.levelIndex+1).padStart(2,'0')+' / 03';
 const [status,title,copy,kicker]=text[state.phase];
 const statusNode=find('game-status');if(statusNode.dataset.phase!==state.phase){statusNode.dataset.phase=state.phase;statusNode.textContent=status;}
 find('start').disabled=state.phase!=='ready';
 const pause=find('pause');pause.disabled=!['running','paused','dying','stageClear'].includes(state.phase);pause.textContent=state.phase==='paused'?'계속하기 · P':'일시정지 · P';
 find('screen-overlay').hidden=state.phase==='running';find('overlay-title').textContent=title;find('overlay-copy').textContent=copy;
 root.querySelector('.overlay-kicker').textContent=kicker;root.querySelector('.start-hint').hidden=state.phase!=='ready';
}
