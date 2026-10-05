/**
 * 六階賢者之天秤黃銅小數密碼鎖組件 (AlchemistLockSystem)
 * 特色：
 * 1. 3 位整數輪盤 (百、十、個) ＋ 中央發光小數點寶石 ＋ 3 位小數輪盤 (十分、百分、千分)
 * 2. 強化學生對「小數點是定位錨」與「位值對齊」的直覺掌握
 * 3. 支援鍵盤左右導覽、快捷鍵入、3D 翻滾動效、齒輪與晶石共鳴音效
 */
class AlchemistLockSystem {
  constructor(containerElement, audioManager, onAttemptUnlock) {
    this.container = containerElement;
    this.audio = audioManager;
    this.onAttemptUnlock = onAttemptUnlock;

    // 6 位數字：[百位, 十位, 個位, 十分位, 百分位, 千分位]
    this.digits = [0, 0, 0, 0, 0, 0];
    this.targetNumber = 0;
    this.lang = 'zh';
    this.isLocked = true;
    this.isAnimating = false;
    this.activeCol = 2; // 預設焦點停在「個位」
  }

  // 設定目標數值與重置鎖面
  setup(targetNumber, lang = 'zh') {
    this.targetNumber = parseFloat(targetNumber);
    this.lang = lang;
    this.digits = [0, 0, 0, 0, 0, 0];
    this.isLocked = true;
    this.isAnimating = false;
    this.activeCol = 2; // 預設聚焦個位
    this.render();
  }

  // 取得當前鎖面數值 (浮點數)
  getCurrentValue() {
    const intPart = this.digits.slice(0, 3).join('');
    const decPart = this.digits.slice(3, 6).join('');
    return parseFloat(`${intPart}.${decPart}`);
  }

  // 取得格式化顯示字串 (例如 "062.500")
  getCurrentFormattedString() {
    return `${this.digits.slice(0, 3).join('')}.${this.digits.slice(3, 6).join('')}`;
  }

