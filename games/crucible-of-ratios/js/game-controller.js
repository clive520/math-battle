/**
 * game-controller.js - 元素調和秘境核心遊戲狀態機與流程控制器
 * 整合 PRNG 題庫引擎、音效、理智值、雙軌控制台、動態 SVG 鷹架與結算證書。
 */
class CrucibleGameController {
  constructor() {
    this.audio = new AudioManager();
    this.tts = new TTSReader();
    this.fx = null;
    this.console = null;
    this.engine = null;

    this.lang = 'zh';
    this.studentInfo = {
      classNum: '601',
      seatNum: '01',
      name: ''
    };

    this.isGameActive = false;
    this.startTime = null;
    this.stability = 100;
    this.currentChamberIdx = 0;
    this.chamberOrder = [];
    this.wrongCount = 0;
    this.chamberMistakes = 0;

    this._init();
  }

  _init() {
    this._bindLoginUI();
    this._bindHeaderUI();
    this._bindModalUI();
    this._restoreSavedProfile();
  }

  _restoreSavedProfile() {
    try {
      const saved = localStorage.getItem('math_student_profile');
      if (saved) {
        const data = JSON.parse(saved);
        if (data.classNum) {
          const classSelect = document.getElementById('student-class');
          if (classSelect) classSelect.value = data.classNum;
          this.studentInfo.classNum = data.classNum;
        }
        if (data.seatNum) {
          this.studentInfo.seatNum = data.seatNum.toString().padStart(2, '0');
          const seatDisp = document.getElementById('seat-display');
          if (seatDisp) seatDisp.textContent = this.studentInfo.seatNum;
        }
        if (data.name) {
          const nameInput = document.getElementById('student-name');
          if (nameInput) nameInput.value = data.name;
          this.studentInfo.name = data.name;
        }
      }
    } catch (e) {}
  }

