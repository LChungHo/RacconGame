const KEY='ponpoko.highScore.v1';
const valid=value=>Number.isSafeInteger(value)&&value>=0;
export function createScoreStore(storage) {
 function read(){try{const value=Number(storage?.getItem(KEY)??0);return valid(value)?value:0;}catch{return 0;}}
 return {
  read,
  save(value){if(!valid(value))return;try{storage?.setItem(KEY,String(Math.max(read(),value)));}catch{/* Local scores are optional. */}}
 };
}
