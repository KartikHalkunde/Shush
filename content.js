(() => {
  let observer;
  let lastAdState = null;
  let shushMutedActive = false;
  let currentVideo = null;

  const AD_UI_SELECTORS = [
    '.ad-badge',
    '.ads-label',
    '.sh-ad-timer',
    '.video-ad-label',
    '.player-ad-overlay',
    '.atv-ad-overlay',
    '[class*="ad-"]',
    '[class*="ad-indicator"]',
    '[class*="advert"]',
    '[id*="ad" i]',
    '[aria-label*="ad" i]',
    '[data-testid*="ad" i]'
  ];

  const AD_TEXT_PATTERNS = [
    /\bAd\s*\d+\s*of\s*\d+\b/i,
    /\bAdvertisement\b/i,
    /\bSponsored\b/i,
    /\bVisit Advertiser\b/i,
    /\bLearn More\b/i,
    /\bYour video will resume\b/i,
    /\bSkip Ad\b/i
  ];

  const getVideo = () => document.querySelector('video');

  const isVisible = (el) => {
    if (!el) return false;
    const style = window.getComputedStyle(el);
    if (style.display === 'none' || style.visibility === 'hidden') return false;
    return el.getClientRects().length > 0;
  };

  const isAdByText = () => {
    const rootText = document.body?.innerText;
    if (!rootText) return false;
    return AD_TEXT_PATTERNS.some((pattern) => pattern.test(rootText));
  };

  const isAdBySelectors = () => {
    return AD_UI_SELECTORS.some((selector) => {
      const node = document.querySelector(selector);
      return isVisible(node);
    });
  };

  const bindVideo = () => {
    const video = getVideo();
    if (!video || video === currentVideo) return;

    currentVideo = video;

    // If the player swaps the <video> node during an ad, keep it muted.
    if (lastAdState) {
      currentVideo.muted = true;
      shushMutedActive = true;
    }

    currentVideo.addEventListener('volumechange', () => {
      if (lastAdState && shushMutedActive && !currentVideo.muted) {
        currentVideo.muted = true;
      }
    });
  };

  const toggleMute = (isAdPlaying) => {
    bindVideo();
    const video = getVideo();
    if (!video) return;

    if (isAdPlaying) {
      if (!video.muted) {
        video.muted = true;
        shushMutedActive = true;
        console.log('Shush: Ad detected. Muting...');
      }
      return;
    }

    if (!isAdPlaying && video.muted && shushMutedActive) {
      video.muted = false;
      shushMutedActive = false;
      console.log('Shush: Content resumed. Unmuting...');
    } else if (!isAdPlaying) {
      shushMutedActive = false;
    }
  };

  const checkAdState = () => {
    bindVideo();
    const isAdPlaying = isAdBySelectors() || isAdByText();

    // Keep enforcing mute during ads even if state did not change.
    if (isAdPlaying) {
      toggleMute(true);
    }

    if (isAdPlaying === lastAdState) return;
    lastAdState = isAdPlaying;
    toggleMute(isAdPlaying);
  };

  const startObserver = () => {
    if (!document.body) return;

    observer = new MutationObserver(() => {
      checkAdState();
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class', 'style', 'hidden', 'aria-label', 'data-testid']
    });

    checkAdState();
    console.log('Shush: Observer started.');
  };

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startObserver, { once: true });
  } else {
    startObserver();
  }
})();
