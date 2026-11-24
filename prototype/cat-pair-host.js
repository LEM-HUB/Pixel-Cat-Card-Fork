// Optional multi-resident card shell (`cats:` on a pixel-cat-home card).
// Kept with the box module so the controller stays inside its inline budget.
(() => {
  const MAX_CATS = 8;
  // `shared_dock: true` gives the card one dock, `false` one dock per entry,
  // and the default paints no dock at all so the residents roam freely.
  const dockMode = host => host.config.shared_dock === true ? 'shared' : host.config.shared_dock === false ? 'separate' : 'free';
  // Personalities belong to the resident, never to the card entry: the shared
  // base only carries scale, chrome and the feature switches. Slot defaults
  // keep the first cat busy and the second one slow and restful.
  const personalKeys = ['name', 'color', 'temperament', 'relaxed_speed', 'casual_speed', 'interested_speed', 'prompted_speed', 'walk_speed', 'rest_ms', 'home_rest_ms', 'casual_wander', 'playful_pounces', 'idle_frame_ms'];
  const personalities = [
    {temperament: {boldness: .9, sociability: .65, curiosity: .95, patience: .2}, relaxed_speed: 15, casual_speed: 8, rest_ms: 4500, home_rest_ms: 5000, casual_wander: false},
    {temperament: {boldness: .25, sociability: .45, curiosity: .3, patience: .95}, relaxed_speed: 5, casual_speed: 4, rest_ms: 24000, home_rest_ms: 28000, casual_wander: true, playful_pounces: false},
  ];
  const pairConfig = (host, cat, index) => {
    const shared = {...host.config}, personality = personalities[index % personalities.length];
    for (const key of personalKeys) delete shared[key];
    delete shared.cats;
    delete shared.type;
    return {
      ...shared,
      ...personality,
      ...cat,
      temperament: {...personality.temperament, ...cat.temperament},
      type: 'custom:pixel-cat-home',
      cat_id: cat.cat_id || `${host.config.cat_id || 'cat'}-${index + 1}`,
      show_home: cat.show_home ?? shared.show_home ?? true,
      show_controls: cat.show_controls ?? shared.show_controls ?? false,
      card_color: cat.card_color ?? shared.card_color ?? 'transparent',
      card_border_color: cat.card_border_color ?? shared.card_border_color ?? 'transparent',
      card_radius: cat.card_radius ?? shared.card_radius ?? 0,
    };
  };
  const unmount = host => {
    for (const child of host.pairChildren || []) child.remove();
    host.pairChildren = [];
    host.pairRoot = null;
    host.roamerRoot = null;
    host.style.display = '';
    delete host.getCardSize;
    host.shadowRoot.innerHTML = '';
    delete host.hass;
    delete host.__pairHass;
  };
  const installHass = host => {
    if (host.__pairHass) return;
    host.__pairHass = true;
    // The card shell forwards Home Assistant state to every resident.
    Object.defineProperty(host, 'hass', {
      configurable: true,
      get() { return this._hass; },
      set(value) {
        this._hass = value;
        if (this.monitorCard) this.monitorCard.hass = value;
        for (const child of this.pairChildren || []) child.hass = value;
      },
    });
  };
  const mount = host => {
    const cats = host.pairCats || [];
    if (!cats.length) return;
    installHass(host);
    const mode = dockMode(host);
    const columns = Math.max(1, Math.min(4, Math.round(Number(host.config.columns) || (mode === 'separate' ? cats.length : 1))));
    if (!host.pairRoot) {
      host.shadowRoot.innerHTML = `<style>:host{display:block}ha-card{display:block;box-sizing:border-box;padding:6px;background:var(--ha-card-background,var(--card-background-color,#fff));border-radius:var(--ha-card-border-radius,12px);border:1px solid var(--divider-color,#ddd);font:12px system-ui;color:var(--primary-text-color,#222)}.pair{display:grid;gap:8px;align-items:start}.pair>pixel-cat-home{display:block;min-width:0}.roamers{display:none}</style><ha-card><div class="pair" role="group" aria-label="Pixel cats"></div><div class="roamers"></div></ha-card>`;
      host.pairRoot = host.shadowRoot.querySelector('.pair');
      host.roamerRoot = host.shadowRoot.querySelector('.roamers');
    }
    // A dock-free shell is only a lifecycle host: it must paint no card at all.
    host.style.display = mode === 'free' ? 'none' : '';
    host.pairRoot.style.gridTemplateColumns = `repeat(${columns},minmax(0,1fr))`;
    const previous = host.pairChildren || [], nodes = [];
    for (let i = 0; i < cats.length; i++) {
      const el = previous[i] || document.createElement('pixel-cat-home');
      const config = pairConfig(host, cats[i], i);
      if (mode === 'shared') {
        // One visible dock: the first resident owns the bed, bowl and controls
        // and is primary; the others anchor their home to that floor.
        config.dock_slot = i;
        config.dock_slots = cats.length;
        if (i === 0) config.primary_home = cats[i].primary_home ?? true;
        else if (cats.length > 1) {
          config.show_home = false;
          config.show_controls = false;
          config.primary_home = false;
        }
      } else if (mode === 'free') {
        // Dock-free roaming: each cat returns to an ordinary dashboard surface.
        config.show_home = cats[i].show_home ?? false;
        config.show_controls = cats[i].show_controls ?? false;
        config.primary_home = i === 0 ? cats[i].primary_home ?? true : false;
        // Distinct slots: different start surface, and x spread when they share one.
        config.dock_slot = i;
        config.dock_slots = cats.length;
      }
      el.dockAnchorOwner = mode === 'shared' && i > 0 && config.show_home !== true ? nodes[0] : null;
      const signature = JSON.stringify(config);
      // Reuse a resident across host reconnects; only a changed config restarts it.
      if (el.__pairSignature !== signature) { el.__pairSignature = signature; el.setConfig(config); }
      nodes.push(el);
    }
    for (let i = 0; i < nodes.length; i++) {
      const el = nodes[i], target = mode === 'separate' || (mode === 'shared' && i === 0) ? host.pairRoot : host.roamerRoot;
      if (el.parentNode !== target) target.append(el);
      if (host._hass) el.hass = host._hass;
    }
    for (const extra of previous.slice(cats.length)) extra.remove();
    host.pairChildren = nodes;
    host.setAttribute('data-cat-count', String(cats.length));
    host.setAttribute('data-dock-mode', mode);
  };
  window.pixelCatPairV1 = {
    config(host, config) {
      const cats = Array.isArray(config?.cats) ? config.cats.filter(c => c && typeof c === 'object' && !Array.isArray(c)).slice(0, MAX_CATS) : [];
      if (!cats.length) {
        if (host.isPairHost) { host.isPairHost = false; unmount(host); }
        return false;
      }
      // A card that was already running one resident hands its overlay back
      // before the shared shell takes over.
      if (!host.isPairHost && host.active) { host.isPairHost = false; host.disconnectedCallback(); }
      host.isPairHost = true;
      host.config = {...config};
      host.pairCats = cats;
      host.worldScale = 4;
      host.scale = 4;
      // Dock-free cards occupy no dashboard space of their own.
      if (dockMode(host) === 'free') host.getCardSize = () => 0;
      else delete host.getCardSize;
      installHass(host);
      if (host.isConnected) mount(host);
      return true;
    },
    mount,
    unmount,
  };
})();
