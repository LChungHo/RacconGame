import test from 'node:test';import assert from 'node:assert/strict';
import {GameModel} from '../../wwwroot/js/game/model.js';
import {createFlatLevel,emptyInput} from '../helpers/fixtures.js';
test('clear_keeps_score_breakdown_and_celebrates_for_five_seconds',()=>{
 const level=createFlatLevel({foods:[{id:'last',x:16,y:16,w:8,h:8}]});
 const model=new GameModel([level, {...level,id:'second'}]);model.start();
 model.state.stageStartScore=500;model.state.score=700;model.state.secondsLeft=12.9;
 model.step(emptyInput(),1/60);
 assert.deepEqual(model.snapshot().clearSummary,{stageNumber:1,stageScore:210,timeBonus:120,totalScore:830});
 for(let i=0;i<299;i++)model.step(emptyInput(),1/60);
 assert.equal(model.snapshot().phase,'stageClear');assert.equal(model.snapshot().secondsLeft,12.9-1/60);
 model.step(emptyInput(),1/60);assert.equal(model.snapshot().levelIndex,1);assert.equal(model.snapshot().clearSummary,null);
});
