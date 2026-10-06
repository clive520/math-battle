/**
 * ratio-console.js - 元素調和秘境實體機關控制台
 * 具備雙軌量筒動態液面升降、比與比值即時光譜預覽、多模式切換與實體調和拉桿。
 */
class RatioConsole {
  constructor(mountId, audioManager, onHarmonize) {
    this.container = document.getElementById(mountId);
    this.audio = audioManager;
    this.onHarmonize = onHarmonize;

    this.currentMode = 'ratio'; // 'ratio', 'fraction', 'single_val', 'select_pipe', 'rate_comparison'
    this.lang = 'zh';

    // 內部狀態值
    this.ante = 1;
    this.cons = 1;
    this.whole = 0;
    this.num = 1;
    this.den = 1;
    this.singleVal = 1;
    this.selectedPipe = null;
    this.chosenOption = 'A';

    this.isLeverPulling = false;
    this.render();
  }

  setLang(lang) {
    this.lang = lang;
    this.render();
  }

  setMode(mode, options = {}) {
    this.currentMode = mode;
    // 重置或初始化預設數值
    this.ante = 1;
    this.cons = 1;
    this.whole = 0;
    this.num = 1;
    this.den = 1;
    this.singleVal = options.defaultVal || 1;
    this.selectedPipe = null;
    this.chosenOption = 'A';
    this.render();
  }

  getValues() {
    switch (this.currentMode) {
      case 'ratio':
        return { ante: this.ante, cons: this.cons };
      case 'fraction':
        return { whole: this.whole, num: this.num, den: this.den };
      case 'single_val':
        return { value: this.singleVal };
      case 'select_pipe':
        return { selectedPipe: this.selectedPipe };
      case 'rate_comparison':
        return {
          fraction: { whole: this.whole, num: this.num, den: this.den },
          best: this.chosenOption
        };
      default:
        return {};
    }
  }

