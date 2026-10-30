export function createInput({target,canvas,onPause=()=>{}}){
 const held=new Set();let jump=false,disposed=false;
 const doc=canvas.ownerDocument??target.document;
 const codes=new Set(['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','Space','KeyP']);
 function ownsFocus(){
  const active=doc?.activeElement;
  if(active?.isContentEditable||['INPUT','TEXTAREA','SELECT'].includes(active?.tagName))return false;
  return active===canvas||Boolean(active?.closest?.('.controls'));
 }
 function clear(){held.clear();jump=false;}
 function down(event){
  if(!ownsFocus()||!codes.has(event.code))return;
  event.preventDefault();
  if(event.code==='KeyP'){if(!event.repeat)onPause();return;}
  if(event.code==='Space'&&!event.repeat&&!held.has('Space'))jump=true;
  held.add(event.code);
 }
 function up(event){held.delete(event.code);}
 target.addEventListener('keydown',down);target.addEventListener('keyup',up);target.addEventListener('blur',clear);
 return {
  read(){const frame={left:held.has('ArrowLeft'),right:held.has('ArrowRight'),up:held.has('ArrowUp'),down:held.has('ArrowDown'),jumpPressed:jump};jump=false;return frame;},
  clear,
  dispose(){if(disposed)return;disposed=true;clear();target.removeEventListener('keydown',down);target.removeEventListener('keyup',up);target.removeEventListener('blur',clear);}
 };
}
