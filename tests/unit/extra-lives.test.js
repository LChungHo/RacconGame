import test from 'node:test';import assert from 'node:assert/strict';
import {GameModel} from '../../wwwroot/js/game/model.js';
import {resolveInteractions} from '../../wwwroot/js/game/rules.js';
import {createFlatLevel,emptyInput} from '../helpers/fixtures.js';
const near={id:'near',x:16,y:16,w:8,h:8},far={id:'far',x:260,y:16,w:8,h:8};
function game(){const model=new GameModel([createFlatLevel({foods:[near,far]})]);model.start();return model;}
test('extra_life_is_awarded_at_every_thirty_thousand_exactly_once',()=>{
 const model=game();model.state.score=29989;model.step(emptyInput(),1/60);
 assert.equal(model.snapshot().score,29999);assert.equal(model.snapshot().lives,3);
 model.state.player.x=260;model.step(emptyInput(),1/60);
 assert.equal(model.snapshot().lives,4);assert.equal(model.snapshot().extraLivesAwarded,1);
 for(let i=0;i<20;i++)model.step(emptyInput(),1/60);assert.equal(model.snapshot().lives,4);
 const exact=game();exact.state.score=29990;exact.step(emptyInput(),1/60);assert.equal(exact.snapshot().score,30000);assert.equal(exact.snapshot().lives,4);
});
test('score_bags_and_time_bonus_can_award_multiple_lives',()=>{
 const model=new GameModel([createFlatLevel({pots:[{id:'big',x:16,y:16,w:10,h:12,outcome:'bonus',points:90000}]})]);model.start();model.step(emptyInput(),1/60);
 assert.equal(model.snapshot().lives,6);assert.equal(model.snapshot().extraLivesAwarded,3);
 const clear=new GameModel([createFlatLevel({foods:[near]})]);clear.start();clear.state.score=29900;clear.state.secondsLeft=12.9;clear.step(emptyInput(),1/60);
 assert.equal(clear.snapshot().score,30030);assert.equal(clear.snapshot().lives,4);
});
test('replayed_threshold_does_not_farm_lives_and_new_game_resets_awards',()=>{
 const model=game();model.state.stageStartScore=29990;model.state.score=29990;model.step(emptyInput(),1/60);assert.equal(model.snapshot().lives,4);
 model.state.secondsLeft=1;model.step(emptyInput(),1/60);assert.equal(model.snapshot().lives,3);
 for(let i=0;i<60;i++)model.step(emptyInput(),1/60);
 assert.equal(model.snapshot().score,29990);model.step(emptyInput(),1/60);assert.equal(model.snapshot().score,30000);assert.equal(model.snapshot().lives,3);
 model.state.score=59990;model.state.collectedFoodIds=[];model.step(emptyInput(),1/60);assert.equal(model.snapshot().lives,4);
 model.restart();assert.equal(model.snapshot().lives,3);assert.equal(model.snapshot().extraLivesAwarded,0);
 model.start();model.state.score=29990;model.step(emptyInput(),1/60);assert.equal(model.snapshot().lives,4);
});
test('stored_high_score_and_paused_time_do_not_award_lives',()=>{
 const model=new GameModel([createFlatLevel()],{highScore:120000});model.start();assert.equal(model.snapshot().lives,3);
 model.pause();model.step(emptyInput(),600);assert.equal(model.snapshot().lives,3);
});