  render() {
    const isEn = (this.lang === 'en');
    const labels = isEn 
      ? ['100s', '10s', '1s', '.1', '.01', '.001']
      : ['百位', '十位', '個位', '十分位', '百分位', '千分位'];

    this.container.innerHTML = `
      <div class="alchemist-lock-container">
        <!-- 鎖頂鍊金重裝扣環 (Shackle) -->
        <div class="lock-shackle-wrapper" id="lockShackle">
          <div class="lock-shackle-bar"></div>
        </div>

        <!-- 鎖身本體 (Brass Lock Body) -->
        <div class="lock-body" id="lockBody">
          <!-- 頂部標題與裝飾銘牌 -->
          <div class="lock-header">
            <span class="lock-emblem">
              ${isEn ? '⚖️ Alchemical Hexa-Decimal Vault Lock' : '⚖️ 賢者天秤・六階小數黃銅機關鎖'}
            </span>
            <span class="lock-hint-text">
              ${isEn ? 'Align integers and decimals around the anchor gem' : '以中央晶石為錨點，精準撥出整數與小數位值'}
            </span>
          </div>

          <!-- 六階輪盤列（左三位整數 ＋ 中央發光小數點 ＋ 右三位小數） -->
          <div class="dials-row" role="group" aria-label="${isEn ? 'Six-dial decimal combination lock' : '六階小數密碼輪盤'}">
            
            <!-- [0] 百位 -->
            ${this._renderDialColumn(0, labels[0], isEn)}

            <!-- [1] 十位 -->
            ${this._renderDialColumn(1, labels[1], isEn)}

            <!-- [2] 個位 -->
            ${this._renderDialColumn(2, labels[2], isEn)}

            <!-- ★ 中央固定發光小數點寶石 (The Anchor Gem) ★ -->
            <div class="decimal-gem-column" id="decimalGemCol" title="${isEn ? 'Decimal Point Anchor Gem' : '小數點定位晶石'}">
              <span class="place-tag gem-tag">${isEn ? 'POINT' : '小數點'}</span>
              <div class="decimal-gemstone" id="decimalGem">
                <div class="gem-inner-glow"></div>
                <span class="gem-dot">•</span>
              </div>
              <span class="place-subtag">Fixed</span>
            </div>

            <!-- [3] 十分位 -->
            ${this._renderDialColumn(3, labels[3], isEn)}

            <!-- [4] 百分位 -->
            ${this._renderDialColumn(4, labels[4], isEn)}

            <!-- [5] 千分位 -->
            ${this._renderDialColumn(5, labels[5], isEn)}

          </div>

          <!-- 快捷數字鍵盤輸入（支援小數點如 62.5 或 0.1 直接同步） -->
          <div class="quick-input-bar">
            <input type="text" 
              class="quick-input" 
              id="quickInputBox" 
              inputmode="decimal" 
              maxlength="8" 
              placeholder="${isEn ? 'e.g. 62.5 or 0.1' : '或在此鍵入小數（如 62.5 或 0.1）'}" 
              value="${this.getCurrentValue() > 0 ? this.getCurrentValue() : ''}">
            <button type="button" class="quick-sync-btn" id="quickSyncBtn">
              ${isEn ? '⚡ Sync to Dials' : '⚡ 同步至六階輪盤'}
            </button>
          </div>

          <!-- 開鎖動作按鈕 -->
          <div class="lock-action-bar">
            <button type="button" class="btn-pull-shackle" id="btnPullShackle">
              <span class="btn-icon">🔓</span>
              <span class="btn-text">${isEn ? 'Turn Key・Attempt Unlock' : '轉動鎖栓・嘗試破咒'}</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
    this._highlightActiveColumn();
  }

  _renderDialColumn(col, label, isEn) {
    const isDec = col >= 3;
    return `
      <div class="dial-column ${isDec ? 'decimal-dial' : 'integer-dial'}" data-col="${col}" id="dialCol-${col}">
        <span class="place-tag ${isDec ? 'dec-tag' : 'int-tag'}">${label}</span>
        <button type="button" class="dial-btn dial-up" data-col="${col}" aria-label="${isEn ? `Increase ${label}` : `增加 ${label}`}">▲</button>
        <div class="dial-window" data-col="${col}">
          <div class="dial-digit" id="dialDigit-${col}">${this.digits[col]}</div>
        </div>
        <button type="button" class="dial-btn dial-down" data-col="${col}" aria-label="${isEn ? `Decrease ${label}` : `減少 ${label}`}">▼</button>
      </div>
    `;
  }

  _bindEvents() {
    // 1. 上下撥動按鈕
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

    // 2. 點擊輪盤視窗聚焦
    const windows = this.container.querySelectorAll('.dial-window');
    windows.forEach(w => {
      w.addEventListener('click', (e) => {
        const col = parseInt(e.currentTarget.getAttribute('data-col'), 10);
        this.activeCol = col;
        this._highlightActiveColumn();
      });
    });

    // 3. 快捷輸入同步
    const quickBox = this.container.querySelector('#quickInputBox');
    const syncBtn = this.container.querySelector('#quickSyncBtn');

    const handleSync = () => {
      const raw = quickBox.value.trim();
      if (!raw) return;
      this.syncFromDecimalInput(raw);
    };

    if (syncBtn) syncBtn.addEventListener('click', handleSync);
    if (quickBox) {
      quickBox.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleSync();
        }
      });
    }

    // 4. 拉動鎖栓
    const shackleBtn = this.container.querySelector('#btnPullShackle');
    if (shackleBtn) {
      shackleBtn.addEventListener('click', () => {
        this.attemptUnlock();
      });
    }

    // 5. 鍵盤事件監聽
    this._handleKeyDown = (e) => {
      if (!this.isLocked || this.isAnimating) return;
      // 若焦點在 input 輸入框，不攔截按鍵
      if (document.activeElement && document.activeElement.tagName === 'INPUT') return;

      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.activeCol = (this.activeCol - 1 + 6) % 6;
        this._highlightActiveColumn();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.activeCol = (this.activeCol + 1) % 6;
        this._highlightActiveColumn();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        this.stepDigit(this.activeCol, 1);
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        this.stepDigit(this.activeCol, -1);
      } else if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        this.setDigit(this.activeCol, parseInt(e.key, 10));
        // 自動跳下一位
        this.activeCol = (this.activeCol + 1) % 6;
        this._highlightActiveColumn();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        this.attemptUnlock();
      }
    };

    window.removeEventListener('keydown', this._boundKeyHandler);
    this._boundKeyHandler = this._handleKeyDown.bind(this);
    window.addEventListener('keydown', this._boundKeyHandler);
  }

  // 將輸入的小數字串（如 "62.5" 或 "7" 或 "0.1"）精準映射到六階輪盤
  syncFromDecimalInput(rawStr) {
    const num = parseFloat(rawStr);
    if (isNaN(num)) return;

    // 分解整數部與小數部
    const parts = rawStr.split('.');
    const intPartStr = parts[0] || '0';
    const decPartStr = parts[1] || '';

    // 整數部取後 3 位 (百、十、個)
    const paddedInt = intPartStr.padStart(3, '0').slice(-3);
    // 小數部取前 3 位 (十分、百分、千分)
    const paddedDec = decPartStr.padEnd(3, '0').slice(0, 3);

    for (let i = 0; i < 3; i++) {
      this.digits[i] = parseInt(paddedInt[i], 10) || 0;
    }
    for (let i = 0; i < 3; i++) {
      this.digits[3 + i] = parseInt(paddedDec[i], 10) || 0;
    }

    // 更新 DOM 與觸發晶石共鳴
    for (let col = 0; col < 6; col++) {
      this._updateDigitDisplay(col, true);
    }
    this._flashGemstone();
    if (this.audio) this.audio.playGemResonate();
  }

  // 步進指定位數
  stepDigit(col, delta) {
    if (col < 0 || col > 5) return;
    this.digits[col] = (this.digits[col] + delta + 10) % 10;
    this.activeCol = col;
    this._highlightActiveColumn();
    this._updateDigitDisplay(col, true);

    // 撥動音效
    if (this.audio) {
      if (col >= 3) {
        this.audio.playGemResonate();
      } else {
        this.audio.playDialTick();
      }
    }
  }

  setDigit(col, val) {
    if (col < 0 || col > 5) return;
    this.digits[col] = ((val % 10) + 10) % 10;
    this._updateDigitDisplay(col, true);
    if (this.audio) this.audio.playDialTick();
  }

  _updateDigitDisplay(col, animate = false) {
    const el = this.container.querySelector(`#dialDigit-${col}`);
    if (!el) return;
    el.textContent = this.digits[col];

    if (animate) {
      el.classList.remove('roll-anim');
      void el.offsetWidth; // trigger reflow
      el.classList.add('roll-anim');
    }

    // 同步到快捷框顯示
    const quickBox = this.container.querySelector('#quickInputBox');
    if (quickBox && document.activeElement !== quickBox) {
      quickBox.value = this.getCurrentValue();
    }
  }

