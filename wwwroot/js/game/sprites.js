const raccoon=[
'..bb......bb....','.boob....boob...','.boooobboooob...','..boooooooob....','..bcckcckccb....','..bckwccwkcb....','...bccccccb.....','....cckkcc......',
'...bccccccb.....','..booccccoob....','bbbooocccoob....','bckboo..oob.....','bkcbboooobb.....','.bkkboooob......','..bb.b..b.......','....bb..bb......'];
const apple=[
'.......gg.......','......gg........','....rrgrrrr.....','...rrrrrrrrr....','..rrwrrrrrrrr...','..rwrrrrrrrrr...','..rrrrrrrrrrr...','..rrrrrrrrrrr...',
'...rrrrrrrrr....','...rrrrrrrrr....','....rrrrrrr.....','.....rrrrr......','................','................','................','................'];
const enemy=[
'................','..pp......pp....','...pppppppp.....','..pppppppppp....','.ppwkkppwkkpp...','.ppwkkppwkkpp...','..pppppppppp....','...pppppppp.....',
'...kkkppkkk.....','..kk..kk..kk....','.kk...kk...kk...','................','................','................','................','................'];
const pot=[
'....yyyyyyyy....','.....oooooo.....','....oooooooo....','...oooccccooo...','..oooccccccooo..','..ooccckkcccoo..','..oocckcckccoo..','..oocccckcccoo..',
'..ooccckccccoo..','..ooccccccccoo..','..ooccckccccoo..','...ooccccccoo...','....ooooooo.....','.....ooooo......','................','................'];
const spike=[
'................','.......c........','......ccc.......','......ccc.......','.....ccccc......','.....ccccc......','....ccccccc.....','....ccccccc.....',
'...ccccccccc....','...ccccccccc....','..ccccccccccc...','..ccccccccccc...','.ccccccccccccc..','.ccccccccccccc..','kkkkkkkkkkkkkkkk','................'];
const palettes={b:'#775038',o:'#d9914c',c:'#f9e3ad',k:'#201c20',w:'#fff8dd',g:'#b8e56f',r:'#f26f51',p:'#ee9ac0',y:'#e7c86a'};
export function createSpriteAtlas(){
 const walk=raccoon.map((row,i)=>i>12?row.split('').reverse().join(''):row);
 const climb=raccoon.map((row,i)=>i>3&&i<8?row.replaceAll('k','o').replaceAll('w','b'):row);
 const patterns={idle:raccoon,walk,jump:raccoon.slice(0,14).concat(['..bb......bb....','................']),climb,dead:[...raccoon].reverse(),food:apple,enemy,pot,spike};
 const width=Object.keys(patterns).length*16,height=16,pixels=new Uint8Array(width*height*4),frames={};
 let index=0;
 for(const [name,rows] of Object.entries(patterns)){
  frames[name]={x:index*16,y:0,w:16,h:16};
  for(let y=0;y<16;y++)for(let x=0;x<16;x++){
   const hex=palettes[(rows[y]??'')[x]];
   if(!hex)continue;
   const offset=(y*width+index*16+x)*4;
   pixels[offset]=parseInt(hex.slice(1,3),16);pixels[offset+1]=parseInt(hex.slice(3,5),16);pixels[offset+2]=parseInt(hex.slice(5,7),16);pixels[offset+3]=255;
  }
  index++;
 }
 return {width,height,pixels,frames};
}
