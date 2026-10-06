/**
 * 實體機關開鎖組件 (Lock System)
 * 提供 4 位可上下撥動的古老機械輪盤銅鎖、音效反饋與拉栓開門動畫
 */
class ClockworkLockSystem {
  constructor(containerElement, onAttemptUnlock, audioManager = null) {
    this.container = containerElement;
    this.onAttemptUnlock = onAttemptUnlock;
    this.audioManager = audioManager;
    this.digits = [0, 0, 0, 0];
    this.targetCode = '0000';
    this.isLocked = true;
    this.isAnimating = false;
    this.lang = 'zh';
  }

  setup(targetCode, lang = 'zh') {
    this.targetCode = String(targetCode).padStart(4, '0');
    this.lang = lang;
    this.digits = [0, 0, 0, 0];
    this.isLocked = true;
    this.isAnimating = false;
    this.render();
  }

  getCurrentInput() {
    return this.digits.join('');
  }

  render() {
    const isEn = (this.lang === 'en');
    this.container.innerHTML = `
      <div class="physical-lock-container">
        <!-- 鎖頂金屬 U 型扣環 (Shackle) -->
        <div class="lock-shackle-wrapper" id="lockShackle">
          <div class="lock-shackle-bar"></div>
        </div>

        <!-- 鎖身本體 (Lock Body) -->
        <div class="lock-body" id="lockBody">
          <div class="lock-header">
            <span class="lock-emblem">${isEn ? '⚙️ Celestial Brass Combination Lock' : '⚙️ 遠古星辰旋轉黃銅鎖'}</span>
            <span class="lock-hint-text">${isEn ? 'Click ▲▼ or type digits to rotate dials' : '點擊 ▲▼ 或按鍵盤數字撥動輪盤'}</span>
          </div>

          <!-- 4 個數字輪盤 -->
          <div class="dials-row">
            ${[0, 1, 2, 3].map(col => `
              <div class="dial-column" data-col="${col}">
                <button type="button" class="dial-btn dial-up" data-col="${col}" aria-label="${isEn ? `Increase digit ${col+1}` : `增加第 ${col+1} 位數字`}">▲</button>
                <div class="dial-window">
                  <div class="dial-digit" id="dialDigit-${col}">${this.digits[col]}</div>
                </div>
                <button type="button" class="dial-btn dial-down" data-col="${col}" aria-label="${isEn ? `Decrease digit ${col+1}` : `減少第 ${col+1} 位數字`}">▼</button>
              </div>
            `).join('')}
          </div>

          <!-- 快捷數字鍵盤輸入（電子白板/平板便利） -->
          <div class="quick-input-bar">
            <input type="text" class="quick-input" id="quickInputBox" maxlength="4" placeholder="${isEn ? 'Type 4-digit code' : '或在此直接輸入4位數字'}" value="${this.getCurrentInput()}">
            <button type="button" class="quick-sync-btn" id="quickSyncBtn">${isEn ? 'Sync' : '同步至輪盤'}</button>
          </div>

          <!-- 嘗試拉栓開鎖按鈕 -->
          <div class="lock-action-bar">
            <button type="button" class="btn-pull-shackle" id="btnPullShackle">
              <span class="btn-icon">🔓</span>
              <span class="btn-text">${isEn ? 'Pull Shackle・Attempt Unlock' : '拉動鎖栓・嘗試解鎖'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    const upBtns = this.container.querySelectorAll('.dial-up');
    const downBtns = this.container.querySelectorAll('.dial-down');

    upBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const col = parseInt(e.currentTarget.getAttribute('data-col'), 10);
        this.stepDigit(col, 1);
      });
    });

    downBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const col = parseInt(e.currentTarget.getAttribute('data-col'), 10);
        this.stepDigit(col, -1);
      });
    });

    const quickBox = this.container.querySelector('#quickInputBox');
    const syncBtn = this.container.querySelector('#quickSyncBtn');

    if (quickBox) {
      quickBox.addEventListener('input', (e) => {
        const val = e.target.value.replace(/\D/g, '').slice(0, 4);
        e.target.value = val;
        if (val.length === 4) {
          this.setInputString(val);
        }
      });

      quickBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          this.attemptUnlock();
        }
      });
    }

    if (syncBtn && quickBox) {
      syncBtn.addEventListener('click', () => {
        const val = quickBox.value.replace(/\D/g, '').padEnd(4, '0').slice(0, 4);
        quickBox.value = val;
        this.setInputString(val);
      });
    }

    const unlockBtn = this.container.querySelector('#btnPullShackle');
    if (unlockBtn) {
      unlockBtn.addEventListener('click', () => {
        this.attemptUnlock();
      });
    }
  }

  stepDigit(colIndex, delta) {
    if (this.isAnimating) return;
    this.digits[colIndex] = (this.digits[colIndex] + delta + 10) % 10;
    this._updateDigitDisplay(colIndex);
    this._syncQuickInput();

    if (this.audioManager) {
      this.audioManager.playDialTick();
    }
  }

  setInputString(str) {
    const padded = String(str).replace(/\D/g, '').padStart(4, '0').slice(-4);
    for (let i = 0; i < 4; i++) {
      this.digits[i] = parseInt(padded[i], 10);
      this._updateDigitDisplay(i);
    }
    this._syncQuickInput();
    if (this.audioManager) {
      this.audioManager.playDialTick();
    }
  }

  _updateDigitDisplay(colIndex) {
    const el = this.container.querySelector(`#dialDigit-${colIndex}`);
    if (el) {
      el.textContent = this.digits[colIndex];
      el.classList.add('dial-animating');
      setTimeout(() => el.classList.remove('dial-animating'), 120);
    }
  }

  _syncQuickInput() {
    const quickBox = this.container.querySelector('#quickInputBox');
    if (quickBox) {
      quickBox.value = this.getCurrentInput();
    }
  }

  attemptUnlock() {
    if (this.isAnimating) return;
    const currentCode = this.getCurrentInput();
    const isCorrect = (currentCode === this.targetCode);

    this.isAnimating = true;
    const shackle = this.container.querySelector('#lockShackle');
    const lockBody = this.container.querySelector('#lockBody');

    if (isCorrect) {
      if (shackle) shackle.classList.add('shackle-unlocked');
      if (lockBody) lockBody.classList.add('lock-body-success');

      if (this.audioManager) {
        this.audioManager.playStoneDoor();
      }

      setTimeout(() => {
        this.isAnimating = false;
        if (typeof this.onAttemptUnlock === 'function') {
          this.onAttemptUnlock(true, currentCode);
        }
      }, 700);
    } else {
      if (lockBody) lockBody.classList.add('lock-body-shake');

      if (this.audioManager) {
        this.audioManager.playWrongCode();
      }

      setTimeout(() => {
        if (lockBody) lockBody.classList.remove('lock-body-shake');
        this.isAnimating = false;
        if (typeof this.onAttemptUnlock === 'function') {
          this.onAttemptUnlock(false, currentCode);
        }
      }, 500);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClockworkLockSystem;
}
