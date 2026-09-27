/**
 * darben personal site — main.js v2
 * SectionObserver + ScrollHint + WorksPreview crossfade
 * Zero dependencies
 */

/* ============================================================
   SectionObserver — IntersectionObserver for nav highlight
   ============================================================ */
class SectionObserver {
  constructor() {
    this.sections = [];
    this.currentIndex = 0;
    this.nav = null;
    this.sectionMap = {
      'hero':    { idx: 1, navVal: 'hero' },
      'works':   { idx: 2, navVal: 'works' },
      'about':   { idx: 3, navVal: 'about' },
      'contact': { idx: 4, navVal: 'contact' }
    };
    this._observer = null;
  }

  init() {
    this.nav = document.querySelector('.editorial-nav');
    this.sections = [
      document.getElementById('hero'),
      document.getElementById('works'),
      document.getElementById('about'),
      document.getElementById('contact')
    ].filter(Boolean);

    if (!this.sections.length) return;

    this._observer = new IntersectionObserver(
      (entries) => this._onIntersect(entries),
      { threshold: 0.4 }
    );

    for (const s of this.sections) this._observer.observe(s);

    // Scroll-end fallback for iOS inertia
    let timer = null;
    window.addEventListener('scroll', () => {
      clearTimeout(timer);
      timer = setTimeout(() => this._findCurrent(), 150);
    }, { passive: true });
  }

  _onIntersect(entries) {
    let bestIdx = -1, bestRatio = 0;
    for (const e of entries) {
      if (e.intersectionRatio > bestRatio) {
        bestRatio = e.intersectionRatio;
        const id = e.target.id;
        if (this.sectionMap[id]) bestIdx = this.sectionMap[id].idx;
      }
    }
    if (bestIdx > 0 && bestIdx !== this.currentIndex) {
      this.currentIndex = bestIdx;
      this._updateNav(bestIdx);
    }
  }

  _findCurrent() {
    const mid = window.innerHeight / 2;
    let best = 1, bestDist = Infinity;
    for (let i = 0; i < this.sections.length; i++) {
      const r = this.sections[i].getBoundingClientRect();
      const d = Math.abs(r.top + r.height / 2 - mid);
      if (d < bestDist) { bestDist = d; best = i + 1; }
    }
    if (best !== this.currentIndex) {
      this.currentIndex = best;
      this._updateNav(best);
    }
  }

  _updateNav(idx) {
    if (!this.nav) return;
    for (const k of Object.keys(this.sectionMap)) {
      if (this.sectionMap[k].idx === idx) {
        this.nav.setAttribute('data-current-section', this.sectionMap[k].navVal);
        break;
      }
    }
  }
}

/* ============================================================
   ScrollHint — progress bar
   ============================================================ */
class ScrollHint {
  constructor() { this.bar = null; }

  init() {
    const el = document.querySelector('.scroll-hint');
    if (!el) return;
    this.bar = el.querySelector('.scroll-progress-bar');
    window.addEventListener('scroll', () => {
      if (!this.bar) return;
      const docH = document.documentElement.scrollHeight - window.innerHeight;
      const p = docH > 0 ? Math.min(1, window.scrollY / docH) : 0;
      this.bar.style.height = `${p * 100}%`;
    }, { passive: true });
  }
}

/* ============================================================
   WorksPreview — hover crossfade
   ============================================================ */
class WorksPreview {
  constructor() {
    this.items = [];
    this.imgs = [];
    this.activeIdx = 0;
  }

  init() {
    this.items = document.querySelectorAll('.work-item');
    this.imgs = document.querySelectorAll('.preview-img');
    if (!this.items.length || !this.imgs.length) return;

    for (let i = 0; i < this.items.length; i++) {
      this.items[i].addEventListener('mouseenter', () => this._show(i));
    }
  }

  _show(idx) {
    if (idx === this.activeIdx) return;
    this.activeIdx = idx;
    for (let i = 0; i < this.imgs.length; i++) {
      this.imgs[i].classList.toggle('active', i === idx);
    }
  }
}

/* ============================================================
   Init
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  new SectionObserver().init();
  new ScrollHint().init();
  new WorksPreview().init();
});
