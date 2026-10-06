/**
 * reactor-console.js - 魔導反應爐實體機關操作主控制台
 * 取代傳統滾輪密碼鎖，提供「整數滑槽＋分子閥門＋分母閥門」與「三向旁路閘門」，
 * 並搭載「逆流翻轉開關」與重型「加壓點火推桿」。
 */
class ReactorConsole {
  constructor(containerId, audioManager, onInjectCallback) {
    this.container = document.getElementById(containerId);
    this.audio = audioManager;
    this.onInject = onInjectCallback;

    this.currentMode = 'fraction'; // 'fraction' or 'bypass'
    this.whole = 0;
    this.num = 0;
    this.den = 1;
    this.bypassSelection = null; // '>', '=', '<'
    this.isLeverPulling = false;
    this.lang = 'zh';

    this.render();
  }

  setLang(lang) {
    this.lang = lang;
    this.render();
  }

  setMode(mode) {
    this.currentMode = mode;
    this.whole = 0;
    this.num = 0;
    this.den = 1;
    this.bypassSelection = null;
    this.render();
  }

  reset() {
    this.whole = 0;
    this.num = 0;
    this.den = 1;
    this.bypassSelection = null;
    this.render();
  }

  getValues() {
    if (this.currentMode === 'bypass') {
      return { mode: 'bypass', value: this.bypassSelection };
    }
    return {
      mode: 'fraction',
      whole: this.whole,
      num: this.num,
      den: this.den
    };
  }

  render() {
    if (!this.container) return;
    const isZh = this.lang === 'zh';

    if (this.currentMode === 'bypass') {
      this.container.innerHTML = `
        <div class="console-box bypass-mode">
          <div class="console-header">
            <span class="gauge-title">⚙️ ${isZh ? '三向旁路分流閘門' : '3-Way Bypass Gate'}</span>
            <span class="gauge-sub">${isZh ? '依據除數與 1 的關係切換管路' : 'Select valve based on divisor vs 1'}</span>
          </div>

          <div class="bypass-gate-cluster">
            <button type="button" class="bypass-btn ${this.bypassSelection === '>' ? 'active' : ''}" data-val=">">
              <span class="btn-icon">🔺</span>
              <span class="btn-label">${isZh ? '增壓管路' : 'BOOST'}</span>
              <span class="btn-symbol">&gt; (商大於被除數)</span>
            </button>
            <button type="button" class="bypass-btn ${this.bypassSelection === '=' ? 'active' : ''}" data-val="=">
              <span class="btn-icon">⚖️</span>
              <span class="btn-label">${isZh ? '衡平管路' : 'BALANCE'}</span>
              <span class="btn-symbol">＝ (商等於被除數)</span>
            </button>
            <button type="button" class="bypass-btn ${this.bypassSelection === '<' ? 'active' : ''}" data-val="<">
              <span class="btn-icon">🔻</span>
              <span class="btn-label">${isZh ? '洩壓管路' : 'DAMPEN'}</span>
              <span class="btn-symbol">&lt; (商小於被除數)</span>
            </button>
          </div>

          <div class="lever-action-row">
            <button type="button" class="inject-btn" id="inject-btn">
              <span class="inject-icon">⚡</span> ${isZh ? '注入加壓 / 扳動推桿' : 'ENGAGE INJECTION LEVER'}
            </button>
          </div>
        </div>
      `;
    } else {
      // 數值讀數預覽 (以標準數學橫式分數呈現)
      const previewHtml = this.getFormattedPreview();

      this.container.innerHTML = `
        <div class="console-box fraction-mode">
          <div class="console-header">
            <span class="gauge-title">⚙️ ${isZh ? '魔導分數調諧量程儀' : 'Aether Fractional Meter'}</span>
            <div class="resonance-display">
              <span class="res-label">${isZh ? '當前設定值：' : 'Setting:'}</span>
              <span class="res-val" id="res-val-preview">${previewHtml}</span>
            </div>
          </div>

          <div class="valves-dashboard">
            <!-- 整數槽 (Whole Stepper) -->
            <div class="valve-module whole-module">
              <div class="module-title">${isZh ? '整數盤' : 'Whole'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="whole" data-delta="1">▲</button>
                <div class="digit-window" id="disp-whole">${this.whole}</div>
                <button type="button" class="step-btn" data-target="whole" data-delta="-1">▼</button>
              </div>
            </div>

            <!-- 分數部 (分子 / 分母) -->
            <div class="valve-module fraction-module">
              <div class="module-title">${isZh ? '分子閥門' : 'Numerator'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="num" data-delta="1">▲</button>
                <div class="digit-window" id="disp-num">${this.num}</div>
                <button type="button" class="step-btn" data-target="num" data-delta="-1">▼</button>
              </div>

              <!-- 分數能量隔板 (Fraction Division Bar) -->
              <div class="fraction-division-bar">
                <span class="bar-core"></span>
              </div>

              <div class="module-title">${isZh ? '分母閥門' : 'Denominator'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="den" data-delta="1">▲</button>
                <div class="digit-window" id="disp-den">${this.den}</div>
                <button type="button" class="step-btn" data-target="den" data-delta="-1">▼</button>
              </div>
            </div>

            <!-- 右側：逆流翻轉開關與實體大拉桿 -->
            <div class="valve-module lever-module">
              <button type="button" class="inverter-btn" id="inverter-btn" title="${isZh ? '翻轉分子與分母 (倒數)' : 'Invert Numerator & Denominator'}">
                <span class="inv-icon">🔄</span>
                <span class="inv-text">${isZh ? '逆流翻轉' : 'Invert'}</span>
              </button>

              <div class="heavy-lever-wrapper" id="heavy-lever-wrapper">
                <div class="lever-pivot"></div>
                <div class="lever-arm" id="lever-arm">
                  <div class="lever-handle"></div>
                </div>
                <div class="lever-label">${isZh ? '加壓推桿' : 'LEVER'}</div>
              </div>
            </div>
          </div>

          <div class="lever-action-row">
            <button type="button" class="inject-btn" id="inject-btn">
              <span class="inject-icon">⚡</span> ${isZh ? '注入加壓 / 扳動推桿' : 'ENGAGE INJECTION LEVER'}
            </button>
          </div>
        </div>
      `;
    }

    this._bindEvents();
  }

