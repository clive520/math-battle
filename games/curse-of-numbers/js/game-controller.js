/**
 * 密室逃脫主控制器 (Game Controller)
 * 負責關卡流轉、理智值 (Sanity)、火把探照、線索筆記本、教師巡堂後台與通關結算
 */
class DungeonEscapeController {
  constructor() {
    this.studentInfo = {
      className: '601',
      seatNum: '01',
      nickname: '勇敢冒險者'
    };
    this.chambers = [];
    this.currentChamberIdx = 0;
    this.sanity = 100;
    this.startTime = null;
    this.endTime = null;
    this.wrongCount = 0;
    this.lockSystem = null;

    this.dom = {};
  }

  init() {
    this._cacheDom();
    this._bindGlobalEvents();
    this._initMouseTorch();

    // 檢查是否有儲存的進度
    const saved = localStorage.getItem('curse_of_numbers_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.studentInfo = data.studentInfo;
        this.sanity = data.sanity || 100;
        this.currentChamberIdx = data.currentChamberIdx || 0;
        this.startTime = data.startTime ? new Date(data.startTime) : new Date();
        this._startWithSeed();
        return;
      } catch (e) {
        console.warn('Failed to restore save', e);
      }
    }

    // 顯示初次登入設定彈窗
    this._showLoginModal();
  }

  _cacheDom() {
    this.dom.torchMask = document.getElementById('torchMask');
    this.dom.loginModal = document.getElementById('loginModal');
    this.dom.journalModal = document.getElementById('journalModal');
    this.dom.teacherModal = document.getElementById('teacherModal');
    this.dom.victoryScreen = document.getElementById('victoryScreen');
    this.dom.gameMain = document.getElementById('gameMain');

    // 頂部狀態列
    this.dom.chamberBadge = document.getElementById('chamberBadge');
    this.dom.studentBadge = document.getElementById('studentBadge');
    this.dom.sanityFill = document.getElementById('sanityFill');
    this.dom.sanityVal = document.getElementById('sanityVal');
    this.dom.btnMute = document.getElementById('btnMute');
    this.dom.btnJournal = document.getElementById('btnJournal');
    this.dom.btnTeacher = document.getElementById('btnTeacher');

    // 密室內容
    this.dom.chamberTitle = document.getElementById('chamberTitle');
    this.dom.chamberSubtitle = document.getElementById('chamberSubtitle');
    this.dom.chamberLore = document.getElementById('chamberLore');
    this.dom.chamberStory = document.getElementById('chamberStory');
    this.dom.targetQuestion = document.getElementById('targetQuestion');
    this.dom.lockMount = document.getElementById('lockMount');
    this.dom.whisperAlert = document.getElementById('whisperAlert');
    this.dom.gateOverlay = document.getElementById('gateOverlay');
  }

  _bindGlobalEvents() {
    // 登入確認按鈕
    const btnStart = document.getElementById('btnStartAdventure');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const cName = document.getElementById('inputClassName').value.trim() || '601';
        const sNum = document.getElementById('inputSeatNum').value.trim() || '01';
        const nick = document.getElementById('inputNickname').value.trim() || '冒險者';

        this.studentInfo = {
          className: cName,
          seatNum: sNum.padStart(2, '0'),
          nickname: nick
        };
        this.startTime = new Date();
        this.sanity = 100;
        this.currentChamberIdx = 0;
        this._hideLoginModal();
        this._startWithSeed();
      });
    }

    // 靜音切換
    this.dom.btnMute?.addEventListener('click', () => {
      const isMuted = window.audioMgr.toggleMute();
      this.dom.btnMute.innerHTML = isMuted ? '🔇' : '🔊';
      this.dom.btnMute.title = isMuted ? '解除靜音' : '靜音';
    });

    // 打開線索筆記本
    this.dom.btnJournal?.addEventListener('click', () => {
      this._openJournal();
    });

    // 關閉線索筆記本
    document.getElementById('btnCloseJournal')?.addEventListener('click', () => {
      this._closeJournal();
    });

    // 教師按鈕
    this.dom.btnTeacher?.addEventListener('click', () => {
      this._openTeacherModal();
    });
    document.getElementById('btnCloseTeacher')?.addEventListener('click', () => {
      this.dom.teacherModal.classList.add('hidden');
    });

    // 鍵盤快捷鍵：T 鍵打開教師面板、J 鍵開筆記本、M 鍵靜音
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 't' || e.key === 'T') {
        this._openTeacherModal();
      } else if (e.key === 'j' || e.key === 'J') {
        this._openJournal();
      } else if (e.key === 'm' || e.key === 'M') {
        this.dom.btnMute?.click();
      }
    });

    // 教師查詢座號按鈕
    document.getElementById('btnQueryTeacherSeed')?.addEventListener('click', () => {
      this._queryTeacherSeed();
    });
  }

  // 手電筒/火把光暈跟隨效果 (Torchlight Vignette)
  _initMouseTorch() {
    window.addEventListener('pointermove', (e) => {
      if (!this.dom.torchMask) return;
      const x = e.clientX;
      const y = e.clientY;
      this.dom.torchMask.style.background = `radial-gradient(circle 380px at ${x}px ${y}px, rgba(0, 0, 0, 0.05) 0%, rgba(5, 5, 10, 0.75) 70%, rgba(3, 3, 5, 0.95) 100%)`;
    });
  }

  _showLoginModal() {
    this.dom.loginModal.classList.remove('hidden');
  }

  _hideLoginModal() {
    this.dom.loginModal.classList.add('hidden');
    window.audioMgr.ensureContext();
  }

  // 根據種子啟動遊戲
  _startWithSeed() {
    const seed = `${this.studentInfo.className}-${this.studentInfo.seatNum}`;
    const engine = new DungeonQuestionEngine(seed);
    this.chambers = engine.generateAllChambers();

    // 更新個人銘牌
    if (this.dom.studentBadge) {
      this.dom.studentBadge.textContent = `👤 ${this.studentInfo.className} 班 ${this.studentInfo.seatNum} 號 ${this.studentInfo.nickname}`;
    }

    this._updateSanityUI();
    this._loadChamber(this.currentChamberIdx);
  }

  // 載入指定關卡
  _loadChamber(index) {
    if (index >= this.chambers.length) {
      this._triggerVictory();
      return;
    }

    const chamber = this.chambers[index];
    this.currentChamberIdx = index;
    this._saveProgress();

    // 更新關卡徽章
    if (this.dom.chamberBadge) {
      this.dom.chamberBadge.textContent = `🏰 關卡 ${chamber.id} / ${this.chambers.length}`;
    }

    // 更新文案
    if (this.dom.chamberTitle) this.dom.chamberTitle.textContent = chamber.title;
    if (this.dom.chamberSubtitle) this.dom.chamberSubtitle.textContent = chamber.subtitle;
    if (this.dom.chamberLore) this.dom.chamberLore.textContent = chamber.lore;
    if (this.dom.chamberStory) this.dom.chamberStory.innerHTML = chamber.story;
    if (this.dom.targetQuestion) this.dom.targetQuestion.innerHTML = `⚠️ <strong>開門機關謎語：</strong>${chamber.targetQuestion}`;

    // 清空前次警報
    if (this.dom.whisperAlert) {
      this.dom.whisperAlert.classList.add('hidden');
      this.dom.whisperAlert.textContent = '';
    }

    // 初始化開鎖元件
    this.lockSystem = new DungeonLockSystem(this.dom.lockMount, (isSuccess, code) => {
      this._handleUnlockAttempt(isSuccess, code);
    });
    this.lockSystem.setup(chamber.correctCode);

    // 播放心跳聲 (隨理智值調節)
    if (this.sanity < 50) {
      window.audioMgr.startHeartbeat(100);
    } else {
      window.audioMgr.stopHeartbeat();
    }
  }

  // 處理開鎖嘗試
  _handleUnlockAttempt(isSuccess, code) {
    const chamber = this.chambers[this.currentChamberIdx];

    if (isSuccess) {
      // 成功解開
      this._showWhisper(`✨【石門轟鳴】密碼【${code}】完全正確！咒印破除！`, 'success');
      this._animateGateOpen(() => {
        this._loadChamber(this.currentChamberIdx + 1);
      });
    } else {
      // 密碼錯誤
      this.wrongCount++;
      this._reduceSanity(15);
      const hint = chamber.hints[0] || '數字不對！請仔細觀察題目的規律與算式！';
      this._showWhisper(`💀【惡靈嘲弄】鎖栓卡死！密碼【${code}】錯誤！${hint}`, 'danger');

      // 觸發螢幕驚悚震動
      this.dom.gameMain?.classList.add('horror-screen-shake');
      setTimeout(() => {
        this.dom.gameMain?.classList.remove('horror-screen-shake');
      }, 500);
    }
  }

  // 石門轟鳴推開過場動畫
  _animateGateOpen(callback) {
    window.audioMgr.playStoneDoor();
    if (!this.dom.gateOverlay) {
      callback();
      return;
    }

    this.dom.gateOverlay.classList.remove('hidden');
    this.dom.gateOverlay.classList.add('gate-opening-anim');

    setTimeout(() => {
      callback();
      setTimeout(() => {
        this.dom.gateOverlay.classList.remove('gate-opening-anim');
        this.dom.gateOverlay.classList.add('hidden');
      }, 400);
    }, 1200);
  }

  // 扣除理智值
  _reduceSanity(amount) {
    this.sanity = Math.max(0, this.sanity - amount);
    this._updateSanityUI();

    if (this.sanity <= 40) {
      window.audioMgr.startHeartbeat(115);
    }

    if (this.sanity <= 0) {
      // 理智崩潰提示：給予甦醒重生與直接提示
      this._showWhisper(`🕯️【微光復甦】你在黑暗中昏厥了過去⋯古老英靈為你恢復了部分神智，並在牆上留下了強烈的提示！快查看筆記本！`, 'warning');
      this.sanity = 40;
      this._updateSanityUI();
      setTimeout(() => this._openJournal(), 800);
    }
  }

  _updateSanityUI() {
    if (this.dom.sanityFill) {
      this.dom.sanityFill.style.width = `${this.sanity}%`;
      if (this.sanity <= 30) {
        this.dom.sanityFill.style.background = 'linear-gradient(90deg, #ff1744, #d50000)';
      } else if (this.sanity <= 60) {
        this.dom.sanityFill.style.background = 'linear-gradient(90deg, #ff9100, #ff6d00)';
      } else {
        this.dom.sanityFill.style.background = 'linear-gradient(90deg, #00e676, #00b0ff)';
      }
    }
    if (this.dom.sanityVal) {
      this.dom.sanityVal.textContent = `${this.sanity}%`;
    }
  }

  _showWhisper(text, type = 'info') {
    if (!this.dom.whisperAlert) return;
    this.dom.whisperAlert.innerHTML = text;
    this.dom.whisperAlert.className = `whisper-alert ${type}`;
    this.dom.whisperAlert.classList.remove('hidden');
  }

  // 打開線索筆記本 (Journal)
  _openJournal() {
    const chamber = this.chambers[this.currentChamberIdx];
    if (!chamber) return;

    window.audioMgr.playDialTick();
    const titleEl = document.getElementById('journalTitle');
    const conceptEl = document.getElementById('journalConcept');
    const hintsEl = document.getElementById('journalHints');
    const diagramEl = document.getElementById('journalDiagramMount');

    if (titleEl) titleEl.textContent = `📖 染血筆記本：${chamber.title}`;
    if (conceptEl) conceptEl.textContent = `核心概念：${chamber.concept}`;

    if (hintsEl) {
      hintsEl.innerHTML = chamber.hints.map(h => `<li>${h}</li>`).join('');
    }

    if (diagramEl) {
      diagramEl.innerHTML = DungeonDiagramRenderer.render(chamber.diagramType, chamber.diagramData);
    }

    this.dom.journalModal.classList.remove('hidden');
  }

  _closeJournal() {
    window.audioMgr.playDialTick();
    this.dom.journalModal.classList.add('hidden');
  }

  // 教師巡堂視角 (Teacher Panel)
  _openTeacherModal() {
    const inputClass = document.getElementById('teacherInputClass');
    const inputSeat = document.getElementById('teacherInputSeat');
    if (inputClass) inputClass.value = this.studentInfo.className;
    if (inputSeat) inputSeat.value = this.studentInfo.seatNum;

    this._queryTeacherSeed();
    this.dom.teacherModal.classList.remove('hidden');
  }

  _queryTeacherSeed() {
    const cName = document.getElementById('teacherInputClass').value.trim() || '601';
    const sNum = (document.getElementById('teacherInputSeat').value.trim() || '01').padStart(2, '0');
    const querySeed = `${cName}-${sNum}`;

    const testEngine = new DungeonQuestionEngine(querySeed);
    const testChambers = testEngine.generateAllChambers();

    const resultBox = document.getElementById('teacherQueryResult');
    if (!resultBox) return;

    resultBox.innerHTML = `
      <div class="teacher-overview">
        <h4>🎯 查詢對象：${cName} 班 ${sNum} 號（種子碼：${querySeed}）</h4>
        <p class="teacher-tip-sub">以下為該同學的 10 間密室題目參數與唯一正確密碼，方便巡堂時迅速查對：</p>
      </div>
      <div class="teacher-cards-list">
        ${testChambers.map((c, i) => `
          <div class="teacher-card">
            <div class="tc-header">
              <span class="tc-num">關卡 ${i+1}</span>
              <strong class="tc-title">${c.title}</strong>
              <span class="tc-code">🔑 密碼：<strong>${c.correctCode}</strong></span>
            </div>
            <div class="tc-body">
              <p><strong>題目：</strong>${c.targetQuestion}</p>
              <p><strong>算式提示：</strong>${c.hints[c.hints.length-1]}</p>
            </div>
          </div>
        `).join('')}
      </div>
    `;
  }

  // 通關勝利結算
  _triggerVictory() {
    this.endTime = new Date();
    const durationSec = Math.floor((this.endTime - this.startTime) / 1000);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const timeFormatted = `${mins} 分 ${secs} 秒`;

    window.audioMgr.stopHeartbeat();
    window.audioMgr.playEscapeVictory();

    // 計算星級
    let stars = '⭐⭐⭐';
    let titleHonor = '傳奇破咒大師';
    if (this.sanity < 50 || this.wrongCount > 6) {
      stars = '⭐';
      titleHonor = '歷劫生還勇者';
    } else if (this.sanity < 80 || this.wrongCount > 3) {
      stars = '⭐⭐';
      titleHonor = '沉著解謎先驅';
    }

    if (this.dom.victoryScreen) {
      this.dom.victoryScreen.innerHTML = `
        <div class="certificate-container">
          <div class="cert-border">
            <div class="cert-header">
              <div class="cert-icon">🏆</div>
              <h1 class="cert-title">禁忌地牢・生還脫出證書</h1>
              <p class="cert-sub">國小六年級數學《數量關係》密室解謎認證</p>
            </div>

            <div class="cert-body">
              <p class="cert-player">
                恭喜 <strong>${this.studentInfo.className} 班 ${this.studentInfo.seatNum} 號【${this.studentInfo.nickname}】</strong>
              </p>
              <p class="cert-desc">
                成功破解幾何規律、和差積商不變法則、引魂間隔與長寬最大公因數之四象陣眼，
                斬斷幽暗詛咒，全員平安生還逃出密室！
              </p>

              <div class="cert-stats-grid">
                <div class="stat-card">
                  <div class="stat-lbl">生還耗時</div>
                  <div class="stat-val">${timeFormatted}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-lbl">剩餘理智值</div>
                  <div class="stat-val ${this.sanity <= 40 ? 'low' : ''}">${this.sanity}%</div>
                </div>
                <div class="stat-card">
                  <div class="stat-lbl">失誤次數</div>
                  <div class="stat-val">${this.wrongCount} 次</div>
                </div>
                <div class="stat-card">
                  <div class="stat-lbl">評定階級</div>
                  <div class="stat-val star-val">${stars} ${titleHonor}</div>
                </div>
              </div>
            </div>

            <div class="cert-footer">
              <div class="cert-date">認證時間：${new Date().toLocaleDateString('zh-TW')}</div>
              <div class="cert-actions">
                <button type="button" class="btn-cert btn-print" onclick="window.print()">🖨️ 列印/截圖留存</button>
                <button type="button" class="btn-cert btn-restart" onclick="localStorage.removeItem('curse_of_numbers_save'); location.reload();">🔄 再次挑戰</button>
                <a href="../../index.html" class="btn-cert btn-home">🏠 返回學習大廳</a>
              </div>
            </div>
          </div>
        </div>
      `;
      this.dom.victoryScreen.classList.remove('hidden');
    }

    localStorage.removeItem('curse_of_numbers_save');
  }

  _saveProgress() {
    const data = {
      studentInfo: this.studentInfo,
      sanity: this.sanity,
      currentChamberIdx: this.currentChamberIdx,
      startTime: this.startTime
    };
    localStorage.setItem('curse_of_numbers_save', JSON.stringify(data));
  }
}

// 頁面載入後自動啟動
window.addEventListener('DOMContentLoaded', () => {
  window.dungeonGame = new DungeonEscapeController();
  window.dungeonGame.init();
});
