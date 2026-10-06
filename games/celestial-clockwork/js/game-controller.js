/**
 * 遊戲主控制器 (ClockworkGameController)
 * 負責全域狀態流轉、理智值懲戒與恢復、手電筒暗黑遮罩、微光復甦、雙語切換與通關結算
 */
class ClockworkGameController {
  constructor() {
    this.audio = new ClockworkAudioManager();
    this.tts = new ClockworkTtsReader();
    this.renderer = new ClockworkDiagramRenderer();
    this.fx = null;
    this.lock = null;
    this.questionEngine = null;

    // 遊戲狀態
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

    this.STORAGE_KEY = 'celestial_clockwork_save_v1';
  }

  init() {
    this.fx = new ClockworkFx('clockworkCanvas', 'torchMask');
    this.lock = new ClockworkLockSystem(
      document.getElementById('lockMount'),
      (isCorrect, code) => this.handleUnlockAttempt(isCorrect, code),
      this.audio
    );

    this._bindGlobalEvents();
    this._checkSavedProgress();
  }

  _bindGlobalEvents() {
    // 登入表單
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

    // 登出
    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        this.logout();
      });
    }

    // 昏厥甦醒確認按鈕
    const reviveBtn = document.getElementById('btnReviveConfirm');
    if (reviveBtn) {
      reviveBtn.addEventListener('click', () => {
        this.confirmRevival();
      });
    }

    // 證書按鈕
    const printBtn = document.getElementById('btnCertPrint');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }

    const restartBtn = document.getElementById('btnCertRestart');
    if (restartBtn) {
      restartBtn.addEventListener('click', () => {
        this.logout();
      });
    }
  }

  _checkSavedProgress() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data && data.studentInfo && Array.isArray(data.chamberOrder)) {
          this.studentInfo = data.studentInfo;
          this.sanity = data.sanity !== undefined ? data.sanity : 100;
          this.currentChamberIdx = data.currentChamberIdx || 0;
          this.wrongCount = data.wrongCount || 0;
          this.chamberWrongCount = data.chamberWrongCount || 0;
          this.startTime = data.startTime || Date.now();
          this.chamberOrder = data.chamberOrder;
          this.lang = data.lang || 'zh';

          const seed = `${this.studentInfo.classVal}-${this.studentInfo.seatVal}`;
          this.questionEngine = new ClockworkQuestionEngine(seed);
          this.chambers = this.questionEngine.generateAllChambers(this.chamberOrder);

          this.showGameScreen();
          this.loadChamber(this.currentChamberIdx);
          this.showToast(this.lang === 'en' ? 'Progress restored!' : '已恢復先前挑戰進度！');
        }
      }
    } catch (e) {
      console.warn('Failed to restore progress', e);
      localStorage.removeItem(this.STORAGE_KEY);
    }
  }

  _saveProgress() {
    if (!this.studentInfo) return;
    const data = {
      studentInfo: this.studentInfo,
      sanity: this.sanity,
      currentChamberIdx: this.currentChamberIdx,
      wrongCount: this.wrongCount,
      chamberWrongCount: this.chamberWrongCount,
      startTime: this.startTime,
      chamberOrder: this.chambers.map(c => c.id),
      lang: this.lang
    };
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(data));
    } catch (e) {
      console.warn('Save failed', e);
    }
  }

  startNewGame() {
    const classVal = document.getElementById('inputClass').value;
    const seatVal = document.getElementById('inputSeat').value;
    const nickname = document.getElementById('inputNickname').value.trim() || '探險者';

    this.audio.init();

    this.studentInfo = { classVal, seatVal, nickname };
    this.sanity = 100;
    this.wrongCount = 0;
    this.chamberWrongCount = 0;
    this.currentChamberIdx = 0;
    this.startTime = Date.now();

    const seed = `${classVal}-${seatVal}`;
    this.questionEngine = new ClockworkQuestionEngine(seed);
    this.chambers = this.questionEngine.generateAllChambers();
    this.chamberOrder = this.chambers.map(c => c.id);

    this.showGameScreen();
    this.loadChamber(0);
    this._saveProgress();
  }

  showGameScreen() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('gameScreen').style.display = 'flex';
    document.getElementById('playerBadgeName').textContent = this.studentInfo.nickname;
  }

  loadChamber(idx) {
    if (idx < 0 || idx >= this.chambers.length) return;
    this.currentChamberIdx = idx;
    this.chamberWrongCount = 0;

    const chamber = this.chambers[idx];
    const isEn = (this.lang === 'en');

    // 更新標題與進度標籤
    document.getElementById('chamberTitle').textContent = chamber.getTitle(this.lang);
    document.getElementById('chamberBadge').textContent = isEn 
      ? `Chamber ${chamber.stageIndex} / 10` 
      : `關卡 ${chamber.stageIndex} / 10`;

    document.getElementById('storyContent').textContent = chamber.getLore(this.lang);
    document.getElementById('questionContent').textContent = chamber.getTargetQuestion(this.lang);

    // 設定實體鎖
    this.lock.setup(chamber.answerCode, this.lang);

    // 更新理智條
    this.updateSanityDisplay();

    // 檢查手電筒與心跳狀態
    this.checkSanityEffects();

    // 若正在播放語音則停止
    this.tts.stop();
    this._updateTtsBtnState(false);
  }

  handleUnlockAttempt(isCorrect, enteredCode) {
    if (isCorrect) {
      // 計算回血加成
      let recovery = 10;
      if (this.chamberWrongCount === 0) recovery = 25;
      else if (this.chamberWrongCount === 1) recovery = 15;

      const oldSanity = this.sanity;
      this.sanity = Math.min(100, this.sanity + recovery);

      // 若從瀕危回升
      if (oldSanity <= 30 && this.sanity > 30) {
        this.showToast(this.lang === 'en' ? '☀️ Light restored! Darkness dispelled.' : '☀️ 驅散黑霧，視野重見光明！');
      }

      this.updateSanityDisplay(true);

      // 觸發星門開門過場特效
      this.fx.triggerDoorOpen(() => {
        if (this.currentChamberIdx + 1 >= this.chambers.length) {
          // 通關脫出！
          this.triggerVictory();
        } else {
          this.loadChamber(this.currentChamberIdx + 1);
          this._saveProgress();
          this.showToast(this.lang === 'en' ? '✨ Mechanism unlocked! Advancing...' : '✨ 機關破譯成功！進入下一密室...');
        }
      });
    } else {
      // 答錯懲罰
      this.wrongCount++;
      this.chamberWrongCount++;
      this.sanity = Math.max(0, this.sanity - 15);

      this.fx.triggerScreenShake();
      this.updateSanityDisplay();
      this.checkSanityEffects();

      this.showToast(this.lang === 'en' ? '❌ Incorrect code! Sanity -15%!' : '❌ 符印錯誤！齒輪逆轉，理智值扣除 15%！');
      this._saveProgress();

      if (this.sanity === 0) {
        this.triggerCollapse();
      }
    }
  }

  updateSanityDisplay(isHeal = false) {
    const bar = document.getElementById('sanityBarFill');
    const val = document.getElementById('sanityValue');

    if (bar && val) {
      bar.style.width = `${this.sanity}%`;
      val.textContent = `${this.sanity}%`;

      if (this.sanity <= 30) {
        bar.style.background = 'linear-gradient(90deg, #dc2626, #ef4444)';
        val.style.color = '#fca5a5';
      } else if (this.sanity <= 60) {
        bar.style.background = 'linear-gradient(90deg, #d97706, #f59e0b)';
        val.style.color = '#fde68a';
      } else {
        bar.style.background = 'linear-gradient(90deg, #059669, #10b981)';
        val.style.color = '#6ee7b7';
      }

      if (isHeal) {
        bar.parentElement.classList.add('sanity-heal-pulse');
        setTimeout(() => bar.parentElement.classList.remove('sanity-heal-pulse'), 800);
      }
    }
  }

  checkSanityEffects() {
    const torchMask = document.getElementById('torchMask');
    if (this.sanity <= 30 && this.sanity > 0) {
      if (torchMask) torchMask.classList.add('active');
      this.audio.startHeartbeat(115);
    } else {
      if (torchMask) torchMask.classList.remove('active');
      this.audio.stopHeartbeat();
    }
  }

  triggerCollapse() {
    this.audio.stopHeartbeat();
    this.tts.stop();
    const revivalModal = document.getElementById('revivalModal');
    if (revivalModal) {
      revivalModal.classList.add('active');
    }
  }

  confirmRevival() {
    const revivalModal = document.getElementById('revivalModal');
    if (revivalModal) {
      revivalModal.classList.remove('active');
    }

    // 回升至 40% (解除黑霧)
    this.sanity = 40;
    this.updateSanityDisplay(true);
    this.checkSanityEffects();
    this._saveProgress();

    // 強制打開筆記本研讀
    this.openNotebook();
    this.showToast(this.lang === 'en' ? '✨ Sanity restored to 40%. Study the notes!' : '✨ 領悟法則！理智回升至 40%，請研讀筆記！');
  }

  openNotebook() {
    const chamber = this.chambers[this.currentChamberIdx];
    if (!chamber) return;

    const isEn = (this.lang === 'en');
    const modal = document.getElementById('notebookModal');
    const body = document.getElementById('notebookBody');

    const hints = chamber.getHints(this.lang);
    const diagramHtml = this.renderer.render(chamber.diagramType, chamber.diagramData, this.lang);

    body.innerHTML = `
      <div class="notebook-sheet">
        <div class="notebook-header">
          <span class="notebook-tag">${isEn ? '📖 ANCIENT ASTRONOMER\'S LOG' : '📖 古代星象祭司之手記'}</span>
          <h2 class="notebook-title">${chamber.getTitle(this.lang)}</h2>
          <p class="notebook-concept">✦ ${chamber.getConcept(this.lang)}</p>
        </div>

        <div class="notebook-diagram-section">
          ${diagramHtml}
        </div>

        <div class="notebook-hints-section">
          <h3 class="hints-heading">${isEn ? '💡 Reasoning Guidance & Traps' : '💡 解題思維鷹架與避坑要點'}</h3>
          <ul class="hints-list">
            ${hints.map(h => `<li>${h}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;

    if (modal) modal.classList.add('active');
  }

  closeNotebook() {
    const modal = document.getElementById('notebookModal');
    if (modal) modal.classList.remove('active');
  }

  toggleTTS() {
    const chamber = this.chambers[this.currentChamberIdx];
    if (!chamber) return;

    if (this.tts.isPlaying) {
      this.tts.stop();
      this._updateTtsBtnState(false);
    } else {
      const text = `${chamber.getLore(this.lang)} ${chamber.getTargetQuestion(this.lang)}`;
      this._updateTtsBtnState(true);
      this.tts.speak(text, this.lang, () => {
        this._updateTtsBtnState(false);
      });
    }
  }

  _updateTtsBtnState(isPlaying) {
    const btn = document.getElementById('btnTts');
    if (!btn) return;
    const isEn = (this.lang === 'en');
    if (isPlaying) {
      btn.innerHTML = `<span>⏹️</span><span>${isEn ? 'Stop' : '停止'}</span>`;
      btn.classList.add('tts-active');
    } else {
      btn.innerHTML = `<span>🔊</span><span>${isEn ? 'Read' : '朗讀'}</span>`;
      btn.classList.remove('tts-active');
    }
  }

  toggleLanguage() {
    this.lang = (this.lang === 'zh') ? 'en' : 'zh';
    const isEn = (this.lang === 'en');

    const langBtn = document.getElementById('btnLangToggle');
    if (langBtn) {
      langBtn.innerHTML = `<span>🌐</span><span>${isEn ? '中文' : 'English'}</span>`;
    }

    const nbBtn = document.getElementById('btnNotebook');
    if (nbBtn) {
      nbBtn.innerHTML = `<span>📖</span><span>${isEn ? 'Notes' : '考古筆記'}</span>`;
    }

    const logoutBtn = document.getElementById('btnLogout');
    if (logoutBtn) {
      logoutBtn.innerHTML = `<span>🚪</span><span>${isEn ? 'Logout' : '登出'}</span>`;
    }

    this._updateTtsBtnState(this.tts.isPlaying);
    this.loadChamber(this.currentChamberIdx);
    this._saveProgress();
  }

  triggerVictory() {
    this.audio.stopHeartbeat();
    this.tts.stop();
    this.audio.playVictoryFanfare();

    const isEn = (this.lang === 'en');
    const elapsedSec = Math.floor((Date.now() - this.startTime) / 1000);
    const mm = String(Math.floor(elapsedSec / 60)).padStart(2, '0');
    const ss = String(elapsedSec % 60).padStart(2, '0');

    let stars = '⭐⭐⭐';
    let honorTitle = isEn ? 'Legendary Stargate Grandmaster' : '傳奇星門破密大師';

    if (this.sanity >= 80 && this.wrongCount <= 3) {
      stars = '⭐⭐⭐';
      honorTitle = isEn ? 'Legendary Stargate Grandmaster' : '傳奇星門破密大師';
    } else if (this.sanity >= 50) {
      stars = '⭐⭐';
      honorTitle = isEn ? 'Steadfast Prime Guardian' : '沉著質源守護者';
    } else {
      stars = '⭐';
      honorTitle = isEn ? 'Resilient Relic Survivor' : '歷劫生還探險者';
    }

    document.getElementById('certStars').textContent = stars;
    document.getElementById('certHonorTitle').textContent = honorTitle;
    document.getElementById('certNickname').textContent = this.studentInfo.nickname;
    document.getElementById('certClassSeat').textContent = `${this.studentInfo.classVal} 班 ${this.studentInfo.seatVal} 號`;
    document.getElementById('certTime').textContent = isEn ? `${mm}m ${ss}s` : `${mm} 分 ${ss} 秒`;
    document.getElementById('certSanity').textContent = `${this.sanity}%`;
    document.getElementById('certWrong').textContent = isEn ? `${this.wrongCount} times` : `${this.wrongCount} 次`;

    const victoryModal = document.getElementById('victoryModal');
    if (victoryModal) victoryModal.classList.add('active');

    // 清除已完成儲存
    localStorage.removeItem(this.STORAGE_KEY);
  }

  logout() {
    this.audio.stopHeartbeat();
    this.tts.stop();
    localStorage.removeItem(this.STORAGE_KEY);
    window.location.reload();
  }

  showToast(msg) {
    const toast = document.getElementById('gameToast');
    if (!toast) return;
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(() => {
      toast.classList.remove('show');
    }, 2500);
  }
}

// 實例化並啟動
document.addEventListener('DOMContentLoaded', () => {
  window.clockworkGame = new ClockworkGameController();
  window.clockworkGame.init();
});
