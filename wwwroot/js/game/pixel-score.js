const DIGITS=[
 ['11111','10001','10001','10001','10001','10001','11111'],
 ['00100','01100','00100','00100','00100','00100','01110'],
 ['11111','00001','00001','11111','10000','10000','11111'],
 ['11111','00001','00001','11111','00001','00001','11111'],
 ['10001','10001','10001','11111','00001','00001','00001'],
 ['11111','10000','10000','11111','00001','00001','11111'],
 ['11111','10000','10000','11111','10001','10001','11111'],
 ['11111','00001','00010','00100','01000','01000','01000'],
 ['11111','10001','10001','11111','10001','10001','11111'],
 ['11111','10001','10001','11111','00001','00001','11111']
];
export function drawScore(canvas,value) {
 const text=String(value).padStart(5,'0');
 if(canvas.dataset.value===text)return;
 canvas.dataset.value=text;
 const context=canvas.getContext('2d');
 context.clearRect(0,0,canvas.width,canvas.height);
 context.fillStyle='#088d99';
 const scale=4,advance=24,start=Math.max(0,(canvas.width-(text.length*advance-4))/2);
 [...text].forEach((digit,index)=>DIGITS[Number(digit)].forEach((row,y)=>[...row].forEach((bit,x)=>{
  if(bit==='1')context.fillRect(start+index*advance+x*scale,y*scale,scale,scale);
 })));
}