  render() {
    if (!this.container) return;
    const isZh = this.lang === 'zh';

    let consoleHtml = '';

    if (this.currentMode === 'ratio') {
      // 模式 1：雙軌量筒比值調和儀 (Antecedent & Consequent)
      const ratioPreview = MathFormatter.formatRatio(this.ante, this.cons);
      const fracValPreview = MathFormatter.formatFraction(0, this.ante, this.cons);

      consoleHtml = `
        <div class="console-box ratio-mode">
          <div class="console-header">
            <span class="gauge-title">⚖️ ${isZh ? '雙軌元素比例調和儀' : 'Dual-Burette Ratio Dispenser'}</span>
            <div class="preview-display">
              <span class="preview-label">${isZh ? '調和比：' : 'Ratio:'}</span>
              <span class="preview-val" id="ratio-preview-box">${ratioPreview}</span>
              <span class="preview-sub-label">${isZh ? '（即時比值：' : '(Value:'}</span>
              <span class="preview-val-sub" id="ratio-val-preview">${fracValPreview}）</span>
            </div>
          </div>

          <div class="valves-dashboard burette-dashboard">
            <!-- 前項量筒管 (Antecedent) -->
            <div class="burette-column">
              <div class="column-title ante-title">🟡 ${isZh ? '前項注入槽' : 'Antecedent'}</div>
              <div class="cylinder-tube ante-tube">
                <div class="liquid-fill ante-fill" id="ante-fill" style="height: ${Math.min(95, Math.max(10, this.ante * 7))}%;"></div>
                <div class="cylinder-scale">
                  <span>- 15</span><span>- 10</span><span>- 5</span><span>- 1</span>
                </div>
              </div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="ante" data-delta="1">▲</button>
                <div class="digit-window ante-digit" id="disp-ante">${this.ante}</div>
                <button type="button" class="step-btn" data-target="ante" data-delta="-1">▼</button>
              </div>
            </div>

            <!-- 中央比例符文隔板 -->
            <div class="colon-divider-column">
              <span class="colon-emblem">：</span>
              <div class="flux-beam"></div>
            </div>

            <!-- 後項量筒管 (Consequent) -->
            <div class="burette-column">
              <div class="column-title cons-title">🔵 ${isZh ? '後項溶劑槽' : 'Consequent'}</div>
              <div class="cylinder-tube cons-tube">
                <div class="liquid-fill cons-fill" id="cons-fill" style="height: ${Math.min(95, Math.max(10, this.cons * 7))}%;"></div>
                <div class="cylinder-scale">
                  <span>- 15</span><span>- 10</span><span>- 5</span><span>- 1</span>
                </div>
              </div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="cons" data-delta="1">▲</button>
                <div class="digit-window cons-digit" id="disp-cons">${this.cons}</div>
                <button type="button" class="step-btn" data-target="cons" data-delta="-1">▼</button>
              </div>
            </div>

            <!-- 右側：實體調和推桿 -->
            <div class="lever-module-wrap">
              <div class="heavy-lever-wrapper" id="heavy-lever-wrapper" title="${isZh ? '拉動調和推桿驗證' : 'Pull Lever to Harmonize'}">
                <div class="lever-pivot"></div>
                <div class="lever-arm" id="lever-arm">
                  <div class="lever-handle"></div>
                </div>
                <div class="lever-label">${isZh ? '調和推桿' : 'LEVER'}</div>
              </div>
            </div>
          </div>

          <div class="lever-action-row">
            <button type="button" class="harmonize-btn" id="harmonize-btn">
              <span class="btn-icon">✨</span> ${isZh ? '啟動比例調和 / 扳動推桿' : 'ENGAGE HARMONIZER LEVER'}
            </button>
          </div>
        </div>
      `;
    } else if (this.currentMode === 'fraction') {
      // 模式 2：分數比值調諧儀 (Whole + Numerator / Denominator)
      const fracPreview = MathFormatter.formatFraction(this.whole, this.num, this.den);

      consoleHtml = `
        <div class="console-box fraction-mode">
          <div class="console-header">
            <span class="gauge-title">📐 ${isZh ? '比值分數調諧量程儀' : 'Ratio Value Meter'}</span>
            <div class="preview-display">
              <span class="preview-label">${isZh ? '當前設定比值：' : 'Setting:'}</span>
              <span class="preview-val" id="frac-preview-box">${fracPreview}</span>
            </div>
          </div>

          <div class="valves-dashboard">
            <!-- 整數盤 -->
            <div class="valve-module whole-module">
              <div class="module-title">${isZh ? '整數部' : 'Whole'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="whole" data-delta="1">▲</button>
                <div class="digit-window" id="disp-whole">${this.whole}</div>
                <button type="button" class="step-btn" data-target="whole" data-delta="-1">▼</button>
              </div>
            </div>

            <!-- 分數部 -->
            <div class="valve-module fraction-module">
              <div class="module-title">${isZh ? '分子 (前項)' : 'Numerator'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="num" data-delta="1">▲</button>
                <div class="digit-window" id="disp-num">${this.num}</div>
                <button type="button" class="step-btn" data-target="num" data-delta="-1">▼</button>
              </div>

              <div class="fraction-bar-divider"></div>

              <div class="module-title">${isZh ? '分母 (後項)' : 'Denominator'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="den" data-delta="1">▲</button>
                <div class="digit-window" id="disp-den">${this.den}</div>
                <button type="button" class="step-btn" data-target="den" data-delta="-1">▼</button>
              </div>
            </div>

            <!-- 實體推桿 -->
            <div class="lever-module-wrap">
              <div class="heavy-lever-wrapper" id="heavy-lever-wrapper">
                <div class="lever-pivot"></div>
                <div class="lever-arm" id="lever-arm">
                  <div class="lever-handle"></div>
                </div>
                <div class="lever-label">${isZh ? '校準推桿' : 'LEVER'}</div>
              </div>
            </div>
          </div>

          <div class="lever-action-row">
            <button type="button" class="harmonize-btn" id="harmonize-btn">
              <span class="btn-icon">⚡</span> ${isZh ? '校準比值 / 扳動推桿' : 'CALIBRATE RATIO VALUE'}
            </button>
          </div>
        </div>
      `;
    } else if (this.currentMode === 'single_val') {
      // 模式 3：單一數值輸入 (未知項、應用題產出、日晷高度)
      consoleHtml = `
        <div class="console-box single-mode">
          <div class="console-header">
            <span class="gauge-title">🔢 ${isZh ? '神壇數值校準盤' : 'Target Calibrator'}</span>
            <div class="preview-display">
              <span class="preview-label">${isZh ? '輸入數值：' : 'Value:'}</span>
              <span class="preview-val highlight-val" id="single-preview-box">${this.singleVal}</span>
            </div>
          </div>

          <div class="valves-dashboard single-dashboard">
            <div class="stepper-large-group">
              <div class="stepper-quick-row">
                <button type="button" class="step-btn quick-btn" data-target="single" data-delta="10">+10</button>
                <button type="button" class="step-btn quick-btn" data-target="single" data-delta="50">+50</button>
                <button type="button" class="step-btn quick-btn" data-target="single" data-delta="100">+100</button>
              </div>
              <div class="stepper-cluster main-stepper">
                <button type="button" class="step-btn lg-btn" data-target="single" data-delta="1">▲</button>
                <div class="digit-window lg-digit" id="disp-single">${this.singleVal}</div>
                <button type="button" class="step-btn lg-btn" data-target="single" data-delta="-1">▼</button>
              </div>
              <div class="stepper-quick-row">
                <button type="button" class="step-btn quick-btn" data-target="single" data-delta="-10">-10</button>
                <button type="button" class="step-btn quick-btn" data-target="single" data-delta="-50">-50</button>
                <button type="button" class="step-btn quick-btn" data-target="single" data-delta="-100">-100</button>
              </div>
            </div>

            <div class="lever-module-wrap">
              <div class="heavy-lever-wrapper" id="heavy-lever-wrapper">
                <div class="lever-pivot"></div>
                <div class="lever-arm" id="lever-arm">
                  <div class="lever-handle"></div>
                </div>
                <div class="lever-label">${isZh ? '注入推桿' : 'LEVER'}</div>
              </div>
            </div>
          </div>

          <div class="lever-action-row">
            <button type="button" class="harmonize-btn" id="harmonize-btn">
              <span class="btn-icon">⚡</span> ${isZh ? '確認注入數值' : 'INJECT VALUE'}
            </button>
          </div>
        </div>
      `;
    } else if (this.currentMode === 'select_pipe') {
      // 模式 4：四向管路切換閥 (A / B / C / D)
      consoleHtml = `
        <div class="console-box pipe-mode">
          <div class="console-header">
            <span class="gauge-title">🚰 ${isZh ? '四向能量分流共振閘門' : '4-Way Conduit Selector'}</span>
            <span class="gauge-sub">${isZh ? '選取與基準比相等的管路' : 'Select equivalent ratio conduit'}</span>
          </div>

          <div class="pipe-select-grid">
            ${['A', 'B', 'C', 'D'].map(p => `
              <button type="button" class="pipe-btn ${this.selectedPipe === p ? 'active' : ''}" data-pipe="${p}">
                <span class="pipe-icon">⚡</span>
                <span class="pipe-label">${isZh ? `管路 ${p}` : `Pipe ${p}`}</span>
              </button>
            `).join('')}
          </div>

          <div class="lever-action-row">
            <button type="button" class="harmonize-btn" id="harmonize-btn">
              <span class="btn-icon">✨</span> ${isZh ? '導通選定管路' : 'CONNECT CONDUIT'}
            </button>
          </div>
        </div>
      `;
    } else if (this.currentMode === 'rate_comparison') {
      // 模式 5：性價比綜合題 (比值 + 划算選項)
      const fracPreview = MathFormatter.formatFraction(this.whole, this.num, this.den);

      consoleHtml = `
        <div class="console-box rate-mode">
          <div class="console-header">
            <span class="gauge-title">💧 ${isZh ? '性價比比值與瓶裝選取儀' : 'Efficiency Analyzer'}</span>
            <div class="preview-display">
              <span class="preview-label">${isZh ? '甲瓶比值：' : 'Rate:'}</span>
              <span class="preview-val" id="frac-preview-box">${fracPreview}</span>
            </div>
          </div>

          <div class="valves-dashboard">
            <div class="valve-module whole-module">
              <div class="module-title">${isZh ? '整數部' : 'Whole'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="whole" data-delta="1">▲</button>
                <div class="digit-window" id="disp-whole">${this.whole}</div>
                <button type="button" class="step-btn" data-target="whole" data-delta="-1">▼</button>
              </div>
            </div>

            <div class="valve-module fraction-module">
              <div class="module-title">${isZh ? '分子' : 'Num'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="num" data-delta="1">▲</button>
                <div class="digit-window" id="disp-num">${this.num}</div>
                <button type="button" class="step-btn" data-target="num" data-delta="-1">▼</button>
              </div>
              <div class="fraction-bar-divider"></div>
              <div class="module-title">${isZh ? '分母' : 'Den'}</div>
              <div class="stepper-cluster">
                <button type="button" class="step-btn" data-target="den" data-delta="1">▲</button>
                <div class="digit-window" id="disp-den">${this.den}</div>
                <button type="button" class="step-btn" data-target="den" data-delta="-1">▼</button>
              </div>
            </div>

            <div class="rate-choice-box">
              <div class="choice-title">${isZh ? '哪一瓶更划算？' : 'Best Choice:'}</div>
              <div class="choice-btn-group">
                <button type="button" class="choice-btn ${this.chosenOption === 'A' ? 'active' : ''}" data-choice="A">甲瓶 (A)</button>
                <button type="button" class="choice-btn ${this.chosenOption === 'B' ? 'active' : ''}" data-choice="B">乙瓶 (B)</button>
              </div>
            </div>
          </div>

          <div class="lever-action-row">
            <button type="button" class="harmonize-btn" id="harmonize-btn">
              <span class="btn-icon">⚡</span> ${isZh ? '確認評估與分析' : 'SUBMIT ANALYSIS'}
            </button>
          </div>
        </div>
      `;
    }

    this.container.innerHTML = consoleHtml;
    this._bindEvents();
  }

