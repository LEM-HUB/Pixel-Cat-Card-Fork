// A deliberate dashboard click reaches only the nearest eligible cat. That cat
// chooses what to do: investigate, glance over, flinch or keep its own business.
// Mood and temperament weigh the choice; no outcome is guaranteed or scripted.
window.pixelCatClickReactionsV1={
 handle(cat,event,card,{cardOwnerFor,clickDestination,attentionWinner,CAT_OWNERS}){
  const owner=cardOwnerFor(card),surfaces=(cat.surfaces||[]).filter(s=>!s.home&&cardOwnerFor(s.el)===owner);
  if(!surfaces.length)return false;
  const destination=clickDestination(surfaces,event.clientX,event.clientY,cat.scale,s=>!!cat.pathTo(s)&&!!cat.pathTo(cat.home,s));
  const candidates=[...CAT_OWNERS].filter(([peer,info])=>info.root===cat.root&&peer.isConnected&&!peer.blocked()).map(([peer])=>peer).filter(peer=>(peer.surfaces||[]).some(s=>!s.home&&cardOwnerFor(s.el)===owner));
  // A cat already sitting on the clicked card answers before a merely closer one elsewhere.
  const reachable=destination?candidates.filter(peer=>peer.surfaces.some(s=>!s.home&&cardOwnerFor(s.el)===owner&&peer.pathTo(s)&&peer.pathTo(peer.home,s))):[];
  const pool=reachable.length?reachable:candidates,onCard=pool.filter(peer=>peer.support?.el&&cardOwnerFor(peer.support.el)===owner),winner=attentionWinner(onCard.length?onCard:pool,event.clientX,event.clientY);
  if(winner!==undefined&&winner!==cat)return false;
  const now=performance.now();if(now<(cat.nextClickReactionAt||0))return false;cat.nextClickReactionAt=now+600;
  cat.setAttribute?.('data-attention-source','card-click');cat.setAttribute?.('data-attention-target',destination?destination.id:'unreachable');
  return destination?this.apply(cat,destination):this.notice(cat,{x:event.clientX,y:event.clientY},'out-of-reach');
 },
 // A click on a card this cat cannot route to still earns a glance toward it.
 notice(cat,point,reason){
  const t=performance.now(),busy=!!(cat.motion||cat.route?.length||cat.play||cat.social?.episode||cat.goal||cat.command||cat.pendingStartle),result=busy?'ignore':'glance';
  if(!busy){cat.facing=(point.x??cat.x)>=cat.x+12*cat.scale?1:-1;cat.previewPose='glance';cat.forcedIdleUntil=t+1200;cat.deadline=cat.forcedIdleUntil;if(cat.idle)cat.idle.poseUntil=t;}
  cat.setAttribute?.('data-click-reaction',result);cat.setAttribute?.('data-click-reason',reason);cat.social?.log?.('card click reaction',{reaction:result,reason});
  return result!=='ignore';
 },
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
  cat.setAttribute?.('data-click-reaction',result);cat.setAttribute?.('data-click-reason','reachable');cat.social?.log?.('card click reaction',{reaction:result});
  return true;
 }
};
