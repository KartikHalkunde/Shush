(() => {
  let observer;
  let lastAdState = null;
  let userMutedBeforeAd = null;

  const AD_UI_SELECTORS = [
    '.ad-badge',
    '.ads-label',
    '[class*="ad-indicator"]',
    '[class*="advert"]',
    '[aria-label*="ad" i]',
    '[data-testid*="ad" i]'
  ];

  const AD_TEXT_PATTERNS = [
    /\bAd\s*\d+\s*of\s*\d+\b/i,
    /\bAdvertisement\b/i,
    /\bSponsored\b/i,
    /\bVisit Advertiser\b/i,
    /\bLearn More\b/i
  ];

  const getVideo = () => document.querySelector('video');

  const isAdByText = () => {
    const rootText = document.body?.innerText;
    if (!rootText) return false;
    return AD_TEXT_PATTERNS.some((pattern) => pattern.test(rootText));
  };

  const isAdBySelectors = () => {
    return AD_UI_SELECTORS.some((selector) => document.querySelector(selector));
  };

  const toggleMute = (isAdPlaying) => {
    const video = getVideo();
    if (!video) return;

    if (isAdPlaying && !video.muted) {
      userMutedBeforeAd = false;
      video.muted = true;
      console.log('Shush: Ad detected. Muting...');
      return;
    }

    if (!isAdPlaying && video.muted && userMutedBeforeAd === false) {
      video.muted = false;
      userMutedBeforeAd = null;
      console.log('Shush: Match resumed. Unmuting...');
    }
  };

  const checkAdState = () => {
    const isAdPlaying = isAdBySelectors() || isAdByText();

    // Avoid repeated writes to the same state
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
      characterData: false
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
