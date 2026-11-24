// A hidden dock owns an actor, but contributes no physical surface. Its return
// anchor aliases an ordinary discovered surface, retaining normal graph routing.
window.pixelCatHiddenHomeV1={
 select(a){
  const eligible=a.surfaces.filter(s=>!s.narrow&&s.max-s.min>=4*a.scale);
  const previous=eligible.find(s=>s.id===a.hiddenHomeId);
  const visible=eligible.filter(s=>s.top>=Math.max(24,a.size)&&s.top<=innerHeight-8&&s.right>0&&s.left<innerWidth);
  // A card slot rotates the candidate list so residents start apart.
  const pool=visible.filter(s=>!s.candidate),home=previous||pool[(Math.round(Number(a.config?.dock_slot))||0)%pool.length]||visible[0];
  a.home=home||null;a.waitingForSurface=!home;
  if(home)a.hiddenHomeId=home.id;
 }
};
