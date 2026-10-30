function createRunId(){
 const crypto=window.crypto;if(crypto.randomUUID)return crypto.randomUUID();
 const bytes=crypto.getRandomValues(new Uint8Array(16));bytes[6]=(bytes[6]&15)|64;bytes[8]=(bytes[8]&63)|128;
 const hex=Array.from(bytes,value=>value.toString(16).padStart(2,'0')).join('');
 return hex.slice(0,8)+'-'+hex.slice(8,12)+'-'+hex.slice(12,16)+'-'+hex.slice(16,20)+'-'+hex.slice(20);
}
export function createResults({root,assetBaseUrl,fetch:request=window.fetch.bind(window),makeId=createRunId}) {
 const panel=root.querySelector('#result-panel'),form=root.querySelector('#score-form'),name=root.querySelector('#player-name');
 const save=root.querySelector('#save-score'),status=root.querySelector('#result-message'),receipt=root.querySelector('#result-receipt');
 const body=root.querySelector('#leaderboard-body'),score=root.querySelector('#final-score'),title=root.querySelector('#result-title');
 const endpoint=assetBaseUrl+'api/leaderboard';
 let generation=0,phase,runId,finalScore=0,pending=false,saved=false,disposed=false,controller;
 function reset(){
  generation++;controller?.abort();controller=new AbortController();pending=false;saved=false;runId=makeId();
  panel.hidden=true;form.hidden=false;save.disabled=false;name.disabled=false;receipt.textContent='';status.textContent='';body.replaceChildren();
 }
 function leaders(entries){
  body.replaceChildren();
  for(const entry of entries){const row=document.createElement('tr');
   for(const value of [entry.rank+'위',entry.name,entry.score+'점']){const cell=document.createElement('td');cell.textContent=value;row.append(cell);}
   body.append(row);
  }
  if(!entries.length){const row=document.createElement('tr'),cell=document.createElement('td');cell.colSpan=3;cell.textContent='첫 기록의 주인공이 되어보세요!';row.append(cell);body.append(row);}
 }
 async function load(current){
  try{const response=await request(endpoint,{signal:controller.signal,cache:'no-store'});if(!response.ok)throw new Error();
   const data=await response.json();if(disposed||generation!==current||saved)return;leaders(data.leaders);
  }catch(error){if(error.name==='AbortError'||disposed||generation!==current||saved)return;status.textContent='순위표를 불러오지 못했습니다. 기록 저장은 다시 시도할 수 있습니다.';}
 }
 async function submit(event){
  event.preventDefault();if(disposed||pending||saved||!['gameOver','victory'].includes(phase))return;
  const playerName=name.value.trim();if(!playerName){name.setCustomValidity('이름을 입력해 주세요.');name.reportValidity();return;}
  const current=generation;pending=true;save.disabled=true;status.textContent='서버에 기록을 저장하고 있어요…';
  try{
   const response=await request(endpoint,{method:'POST',signal:controller.signal,headers:{'Content-Type':'application/json','X-CSRF-TOKEN':form.querySelector('[name="__RequestVerificationToken"]').value},body:JSON.stringify({runId,name:playerName,score:finalScore})});
   const data=await response.json();if(!response.ok)throw new Error(data.message??'저장하지 못했습니다. 잠시 후 다시 시도해 주세요.');
   if(disposed||generation!==current)return;
   saved=true;name.disabled=true;form.hidden=true;leaders(data.leaders);
   receipt.textContent=data.entry.name+' · '+data.entry.score+'점 · '+data.entry.rank+'위';
   status.textContent='서버에 저장했습니다. 모든 플레이어와 순위를 공유합니다.';
  }catch(error){if(error.name==='AbortError'||disposed||generation!==current)return;status.textContent=error.message==='Failed to fetch'?'서버에 연결하지 못했습니다. 다시 저장을 눌러 주세요.':error.message;}
  finally{if(generation===current&&!disposed){pending=false;save.disabled=saved;}}
 }
 const clearValidity=()=>name.setCustomValidity('');
 form.addEventListener('submit',submit);name.addEventListener('input',clearValidity);
 return {
  render(state){
   if(disposed)return;
   if(phase!==state.phase){
    const previous=phase;phase=state.phase;
    if(state.phase==='ready'||previous===undefined)reset();
    if(['gameOver','victory'].includes(state.phase)){
     finalScore=state.score;score.textContent=finalScore+'점';title.textContent=state.phase==='victory'?'20 스테이지 완주!':'GAME OVER';
     panel.hidden=false;void load(generation);name.focus({preventScroll:true});
    }else panel.hidden=true;
   }
  },
  dispose(){if(disposed)return;disposed=true;generation++;controller?.abort();form.removeEventListener('submit',submit);name.removeEventListener('input',clearValidity);}
 };
}