  _bindEvents() {
    // 1. 步進按鈕
    const stepBtns = this.container.querySelectorAll('.step-btn');
    stepBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = btn.dataset.target;
        const delta = parseInt(btn.dataset.delta, 10) || 0;
        this._handleStep(target, delta);
      });
    });

    // 2. 管路選擇按鈕
    const pipeBtns = this.container.querySelectorAll('.pipe-btn');
    pipeBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        pipeBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.selectedPipe = btn.dataset.pipe;
        this.audio?.playClick();
      });
    });

    // 3. 划算選項按鈕
    const choiceBtns = this.container.querySelectorAll('.choice-btn');
    choiceBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        choiceBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.chosenOption = btn.dataset.choice;
        this.audio?.playClick();
      });
    });

    // 4. 調和推桿按鈕與實體推桿
    const leverWrapper = this.container.querySelector('#heavy-lever-wrapper');
    if (leverWrapper) {
      leverWrapper.addEventListener('click', () => this.pullLever());
    }

    const actionBtn = this.container.querySelector('#harmonize-btn');
    if (actionBtn) {
      actionBtn.addEventListener('click', () => this.pullLever());
    }
  }

  _handleStep(target, delta) {
    this.audio?.playDrop(delta > 0 ? 1.2 : 0.9);

    switch (target) {
      case 'ante':
        this.ante = Math.max(1, Math.min(999, this.ante + delta));
        break;
      case 'cons':
        this.cons = Math.max(1, Math.min(999, this.cons + delta));
        break;
      case 'whole':
        this.whole = Math.max(0, Math.min(999, this.whole + delta));
        break;
      case 'num':
        this.num = Math.max(0, Math.min(999, this.num + delta));
        break;
      case 'den':
        this.den = Math.max(1, Math.min(999, this.den + delta));
        break;
      case 'single':
        this.singleVal = Math.max(0, Math.min(9999, this.singleVal + delta));
        break;
    }

    this._updateDisplays();
  }

  _updateDisplays() {
    const isZh = this.lang === 'zh';

    if (this.currentMode === 'ratio') {
      const dAnte = this.container.querySelector('#disp-ante');
      const dCons = this.container.querySelector('#disp-cons');
      const fAnte = this.container.querySelector('#ante-fill');
      const fCons = this.container.querySelector('#cons-fill');
      const pBox = this.container.querySelector('#ratio-preview-box');
      const pVal = this.container.querySelector('#ratio-val-preview');

      if (dAnte) dAnte.textContent = this.ante;
      if (dCons) dCons.textContent = this.cons;
      if (fAnte) fAnte.style.height = `${Math.min(95, Math.max(10, this.ante * 7))}%`;
      if (fCons) fCons.style.height = `${Math.min(95, Math.max(10, this.cons * 7))}%`;
      if (pBox) pBox.innerHTML = MathFormatter.formatRatio(this.ante, this.cons);
      if (pVal) pVal.innerHTML = `${MathFormatter.formatFraction(0, this.ante, this.cons)}）`;
    } else if (this.currentMode === 'fraction' || this.currentMode === 'rate_comparison') {
      const dWhole = this.container.querySelector('#disp-whole');
      const dNum = this.container.querySelector('#disp-num');
      const dDen = this.container.querySelector('#disp-den');
      const pBox = this.container.querySelector('#frac-preview-box');

      if (dWhole) dWhole.textContent = this.whole;
      if (dNum) dNum.textContent = this.num;
      if (dDen) dDen.textContent = this.den;
      if (pBox) pBox.innerHTML = MathFormatter.formatFraction(this.whole, this.num, this.den);
    } else if (this.currentMode === 'single_val') {
      const dSingle = this.container.querySelector('#disp-single');
      const pBox = this.container.querySelector('#single-preview-box');

      if (dSingle) dSingle.textContent = this.singleVal;
      if (pBox) pBox.textContent = this.singleVal;
    }
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
      if (typeof this.onHarmonize === 'function') {
        this.onHarmonize(this.getValues());
      }
    }, 320);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = RatioConsole;
}
