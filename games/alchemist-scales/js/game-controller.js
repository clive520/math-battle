/**
 * 遊戲主控制器 (GameController)
 * 負責全域狀態流轉、理智值懲戒與恢復、暗黑遮罩、微光復甦、雙語切換與通關結算
 */
class GameController {
  constructor() {
    this.audio = new AudioManager();
    this.tts = new TTSReader();
    this.diagramRenderer = new AlchemistDiagramRenderer();
    this.fx = null;
    this.lock = null;
    this.questionEngine = null;

    // 遊戲運行狀態
    this.lang = 'zh';
    this.studentInfo = null;
    this.chambers = [];
    this.chamberOrder = null;
    this.currentChamberIdx = 0;
    this.sanity = 100;
    this.wrongCount = 0;
    this.chamberWrongCount = 0;
    this.startTime = null;
    this.isReviving = false;

    this.STORAGE_KEY = 'alchemist_escape_save_v1';
  }

  init() {
    this.fx = new AlchemyFxManager(document.getElementById('alchemyCanvas'));
    this.lock = new AlchemistLockSystem(
      document.getElementById('lockMount'),
      this.audio,
      (isCorrect, value) => this.handleUnlockAttempt(isCorrect, value)
    );

    this._bindGlobalEvents();
    this._checkSavedProgress();
  }

