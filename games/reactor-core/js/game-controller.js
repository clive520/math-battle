/**
 * game-controller.js - 魔導反應爐逃脫遊戲主控制器
 * 統合防作弊種子題庫、反應爐特效、機關控制台、理智穩定度、雙語切換與通關證書。
 */
class ReactorGameController {
  constructor() {
    this.audio = new ReactorAudio();
    this.tts = new TTSReader();
    this.fx = null;
    this.console = null;
    this.engine = null;

    this.lang = 'zh';
    this.studentInfo = { classNum: '601', seatNum: '01', name: '' };
    this.stability = 100;
    this.currentChamberIdx = 0;
    this.chamberOrder = [];
    this.wrongCount = 0;
    this.chamberMistakes = 0;
    this.startTime = null;
    this.isGameActive = false;

    this.init();
  }

  init() {
    this._bindLoginUI();
    this._bindHeaderUI();
    this._bindModalUI();

    // 初始化語音按鈕狀態監聽
    this.tts.onStateChange = (speaking) => {
      const btn = document.getElementById('tts-toggle-btn');
      if (btn) {
        if (speaking) {
          btn.classList.add('speaking');
          btn.innerHTML = `🔊 ${this.lang === 'zh' ? '停止朗讀' : 'Stop'}`;
        } else {
          btn.classList.remove('speaking');
          btn.innerHTML = `🔊 ${this.lang === 'zh' ? '朗讀題目' : 'Read'}`;
        }
      }
    };
  }

