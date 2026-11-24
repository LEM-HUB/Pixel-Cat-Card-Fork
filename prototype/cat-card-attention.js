window.pixelCatCardAttentionV1=function(event,deps) {
    if(this.userHeld||this.config.click_attention===false||!this.root||event.button!==0||event.ctrlKey||event.metaKey||event.altKey||event.shiftKey||this.blocked())return;
    const path=event.composedPath();if(!path.includes(this.root)||path.includes(this)||path.some(el=>el.dataset?.pixelCatOverlay!==undefined||el.dataset?.catPost!==undefined||el.localName==='pixel-cat-home'||el.matches?.('input,textarea,select,[contenteditable="true"]')))return;
    const card=path.find(el=>el.localName==='ha-card'||el.hasAttribute?.('data-cat-surface'));if(card)window.pixelCatClickReactionsV1?.handle(this,event,card,deps);
  };
