import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
const box={window:{},performance:{now:()=>1000}};
vm.runInNewContext(fs.readFileSync('prototype/cat-card-attention.js','utf8')+'\n'+fs.readFileSync('prototype/cat-click-reactions.js','utf8')+'\nglobalThis.api={attention:window.pixelCatCardAttentionV1,reactions:window.pixelCatClickReactionsV1};',box);
const {attention,reactions}=box.api;
const seeded=()=>{let state=20261124;return()=>{state=Math.imul(state^state>>>15,2246822507)>>>0;state=Math.imul(state^state>>>13,3266489909)>>>0;return ((state^state>>>16)>>>0)/4294967296;};};
const traits={boldness:.5,sociability:.5,curiosity:.5,patience:.5};
box.window.pixelCatTemperamentV1=()=>traits;
const makeCat=(opts={})=>{const calls={visits:[],startles:0,attrs:{},logs:0};const cat={config:{cat_id:'miso'},scale:2,x:100,y:300,facing:1,idle:null,...opts,
  ensureMood:()=>({values:{playfulness:0,sleepiness:0,alertness:0,...opts.values},random:opts.random}),
  requestVisit:(...args)=>calls.visits.push(args),
  requestStartle:()=>{calls.startles++;return opts.startle!==false;},
  setAttribute:(k,v)=>calls.attrs[k]=v,
  social:{log:()=>calls.logs++}};return {cat,calls};};
const destination={id:'card:floor::click',point:{x:124,y:300}};

const eager=makeCat({values:{playfulness:.9,sleepiness:0},random:()=>0});
reactions.apply(eager.cat,destination);
assert.deepEqual(eager.calls.visits[0],['card:floor::click','interested',destination.point],'An eager cat investigates the clicked spot');
assert.equal(eager.calls.attrs['data-click-reaction'],'visit');

const watchful=makeCat({values:{playfulness:0,sleepiness:0,alertness:0},random:()=>.9});
reactions.apply(watchful.cat,destination);
assert.equal(watchful.calls.attrs['data-click-reaction'],'glance','A quiet cat may only glance toward the click');
assert.equal(watchful.calls.visits.length,0);
assert.equal(watchful.cat.previewPose,'glance');
assert.equal(watchful.cat.facing,1,'Glance faces the click');
assert.equal(watchful.cat.deadline,2200);

const idle=makeCat({values:{playfulness:0,sleepiness:1,alertness:0},random:()=>.99});
reactions.apply(idle.cat,destination);
assert.equal(idle.calls.attrs['data-click-reaction'],'ignore','A sleepy cat may keep to itself');
assert.equal(idle.calls.visits.length,0);
assert.equal(idle.cat.previewPose,undefined);

box.window.pixelCatTemperamentV1=()=>({...traits,boldness:.2,curiosity:.3});
const skittish=makeCat({values:{playfulness:.2,sleepiness:.1,alertness:.8},random:()=>.99});
reactions.apply(skittish.cat,destination);
assert.equal(skittish.calls.attrs['data-click-reaction'],'startle','A close click can startle a skittish cat');
assert.equal(skittish.calls.startles,1);
box.window.pixelCatTemperamentV1=()=>traits;

const busy=makeCat({motion:{kind:'walk'},values:{sleepiness:0,alertness:.5},random:()=>.99});
reactions.apply(busy.cat,destination);
assert.equal(busy.calls.attrs['data-click-reaction'],'ignore','A committed step is not interrupted');
assert.equal(busy.calls.visits.length,0);
assert.equal(busy.cat.previewPose,undefined);

const counted=(values,idle,point)=>{const random=seeded(),seen={};for(let i=0;i<200;i++){const {cat,calls}=makeCat({values,idle,random,x:80});reactions.apply(cat,{id:'card:floor::click',point});const kind=calls.attrs['data-click-reaction'];seen[kind]=(seen[kind]||0)+1;}return seen;};
const lively=counted({playfulness:.5,sleepiness:.1,alertness:.4},null,{x:300,y:300});
assert.ok(lively.visit>0&&lively.glance>0&&lively.ignore>0,'An alert cat shows several replies: '+JSON.stringify(lively));
assert.equal(lively.startle,undefined,'A distant click never startles');
const sleeping=counted({playfulness:.1,sleepiness:.9,alertness:.1},{pose:'sleep',poseUntil:Infinity,start:0},{x:300,y:300});
assert.equal(sleeping.startle,undefined,'A sleeping cat never startles');
assert.ok(sleeping.ignore>sleeping.visit,'A sleeping cat mostly stays put: '+JSON.stringify(sleeping));

const card={localName:'ha-card',parentElement:{}};
const surface={id:'card:floor',el:card,left:100,right:400,min:100,max:352,top:300};
const wired={config:{},root:{},scale:2,x:200,y:300,userHeld:false,idle:null,surfaces:[surface],home:{},nextClickReactionAt:0,
  blocked:()=>false,pathTo:()=>[],setAttribute(){},ensureMood:()=>({values:{playfulness:.9,sleepiness:0,alertness:0},random:()=>0}),requestVisit:(...args)=>wired.visits.push(args),visits:[]};
const event={button:0,clientX:230,clientY:300,composedPath:()=>[card,wired.root]};
const stubs={cardOwnerFor:()=>card.parentElement,clickDestination:()=>destination,attentionWinner:cats=>cats[0],CAT_OWNERS:new Map([[wired,{root:wired.root}]])};
attention.call(wired,event,stubs);
assert.equal(wired.visits.length,1,'A card click reaches the nearest cat');
attention.call(wired,event,stubs);
assert.equal(wired.visits.length,1,'Rapid repeat clicks are not answered twice');
wired.config.click_attention=false;
attention.call(wired,{...event,clientX:240},stubs);
assert.equal(wired.visits.length,1,'click_attention: false disables replies');
console.log('PASS: dashboard clicks reach the nearest cat, which independently investigates, glances, flinches or ignores based on mood, temperament and its own commitments; repeat clicks and the opt-out are honoured.');
