/**
 * 實體機關開鎖組件 (Lock System)
 * 提供 4 位可上下撥動的古老機械輪盤銅鎖、音效反饋與拉栓開門動畫
 */
class DungeonLockSystem {
  constructor(containerElement, onAttemptUnlock) {
    this.container = containerElement;
    this.onAttemptUnlock = onAttemptUnlock;
    this.digits = [0, 0, 0, 0]; // 4 位當前設定值
    this.targetCode = '0000';
    this.isLocked = true;
    this.isAnimating = false;
  }

  // 設定目標密碼與重置鎖面
  setup(targetCode) {
    this.targetCode = String(targetCode).padStart(4, '0');
    this.digits = [0, 0, 0, 0];
    this.isLocked = true;
    this.isAnimating = false;
    this.render();
  }

  // 取得當前鎖面輸入的 4 位字串
  getCurrentInput() {
    return this.digits.join('');
  }

  // 渲染實體銅鎖介面
  render() {
    this.container.innerHTML = `
      <div class="physical-lock-container">
        <!-- 鎖頂金屬 U 型扣環 (Shackle) -->
        <div class="lock-shackle-wrapper" id="lockShackle">
          <div class="lock-shackle-bar"></div>
        </div>

        <!-- 鎖身本體 (Lock Body) -->
        <div class="lock-body" id="lockBody">
          <div class="lock-header">
            <span class="lock-emblem">⚙️ 遠古密法旋轉銅鎖</span>
            <span class="lock-hint-text">點擊 ▲▼ 或按鍵盤數字撥動</span>
          </div>

          <!-- 4 個數字輪盤 -->
          <div class="dials-row">
            ${[0, 1, 2, 3].map(col => `
              <div class="dial-column" data-col="${col}">
                <button type="button" class="dial-btn dial-up" data-col="${col}" aria-label="增加第 ${col+1} 位數字">▲</button>
                <div class="dial-window">
                  <div class="dial-digit" id="dialDigit-${col}">${this.digits[col]}</div>
                </div>
                <button type="button" class="dial-btn dial-down" data-col="${col}" aria-label="減少第 ${col+1} 位數字">▼</button>
              </div>
            `).join('')}
          </div>

          <!-- 快捷數字鍵盤輸入切換（電子白板/平板便利） -->
          <div class="quick-input-bar">
            <input type="text" class="quick-input" id="quickInputBox" maxlength="4" placeholder="或在此鍵入4位數字" value="${this.getCurrentInput()}">
            <button type="button" class="quick-sync-btn" id="quickSyncBtn">同步至輪盤</button>
          </div>

          <!-- 嘗試拉栓開鎖按鈕 -->
          <div class="lock-action-bar">
            <button type="button" class="btn-pull-shackle" id="btnPullShackle">
              <span class="btn-icon">🔓</span>
              <span class="btn-text">拉動鎖栓・嘗試破咒</span>
            </button>
          </div>
        </div>
      </div>
    `;

    this._bindEvents();
  }

  _bindEvents() {
    // 綁定上下撥動按鈕
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

    // 快捷輸入框
    const quickBox = this.container.querySelector('#quickInputBox');
    const syncBtn = this.container.querySelector('#quickSyncBtn');

    if (quickBox && syncBtn) {
      syncBtn.addEventListener('click', () => {
        this.setFromInput(quickBox.value);
      });
      quickBox.addEventListener('keyup', (e) => {
        if (e.key === 'Enter') {
          this.setFromInput(quickBox.value);
          this.triggerUnlockAttempt();
        }
      });
    }

    // 拉栓按鈕
    const pullBtn = this.container.querySelector('#btnPullShackle');
    if (pullBtn) {
      pullBtn.addEventListener('click', () => {
        this.triggerUnlockAttempt();
      });
    }
  }

  // 步進某一位數字 (+1 或 -1)
  stepDigit(col, delta) {
    if (this.isAnimating) return;
    window.audioMgr?.playDialTick();
    
    this.digits[col] = (this.digits[col] + delta + 10) % 10;
    const digitEl = this.container.querySelector(`#dialDigit-${col}`);
    if (digitEl) {
      digitEl.textContent = this.digits[col];
      digitEl.classList.remove('roll-anim');
      void digitEl.offsetWidth; // 觸發重繪
      digitEl.classList.add('roll-anim');
    }

    const quickBox = this.container.querySelector('#quickInputBox');
    if (quickBox) {
      quickBox.value = this.getCurrentInput();
    }
  }

  // 從字串一次性設定 4 位數
  setFromInput(val) {
    const clean = val.replace(/\D/g, '').slice(0, 4).padStart(4, '0');
    for (let i = 0; i < 4; i++) {
      this.digits[i] = parseInt(clean[i], 10);
      const el = this.container.querySelector(`#dialDigit-${i}`);
      if (el) el.textContent = this.digits[i];
    }
    const quickBox = this.container.querySelector('#quickInputBox');
    if (quickBox) quickBox.value = clean;
    window.audioMgr?.playDialTick();
  }

  // 嘗試解鎖
  triggerUnlockAttempt() {
    if (this.isAnimating) return;
    const currentCode = this.getCurrentInput();
    const isCorrect = (currentCode === this.targetCode);

    const shackle = this.container.querySelector('#lockShackle');
    const lockBody = this.container.querySelector('#lockBody');

    if (isCorrect) {
      // 成功解鎖動畫
      this.isAnimating = true;
      shackle?.classList.add('unlocked-shackle');
      lockBody?.classList.add('unlocked-glow');
      window.audioMgr?.playUnlockSuccess();

      setTimeout(() => {
        this.onAttemptUnlock(true, currentCode);
      }, 700);
    } else {
      // 失敗卡死震動
      this.isAnimating = true;
      lockBody?.classList.add('lock-rattle-fail');
      window.audioMgr?.playWrongAnswer();

      setTimeout(() => {
        lockBody?.classList.remove('lock-rattle-fail');
        this.isAnimating = false;
        this.onAttemptUnlock(false, currentCode);
      }, 600);
    }
  }
}

window.DungeonLockSystem = DungeonLockSystem;