  _bindLoginUI() {
    const classSelect = document.getElementById('login-class');
    const seatDisplay = document.getElementById('seat-display');
    const seatUp = document.getElementById('seat-up');
    const seatDown = document.getElementById('seat-down');
    const nameInput = document.getElementById('student-name');
    const startBtn = document.getElementById('start-btn');

    let currentSeat = 1;

    const updateSeat = () => {
      const formatted = String(currentSeat).padStart(2, '0');
      if (seatDisplay) seatDisplay.textContent = formatted;
      this.studentInfo.seatNum = formatted;
    };

    if (seatUp) {
      seatUp.addEventListener('click', () => {
        currentSeat = currentSeat >= 45 ? 1 : currentSeat + 1;
        updateSeat();
        this.audio.playValveTick();
      });
    }

    if (seatDown) {
      seatDown.addEventListener('click', () => {
        currentSeat = currentSeat <= 1 ? 45 : currentSeat - 1;
        updateSeat();
        this.audio.playValveTick();
      });
    }

    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const nameVal = nameInput ? nameInput.value.trim() : '';
        if (!nameVal) {
          alert(this.lang === 'zh' ? '請輸入艦隊技師姓名！' : 'Please enter your name!');
          nameInput?.focus();
          return;
        }

        this.studentInfo.classNum = classSelect ? classSelect.value : '601';
        this.studentInfo.name = nameVal;
        this.startGame();
      });
    }
  }

  _bindHeaderUI() {
    // 語言切換
    const langBtn = document.getElementById('lang-toggle-btn');
    if (langBtn) {
      langBtn.addEventListener('click', () => {
        this.lang = this.lang === 'zh' ? 'en' : 'zh';
        langBtn.textContent = this.lang === 'zh' ? '🌐 English' : '🌐 中文';
        this.console?.setLang(this.lang);
        this.renderCurrentChamber();
      });
    }

    // 語音朗讀
    const ttsBtn = document.getElementById('tts-toggle-btn');
    if (ttsBtn) {
      ttsBtn.addEventListener('click', () => {
        if (this.tts.isPlaying) {
          this.tts.stop();
        } else {
          const chamber = this.getCurrentChamber();
          if (chamber) {
            const textToRead = this.lang === 'zh' 
              ? `${chamber.story_zh} ${chamber.question_zh}`
              : `${chamber.story_en} ${chamber.question_en}`;
            this.tts.speak(textToRead, this.lang);
          }
        }
      });
    }

    // 音效靜音開關
    const muteBtn = document.getElementById('mute-toggle-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // 工程維修日誌 (學習鷹架)
    const logBtn = document.getElementById('logbook-btn');
    if (logBtn) {
      logBtn.addEventListener('click', () => {
        this.openLogbook();
        this.audio.playClick();
      });
    }

    // 登出/重設
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm(this.lang === 'zh' ? '確定要登出並重設反應爐嗎？' : 'Are you sure you want to exit?')) {
          location.reload();
        }
      });
    }
  }

  _bindModalUI() {
    const modal = document.getElementById('logbook-modal');
    const closeBtn = document.getElementById('close-logbook-btn');
    if (closeBtn && modal) {
      closeBtn.addEventListener('click', () => {
        modal.classList.add('hidden');
        this.audio.playClick();
      });
    }
  }

  startGame() {
    document.getElementById('login-screen')?.classList.add('hidden');
    document.getElementById('game-screen')?.classList.remove('hidden');

    this.isGameActive = true;
    this.startTime = Date.now();
    this.stability = 100;
    this.currentChamberIdx = 0;
    this.wrongCount = 0;
    this.chamberMistakes = 0;

    // 初始化題目引擎
    this.engine = new QuestionEngine(this.studentInfo.classNum, this.studentInfo.seatNum);

    // 洗牌前 9 題，第 10 題維持魔王關
    const head9 = this.engine.rng.shuffle(this.engine.chambers.slice(0, 9));
    this.chamberOrder = [...head9, this.engine.chambers[9]];

    // 初始化特效與控制台
    this.fx = new ReactorFX('reactor-canvas');
    this.console = new ReactorConsole('reactor-console-mount', this.audio, (vals) => this.handleInject(vals));
    this.console.setLang(this.lang);

    // 更新技師標籤
    const userTag = document.getElementById('user-tag');
    if (userTag) {
      userTag.textContent = `👤 ${this.studentInfo.classNum}-${this.studentInfo.seatNum} ${this.studentInfo.name}`;
    }

    this.audio.startAmbientHum();
    this.renderCurrentChamber();
    this.updateStabilityDisplay();
  }

  getCurrentChamber() {
    if (!this.chamberOrder || this.chamberOrder.length === 0) return null;
    return this.chamberOrder[this.currentChamberIdx];
  }

  renderCurrentChamber() {
    const chamber = this.getCurrentChamber();
    if (!chamber) return;

    this.tts.stop();
    this.chamberMistakes = 0;

    const isZh = this.lang === 'zh';
    const chamberNum = this.currentChamberIdx + 1;

    // 更新頂部關卡標題
    const titleEl = document.getElementById('chamber-title');
    const secBadgeEl = document.getElementById('section-badge');
    const storyEl = document.getElementById('chamber-story');
    const questEl = document.getElementById('chamber-question');
    const progEl = document.getElementById('chamber-progress');

    if (titleEl) {
      titleEl.textContent = isZh ? `第 ${chamberNum} 層反應爐：${chamber.title_zh}` : `Level ${chamberNum}: ${chamber.title_en}`;
    }
    if (secBadgeEl) {
      secBadgeEl.textContent = chamber.unitSection;
    }
    if (storyEl) {
      storyEl.textContent = isZh ? chamber.story_zh : chamber.story_en;
    }
    if (questEl) {
      questEl.textContent = isZh ? chamber.question_zh : chamber.question_en;
    }
    if (progEl) {
      progEl.textContent = `${chamberNum} / 10`;
    }

    // 切換控制台模式 (Bypass vs. Fraction)
    this.console.setMode(chamber.type === 'bypass' ? 'bypass' : 'fraction');
    this.fx.setState('normal');
  }

  // 處理拉桿加壓驗證
  handleInject(userInput) {
    const chamber = this.getCurrentChamber();
    if (!chamber) return;

    const isZh = this.lang === 'zh';

    if (chamber.type === 'bypass') {
      // 三向旁路比大小模式
      if (!userInput.value) {
        alert(isZh ? '請先選取三向管路（增壓 / 衡平 / 洩壓）！' : 'Please select a bypass valve first!');
        return;
      }

      if (userInput.value === chamber.target) {
        this.handleSuccess();
      } else {
        this.handleFailure(isZh ? '管路壓力方向錯誤！請檢視除數與 1 的關係！' : 'Incorrect pressure flow! Check divisor vs 1.');
      }
    } else {
      // 分數模式驗證
      const { whole, num, den } = userInput;

      // 計算使用者輸入的十進位數值
      const userValue = whole + (den > 0 ? num / den : 0);
      const targetValue = chamber.target.whole + (chamber.target.den > 0 ? chamber.target.num / chamber.target.den : 0);

      // 檢查數值是否相等
      if (Math.abs(userValue - targetValue) < 0.0001) {
        // 數值相符，進一步檢驗最簡分數規範
        const g = gcd(num, den);
        if (num > 0 && g > 1) {
          // 未約分
          this.audio.playWarningAlarm();
          alert(isZh ? '⚠️ 能量波形含雜質：數值正確，但請將分數「約分成最簡分數」！' : '⚠️ Impure resonance: Please reduce the fraction to simplest form!');
          return;
        }

        if (whole === 0 && num >= den && chamber.target.whole > 0) {
          // 化成帶分數要求
          this.audio.playWarningAlarm();
          alert(isZh ? '⚠️ 能量波形需穩定：請將假分數化為「帶分數」（填入整數盤）！' : '⚠️ Please convert improper fraction into a mixed number!');
          return;
        }

        // 完全正確
        this.handleSuccess();
      } else {
        this.handleFailure(isZh ? '加壓注入失敗：能量比率不平衡，請重新核算！' : 'Injection failed: Energy imbalance. Recalculate!');
      }
    }
  }

  handleSuccess() {
    this.audio.playUnlockSuccess();
    this.audio.playSteamRelease(1.2);
    this.fx.triggerVictoryWave();
    this.fx.triggerSteamBlast();
    this.fx.setState('stabilized');

    // 依據本關失誤次數恢復理智值 (SOP 第四階段)
    let healAmount = 10;
    if (this.chamberMistakes === 0) {
      healAmount = 25; // 0次失誤獎勵
    } else if (this.chamberMistakes === 1) {
      healAmount = 15;
    }
    this.stability = Math.min(100, this.stability + healAmount);
    this.updateStabilityDisplay();

    // 提示反饋
    const questEl = document.getElementById('chamber-question');
    if (questEl) {
      questEl.innerHTML = `<span style="color:#30d158; font-weight:bold;">⚡ ${this.lang === 'zh' ? '加壓成功！核心共振鎖定！' : 'INJECTION SUCCESS! RESONANCE LOCKED!'}</span>`;
    }

    setTimeout(() => {
      if (this.currentChamberIdx >= 9) {
        this.showVictoryCertificate();
      } else {
        this.currentChamberIdx++;
        this.renderCurrentChamber();
      }
    }, 1800);
  }

  handleFailure(message) {
    this.wrongCount++;
    this.chamberMistakes++;
    this.audio.playWarningAlarm();
    this.fx.triggerSparks();
    this.fx.setState('warning');

    // 扣除理智值 15%
    this.stability = Math.max(0, this.stability - 15);
    this.updateStabilityDisplay();

    // 震動回饋
    const container = document.querySelector('.reactor-main-layout');
    if (container) {
      container.classList.add('screen-shake');
      setTimeout(() => container.classList.remove('screen-shake'), 450);
    }

    // 警報狀態檢測 (<= 30%)
    if (this.stability <= 30 && this.stability > 0) {
      this.audio.startHeartbeat(115);
      this.fx.setState('critical');
    }

    // 昏厥崩潰檢測 (== 0%)
    if (this.stability === 0) {
      setTimeout(() => {
        alert(this.lang === 'zh' ? '⚠️ 爐心即將熔毀！緊急冷卻閥啟動，請翻閱工程手冊研讀！' : '⚠️ Emergency cooling engaged! Open logbook to study!');
        this.stability = 40; // 復甦至 40% (解除黑霧警報)
        this.audio.stopHeartbeat();
        this.updateStabilityDisplay();
        this.openLogbook();
      }, 500);
    } else {
      alert(message);
    }
  }

  updateStabilityDisplay() {
    const bar = document.getElementById('stability-bar');
    const valText = document.getElementById('stability-val');
    if (bar) {
      bar.style.width = `${this.stability}%`;
      if (this.stability <= 30) {
        bar.className = 'progress-fill critical';
      } else if (this.stability <= 60) {
        bar.className = 'progress-fill warning';
      } else {
        bar.className = 'progress-fill normal';
      }
    }
    if (valText) {
      valText.textContent = `${this.stability}%`;
    }
    this.fx?.setPressure(100 - this.stability * 0.5);
  }

  openLogbook() {
    const modal = document.getElementById('logbook-modal');
    const content = document.getElementById('logbook-content');
    const chamber = this.getCurrentChamber();
    if (!modal || !content || !chamber) return;

    const isZh = this.lang === 'zh';
    const hints = isZh ? chamber.hint_zh : chamber.hint_en;

    // 渲染動態 SVG 鷹架圖解
    const svgHtml = DiagramRenderer.render(chamber.diagramType, chamber.diagramData, this.lang);

    content.innerHTML = `
      <div class="logbook-section">
        <h3>📘 ${isZh ? '工程維修手冊・解題思考步驟' : 'Field Manual & Scaffolding'}</h3>
        <p class="scaffold-desc">${isZh ? '提示指引只提供觀念與思考架構，請在草稿紙上動手演算！' : 'Hints provide concept structure only. Perform calculations on paper!'}</p>
        
        <div class="svg-diagram-container">
          ${svgHtml}
        </div>

        <ul class="hint-list">
          ${hints.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  showVictoryCertificate() {
    this.audio.stopAmbientHum();
    this.audio.stopHeartbeat();
    this.tts.stop();

    const elapsedMs = Date.now() - (this.startTime || Date.now());
    const totalSecs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const timeFormatted = `${mins} 分 ${secs} 秒`;

    // 星級評定
    let stars = '⭐⭐⭐';
    let titleZh = '傳奇魔導技師大師';
    let titleEn = 'Legendary Aether Engineer';

    if (this.stability < 50 || this.wrongCount > 6) {
      stars = '⭐';
      titleZh = '歷劫生還操作員';
      titleEn = 'Core Meltdown Survivor';
    } else if (this.stability < 80 || this.wrongCount > 3) {
      stars = '⭐⭐';
      titleZh = '沉著冷卻專家';
      titleEn = 'Calm Coolant Specialist';
    }

    const certModal = document.getElementById('cert-modal');
    const certBody = document.getElementById('cert-body');
    const isZh = this.lang === 'zh';

    if (certBody && certModal) {
      certBody.innerHTML = `
        <div class="certificate-paper">
          <div class="cert-border">
            <h1 class="cert-title">⚡ ${isZh ? '反應爐超載解除榮譽證書' : 'AETHER CORE STABILIZATION CERTIFICATE'}</h1>
            <div class="cert-stars">${stars}</div>
            <div class="cert-recipient">
              ${isZh ? '茲證明技師' : 'Awarded to Engineer'}
              <span class="cert-name">${this.studentInfo.classNum} 班 ${this.studentInfo.seatNum} 號 ${this.studentInfo.name}</span>
            </div>
            <p class="cert-text">
              ${isZh ? `成功解除魔導反應爐全 10 層過載危機，完全掌握康軒六上第二單元《分數除法》核心運算！榮獲封號：【${titleZh}】` : `Successfully stabilized all 10 layers of the reactor core! Title: [${titleEn}]`}
            </p>
            <div class="cert-stats">
              <div class="stat-pill">⏱️ ${isZh ? '總耗時' : 'Time'}: ${timeFormatted}</div>
              <div class="stat-pill">💖 ${isZh ? '剩餘爐心穩定度' : 'Stability'}: ${this.stability}%</div>
              <div class="stat-pill">⚠️ ${isZh ? '總失誤次數' : 'Mistakes'}: ${this.wrongCount}</div>
            </div>
            <div class="cert-footer">
              <span>🏛️ 康軒國小六上數學研究組</span>
              <span>📅 ${new Date().toLocaleDateString()}</span>
            </div>
          </div>
        </div>
        <div class="cert-actions">
          <button type="button" class="btn" onclick="window.print()">🖨️ ${isZh ? '列印證書' : 'Print'}</button>
          <button type="button" class="btn" onclick="location.reload()">🔄 ${isZh ? '再次挑戰' : 'Replay'}</button>
          <button type="button" class="btn primary" onclick="location.href='../../index.html'">🏠 ${isZh ? '返回學習大廳' : 'Lobby'}</button>
        </div>
      `;
      certModal.classList.remove('hidden');
    }
  }
}

// 頁面載入時實例化
window.addEventListener('DOMContentLoaded', () => {
  window.gameController = new ReactorGameController();
});
