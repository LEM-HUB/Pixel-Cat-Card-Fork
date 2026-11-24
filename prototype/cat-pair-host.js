// Optional multi-resident card shell (`cats:` on a pixel-cat-home card).
// Kept with the box module so the controller stays inside its inline budget.
(() => {
  const MAX_CATS = 8;
  const pairConfig = (host, cat, index) => {
    const shared = {...host.config};
    delete shared.cats;
    delete shared.type;
    return {
      ...shared,
      ...cat,
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
    const columns = Math.max(1, Math.min(4, Math.round(Number(host.config.columns) || cats.length)));
    if (!host.pairRoot) {
      host.shadowRoot.innerHTML = `<style>:host{display:block}ha-card{display:block;box-sizing:border-box;padding:6px;background:var(--ha-card-background,var(--card-background-color,#fff));border-radius:var(--ha-card-border-radius,12px);border:1px solid var(--divider-color,#ddd);font:12px system-ui;color:var(--primary-text-color,#222)}.pair{display:grid;gap:8px;align-items:start}.pair>pixel-cat-home{display:block;min-width:0}</style><ha-card><div class="pair" role="group" aria-label="Pixel cats"></div></ha-card>`;
      host.pairRoot = host.shadowRoot.querySelector('.pair');
    }
    host.pairRoot.style.gridTemplateColumns = `repeat(${columns},minmax(0,1fr))`;
    const nodes = [...host.pairRoot.children].filter(el => el.localName === 'pixel-cat-home');
    for (let i = 0; i < cats.length; i++) {
      const el = nodes[i] || document.createElement('pixel-cat-home');
      const config = pairConfig(host, cats[i], i);
      const signature = JSON.stringify(config);
      // Reuse a resident across host reconnects; only a changed config restarts it.
      if (el.__pairSignature !== signature) { el.__pairSignature = signature; el.setConfig(config); }
      if (!el.isConnected) host.pairRoot.append(el);
      if (host._hass) el.hass = host._hass;
    }
    for (const extra of nodes.slice(cats.length)) extra.remove();
    host.pairChildren = [...host.pairRoot.children].filter(el => el.localName === 'pixel-cat-home');
    host.setAttribute('data-cat-count', String(cats.length));
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
      installHass(host);
      if (host.isConnected) mount(host);
      return true;
    },
    mount,
    unmount,
  };
})();
