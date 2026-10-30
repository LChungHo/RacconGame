import { Engine,Scene,FreeCamera,Vector3,Camera,Color3,Color4,MeshBuilder,StandardMaterial,RawTexture,Texture,VertexBuffer } from '@babylonjs/core';
import { createSpriteAtlas } from './sprites.js';
export function createRenderer({canvas,levels,engine}){
 const gpu=engine??new Engine(canvas,false,{preserveDrawingBuffer:true,stencil:true});
 if(!engine)gpu.setHardwareScalingLevel(1/Math.min(globalThis.devicePixelRatio||1,2));
 const scene=new Scene(gpu);scene.clearColor=new Color4(.018,.03,.036,1);
 const camera=new FreeCamera('board-camera',new Vector3(144,112,-100),scene);camera.setTarget(new Vector3(144,112,0));camera.mode=Camera.ORTHOGRAPHIC_CAMERA;
 camera.orthoLeft=-144;camera.orthoRight=144;camera.orthoTop=112;camera.orthoBottom=-112;scene.activeCamera=camera;
 const atlas=createSpriteAtlas();
 const texture=RawTexture.CreateRGBATexture(atlas.pixels,atlas.width,atlas.height,scene,false,false,Texture.NEAREST_SAMPLINGMODE);
 texture.hasAlpha=true;texture.wrapU=texture.wrapV=Texture.CLAMP_ADDRESSMODE;
 const spriteMaterial=new StandardMaterial('sprite-atlas',scene);spriteMaterial.diffuseTexture=texture;spriteMaterial.emissiveColor=Color3.White();spriteMaterial.disableLighting=true;spriteMaterial.backFaceCulling=false;spriteMaterial.useAlphaFromDiffuseTexture=true;
 const materials=new Map(),nodes=new Map();let stage=-1,disposed=false;
 function colorMaterial(color){if(!materials.has(color)){const m=new StandardMaterial(color,scene);m.emissiveColor=Color3.FromHexString(color);m.disableLighting=true;materials.set(color,m);}return materials.get(color);}
 function rectangle(name,r,color,z=2){
  const mesh=MeshBuilder.CreatePlane(name,{width:r.w,height:r.h,sideOrientation:2},scene);
  mesh.position.set(r.x+r.w/2,r.y+r.h/2,z);mesh.material=colorMaterial(color);return mesh;
 }
 function frame(mesh,name){
  if(mesh.metadata===name)return;
  const f=atlas.frames[name],u=f.x/atlas.width,v=(f.x+f.w)/atlas.width;
  mesh.setVerticesData(VertexBuffer.UVKind,[u,1,v,1,v,0,u,0]);mesh.metadata=name;
 }
 function sprite(name,r,kind){
  const mesh=MeshBuilder.CreatePlane(name,{width:r.w,height:r.h,sideOrientation:2,updatable:true},scene);mesh.material=spriteMaterial;
  mesh.position.set(r.x+r.w/2,r.y+r.h/2,0);frame(mesh,kind);nodes.set(name,mesh);return mesh;
 }
 function loadLevel(index){
  for(const mesh of [...scene.meshes])mesh.dispose();nodes.clear();stage=index;
  const level=levels[index];const colors=['#77c7ad','#c4a0d8','#e6a665'];const accent=colors[index%3];
  for(const p of level.platforms){
   rectangle('platform',p,'#24493f');
   rectangle('platform-edge',{x:p.x,y:p.y+p.h-2,w:p.w,h:2},accent,1);
   for(let x=p.x+3;x<p.x+p.w-2;x+=12)rectangle('brick',{x,y:p.y+1,w:1,h:3},'#5a8270',1);
  }
  for(const l of level.ladders){
   rectangle('ladder-left',{x:l.x,y:l.y,w:2,h:l.h},'#c2ad69',1);
   rectangle('ladder-right',{x:l.x+l.w-2,y:l.y,w:2,h:l.h},'#c2ad69',1);
   for(let y=l.y+4;y<l.y+l.h;y+=6)rectangle('ladder-rung',{x:l.x,y,w:l.w,h:1},'#a58e50',1);
  }
  for(const f of level.foods)sprite('food-'+f.id,f,'food');
  for(const h of level.hazards)sprite('hazard-'+h.id,h,'spike');
  for(const p of level.pots)sprite('pot-'+p.id,p,'pot');
  for(const e of level.enemies)sprite('enemy-'+e.id,e,'enemy');
  sprite('player',{...level.spawn,w:12,h:16},'idle');
  // Tiny fixed stars make the otherwise empty upper area feel like an arcade screen.
  for(const [x,y] of [[19,207],[66,195],[141,212],[213,201],[267,211]])rectangle('star',{x,y,w:1,h:1},'#4a6356',3);
 }
 return {
  render(state){
   if(disposed)return;
   if(stage!==state.levelIndex)loadLevel(state.levelIndex);
   const player=nodes.get('player'),p=state.player;
   player.position.set(p.x+p.w/2,p.y+p.h/2,0);player.scaling.x=p.facing;
   const gait=Math.floor(p.x/4)%2;
   frame(player,p.mode==='dead'?'dead':p.mode==='climbing'?'climb':p.mode==='airborne'?'jump':p.vx&&gait?'walk':'idle');
   for(const f of levels[stage].foods)nodes.get('food-'+f.id).setEnabled(!state.collectedFoodIds.includes(f.id));
   for(const pot of levels[stage].pots)nodes.get('pot-'+pot.id).setEnabled(!state.openedPotIds.includes(pot.id));
   for(const e of state.enemies){const mesh=nodes.get('enemy-'+e.id);mesh.position.set(e.x+e.w/2,e.y+e.h/2,0);mesh.scaling.x=e.direction;}
   scene.render();
  },
  resize(){if(!disposed)gpu.resize();},
  dispose(){if(disposed)return;disposed=true;scene.dispose();gpu.dispose();}
 };
}
