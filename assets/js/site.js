/* Navigation and media enhancements. All page content works without JavaScript. */
(() => {
  'use strict';

  const navigation = document.querySelector('.site-nav');
  const navigationToggle = navigation && navigation.querySelector('.nav-toggle');
  if (navigationToggle) {
    navigation.classList.add('is-enhanced');
    navigationToggle.hidden = false;
    const closeMenu = () => {
      navigation.classList.remove('is-open');
      navigationToggle.setAttribute('aria-expanded', 'false');
    };
    navigationToggle.addEventListener('click', () => {
      const open = navigation.classList.toggle('is-open');
      navigationToggle.setAttribute('aria-expanded', String(open));
    });
    navigation.addEventListener('keydown', (event) => {
      if (event.key === 'Escape' && navigation.classList.contains('is-open')) {
        closeMenu();
        navigationToggle.focus();
      }
    });
    navigation.querySelectorAll('.nav-links a').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
  }

  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
  const hasObserver = 'IntersectionObserver' in window;
  const players = [];
  const youtubePlayers = [];

  const updateButton = (player) => {
    player.button.textContent = player.video.paused ? 'Play demonstration' : 'Pause demonstration';
    player.button.setAttribute('aria-pressed', String(!player.video.paused));
  };
  const message = (player, text) => {
    player.message.textContent = text;
    player.message.hidden = !text;
  };
  const hydrate = (player) => {
    if (player.loaded) return;
    player.video.querySelectorAll('[data-src]').forEach((source) => {
      source.src = source.dataset.src;
      source.removeAttribute('data-src');
    });
    player.video.load();
    player.loaded = true;
  };
  const pauseFromPage = (player) => {
    if (!player.video.paused) {
      player.systemPause = true;
      player.video.pause();
    }
  };
  const play = (player, manual) => {
    hydrate(player);
    player.userPaused = false;
    player.playMode = manual ? 'manual' : 'auto';
    message(player, '');
    const result = player.video.play();
    if (result && result.catch) {
      result.then(() => {
        // The viewport or preference may have changed while play() was pending.
        if (!player.inView || document.hidden || (!manual && reducedMotion.matches)) {
          pauseFromPage(player);
        }
      }).catch(() => {
        player.userPaused = true;
        message(player, 'Use Play demonstration to start this video, or open it directly.');
        updateButton(player);
      });
    }
  };
  const maybeAutoplay = (player) => {
    if (player.autoplay && player.inView && !document.hidden && !reducedMotion.matches &&
        !player.userPaused && !player.failed && player.video.paused) {
      play(player, false);
    }
  };

  document.querySelectorAll('[data-local-player]').forEach((element) => {
    const video = element.querySelector('video');
    const player = {
      video,
      button: element.querySelector('.media-toggle'),
      message: element.querySelector('.media-message'),
      autoplay: video.dataset.videoType === 'autoplay',
      loaded: !video.querySelector('source[data-src]'),
      inView: !hasObserver,
      userPaused: false,
      systemPause: false,
      failed: false
    };
    if (player.autoplay) video.muted = true;
    player.button.hidden = false;
    player.button.addEventListener('click', () => {
      if (video.paused) {
        player.failed = false;
        play(player, true);
      } else {
        player.userPaused = true;
        video.pause();
      }
    });
    video.addEventListener('play', () => {
      if (!player.inView || document.hidden) pauseFromPage(player);
      updateButton(player);
    });
    video.addEventListener('pause', () => {
      // A pause made by the visitor persists when they scroll away and return.
      if (player.systemPause) player.systemPause = false;
      else player.userPaused = true;
      updateButton(player);
    });
    video.addEventListener('ended', () => updateButton(player));
    video.addEventListener('error', () => {
      player.failed = true;
      pauseFromPage(player);
      message(player, 'This video could not be loaded. You can try opening the video directly.');
      updateButton(player);
    }, true);
    players.push(player);
  });

  const pauseYouTube = (player) => {
    if (player.iframe && player.iframe.contentWindow) {
      player.iframe.contentWindow.postMessage(
        JSON.stringify({ event: 'command', func: 'pauseVideo', args: [] }),
        'https://www.youtube-nocookie.com'
      );
    }
  };
  document.querySelectorAll('[data-youtube]').forEach((element) => {
    const player = { element, iframe: null };
    const trigger = element.querySelector('.youtube-load');
    trigger.addEventListener('click', (event) => {
      if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const id = element.dataset.youtube;
      if (!/^[a-zA-Z0-9_-]{11}$/.test(id)) return;
      event.preventDefault();
      const iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube-nocookie.com/embed/' + id +
        '?enablejsapi=1&rel=0&origin=' + encodeURIComponent(window.location.origin);
      iframe.title = element.dataset.title || 'Robotics demonstration';
      iframe.allow = 'encrypted-media; picture-in-picture; fullscreen';
      iframe.allowFullscreen = true;
      iframe.referrerPolicy = 'strict-origin-when-cross-origin';
      element.replaceChildren(iframe);
      player.iframe = iframe;
      iframe.focus();
    });
    youtubePlayers.push(player);
  });

  if (hasObserver) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const player = players.find((item) => item.video === entry.target);
        if (player) {
          player.inView = entry.isIntersecting && entry.intersectionRatio >= 0.15;
          if (player.inView) maybeAutoplay(player);
          else pauseFromPage(player);
        }
        const youtube = youtubePlayers.find((item) => item.element === entry.target);
        if (youtube && !entry.isIntersecting) pauseYouTube(youtube);
      });
    }, { threshold: [0, 0.15] });
    players.forEach((player) => observer.observe(player.video));
    youtubePlayers.forEach((player) => observer.observe(player.element));
  }
  // Without IntersectionObserver, play remains explicit and no autoplay is attempted.
  document.addEventListener('visibilitychange', () => {
    players.forEach((player) => document.hidden ? pauseFromPage(player) : (hasObserver && maybeAutoplay(player)));
    if (document.hidden) youtubePlayers.forEach(pauseYouTube);
  });
  const motionChanged = () => {
    players.forEach((player) => {
      if (player.autoplay && reducedMotion.matches) pauseFromPage(player);
      else if (hasObserver) maybeAutoplay(player);
    });
  };
  if (reducedMotion.addEventListener) reducedMotion.addEventListener('change', motionChanged);
  else reducedMotion.addListener(motionChanged);
})();