  _bindLoginUI() {
    // 1. 座號箭頭步進按鈕 (嚴禁文字隨意輸入)
    let currentSeat = parseInt(this.studentInfo.seatNum, 10) || 1;
    const seatDisplay = document.getElementById('seat-display');
    const seatUpBtn = document.getElementById('seat-up');
    const seatDownBtn = document.getElementById('seat-down');

    const updateSeat = (val) => {
      currentSeat = Math.max(1, Math.min(45, val));
      this.studentInfo.seatNum = currentSeat.toString().padStart(2, '0');
      if (seatDisplay) seatDisplay.textContent = this.studentInfo.seatNum;
      this.audio.playClick();
    };

    if (seatUpBtn) seatUpBtn.addEventListener('click', () => updateSeat(currentSeat + 1));
    if (seatDownBtn) seatDownBtn.addEventListener('click', () => updateSeat(currentSeat - 1));

    // 2. 開始遊戲按鈕
    const startBtn = document.getElementById('start-btn');
    if (startBtn) {
      startBtn.addEventListener('click', () => {
        const nameInput = document.getElementById('student-name');
        const classSelect = document.getElementById('student-class');
        const nameVal = nameInput ? nameInput.value.trim() : '';

        if (!nameVal) {
          alert(this.lang === 'zh' ? '請先輸入調和師姓名！' : 'Please enter your name!');
          nameInput?.focus();
          return;
        }

        this.studentInfo.classNum = classSelect ? classSelect.value : '601';
        this.studentInfo.name = nameVal;

        // 持久化儲存
        try {
          localStorage.setItem('math_student_profile', JSON.stringify({
            classNum: this.studentInfo.classNum,
            seatNum: this.studentInfo.seatNum,
            name: this.studentInfo.name
          }));
        } catch (e) {}

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
            const textToRead = this.lang === 'zh' ? chamber.story_zh : chamber.story_en;
            this.tts.speak(textToRead, this.lang);
          }
        }
      });
    }

    // 音效靜音
    const muteBtn = document.getElementById('mute-toggle-btn');
    if (muteBtn) {
      muteBtn.addEventListener('click', () => {
        const isMuted = this.audio.toggleMute();
        muteBtn.textContent = isMuted ? '🔇' : '🔊';
      });
    }

    // 學習鷹架手冊
    const logBtn = document.getElementById('logbook-btn');
    if (logBtn) {
      logBtn.addEventListener('click', () => {
        this.openLogbook();
        this.audio.playClick();
      });
    }

    // 登出/重整
    const logoutBtn = document.getElementById('logout-btn');
    if (logoutBtn) {
      logoutBtn.addEventListener('click', () => {
        if (confirm(this.lang === 'zh' ? '確定要離開調和神殿嗎？' : 'Are you sure you want to exit?')) {
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
    // 切換至遊戲主畫面
    const loginScreen = document.getElementById('login-screen');
    const gameScreen = document.getElementById('game-screen');
    if (loginScreen) loginScreen.classList.add('hidden');
    if (gameScreen) gameScreen.classList.remove('hidden');

    // 置頂跳轉
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    this.isGameActive = true;
    this.startTime = Date.now();
    this.stability = 100;
    this.currentChamberIdx = 0;
    this.wrongCount = 0;
    this.chamberMistakes = 0;

    // 初始化題庫引擎
    this.engine = new QuestionEngine(this.studentInfo.classNum, this.studentInfo.seatNum);

    // 洗牌前 9 題，第 10 題為固定魔王關
    const head9 = this.engine.rng.shuffle(this.engine.chambers.slice(0, 9));
    this.chamberOrder = [...head9, this.engine.chambers[9]];

    // 初始化特效與控制台
    this.fx = new CrucibleFX('crucible-canvas');
    this.console = new RatioConsole('crucible-console-mount', this.audio, (vals) => this.handleHarmonize(vals));
    this.console.setLang(this.lang);

    // 顯示調和師標籤
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

    // 雙重保證置頂
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    this.tts.stop();
    this.chamberMistakes = 0;

    const isZh = this.lang === 'zh';
    const chamberNum = this.currentChamberIdx + 1;

    // 標題與情境
    const titleEl = document.getElementById('chamber-title');
    const secBadgeEl = document.getElementById('section-badge');
    const storyEl = document.getElementById('chamber-story');
    const progEl = document.getElementById('chamber-progress');

    if (titleEl) {
      titleEl.textContent = isZh ? `第 ${chamberNum} 層神殿：${chamber.title_zh}` : `Level ${chamberNum}: ${chamber.title_en}`;
    }
    if (secBadgeEl) {
      secBadgeEl.textContent = chamber.unitSection;
    }
    if (storyEl) {
      const rawStory = isZh ? chamber.story_zh : chamber.story_en;
      storyEl.innerHTML = typeof MathFormatter !== 'undefined' ? MathFormatter.formatText(rawStory, this.lang) : rawStory;
    }
    if (progEl) {
      progEl.textContent = `${chamberNum} / 10`;
    }

    // 重設狀態標籤
    const coreStatus = document.getElementById('core-status-tag');
    if (coreStatus) {
      coreStatus.textContent = 'HARMONY ACTIVE';
      coreStatus.style.borderColor = '';
      coreStatus.style.color = '';
    }

    // 切換控制台模式
    this.console.setMode(chamber.consoleMode, { defaultVal: 1 });
    this.fx.setState('normal');
  }

  // 驗證拉桿調和
  handleHarmonize(userInput) {
    const chamber = this.getCurrentChamber();
    if (!chamber) return;

    const isZh = this.lang === 'zh';

    if (chamber.consoleMode === 'ratio') {
      const { ante, cons } = userInput;
      const target = chamber.target;

      // 迷思陷阱 1：前後項完全顛倒
      if (ante === target.cons && cons === target.ante && ante !== cons) {
        this.audio.playWarningAlarm();
        alert(isZh ? '⚠️ 前後項次序顛倒了！請注意題目問的是「誰比誰」，前項在左、後項在右！' : '⚠️ Antecedent and consequent are reversed! Check which term comes first!');
        this.handleFailure();
        return;
      }

      // 迷思陷阱 2：數值等值，但尚未化為最簡整數比 (針對 B5, B6)
      if (chamber.id === 'chamber_5' || chamber.id === 'chamber_6') {
        if ((ante / cons) === (target.ante / target.cons) && (ante !== target.ante || cons !== target.cons)) {
          this.audio.playWarningAlarm();
          alert(isZh ? '⚠️ 比例正確，但尚未化為「最簡整數比」（前後項必須互質，公因數只有1）！' : '⚠️ Ratio is equivalent, but not yet reduced to simplest integer ratio (coprime)!');
          this.handleFailure();
          return;
        }
      }

      if (ante === target.ante && cons === target.cons) {
        this.handleSuccess();
      } else {
        this.handleFailure(isZh ? '調和失敗：元素比例失衡，請重新演算！' : 'Harmonization failed: Ratio mismatch. Recalculate!');
      }
    } else if (chamber.consoleMode === 'fraction') {
      const { whole, num, den } = userInput;
      const target = chamber.target;

      // 檢查是否相等
      const userTotalNumerator = whole * den + num;
      const targetTotalNumerator = target.whole * target.den + target.num;

      if ((userTotalNumerator / den) === (targetTotalNumerator / target.den)) {
        // 約分檢查
        if (num > 0 && gcd(num, den) > 1) {
          this.audio.playWarningAlarm();
          alert(isZh ? '⚠️ 數值正確，但分數部分請約分成「最簡分數」！' : '⚠️ Please reduce fraction to simplest terms!');
          return;
        }
        this.handleSuccess();
      } else {
        this.handleFailure(isZh ? '校準失敗：比值不符，請重新除算！' : 'Calibration failed: Incorrect ratio value!');
      }
    } else if (chamber.consoleMode === 'single_val') {
      const { value } = userInput;
      if (Math.abs(value - chamber.target) < 0.001) {
        this.handleSuccess();
      } else {
        this.handleFailure(isZh ? '注入失敗：數值偏離平衡點，請重新推理！' : 'Injection failed: Target value mismatch!');
      }
    } else if (chamber.consoleMode === 'select_pipe') {
      const { selectedPipe } = userInput;
      if (!selectedPipe) {
        alert(isZh ? '請先選取一條能量管路！' : 'Please select a conduit first!');
        return;
      }
      if (selectedPipe === chamber.target) {
        this.handleSuccess();
      } else {
        this.handleFailure(isZh ? '導通失敗：該管路非相等的比，請比較比值！' : 'Conduit failed: Non-equivalent ratio!');
      }
    } else if (chamber.consoleMode === 'rate_comparison') {
      const { fraction, best } = userInput;
      const target = chamber.target;

      const userTotalNumerator = fraction.whole * fraction.den + fraction.num;
      const targetTotalNumerator = target.fraction.whole * target.fraction.den + target.fraction.num;

      const fracMatch = Math.abs((userTotalNumerator / fraction.den) - (targetTotalNumerator / target.fraction.den)) < 0.001;
      const choiceMatch = (best === target.best);

      if (fracMatch && choiceMatch) {
        this.handleSuccess();
      } else if (!choiceMatch) {
        this.handleFailure(isZh ? '評估錯誤：請比較每 1 靈石哪瓶買到更多容量！' : 'Incorrect best choice: Compare volume per MP!');
      } else {
        this.handleFailure(isZh ? '比值計算錯誤：請用甲瓶容量 ÷ 甲瓶花費！' : 'Incorrect unit rate calculation!');
      }
    }
  }

  handleSuccess() {
    this.audio.playUnlockSuccess();
    this.fx.triggerVictoryWave();
    this.fx.setState('stabilized');

    // 依據失誤次數回補理智值
    let heal = 10;
    if (this.chamberMistakes === 0) heal = 25;
    else if (this.chamberMistakes === 1) heal = 15;

    this.stability = Math.min(100, this.stability + heal);
    this.updateStabilityDisplay();

    const coreStatus = document.getElementById('core-status-tag');
    if (coreStatus) {
      coreStatus.textContent = this.lang === 'zh' ? '✨ 調和成功！共鳴鎖定' : '✨ HARMONY STABILIZED! LOCKED';
      coreStatus.style.borderColor = 'var(--safe-green)';
      coreStatus.style.color = 'var(--safe-green)';
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

    this.stability = Math.max(0, this.stability - 15);
    this.updateStabilityDisplay();

    const app = document.getElementById('game-screen');
    if (app) {
      app.classList.add('screen-shake');
      setTimeout(() => app.classList.remove('screen-shake'), 450);
    }

    if (this.stability <= 0) {
      alert(this.lang === 'zh' ? '⚠️ 理智值歸零！神殿元素紊亂，啟動緊急復甦儀式！' : '⚠️ Sanity depleted! Emergency recovery active!');
      this.stability = 40;
      this.updateStabilityDisplay();
      this.openLogbook();
      return;
    }

    if (message) {
      setTimeout(() => alert(message), 80);
    }
  }

  updateStabilityDisplay() {
    const valEl = document.getElementById('stability-val');
    const barEl = document.getElementById('stability-bar');
    if (valEl) valEl.textContent = `${this.stability}%`;
    if (barEl) {
      barEl.style.width = `${this.stability}%`;
      barEl.className = 'progress-fill ' + (this.stability > 60 ? 'normal' : (this.stability > 25 ? 'warning' : 'critical'));
    }
  }

  openLogbook() {
    const modal = document.getElementById('logbook-modal');
    const content = document.getElementById('logbook-content');
    const chamber = this.getCurrentChamber();
    if (!modal || !content || !chamber) return;

    const isZh = this.lang === 'zh';
    const hints = isZh ? chamber.hint_zh : chamber.hint_en;
    const svgHtml = DiagramRenderer.render(chamber.diagramType, chamber.diagramData, this.lang);

    content.innerHTML = `
      <div class="logbook-section">
        <h3>📘 ${isZh ? '調和聖典・思考鷹架與幾何引導' : 'Sacred Tome & Conceptual Scaffolding'}</h3>
        <p class="scaffold-desc">${isZh ? '提示手冊僅提供觀念架構與思考步驟，嚴禁抄襲答案，請動手演算！' : 'Hints provide concept structure only. Perform calculations on paper!'}</p>
        
        <div class="svg-diagram-container">
          ${svgHtml}
        </div>

        <ul class="hint-list">
          ${hints.map(h => `<li>${typeof MathFormatter !== 'undefined' ? MathFormatter.formatText(h, this.lang) : h}</li>`).join('')}
        </ul>
      </div>
    `;

    modal.classList.remove('hidden');
  }

  showVictoryCertificate() {
    this.audio.stopAmbientHum();
    this.tts.stop();

    const elapsedMs = Date.now() - (this.startTime || Date.now());
    const totalSecs = Math.floor(elapsedMs / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    const timeFormatted = `${mins} 分 ${secs} 秒`;

    let stars = '⭐⭐⭐';
    let titleZh = '皇家黃金比例大調和師';
    let titleEn = 'Grand Royal Harmonizer';

    if (this.stability < 50 || this.wrongCount > 6) {
      stars = '⭐';
      titleZh = '神殿歷劫調和學徒';
      titleEn = 'Novice Ratio Survivor';
    } else if (this.stability < 80 || this.wrongCount > 3) {
      stars = '⭐⭐';
      titleZh = '純熟比例鍊金術士';
      titleEn = 'Adept Alchemist';
    }

    const certModal = document.getElementById('cert-modal');
    const certBody = document.getElementById('cert-body');
    const isZh = this.lang === 'zh';

    if (certBody) {
      certBody.innerHTML = `
        <div class="cert-card-inner">
          <div class="cert-emblem">🏛️</div>
          <h2 class="cert-title">${isZh ? '元素調和密室・通關榮譽證書' : 'Certificate of Mastery: Crucible of Ratios'}</h2>
          <div class="cert-stars">${stars}</div>
          <p class="cert-hero-title">${isZh ? titleZh : titleEn}</p>
          
          <div class="cert-meta-grid">
            <div class="meta-item"><span class="m-label">${isZh ? '班級座號' : 'Seat'}:</span> <span class="m-val">${this.studentInfo.classNum} 班 ${this.studentInfo.seatNum} 號</span></div>
            <div class="meta-item"><span class="m-label">${isZh ? '調和師姓名' : 'Name'}:</span> <span class="m-val">${this.studentInfo.name}</span></div>
            <div class="meta-item"><span class="m-label">${isZh ? '逃脫總耗時' : 'Time'}:</span> <span class="m-val">${timeFormatted}</span></div>
            <div class="meta-item"><span class="m-label">${isZh ? '最終理智度' : 'Sanity'}:</span> <span class="m-val">${this.stability}%</span></div>
            <div class="meta-item"><span class="m-label">${isZh ? '總失誤次數' : 'Mistakes'}:</span> <span class="m-val">${this.wrongCount} 次</span></div>
            <div class="meta-item"><span class="m-label">${isZh ? '單元對照' : 'Curriculum'}:</span> <span class="m-val">康軒六上 第五單元 比與比值</span></div>
          </div>

          <div class="cert-actions">
            <button type="button" class="btn primary-btn" onclick="location.reload()">🔄 ${isZh ? '再次挑戰新隨機題' : 'Play Again'}</button>
            <a href="../../index.html" class="btn secondary-btn">🏠 ${isZh ? '返回學習大廳' : 'Lobby'}</a>
          </div>
        </div>
      `;
    }

    if (certModal) certModal.classList.remove('hidden');
  }
}

// 實例化啟動
document.addEventListener('DOMContentLoaded', () => {
  window.gameApp = new CrucibleGameController();
});