  _bindGlobalEvents() {
    // 登入表單送出
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.startNewGame();
      });
    }

    // 座號步進選擇器按鈕 (▲ / ▼)
    const btnSeatDown = document.getElementById('btnSeatDown');
    const btnSeatUp = document.getElementById('btnSeatUp');
    const selectSeat = document.getElementById('inputSeat');

    if (btnSeatDown && selectSeat) {
      btnSeatDown.addEventListener('click', () => {
        if (selectSeat.selectedIndex > 0) {
          selectSeat.selectedIndex--;
          if (this.audio) this.audio.playDialTick();
        }
      });
    }

    if (btnSeatUp && selectSeat) {
      btnSeatUp.addEventListener('click', () => {
        if (selectSeat.selectedIndex < selectSeat.options.length - 1) {
          selectSeat.selectedIndex++;
          if (this.audio) this.audio.playDialTick();
        }
      });
    }

    // 語言切換
    const langBtn = document.getElementById('btnLangToggle');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        this.toggleLanguage();
      });
    }

    // 語音朗讀
    const ttsBtn = document.getElementById('btnTts');
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        this.toggleTTS();
      });
    }

    // 打開筆記本
    const notebookBtn = document.getElementById('btnNotebook');
    if (notebookBtn) {
      notebookBtn.addEventListener('click', () => {
        this.openNotebook();
      });
    }

    // 關閉筆記本
    const closeNotebookBtn = document.getElementById('btnCloseNotebook');
    if (closeNotebookBtn) {
      closeNotebookBtn.addEventListener('click', () => {
        this.closeNotebook();
      });
    }

    // 登出按鈕
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm(this.lang === 'en' ? 'Are you sure you want to log out?' : '確定要登出並結束當前探險嗎？')) {
          this.logout();
        }
      });
    }

    // 復甦確認按鈕
    const btnReviveConfirm = document.getElementById('btnReviveConfirm');
    if (btnReviveConfirm) {
      btnReviveConfirm.addEventListener('click', () => {
        this.confirmRevival();
      });
    }

    // 手電筒暗黑遮罩跟隨鼠標與觸控 (理智 ≤ 30% 啟動)
    const torchMask = document.getElementById('torchMask');
    const updateTorch = (x, y) => {
      if (torchMask && torchMask.classList.contains('active')) {
        torchMask.style.setProperty('--torch-x', `${x}px`);
        torchMask.style.setProperty('--torch-y', `${y}px`);
      }
    };

    window.addEventListener('mousemove', (e) => updateTorch(e.clientX, e.clientY));
    window.addEventListener('touchmove', (e) => {
      if (e.touches && e.touches[0]) {
        updateTorch(e.touches[0].clientX, e.touches[0].clientY);
      }
    });

    // 證書按鈕
    const btnCertPrint = document.getElementById('btnCertPrint');
    if (btnCertPrint) {
      btnCertPrint.addEventListener('click', () => window.print());
    }

    const btnCertRestart = document.getElementById('btnCertRestart');
    if (btnCertRestart) {
      btnCertRestart.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  _checkSavedProgress() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && data.studentInfo) {
          this.studentInfo = data.studentInfo;
          this.sanity = data.sanity ?? 100;
          this.currentChamberIdx = data.currentChamberIdx ?? 0;
          this.wrongCount = data.wrongCount ?? 0;
          this.chamberWrongCount = data.chamberWrongCount ?? 0;
          this.startTime = data.startTime ?? Date.now();
          this.chamberOrder = data.chamberOrder ?? null;
          this.lang = data.lang ?? 'zh';

          const seed = `${this.studentInfo.classNo}-${this.studentInfo.seatNo}`;
          this.questionEngine = new AlchemistQuestionEngine(seed);
          const gen = this.questionEngine.generateAllChambers(this.chamberOrder);
          this.chambers = gen.chambers;
          this.chamberOrder = gen.order;

          this.showGameScreen();
          this.loadChamber(this.currentChamberIdx);
          this.updateSanityDisplay();
          this.updateTopBarUI();
          return;
        }
      }
    } catch (e) {
      console.warn('Load save error:', e);
    }

    // 無進度，顯示登入
    this.showLoginScreen();
  }

  saveProgress() {
    if (!this.studentInfo) return;
    try {
      const data = {
        studentInfo: this.studentInfo,
        sanity: this.sanity,
        currentChamberIdx: this.currentChamberIdx,
        wrongCount: this.wrongCount,
        chamberWrongCount: this.chamberWrongCount,
        startTime: this.startTime,
        chamberOrder: this.chamberOrder,
        lang: this.lang
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save error:', e);
    }
  }

  clearProgress() {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (e) {}
  }

  startNewGame() {
    const classNo = document.getElementById('inputClass').value.trim() || '601';
    const seatNo = document.getElementById('inputSeat').value.trim() || '01';
    const nickname = document.getElementById('inputNickname').value.trim() || (this.lang === 'en' ? 'Apprentice' : '煉金學徒');

    this.studentInfo = { classNo, seatNo, nickname };
    this.sanity = 100;
    this.currentChamberIdx = 0;
    this.wrongCount = 0;
    this.chamberWrongCount = 0;
    this.startTime = Date.now();

    const seed = `${classNo}-${seatNo}`;
    this.questionEngine = new AlchemistQuestionEngine(seed);
    const gen = this.questionEngine.generateAllChambers(); // 新局隨機洗牌
    this.chambers = gen.chambers;
    this.chamberOrder = gen.order;

    this.saveProgress();
    this.showGameScreen();
    this.loadChamber(0);
    this.updateSanityDisplay();
    this.updateTopBarUI();
  }

  loadChamber(idx) {
    if (idx >= this.chambers.length) {
      this.triggerVictory();
      return;
    }

    this.currentChamberIdx = idx;
    this.chamberWrongCount = 0;
    this.saveProgress();

    const chamber = this.chambers[idx];
    const isEn = (this.lang === 'en');

    // 更新密室資訊
    const titleEl = document.getElementById('chamberTitle');
    const badgeEl = document.getElementById('chamberBadge');
    const storyEl = document.getElementById('storyContent');
    const questionEl = document.getElementById('questionContent');

    if (titleEl) titleEl.textContent = isEn ? chamber.title_en : chamber.title_zh;
    if (badgeEl) badgeEl.textContent = isEn ? chamber.stageBadge_en : chamber.stageBadge_zh;
    if (storyEl) storyEl.textContent = isEn ? chamber.story_en : chamber.story_zh;
    if (questionEl) questionEl.textContent = isEn ? chamber.question_en : chamber.question_zh;

    // 配置 6 位小數密碼鎖
    this.lock.setup(chamber.targetNumber, this.lang);

    // 停止朗讀
    this.tts.stop();
    this._resetTtsButtonText();

    // 檢查暗黑手電筒
    this._checkTorchlightState();
  }

  handleUnlockAttempt(isCorrect, valueEntered) {
    const current = this.chambers[this.currentChamberIdx];
    const isEn = (this.lang === 'en');

    if (isCorrect) {
      // 答對處理
      // 計算理智回血（方案 3：精準解鎖加成）
      let heal = 10;
      if (this.chamberWrongCount === 0) heal = 25;
      else if (this.chamberWrongCount === 1) heal = 15;

      const oldSanity = this.sanity;
      this.sanity = Math.min(100, this.sanity + heal);
      this.updateSanityDisplay(true); // 帶綠光脈衝

      // 觸發音效與聖光粒子
      if (this.audio) this.audio.playSanityHeal();
      if (this.fx) this.fx.triggerHealBurst(document.getElementById('sanityBar'));

      // 若剛好脫離瀕死 (<=30% 回升至 >30%)
      if (oldSanity <= 30 && this.sanity > 30) {
        this._showToast(isEn ? '☀️ Darkness dispelled! Vision restored!' : '☀️ 驅散毒霧，視野重現光明！');
      }

      this._checkTorchlightState();

      // 觸發鋼門開啟與長廊推進動效
      if (this.fx) {
        this.fx.triggerVaultOpen(() => {
          this.loadChamber(this.currentChamberIdx + 1);
        });
      } else {
        setTimeout(() => this.loadChamber(this.currentChamberIdx + 1), 1000);
      }

    } else {
      // 答錯處理
      this.wrongCount++;
      this.chamberWrongCount++;

      // 扣除 15% 理智
      this.sanity = Math.max(0, this.sanity - 15);
      this.updateSanityDisplay();

      // 觸發毒氣回火與劇烈震動
      if (this.fx) this.fx.triggerToxicBurst();

      // 特別針對魔王關餘數陷阱提示
      if (current.id === 'ch_boss_philosopher_blood') {
        this._showToast(isEn ? '⚠️ Trap! Remainder aligns with the ORIGINAL decimal point!' : '⚠️ 致命陷阱！餘數小數點必須對齊被除數的【原小數點】！');
      } else {
        this._showToast(isEn ? `❌ Incorrect balance! -15% Sanity` : `❌ 機關失衡！扣除 15% 理智值`);
      }

      this._checkTorchlightState();

      // 檢查是否昏厥崩潰 (0%)
      if (this.sanity <= 0) {
        this.triggerFaintingRevival();
      } else {
        this.saveProgress();
      }
    }
  }

  // 0% 昏厥崩潰與微光復甦
  triggerFaintingRevival() {
    this.isReviving = true;
    this.audio.stopHeartbeat();

    const revivalModal = document.getElementById('revivalModal');
    if (revivalModal) {
      revivalModal.classList.add('active');
    }

    // 強制打開筆記本以供研讀
    this.openNotebook(true);
  }

  confirmRevival() {
    const revivalModal = document.getElementById('revivalModal');
    if (revivalModal) {
      revivalModal.classList.remove('active');
    }

    // 理智回升至 40%
    this.sanity = 40;
    this.isReviving = false;
    this.updateSanityDisplay(true);

    // 因 40% > 30%，黑霧自動散去
    this._checkTorchlightState();
    this.saveProgress();

    const isEn = (this.lang === 'en');
    this._showToast(isEn ? '✨ Revived! Sanity restored to 40%. Darkness lifted!' : '✨ 賢者微光復甦！理智恢復至 40%，毒霧消散！');
  }

  _checkTorchlightState() {
    const torchMask = document.getElementById('torchMask');
    if (this.sanity <= 30 && !this.isReviving) {
      if (torchMask) torchMask.classList.add('active');
      this.audio.startHeartbeat();
    } else {
      if (torchMask) torchMask.classList.remove('active');
      this.audio.stopHeartbeat();
    }
  }

  updateSanityDisplay(healPulse = false) {
    const bar = document.getElementById('sanityBarFill');
    const text = document.getElementById('sanityValue');
    const container = document.getElementById('sanityBar');

    if (bar) {
      bar.style.width = `${this.sanity}%`;
      // 顏色依區間變換
      if (this.sanity <= 30) {
        bar.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
      } else if (this.sanity <= 60) {
        bar.style.background = 'linear-gradient(90deg, #d97706, #f59e0b)';
      } else {
        bar.style.background = 'linear-gradient(90deg, #10b981, #34d399)';
      }
    }

    if (text) text.textContent = `${this.sanity}%`;

    if (healPulse && container) {
      container.classList.remove('sanity-heal-pulse');
      void container.offsetWidth;
      container.classList.add('sanity-heal-pulse');
      setTimeout(() => container.classList.remove('sanity-heal-pulse'), 1000);
    }
  }

  openNotebook(fromFaint = false) {
    const modal = document.getElementById('notebookModal');
    const bodyEl = document.getElementById('notebookBody');
    const current = this.chambers[this.currentChamberIdx];
    const isEn = (this.lang === 'en');

    if (!modal || !current) return;

    let svgHtml = '';
    const d = current.diagramData;
    if (current.diagramType === 'division') {
      svgHtml = this.diagramRenderer.renderLongDivision(d.dividend, d.divisor, d.quotient, d.remainder, false, this.lang);
    } else if (current.diagramType === 'scale') {
      svgHtml = this.diagramRenderer.renderBalanceScale(d.dividend, d.divisor, isEn);
    } else if (current.diagramType === 'beaker') {
      svgHtml = this.diagramRenderer.renderBeakerRemainder(d.totalVol, d.bottleVol, d.bottlesCount, d.remainderVol, this.lang);
    } else if (current.diagramType === 'geometry') {
      svgHtml = this.diagramRenderer.renderGeometryArea(d.base, d.height, d.rectLength, d.rectWidth, this.lang);
    }

    bodyEl.innerHTML = `
      <div class="notebook-content">
        <div class="notebook-header-badge">${current.chapter_ref}</div>
        <h3 class="notebook-title">${isEn ? current.title_en : current.title_zh}</h3>
        <div class="notebook-text">${(isEn ? current.notebook_en : current.notebook_zh).replace(/\n/g, '<br>')}</div>
        <div class="notebook-diagram-container">
          ${svgHtml}
        </div>
      </div>
    `;

    modal.classList.add('active');
  }

  closeNotebook() {
    const modal = document.getElementById('notebookModal');
    if (modal) modal.classList.remove('active');
  }

  toggleTTS() {
    const isEn = (this.lang === 'en');
    const btn = document.getElementById('btnTts');
    const current = this.chambers[this.currentChamberIdx];
    if (!current) return;

    if (this.tts.isPlaying) {
      this.tts.stop();
      this._resetTtsButtonText();
    } else {
      const fullText = isEn 
        ? `${current.story_en}. ${current.question_en}`
        : `${current.story_zh}。${current.question_zh}`;

      this.tts.speak(
        fullText,
        this.lang,
        () => {
          if (btn) btn.innerHTML = `<span>⏹️</span><span>${isEn ? 'Stop' : '停止'}</span>`;
        },
        () => {
          this._resetTtsButtonText();
        }
      );
    }
  }

  _resetTtsButtonText() {
    const btn = document.getElementById('btnTts');
    if (btn) {
      btn.innerHTML = `<span>🔊</span><span>${this.lang === 'en' ? 'Read' : '朗讀'}</span>`;
    }
  }

  toggleLanguage() {
    this.lang = (this.lang === 'zh') ? 'en' : 'zh';
    this.saveProgress();

    // 更新頂部按鈕與標籤
    this.updateTopBarUI();

    // 重新加載當前密室文本與鎖具語言
    if (this.chambers && this.chambers[this.currentChamberIdx]) {
      this.loadChamber(this.currentChamberIdx);
    }
  }

  updateTopBarUI() {
    const isEn = (this.lang === 'en');

    // 語言切換按鈕文字
    const langBtn = document.getElementById('btnLangToggle');
    if (langBtn) {
      langBtn.innerHTML = `<span>🌐</span><span>${isEn ? '中文' : 'English'}</span>`;
    }

    // 登出按鈕
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.innerHTML = `<span>🚪</span><span>${isEn ? 'Logout' : '登出'}</span>`;
    }

    // 筆記按鈕
    const notebookBtn = document.getElementById('btnNotebook');
    if (notebookBtn) {
      notebookBtn.innerHTML = `<span>📖</span><span>${isEn ? 'Notes' : '染血筆記'}</span>`;
    }

    // 學生標籤（只顯示暱稱）
    const playerBadge = document.getElementById('playerBadge');
    if (playerBadge && this.studentInfo) {
      playerBadge.innerHTML = `<span>👤</span><span>${this.studentInfo.nickname}</span>`;
    }

    this._resetTtsButtonText();
  }

  triggerVictory() {
    this.clearProgress();
    this.audio.stopHeartbeat();
    this.audio.playVictory();

    const certModal = document.getElementById('victoryModal');
    if (!certModal) return;

    const totalSeconds = Math.max(1, Math.round((Date.now() - (this.startTime || Date.now())) / 1000));
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    const isEn = (this.lang === 'en');

    // 星級評定
    let stars = '⭐⭐';
    let title = isEn ? 'Composed Alchemical Adept' : '沉著提煉先驅者';
    if (this.sanity >= 80 && this.wrongCount <= 3) {
      stars = '⭐⭐⭐';
      title = isEn ? 'Legendary Philosopher Alchemist' : '賢者之石傳奇煉成師';
    } else if (this.sanity < 50) {
      stars = '⭐';
      title = isEn ? 'Resilient Escape Apprentice' : '破咒生還學徒';
    }

    document.getElementById('certNickname').textContent = this.studentInfo.nickname;
    document.getElementById('certClassSeat').textContent = `${this.studentInfo.classNo} 班 ${this.studentInfo.seatNo} 號`;
    document.getElementById('certTime').textContent = `${mins} 分 ${secs} 秒 (${totalSeconds}s)`;
    document.getElementById('certSanity').textContent = `${this.sanity}%`;
    document.getElementById('certWrong').textContent = `${this.wrongCount} 次`;
    document.getElementById('certStars').textContent = stars;
    document.getElementById('certTitle').textContent = title;

    certModal.classList.add('active');
  }

  logout() {
    this.clearProgress();
    this.studentInfo = null;
    this.audio.stopHeartbeat();
    this.tts.stop();

    const victoryModal = document.getElementById('victoryModal');
    if (victoryModal) victoryModal.classList.remove('active');

    const revivalModal = document.getElementById('revivalModal');
    if (revivalModal) revivalModal.classList.remove('active');

    this.showLoginScreen();
  }

  showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('gameScreen').style.display = 'none';
  }

  showGameScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
  }

  _showToast(msg) {
    const toast = document.getElementById('gameToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.remove('show');
    void toast.offsetWidth;
    toast.classList.add('show');
    setTimeout(() => toast.classList.remove('show'), 2800);
  }
}

// 啟動主入口
window.addEventListener('DOMContentLoaded', () => {
  window.gameController = new GameController();
  window.gameController.init();
});
