// Behavior tests for lazy playback, user intent, motion preferences, and navigation.
// Uses Node's standard library; no browser or npm packages required.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const code = fs.readFileSync(require('node:path').join(__dirname, '../assets/js/site.js'), 'utf8');

class Element {
  constructor() {
    this.handlers = {};
    this.attributes = {};
    this.dataset = {};
    this.hidden = true;
    this.textContent = '';
    const classes = new Set();
    this.classList = {
      add: (name) => classes.add(name),
      remove: (name) => classes.delete(name),
      contains: (name) => classes.has(name),
      toggle: (name) => classes.has(name) ? (classes.delete(name), false) : (classes.add(name), true)
    };
  }
  addEventListener(name, callback) { (this.handlers[name] ||= []).push(callback); }
  dispatch(name, event = {}) { (this.handlers[name] || []).forEach((callback) => callback(event)); }
  setAttribute(name, value) { this.attributes[name] = value; }
  removeAttribute(name) { delete this.attributes[name]; if (name === 'data-src') delete this.dataset.src; }
  focus() { this.focused = true; }
}

function setup({ reduced = false, observer = true, type = 'autoplay', rejectPlay = false } = {}) {
  const video = new Element();
  const source = new Element();
  source.dataset.src = '/assets/videos/fixture.mp4';
  video.dataset.videoType = type;
  video.paused = true;
  video.loads = 0;
  video.plays = 0;
  video.load = () => video.loads++;
  video.play = () => {
    video.plays++;
    if (rejectPlay) return Promise.reject(new Error('Browser blocked autoplay'));
    video.paused = false;
    video.dispatch('play');
    return Promise.resolve();
  };
  video.pause = () => { if (!video.paused) { video.paused = true; video.dispatch('pause'); } };
  video.querySelector = () => type === 'autoplay' && source.dataset.src ? source : null;
  video.querySelectorAll = () => source.dataset.src && type === 'autoplay' ? [source] : [];
  const button = new Element(), status = new Element(), wrapper = new Element();
  wrapper.querySelector = (selector) => ({ video, '.media-toggle': button, '.media-message': status })[selector];
  const trigger = new Element(), youtube = new Element();
  youtube.dataset = { youtube: 'abcdefghijk', title: 'Synthetic test fixture' };
  youtube.querySelector = () => trigger;
  youtube.replaceChildren = (iframe) => { youtube.iframe = iframe; };
  const nav = new Element(), navToggle = new Element(), navLink = new Element();
  nav.querySelector = () => navToggle;
  nav.querySelectorAll = () => [navLink];
  const document = new Element();
  document.hidden = false;
  document.querySelector = () => nav;
  document.querySelectorAll = (selector) => selector === '[data-local-player]' ? [wrapper] : [youtube];
  document.created = 0;
  document.createElement = () => {
    document.created++;
    const iframe = new Element();
    iframe.messages = [];
    iframe.contentWindow = { postMessage: (...args) => iframe.messages.push(args) };
    return iframe;
  };
  const motion = new Element();
  motion.matches = reduced;
  const observers = [];
  class Observer {
    constructor(callback) { this.callback = callback; observers.push(this); }
    observe() {}
  }
  const window = { matchMedia: () => motion, location: { origin: 'http://localhost:4000' } };
  if (observer) window.IntersectionObserver = Observer;
  vm.runInNewContext(code, { document, window, IntersectionObserver: Observer });
  const intersect = (target, visible) => observers[0].callback([{ target, isIntersecting: visible, intersectionRatio: visible ? 1 : 0 }]);
  return { video, source, button, status, document, motion, youtube, trigger, nav, navToggle, navLink, intersect };
}
const settle = async () => { await Promise.resolve(); await Promise.resolve(); };