  _highlightActiveColumn() {
    this.container.querySelectorAll('.dial-column').forEach(colEl => {
      colEl.classList.remove('active-dial');
    });
    const target = this.container.querySelector(`#dialCol-${this.activeCol}`);
    if (target) target.classList.add('active-dial');
  }

  _flashGemstone() {
    const gem = this.container.querySelector('#decimalGem');
    if (!gem) return;
    gem.classList.remove('gem-flash');
    void gem.offsetWidth;
    gem.classList.add('gem-flash');
  }

  // 嘗試解鎖驗證
  attemptUnlock() {
    if (this.isAnimating) return;
    this.isAnimating = true;

    const studentValue = this.getCurrentValue();
    const isCorrect = Math.abs(studentValue - this.targetNumber) < 0.0001;

    const shackle = this.container.querySelector('#lockShackle');
    const lockBody = this.container.querySelector('#lockBody');

    if (isCorrect) {
      // 成功開鎖
      this.isLocked = false;
      this._flashGemstone();
      if (shackle) shackle.classList.add('unlocked');
      if (lockBody) lockBody.classList.add('unlock-success');

      if (this.audio) this.audio.playStoneDoor();

      setTimeout(() => {
        this.isAnimating = false;
        if (this.onAttemptUnlock) this.onAttemptUnlock(true, studentValue);
      }, 900);

    } else {
      // 失敗震動
      if (lockBody) {
        lockBody.classList.add('lock-shake');
        setTimeout(() => lockBody.classList.remove('lock-shake'), 600);
      }
      if (this.audio) this.audio.playWrongAlarm();

      setTimeout(() => {
        this.isAnimating = false;
        if (this.onAttemptUnlock) this.onAttemptUnlock(false, studentValue);
      }, 650);
    }
  }

  destroy() {
    if (this._boundKeyHandler) {
      window.removeEventListener('keydown', this._boundKeyHandler);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = AlchemistLockSystem;
}
