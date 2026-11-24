import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';
// A `cats` card hosts dock-free residents with their own personalities. The
// shell and the hidden-home choice are loaded exactly as shipped.
const stub=()=>({style:{},attrs:{},setAttribute(k,v){this.attrs[k]=v;},append(child){child.parentNode=this;},setConfig(config){this.config=config;}});
const ui={window:{},document:{createElement:()=>stub()}};
vm.runInNewContext(fs.readFileSync('prototype/cat-pair-host.js','utf8')+'\nglobalThis.pairApi=window.pixelCatPairV1;',ui);
const mountCard=entries=>{const host=stub(),grid=stub(),roamers=stub();host.shadowRoot={innerHTML:'',querySelector:s=>s==='.pair'?grid:roamers};host.isConnected=true;ui.pairApi.config(host,{type:'custom:pixel-cat-home',cat_id:'card',cell_size:2,mood_behaviour:true,social_behaviour:true,relaxed_speed:30,rest_ms:99999,temperament:{boldness:0},cats:entries});return host;};

const host=mountCard([{cat_id:'miso'},{cat_id:'nori'}]);
const [misoEl,noriEl]=host.pairChildren,[miso,nori]=[misoEl,noriEl].map(cat=>cat.config);
assert.equal(host.attrs['data-dock-mode'],'free','Card runs without a dock');
assert.equal(host.attrs['data-cat-count'],'2');
assert.equal(host.style.display,'none','Dock-free card paints no chrome');
assert.equal(host.getCardSize(),0,'Dock-free card claims no dashboard space');
assert.ok(host.pairChildren.every(el=>el.parentNode===host.roamerRoot),'Both residents live in the hidden roamer root');
for(const cat of [miso,nori]){
  assert.equal(cat.show_home,false,'No starter dock for '+cat.cat_id);
  assert.equal(cat.show_controls,false,'No dock controls for '+cat.cat_id);
  assert.equal(cat.cell_size,2,'Scale stays shared');
  assert.equal(cat.mood_behaviour,true,'Feature switches stay shared');
}
assert.equal(miso.primary_home,true,'First resident is primary');
assert.equal(nori.primary_home,false,'Only one primary');
assert.deepEqual([miso.dock_slot,nori.dock_slot],[0,1],'Residents take different start slots');
assert.deepEqual([miso.dock_slots,nori.dock_slots],[2,2]);
assert.ok(miso.relaxed_speed>=nori.relaxed_speed*3,`Active cat is much faster (${miso.relaxed_speed} vs ${nori.relaxed_speed})`);
assert.ok(miso.rest_ms*3<=nori.rest_ms,`Active cat rests far less (${miso.rest_ms} vs ${nori.rest_ms})`);
assert.ok(miso.temperament.boldness>nori.temperament.boldness&&miso.temperament.curiosity>nori.temperament.curiosity&&miso.temperament.patience<nori.temperament.patience,'Temperaments differ by slot');
assert.equal(nori.playful_pounces,false,'Restful slot skips playful pounces');

const custom=mountCard([{cat_id:'miso',relaxed_speed:22,rest_ms:7000,playful_pounces:true,temperament:{patience:.6,curiosity:.5}},{cat_id:'nori',relaxed_speed:3,rest_ms:40000,temperament:{boldness:.7}}]);
const [ownMiso,ownNori]=custom.pairChildren.map(cat=>cat.config);
assert.equal(ownMiso.relaxed_speed,22,'Entry pace overrides the slot');
assert.equal(ownMiso.rest_ms,7000,'Entry rest overrides the slot');
assert.equal(ownMiso.playful_pounces,true,'Entry pounce choice overrides the slot');
assert.equal(ownNori.relaxed_speed,3);assert.equal(ownNori.rest_ms,40000);
assert.deepEqual({...ownMiso.temperament},{boldness:.9,sociability:.65,curiosity:.5,patience:.6},'Entry temperament merges over its slot defaults');
assert.deepEqual({...ownNori.temperament},{boldness:.7,sociability:.45,curiosity:.3,patience:.95});

const box={window:{},innerWidth:900,innerHeight:700,HTMLElement:class{},customElements:{get:()=>true}};
vm.runInNewContext(['prototype/cat-polish.js','prototype/cat-surface-world.js','prototype/cat-card-attention.js','pixel-cat-roaming.js','prototype/cat-hidden-home.js'].map(f=>fs.readFileSync(f,'utf8')).join('\n')+'\nglobalThis.api={PixelCatHome,select:window.pixelCatHiddenHomeV1.select};',box);
const surface=(id,top)=>({id,top,left:40,right:400,min:40,max:352,el:{isConnected:true}});
const actor=(dockSlot,surfaces)=>Object.assign(Object.create(box.api.PixelCatHome.prototype),{config:{show_home:false,dock_slot:dockSlot,dock_slots:2},scale:2,size:48,surfaces,route:[]});
const surfaces=[surface('weather',280),surface('energy',320)];
const active=actor(miso.dock_slot,surfaces),restful=actor(nori.dock_slot,surfaces);
box.api.select(active);box.api.select(restful);
assert.deepEqual([active.home.id,restful.home.id],['weather','energy'],'Start slots choose different visible surfaces');
const only=[surface('only',300)],left=actor(0,only),right=actor(1,only);
box.api.select(left);box.api.select(right);left.reconcileLayout(null,[],0);right.reconcileLayout(null,[],0);
assert.ok(left.x<right.x,'One shared surface still starts them apart, left to right');
assert.ok(left.x>=only[0].min&&right.x<=only[0].max,'Start points stay on the surface');
console.log('PASS: dock-free `cats` card claims no space, hides its chrome and paints none, keeps both residents in the hidden roamer root without furniture, starts them on different slots/surfaces (spread when one surface remains), gives the slots clearly different pace, rest and temperament, lets entries override those, and still shares scale and feature switches.');
