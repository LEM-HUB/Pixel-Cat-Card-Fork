// A deliberate dashboard click reaches only the nearest eligible cat. That cat
// chooses what to do: investigate, glance over, flinch or keep its own business.
// Mood and temperament weigh the choice; no outcome is guaranteed or scripted.
window.pixelCatClickReactionsV1={
 choose(cat,destination){
  const mood=cat.ensureMood?.(),v=mood?.values||{},random=()=>mood?mood.random():Math.random(),traits=window.pixelCatTemperamentV1?.(cat.ownerKey||cat.config?.cat_id||'cat',cat.config?.temperament)||{},point=destination.point||{};
  const units=Math.hypot((point.x??cat.x)-cat.x-12*cat.scale,(point.y??cat.y)-cat.y)/Math.max(1,cat.scale);
  const resting=['sleep','loaf','alertLying','backRoll'].includes(cat.idle?.pose),busy=!!(cat.motion||cat.route?.length||cat.play||cat.social?.episode||cat.goal||cat.command||cat.pendingStartle);
  // A resting cat mostly stays put; a busy one never abandons its committed action.
  const options=busy?[['ignore',1+2*(v.sleepiness||0)],['glance',.6+(v.alertness||0)]]
   :resting?[['ignore',1.4+2*(v.sleepiness||0)],['glance',1+(v.alertness||0)],['visit',.5+(v.playfulness||0)+(traits.curiosity||.5)]]
   :[['visit',2.2+(v.playfulness||0)+1.2*(traits.curiosity||.5)],['glance',.6+(v.alertness||0)+(units>8?.7:0)],['ignore',.3+.9*(v.sleepiness||0)],['startle',units<3&&(traits.boldness||.5)<.45&&(v.alertness||0)>.5?.6+(v.alertness||0):0]];
  let roll=random()*options.reduce((sum,[,weight])=>sum+weight,0),reaction='ignore';
  for(const [kind,weight]of options)if((roll-=weight)<0){reaction=kind;break;}
  return {reaction,resting,busy,units};
 },
 apply(cat,destination){
  const t=performance.now(),{reaction,busy}=this.choose(cat,destination),point=destination.point||{};let result=reaction;
  if(result==='visit')cat.requestVisit(destination.id,'interested',destination.point);
  else if(result==='startle'&&!cat.requestStartle?.({id:'card-click-'+t,kind:'Card click',x:point.x,y:point.y,intensity:.4},t))result='ignore';
  else if(result==='glance'){
   if(busy)result='ignore';
   else{
    cat.facing=(point.x??cat.x)>=cat.x+12*cat.scale?1:-1;cat.previewPose='glance';cat.forcedIdleUntil=t+1200;cat.deadline=cat.forcedIdleUntil;if(cat.idle)cat.idle.poseUntil=t;
   }
  }
  cat.setAttribute?.('data-click-reaction',result);cat.social?.log?.('card click reaction',{reaction:result});
  return true;
 }
};
