import { createPainter } from './pixel-art.js';
const green='#3f9e48',lightGreen='#95d66a',darkGreen='#21693b',red='#e94e42',cream='#fff0c4',yellow='#efc955',orange='#ee923e',brown='#805333';
export function paintFood(type) {
 const p=createPainter(),{rect,ellipse,line,polygon,pixel}=p;
 switch(type){
 case 'carrot':
  polygon([[5,7],[18,11],[6,23]],orange);line(8,9,12,10,'#ffc16c',2);line(14,8,12,1,green,2);line(15,8,19,2,lightGreen,2);line(16,8,22,6,green,2);line(8,15,10,16,brown);break;
 case 'cherries':
  line(7,14,14,3,green);line(18,16,14,3,green);ellipse(16,3,4,2,lightGreen);ellipse(6,17,5,5,red);ellipse(18,18,5,5,'#c93742');rect(4,14,2,3,cream);rect(17,15,2,2,cream);break;
 case 'mushroom':
  rect(9,10,7,12,cream);rect(8,20,9,3,'#e0cfaa');ellipse(12,9,10,7,red);rect(2,10,21,4,red);ellipse(7,8,2,2,cream);ellipse(16,5,2,2,cream);rect(16,10,3,3,cream);break;
 case 'persimmon':
  ellipse(12,15,10,8,orange);ellipse(10,13,6,5,'#f4a44e');polygon([[5,7],[12,9],[18,6],[16,11],[12,10],[8,12]],green);rect(12,3,2,5,brown);break;
 case 'corn':
  ellipse(12,12,6,10,yellow);for(let y=4;y<21;y+=4)for(let x=9;x<=15;x+=3)rect(x,y,1,2,'#c48e33');
  polygon([[2,11],[8,15],[12,23],[6,21]],green);polygon([[22,9],[19,20],[12,23],[15,15]],lightGreen);break;
 case 'pineapple':
  ellipse(12,16,8,8,'#d9a947');for(let y=11;y<23;y+=4)for(let x=7;x<20;x+=4)rect(x+(y%3),y,1,2,brown);
  polygon([[12,10],[4,3],[10,5],[11,0],[14,5],[21,2],[17,8]],green);break;
 case 'watermelon':
  for(let y=9;y<23;y++)for(let x=1;x<24;x++){const d=((x-12)/11)**2+((y-11)/10)**2;if(d<=1)pixel(x,y,d>.75?darkGreen:d>.58?lightGreen:red);}
  for(const [x,y]of [[5,12],[9,17],[14,13],[18,12]])rect(x,y,1,2,'#2b2925');break;
 case 'eggplant':
  ellipse(12,15,7,8,'#81549c');ellipse(14,14,3,6,'#ad81bc');polygon([[6,6],[13,3],[19,7],[16,10],[11,7],[8,10]],green);line(13,4,15,0,darkGreen,2);break;
 case 'melon':
  ellipse(12,14,10,9,'#95bfa1');for(let y=7;y<23;y+=4)line(4,y,20,y,cream);for(let x=5;x<22;x+=4)line(x,6,x-4,22,'#dce9bf');
  rect(11,2,2,5,green);line(12,3,17,3,green,2);break;
 case 'chestnut':
  polygon([[3,12],[12,3],[21,12]],brown);ellipse(12,15,9,8,'#9d603d');ellipse(12,20,8,3,'#d5af71');line(7,11,8,17,'#bf8553');break;
 case 'banana':
  ellipse(11,12,11,10,yellow);ellipse(15,7,10,9,null);line(2,12,3,17,'#ffe88a',2);rect(2,7,3,3,brown);rect(20,13,3,3,brown);break;
 case 'strawberry':
  ellipse(7,10,5,5,red);ellipse(17,10,5,5,red);polygon([[2,10],[22,10],[12,23]],red);
  for(const [x,y]of [[6,10],[11,13],[17,10],[8,16],[14,18]])rect(x,y,1,2,yellow);
  polygon([[4,5],[11,7],[12,2],[15,6],[21,4],[18,8],[7,8]],green);break;
 case 'orange':
  ellipse(12,14,10,9,orange);ellipse(9,11,3,3,'#ffc372');rect(12,3,2,4,brown);ellipse(17,4,5,2,green);break;
 case 'radish':
  ellipse(12,15,6,7,'#f4f0df');polygon([[7,16],[17,16],[10,24]],'#f4f0df');line(10,7,5,1,green,2);line(12,7,12,0,lightGreen,2);line(14,7,20,2,green,2);line(12,20,11,22,'#ceceb8');break;
 case 'apple':
  ellipse(8,14,7,8,red);ellipse(16,14,7,8,'#d83a3d');rect(11,2,2,6,brown);ellipse(17,4,5,2,green);rect(5,10,2,4,cream);break;
 case 'grapes':
  for(const [x,y]of [[7,9],[15,9],[4,14],[12,14],[20,14],[8,19],[16,19],[12,23]])ellipse(x,y,3,3,'#9565bf');
  ellipse(7,8,1,1,'#d6b8ec');line(12,7,13,1,green,2);ellipse(17,3,5,2,green);break;
 case 'peanut':
  ellipse(8,8,6,7,'#ca9b66');ellipse(15,17,7,6,'#dcb47b');for(const [x,y]of [[5,5],[9,9],[11,15],[16,17],[18,20]])line(x,y,x+2,y+1,'#9d7045');break;
 case 'peach':
  ellipse(8,14,7,8,'#f2a58c');ellipse(16,14,7,8,'#efbd9b');line(12,9,11,21,'#d77c7c');ellipse(17,4,5,2,green);rect(12,3,2,5,brown);break;
 case 'peas':
  ellipse(12,14,11,7,green);ellipse(12,13,9,4,darkGreen);for(const x of [5,12,19])ellipse(x,13,3,3,lightGreen);line(3,18,19,18,lightGreen);break;
 case 'beer':
  rect(16,10,7,10,yellow);rect(18,12,3,6,null);rect(4,7,13,16,'#dbaa35');rect(6,8,9,13,yellow);rect(7,10,2,10,'#ffe58c');
  for(const [x,y]of [[6,5],[10,3],[15,5]])ellipse(x,y,4,3,'#fff5d8');rect(3,5,15,4,'#fff5d8');rect(4,22,13,2,cream);break;
 default:throw new Error('Unknown food sprite: '+type);
 }
 return p.pixels;
}