  _bindEvents() {
    // 旁路閘門按鈕
    const bypassBtns = this.container.querySelectorAll('.bypass-btn');
    bypassBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        this.bypassSelection = btn.getAttribute('data-val');
        this.audio?.playValveTick();
        this.render();
      });
    });

    // 步進按鈕 (▲ / ▼)
    const stepBtns = this.container.querySelectorAll('.step-btn');
    stepBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const target = btn.getAttribute('data-target');
        const delta = parseInt(btn.getAttribute('data-delta'), 10);
        this._updateStepper(target, delta);
        this.audio?.playValveTick();
      });
    });

    // 逆流翻轉開關
    const invBtn = this.container.querySelector('#inverter-btn');
    if (invBtn) {
      invBtn.addEventListener('click', () => {
        if (this.num === 0) return;
        const temp = this.num;
        this.num = this.den;
        this.den = temp;
        this.audio?.playInvertSwitch();
        this.render();
      });
    }

    // 實體推桿拖曳/點擊
    const leverWrapper = this.container.querySelector('#heavy-lever-wrapper');
    if (leverWrapper) {
      leverWrapper.addEventListener('click', () => this.pullLever());
    }

    // 注入按鈕
    const injectBtn = this.container.querySelector('#inject-btn');
    if (injectBtn) {
      injectBtn.addEventListener('click', () => this.pullLever());
    }
  }

  _updateStepper(target, delta) {
    if (target === 'whole') {
      this.whole = Math.max(0, Math.min(99, this.whole + delta));
    } else if (target === 'num') {
      this.num = Math.max(0, Math.min(99, this.num + delta));
    } else if (target === 'den') {
      this.den = Math.max(1, Math.min(99, this.den + delta));
    }

    // 即時更新 DOM 避免整頁重繪
    const wEl = this.container.querySelector('#disp-whole');
    const nEl = this.container.querySelector('#disp-num');
    const dEl = this.container.querySelector('#disp-den');
    const prevEl = this.container.querySelector('#res-val-preview');

    if (wEl) wEl.textContent = this.whole;
    if (nEl) nEl.textContent = this.num;
    if (dEl) dEl.textContent = this.den;

    if (prevEl) {
      prevEl.innerHTML = this.getFormattedPreview();
    }
  }

  getFormattedPreview() {
    if (typeof MathFormatter !== 'undefined') {
      return MathFormatter.formatFraction(this.whole, this.num, this.den);
    }
    if (this.whole > 0 && this.num > 0) return `${this.whole}又 ${this.num}/${this.den}`;
    if (this.num > 0) return `${this.num}/${this.den}`;
    return `${this.whole}`;
  }

  pullLever() {
    if (this.isLeverPulling) return;
    this.isLeverPulling = true;
    this.audio?.playLeverPull();

    const leverArm = this.container.querySelector('#lever-arm');
    if (leverArm) {
      leverArm.classList.add('pulled');
    }

    setTimeout(() => {
      if (leverArm) {
        leverArm.classList.remove('pulled');
      }
      this.isLeverPulling = false;
      if (typeof this.onInject === 'function') {
        this.onInject(this.getValues());
      }
    }, 350);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReactorConsole;
}