test('off-screen autoplay clips do not load; visible clips load muted and play', async () => {
  const s = setup();
  assert.equal(s.video.loads, 0);
  assert.equal(s.video.plays, 0);
  s.intersect(s.video, true);
  await settle();
  assert.equal(s.source.src, '/assets/videos/fixture.mp4');
  assert.equal(s.video.loads, 1);
  assert.equal(s.video.muted, true);
  assert.equal(s.video.paused, false);
  assert.equal(s.button.attributes['aria-pressed'], 'true');
});
test('page pauses resume on return, but a user pause persists', async () => {
  const s = setup();
  s.intersect(s.video, true); await settle();
  s.intersect(s.video, false);
  assert.equal(s.video.paused, true);
  s.intersect(s.video, true); await settle();
  assert.equal(s.video.paused, false);
  s.button.dispatch('click');
  s.intersect(s.video, false); s.intersect(s.video, true); await settle();
  assert.equal(s.video.paused, true);
  assert.equal(s.video.plays, 2);
  assert.equal(s.video.loads, 1);
});
test('reduced motion defers downloads and autoplay but permits explicit play', async () => {
  const s = setup({ reduced: true });
  s.intersect(s.video, true); await settle();
  assert.equal(s.video.loads, 0);
  assert.equal(s.video.plays, 0);
  s.button.dispatch('click'); await settle();
  assert.equal(s.video.paused, false);
  assert.equal(s.video.loads, 1);
});
test('a changed motion preference pauses a running autoplay clip', async () => {
  const s = setup();
  s.intersect(s.video, true); await settle();
  s.motion.matches = true; s.motion.dispatch('change');
  assert.equal(s.video.paused, true);
  s.intersect(s.video, true); await settle();
  assert.equal(s.video.plays, 1);
});
test('background tabs pause playback and preserve a user pause', async () => {
  const s = setup();
  s.intersect(s.video, true); await settle();
  s.document.hidden = true; s.document.dispatch('visibilitychange');
  assert.equal(s.video.paused, true);
  s.document.hidden = false; s.document.dispatch('visibilitychange'); await settle();
  assert.equal(s.video.paused, false);
  s.video.pause();
  s.document.hidden = true; s.document.dispatch('visibilitychange');
  s.document.hidden = false; s.document.dispatch('visibilitychange'); await settle();
  assert.equal(s.video.paused, true);
});
test('without IntersectionObserver playback stays manual', async () => {
  const s = setup({ observer: false });
  assert.equal(s.video.plays, 0);
  s.document.dispatch('visibilitychange');
  assert.equal(s.video.plays, 0);
  s.button.dispatch('click'); await settle();
  assert.equal(s.video.paused, false);
});
test('full local videos never autoplay and pause off-screen', async () => {
  const s = setup({ type: 'local' });
  s.intersect(s.video, true);
  assert.equal(s.video.plays, 0);
  s.button.dispatch('click'); await settle();
  assert.equal(s.video.paused, false);
  s.intersect(s.video, false);
  assert.equal(s.video.paused, true);
  s.intersect(s.video, true);
  assert.equal(s.video.paused, true);
});
test('blocked playback leaves an accessible play action and status message', async () => {
  const s = setup({ rejectPlay: true });
  s.intersect(s.video, true); await settle();
  assert.equal(s.status.hidden, false);
  assert.match(s.status.textContent, /Play demonstration/);
  assert.equal(s.button.textContent, 'Play demonstration');
  s.intersect(s.video, true);
  assert.equal(s.video.plays, 1);
});
test('YouTube is click-to-load, has no automatic audio, and receives a pause request', () => {
  const s = setup();
  assert.equal(s.document.created, 0);
  let prevented = false;
  s.trigger.dispatch('click', { preventDefault: () => { prevented = true; } });
  assert.equal(prevented, true);
  assert.equal(s.document.created, 1);
  assert.match(s.youtube.iframe.src, /^https:\/\/www.youtube-nocookie.com\/embed\//);
  assert.equal(s.youtube.iframe.src.includes('autoplay=1'), false);
  s.intersect(s.youtube, false);
  assert.match(s.youtube.iframe.messages[0][0], /pauseVideo/);
  assert.equal(s.youtube.iframe.messages[0][1], 'https://www.youtube-nocookie.com');
});
test('the mobile menu exposes state and Escape returns focus', () => {
  const s = setup();
  s.navToggle.dispatch('click');
  assert.equal(s.navToggle.attributes['aria-expanded'], 'true');
  s.nav.dispatch('keydown', { key: 'Escape' });
  assert.equal(s.navToggle.attributes['aria-expanded'], 'false');
  assert.equal(s.navToggle.focused, true);
});
