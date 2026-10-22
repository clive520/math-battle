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
    this._syncFromInputs();
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
            <!-- 整數槽 (Whole Stepper & Direct Input) -->
            <div class="valve-module whole-module">
              <div class="module-title">${isZh ? '整數盤' : 'Whole'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="whole" data-delta="1" title="${isZh ? '增加整數' : '+1'}">▲</button>
                <input type="text"
                       inputmode="numeric"
                       pattern="[0-9]*"
                       class="digit-window digit-input"
                       id="disp-whole"
                       data-target="whole"
                       value="${this.whole}"
                       maxlength="4"
                       aria-label="${isZh ? '整數盤輸入' : 'Whole number input'}"
                       autocomplete="off">
                <button type="button" class="step-btn" data-target="whole" data-delta="-1" title="${isZh ? '減少整數' : '-1'}">▼</button>
              </div>
            </div>

            <!-- 分數部 (分子 / 分母) -->
            <div class="valve-module fraction-module">
              <div class="module-title">${isZh ? '分子閥門' : 'Numerator'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="num" data-delta="1" title="${isZh ? '增加分子' : '+1'}">▲</button>
                <input type="text"
                       inputmode="numeric"
                       pattern="[0-9]*"
                       class="digit-window digit-input"
                       id="disp-num"
                       data-target="num"
                       value="${this.num}"
                       maxlength="3"
                       aria-label="${isZh ? '分子閥門輸入' : 'Numerator input'}"
                       autocomplete="off">
                <button type="button" class="step-btn" data-target="num" data-delta="-1" title="${isZh ? '減少分子' : '-1'}">▼</button>
              </div>

              <!-- 分數能量隔板 (Fraction Division Bar) -->
              <div class="fraction-division-bar">
                <span class="bar-core"></span>
              </div>

              <div class="module-title">${isZh ? '分母閥門' : 'Denominator'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="den" data-delta="1" title="${isZh ? '增加分母' : '+1'}">▲</button>
                <input type="text"
                       inputmode="numeric"
                       pattern="[0-9]*"
                       class="digit-window digit-input"
                       id="disp-den"
                       data-target="den"
                       value="${this.den}"
                       maxlength="3"
                       aria-label="${isZh ? '分母閥門輸入' : 'Denominator input'}"
                       autocomplete="off">
                <button type="button" class="step-btn" data-target="den" data-delta="-1" title="${isZh ? '減少分母' : '-1'}">▼</button>
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

    // 數值輸入格直接鍵盤輸入 (支援實體鍵盤、平板螢幕鍵盤與快捷按鍵)
    const digitInputs = this.container.querySelectorAll('.digit-input');
    digitInputs.forEach(input => {
      const target = input.getAttribute('data-target');

      // 點擊或聚焦自動全選，使用者可直接鍵入新數值
      input.addEventListener('focus', () => {
        input.select();
      });
      input.addEventListener('click', () => {
        input.select();
      });

      // 即時過濾非數字字元並即時同步讀數
      input.addEventListener('input', () => {
        const cleaned = input.value.replace(/[^0-9]/g, '');
        input.value = cleaned;

        if (cleaned !== '') {
          let val = parseInt(cleaned, 10);
          if (target === 'whole') {
            val = Math.max(0, Math.min(9999, val));
          } else if (target === 'num') {
            val = Math.max(0, Math.min(999, val));
          } else if (target === 'den') {
            val = Math.max(0, Math.min(999, val));
          }
          this[target] = val;
        } else {
          if (target === 'whole') this.whole = 0;
          else if (target === 'num') this.num = 0;
          else if (target === 'den') this.den = 1;
        }
        this._updatePreview();
      });

      // 失焦時進行嚴格邊界校正與格式化
      input.addEventListener('blur', () => {
        let val = parseInt(input.value, 10);
        if (isNaN(val)) {
          val = (target === 'den') ? 1 : 0;
        }
        if (target === 'whole') {
          this.whole = Math.max(0, Math.min(9999, val));
          input.value = this.whole;
        } else if (target === 'num') {
          this.num = Math.max(0, Math.min(999, val));
          input.value = this.num;
        } else if (target === 'den') {
          // 分母不可為 0，最低為 1
          this.den = Math.max(1, Math.min(999, val));
          input.value = this.den;
        }
        this._updatePreview();
      });

      // 鍵盤導航：Enter 鍵直接發射拉桿，上下鍵步進微調
      input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          input.blur();
          this.pullLever();
        } else if (e.key === 'ArrowUp') {
          e.preventDefault();
          this._updateStepper(target, 1);
          input.select();
        } else if (e.key === 'ArrowDown') {
          e.preventDefault();
          this._updateStepper(target, -1);
          input.select();
        }
      });
    });

    // 逆流翻轉開關
    const invBtn = this.container.querySelector('#inverter-btn');
    if (invBtn) {
      invBtn.addEventListener('click', () => {
        this._syncFromInputs();
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

  _syncFromInputs() {
    const wEl = this.container.querySelector('#disp-whole');
    const nEl = this.container.querySelector('#disp-num');
    const dEl = this.container.querySelector('#disp-den');

    if (wEl && wEl.value !== '') {
      const v = parseInt(wEl.value, 10);
      if (!isNaN(v)) this.whole = Math.max(0, Math.min(9999, v));
    }
    if (nEl && nEl.value !== '') {
      const v = parseInt(nEl.value, 10);
      if (!isNaN(v)) this.num = Math.max(0, Math.min(999, v));
    }
    if (dEl && dEl.value !== '') {
      const v = parseInt(dEl.value, 10);
      if (!isNaN(v)) this.den = Math.max(1, Math.min(999, v));
    }
  }

  _updateStepper(target, delta) {
    if (target === 'whole') {
      this.whole = Math.max(0, Math.min(9999, this.whole + delta));
    } else if (target === 'num') {
      this.num = Math.max(0, Math.min(999, this.num + delta));
    } else if (target === 'den') {
      this.den = Math.max(1, Math.min(999, this.den + delta));
    }

    // 即時更新 DOM 避免整頁重繪
    const wEl = this.container.querySelector('#disp-whole');
    const nEl = this.container.querySelector('#disp-num');
    const dEl = this.container.querySelector('#disp-den');

    if (wEl) wEl.value = this.whole;
    if (nEl) nEl.value = this.num;
    if (dEl) dEl.value = this.den;

    this._updatePreview();
  }

  _updatePreview() {
    const prevEl = this.container.querySelector('#res-val-preview');
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

  setDisabled(disabled) {
    this.isLeverPulling = disabled;
    const injectBtn = this.container.querySelector('#inject-btn');
    const leverWrapper = this.container.querySelector('#heavy-lever-wrapper');
    const bypassBtns = this.container.querySelectorAll('.bypass-btn');
    const stepBtns = this.container.querySelectorAll('.step-btn');
    const invBtn = this.container.querySelector('#inverter-btn');
    const digitInputs = this.container.querySelectorAll('.digit-input');

    if (injectBtn) {
      injectBtn.disabled = disabled;
      injectBtn.style.pointerEvents = disabled ? 'none' : '';
      injectBtn.style.opacity = disabled ? '0.6' : '';
    }
    if (leverWrapper) {
      leverWrapper.style.pointerEvents = disabled ? 'none' : '';
      leverWrapper.style.opacity = disabled ? '0.6' : '';
    }
    bypassBtns.forEach(btn => {
      btn.disabled = disabled;
      btn.style.pointerEvents = disabled ? 'none' : '';
    });
    stepBtns.forEach(btn => {
      btn.disabled = disabled;
      btn.style.pointerEvents = disabled ? 'none' : '';
    });
    if (invBtn) {
      invBtn.disabled = disabled;
      invBtn.style.pointerEvents = disabled ? 'none' : '';
    }
    digitInputs.forEach(input => {
      input.disabled = disabled;
    });
  }

  pullLever() {
    if (this.isLeverPulling) return;
    this._syncFromInputs();
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
