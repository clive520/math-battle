// js/game.js - 國小六年級數學「植樹與間隔問題 雙人搶答對決」核心遊戲控制器
class IntervalBattleGame {
  constructor() {
    this.totalQuestions = 4; // 每一回合固定 4 題
    this.timeLimit = 45;      // 每題 45 秒限時
    this.currentRound = 0;
    this.currentCategory = 'numbering';
    this.questions = [];
    this.currentQuestion = null;

    this.scores = { p1: 0, p2: 0 };
    this.teamNames = { p1: '紅隊', p2: '藍隊' };

    // 抽籤系統狀態 (全班共享不重複抽籤池)
    this.gameKey = 'tree_intervals';
    this.lotteryNumbers = { p1: null, p2: null };
    this.drawnStudents = new Set(); // 記住全班已抽過的座號 (跨隊伍、跨回合)
    this.usedLottery = this.drawnStudents; // 相容別名
    this.isRollingLottery = { p1: false, p2: false };
    this.rollTimers = { p1: null, p2: null };
    this.safetyTimers = { p1: null, p2: null };

    this.timer = null;
    this.timeLeft = this.timeLimit;
    this.isAnsweringActive = false;

    // 懲罰鎖定計時器 (答錯冰凍暫停 5 秒)
    this.locks = { p1: false, p2: false };
    this.lockTimers = { p1: null, p2: null };

    this.loadDrawnStudents();
    this.initDOMElements();
    this.bindEvents();
    this.bindKeyboardShortcuts();
    this.updateLotteryHistoryUI();
  }

  initDOMElements() {
    // 畫面容器
    this.screens = {
      menu: document.getElementById('menu-screen'),
      game: document.getElementById('game-screen'),
      explanation: document.getElementById('explanation-modal'),
      victory: document.getElementById('victory-screen')
    };

    // 主選單元素
    this.categoryCards = document.querySelectorAll('.category-card');
    this.p1NameInput = document.getElementById('p1-name-input');
    this.p2NameInput = document.getElementById('p2-name-input');
    this.startGameBtn = document.getElementById('start-game-btn');
    this.soundToggleBtn = document.getElementById('sound-toggle-btn');
    this.fullscreenBtn = document.getElementById('fullscreen-btn');

    // 抽籤設定與按鈕
    this.lotteryMaxInput = document.getElementById('lottery-max-input');
    this.noRepeatCheckbox = document.getElementById('no-repeat-checkbox');
    this.p1MenuLotteryBtn = document.getElementById('p1-menu-lottery-btn');
    this.p2MenuLotteryBtn = document.getElementById('p2-menu-lottery-btn');
    this.p1MenuNumber = document.getElementById('p1-menu-number');
    this.p2MenuNumber = document.getElementById('p2-menu-number');
    this.resetHistoryBtn = document.getElementById('reset-history-btn');
    this.drawnCountEl = document.getElementById('drawn-count');
    this.totalCountEl = document.getElementById('total-count');
    this.drawnTagsList = document.getElementById('drawn-tags-list');

    // 比賽頂部狀態看板
    this.roundBadge = document.getElementById('round-badge');
    this.categoryBadge = document.getElementById('category-badge');
    this.timerBar = document.getElementById('timer-bar-fill');
    this.timerText = document.getElementById('timer-text');
    this.questionText = document.getElementById('question-text');

    this.p1ScoreEl = document.getElementById('p1-score-display');
    this.p2ScoreEl = document.getElementById('p2-score-display');
    this.p1NameDisplay = document.getElementById('p1-name-display');
    this.p2NameDisplay = document.getElementById('p2-name-display');
    this.p1ArenaRepDisplay = document.getElementById('p1-arena-rep-display');
    this.p2ArenaRepDisplay = document.getElementById('p2-arena-rep-display');

    // 左右兩側作答區
    this.p1OptionsContainer = document.getElementById('p1-options');
    this.p2OptionsContainer = document.getElementById('p2-options');
    this.p1LockOverlay = document.getElementById('p1-lock-overlay');
    this.p2LockOverlay = document.getElementById('p2-lock-overlay');
    this.p1LockCountdown = document.getElementById('p1-lock-countdown');
    this.p2LockCountdown = document.getElementById('p2-lock-countdown');

    // 作答區內即時抽籤換人按鈕
    this.p1ArenaLotteryBtn = document.getElementById('p1-arena-lottery-btn');
    this.p2ArenaLotteryBtn = document.getElementById('p2-arena-lottery-btn');
    this.p1PanelNum = document.getElementById('p1-panel-num');
    this.p2PanelNum = document.getElementById('p2-panel-num');

    // 解析彈窗元素
    this.expResultTitle = document.getElementById('exp-result-title');
    this.expBadge = document.getElementById('exp-badge');
    this.expAnswerText = document.getElementById('exp-answer-text');
    this.expDiagramBox = document.getElementById('exp-diagram-box');
    this.expBody = document.getElementById('exp-body');
    this.nextQuestionBtn = document.getElementById('next-question-btn');

    // 勝利頁面元素
    this.winnerTitle = document.getElementById('winner-title');
    this.winnerSub = document.getElementById('winner-sub');
    this.finalScoreText = document.getElementById('final-score-text');
    this.playAgainBtn = document.getElementById('play-again-btn');
    this.backToMenuBtn = document.getElementById('back-to-menu-btn');
    this.confettiCanvas = document.getElementById('confetti-canvas');
  }

  bindEvents() {
    // 1. 選擇題型卡片
    this.categoryCards.forEach(card => {
      card.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.categoryCards.forEach(c => c.classList.remove('selected'));
        card.classList.add('selected');
        this.currentCategory = card.dataset.category;
        window.soundManager.playTick();
      });
    });

    // 2. 隨機抽籤按鈕事件
    const handleLotteryClick = (teamKey) => {
      this.rollTeamLottery(teamKey);
    };

    if (this.p1MenuLotteryBtn) this.p1MenuLotteryBtn.addEventListener('click', (e) => { e.preventDefault(); handleLotteryClick('p1'); });
    if (this.p2MenuLotteryBtn) this.p2MenuLotteryBtn.addEventListener('click', (e) => { e.preventDefault(); handleLotteryClick('p2'); });
    if (this.p1ArenaLotteryBtn) this.p1ArenaLotteryBtn.addEventListener('click', (e) => { e.preventDefault(); handleLotteryClick('p1'); });
    if (this.p2ArenaLotteryBtn) this.p2ArenaLotteryBtn.addEventListener('click', (e) => { e.preventDefault(); handleLotteryClick('p2'); });

    // 清空已抽名單按鈕
    if (this.resetHistoryBtn) {
      this.resetHistoryBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.clearDrawnHistory();
      });
    }

    if (this.lotteryMaxInput) {
      this.lotteryMaxInput.addEventListener('change', () => {
        this.updateLotteryHistoryUI();
      });
    }

    if (this.noRepeatCheckbox) {
      this.noRepeatCheckbox.addEventListener('change', () => {
        this.updateLotteryHistoryUI();
      });
    }

    // 3. 開始比賽按鈕
    if (this.startGameBtn) this.startGameBtn.addEventListener('click', (e) => {
      e.preventDefault();
      this.teamNames.p1 = this.p1NameInput.value.trim() || '紅隊';
      this.teamNames.p2 = this.p2NameInput.value.trim() || '藍隊';
      try { window.soundManager.playStart(); } catch (err) {}
      this.startNewMatch();
    });

    // 4. 解析頁面的「下一題」按鈕
    if (this.nextQuestionBtn) this.nextQuestionBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try { window.soundManager.playTick(); } catch (err) {}
      this.screens.explanation.classList.remove('active');
      this.advanceQuestion();
    });

    // 5. 勝利畫面按鈕
    if (this.playAgainBtn) this.playAgainBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try { window.soundManager.playStart(); } catch (err) {}
      // 再來一局：清空場上選手，自動為新一局抽取尚未上台的同學
      this.lotteryNumbers = { p1: null, p2: null };
      this.startNewMatch();
    });

    if (this.backToMenuBtn) this.backToMenuBtn.addEventListener('click', (e) => {
      e.preventDefault();
      try { window.soundManager.playTick(); } catch (err) {}
      this.showScreen('menu');
      this.updateLotteryHistoryUI();
    });

    // 6. 音效切換 (支援畫面上的所有音效按鈕)
    document.querySelectorAll('.sound-toggle-btn, #sound-toggle-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        const isMuted = window.soundManager.toggleMute();
        document.querySelectorAll('.sound-toggle-btn, #sound-toggle-btn').forEach(b => {
          b.textContent = isMuted ? '🔇 靜音中' : '🔊 音效開';
          b.classList.toggle('muted', isMuted);
        });
      });
    });

    // 7. 全螢幕切換
    document.querySelectorAll('.fullscreen-btn, #fullscreen-btn').forEach(btn => {
      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.toggleFullscreen();
      });
    });
  }

  bindKeyboardShortcuts() {
    window.addEventListener('keydown', (e) => {
      if (e.key === 'f' || e.key === 'F') {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          this.toggleFullscreen();
        }
      }
      if (e.key === 'm' || e.key === 'M') {
        if (!['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
          const isMuted = window.soundManager.toggleMute();
          document.querySelectorAll('.sound-toggle-btn, #sound-toggle-btn').forEach(b => {
            b.textContent = isMuted ? '🔇 靜音中' : '🔊 音效開';
            b.classList.toggle('muted', isMuted);
          });
        }
      }

      // 若在比賽畫面且作答中，支援鍵盤快捷鍵
      if (this.screens.game.classList.contains('active') && this.isAnsweringActive) {
        // P1 快捷鍵：1, 2, 3, 4, Q, W, E, R (或 A, S, D, F, Z, X, C, V)
        const p1Keys = ['1', '2', '3', '4', 'q', 'w', 'e', 'r'];
        const p1AltKeys = ['a', 's', 'd', 'f', 'z', 'x', 'c', 'v'];
        const keyLower = e.key.toLowerCase();

        let p1Idx = p1Keys.indexOf(keyLower);
        if (p1Idx === -1) p1Idx = p1AltKeys.indexOf(keyLower);
        if (p1Idx !== -1 && !this.locks.p1) {
          const btn = this.p1OptionsContainer.children[p1Idx];
          if (btn) {
            const opt = btn.getAttribute('data-option');
            this.handlePlayerAnswer('p1', opt, btn);
          }
        }

        // P2 快捷鍵：7, 8, 9, 0, U, I, O, P (或 J, K, L, ;, N, M, ,, .)
        const p2Keys = ['7', '8', '9', '0', 'u', 'i', 'o', 'p'];
        const p2AltKeys = ['j', 'k', 'l', ';', 'n', 'm', ',', '.'];
        let p2Idx = p2Keys.indexOf(keyLower);
        if (p2Idx === -1) p2Idx = p2AltKeys.indexOf(keyLower);
        if (p2Idx !== -1 && !this.locks.p2) {
          const btn = this.p2OptionsContainer.children[p2Idx];
          if (btn) {
            const opt = btn.getAttribute('data-option');
            this.handlePlayerAnswer('p2', opt, btn);
          }
        }
      }

      // 若在解析彈窗，按空白鍵或 Enter 進入下一題
      if (this.screens.explanation.classList.contains('active')) {
        if (e.key === ' ' || e.key === 'Enter') {
          e.preventDefault();
          this.screens.explanation.classList.remove('active');
          this.advanceQuestion();
        }
      }
    });
  }

  // =========================================================================
  // 抽籤系統 (號碼 1 到 26 號，全班共享不重複抽籤池、防重複與強制逾時停止機制)
  // =========================================================================
  saveDrawnStudents() {
    try {
      const arr = Array.from(this.drawnStudents);
      sessionStorage.setItem('math_battle_drawn_' + this.gameKey, JSON.stringify(arr));
    } catch (e) {}
  }

  loadDrawnStudents() {
    try {
      const saved = sessionStorage.getItem('math_battle_drawn_' + this.gameKey);
      if (saved) {
        const arr = JSON.parse(saved);
        if (Array.isArray(arr)) {
          this.drawnStudents = new Set(arr);
          this.usedLottery = this.drawnStudents;
        }
      }
    } catch (e) {}
  }

  clearDrawnHistory() {
    this.drawnStudents.clear();
    this.saveDrawnStudents();
    this.updateLotteryHistoryUI();
    try { window.soundManager.playTick(); } catch (e) {}
  }

  removeDrawnStudent(num) {
    this.drawnStudents.delete(num);
    this.saveDrawnStudents();
    this.updateLotteryHistoryUI();
    try { window.soundManager.playTick(); } catch (e) {}
  }

  updateLotteryHistoryUI() {
    const maxNum = parseInt(this.lotteryMaxInput ? this.lotteryMaxInput.value : '26', 10) || 26;
    if (this.totalCountEl) this.totalCountEl.textContent = maxNum;
    if (this.drawnCountEl) this.drawnCountEl.textContent = this.drawnStudents.size;

    if (this.drawnTagsList) {
      this.drawnTagsList.innerHTML = '';
      if (this.drawnStudents.size === 0) {
        this.drawnTagsList.innerHTML = '<span class="empty-history-tip">尚未抽籤，點選下方隊伍抽籤鈕開始！</span>';
      } else {
        const sorted = Array.from(this.drawnStudents).sort((a, b) => a - b);
        sorted.forEach(num => {
          const tag = document.createElement('span');
          tag.className = 'drawn-student-tag';
          tag.title = `點選將 ${num} 號放回抽籤池`;
          tag.innerHTML = `<span>${num} 號</span> <span class="tag-remove">✕</span>`;
          tag.addEventListener('click', () => {
            this.removeDrawnStudent(num);
          });
          this.drawnTagsList.appendChild(tag);
        });
      }
    }

    // 更新對戰區換人按鈕的剩餘人數提示
    const remaining = Math.max(0, maxNum - this.drawnStudents.size);
    const repTip = remaining > 0 ? `🎲 換人抽籤 (剩${remaining}人)` : `🎲 換人抽籤 (已全抽過)`;
    if (this.p1ArenaLotteryBtn) this.p1ArenaLotteryBtn.textContent = repTip;
    if (this.p2ArenaLotteryBtn) this.p2ArenaLotteryBtn.textContent = repTip;
  }

  // 取得全班目前可抽取的學生座號名單 (絕對不重複、排除對手當前選手)
  getAvailableStudents(excludeTeamKey = null) {
    const maxNum = parseInt(this.lotteryMaxInput ? this.lotteryMaxInput.value : '26', 10) || 26;
    const noRepeat = this.noRepeatCheckbox ? this.noRepeatCheckbox.checked : true;

    // 當前在場上的另一隊選手號碼，絕對不能抽到同一人
    const otherTeamKey = excludeTeamKey === 'p1' ? 'p2' : (excludeTeamKey === 'p2' ? 'p1' : null);
    const otherPlayerNum = otherTeamKey ? this.lotteryNumbers[otherTeamKey] : null;

    let pool = [];
    for (let i = 1; i <= maxNum; i++) {
      if (otherPlayerNum !== null && i === otherPlayerNum) {
        continue; // 排除對手當前選手
      }
      if (noRepeat && this.drawnStudents.has(i)) {
        continue; // 排除全班本輪已上台過的同學
      }
      pool.push(i);
    }

    // 若全班可用名單已經抽完（池子空了），自動重置開啟新一輪
    if (pool.length === 0) {
      this.drawnStudents.clear();
      for (let i = 1; i <= maxNum; i++) {
        if (otherPlayerNum !== null && i === otherPlayerNum) continue;
        pool.push(i);
      }
      this.saveDrawnStudents();
      this.updateLotteryHistoryUI();
    }

    return pool;
  }

  rollTeamLottery(teamKey) {
    // 若該隊已在抽籤中，先停止舊計時器
    if (this.rollTimers[teamKey]) {
      clearInterval(this.rollTimers[teamKey]);
      this.rollTimers[teamKey] = null;
    }
    if (this.safetyTimers && this.safetyTimers[teamKey]) {
      clearTimeout(this.safetyTimers[teamKey]);
      this.safetyTimers[teamKey] = null;
    }
    if (this.isRollingLottery[teamKey]) return;

    const available = this.getAvailableStudents(teamKey);
    const maxNum = parseInt(this.lotteryMaxInput ? this.lotteryMaxInput.value : '26', 10) || 26;
    const finalChoice = available[Math.floor(Math.random() * available.length)];

    this.isRollingLottery[teamKey] = true;
    this.setLotteryButtonsDisabled(teamKey, true);

    // 終極安全機制：設定 1.0 秒硬性停止定時器，確保在任何異常或頁面切換情況下必能停止抽籤
    this.safetyTimers[teamKey] = setTimeout(() => {
      if (this.isRollingLottery[teamKey]) {
        this.finalizeLotteryDraw(teamKey, finalChoice);
      }
    }, 1000);

    let rollCount = 0;
    const maxRolls = 16;
    this.rollTimers[teamKey] = setInterval(() => {
      try {
        rollCount++;
        const tempNum = Math.floor(Math.random() * maxNum) + 1;
        this.updateLotteryDisplay(teamKey, tempNum, true);
        if (window.soundManager && typeof window.soundManager.playLotteryRoll === 'function') {
          window.soundManager.playLotteryRoll();
        }
      } catch (e) {
        console.warn('Lottery tick exception caught:', e);
      } finally {
        if (rollCount >= maxRolls) {
          if (this.rollTimers[teamKey]) {
            clearInterval(this.rollTimers[teamKey]);
            this.rollTimers[teamKey] = null;
          }
          if (this.safetyTimers && this.safetyTimers[teamKey]) {
            clearTimeout(this.safetyTimers[teamKey]);
            this.safetyTimers[teamKey] = null;
          }
          this.finalizeLotteryDraw(teamKey, finalChoice);
        }
      }
    }, 45);
  }

  finalizeLotteryDraw(teamKey, selectedNum) {
    if (this.rollTimers[teamKey]) {
      clearInterval(this.rollTimers[teamKey]);
      this.rollTimers[teamKey] = null;
    }
    if (this.safetyTimers && this.safetyTimers[teamKey]) {
      clearTimeout(this.safetyTimers[teamKey]);
      this.safetyTimers[teamKey] = null;
    }
    this.lotteryNumbers[teamKey] = selectedNum;
    this.drawnStudents.add(selectedNum);
    this.saveDrawnStudents();
    this.isRollingLottery[teamKey] = false;
    this.setLotteryButtonsDisabled(teamKey, false);

    try {
      this.updateLotteryDisplay(teamKey, selectedNum, false);
      this.updateLotteryHistoryUI();
      if (window.soundManager && typeof window.soundManager.playLotterySuccess === 'function') {
        window.soundManager.playLotterySuccess();
      }

      const displays = [
        teamKey === 'p1' ? this.p1MenuNumber : this.p2MenuNumber,
        teamKey === 'p1' ? this.p1PanelNum : this.p2PanelNum
      ];
      displays.forEach(el => {
        if (el) {
          el.classList.remove('num-pop');
          void el.offsetWidth;
          el.classList.add('num-pop');
        }
      });
    } catch (e) {
      console.warn('Finalize lottery UI exception caught:', e);
    } finally {
      this.isRollingLottery[teamKey] = false;
      this.setLotteryButtonsDisabled(teamKey, false);
    }
  }

  updateLotteryDisplay(teamKey, numVal, isRolling) {
    const text = `${numVal}`;
    const repText = isRolling ? `抽籤中...` : `座號: ${numVal} 號`;

    if (teamKey === 'p1') {
      if (this.p1MenuNumber) this.p1MenuNumber.textContent = text;
      if (this.p1PanelNum) this.p1PanelNum.textContent = text;
      if (this.p1ArenaRepDisplay) this.p1ArenaRepDisplay.textContent = repText;
    } else {
      if (this.p2MenuNumber) this.p2MenuNumber.textContent = text;
      if (this.p2PanelNum) this.p2PanelNum.textContent = text;
      if (this.p2ArenaRepDisplay) this.p2ArenaRepDisplay.textContent = repText;
    }
  }

  setLotteryButtonsDisabled(teamKey, isDisabled) {
    if (teamKey === 'p1') {
      if (this.p1MenuLotteryBtn) this.p1MenuLotteryBtn.disabled = isDisabled;
      if (this.p1ArenaLotteryBtn) this.p1ArenaLotteryBtn.disabled = isDisabled;
    } else {
      if (this.p2MenuLotteryBtn) this.p2MenuLotteryBtn.disabled = isDisabled;
      if (this.p2ArenaLotteryBtn) this.p2ArenaLotteryBtn.disabled = isDisabled;
    }
  }

  toggleFullscreen() {
    const isFullscreen = !!document.fullscreenElement;
    if (!isFullscreen) {
      document.documentElement.requestFullscreen().catch(() => {});
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      }
    }
    document.querySelectorAll('.fullscreen-btn, #fullscreen-btn').forEach(btn => {
      btn.textContent = !isFullscreen ? '⛶ 退出全螢幕' : '⛶ 全螢幕';
    });
  }

  showScreen(screenName) {
    Object.values(this.screens).forEach(s => s.classList.remove('active'));
    this.screens[screenName].classList.add('active');
  }

  // 開始一場全新 4 題的比賽
  startNewMatch() {
    this.scores = { p1: 0, p2: 0 };
    this.currentRound = 0;
    this.p1ScoreEl.textContent = '0';
    this.p2ScoreEl.textContent = '0';
    this.p1NameDisplay.textContent = this.teamNames.p1;
    this.p2NameDisplay.textContent = this.teamNames.p2;

    // 清理任何正在進行的抽籤計時器
    ['p1', 'p2'].forEach(teamKey => {
      if (this.rollTimers[teamKey]) {
        clearInterval(this.rollTimers[teamKey]);
        this.rollTimers[teamKey] = null;
      }
      if (this.safetyTimers && this.safetyTimers[teamKey]) {
        clearTimeout(this.safetyTimers[teamKey]);
        this.safetyTimers[teamKey] = null;
      }
      this.isRollingLottery[teamKey] = false;
      this.setLotteryButtonsDisabled(teamKey, false);
    });

    // 若比賽前紅隊或藍隊尚未抽籤，依全班不重複原則自動抽取
    if (this.lotteryNumbers.p1 === null) {
      const p1Pool = this.getAvailableStudents('p1');
      const p1Choice = p1Pool[Math.floor(Math.random() * p1Pool.length)];
      this.finalizeLotteryDraw('p1', p1Choice);
    } else {
      this.updateLotteryDisplay('p1', this.lotteryNumbers.p1, false);
    }

    if (this.lotteryNumbers.p2 === null) {
      const p2Pool = this.getAvailableStudents('p2');
      const p2Choice = p2Pool[Math.floor(Math.random() * p2Pool.length)];
      this.finalizeLotteryDraw('p2', p2Choice);
    } else {
      this.updateLotteryDisplay('p2', this.lotteryNumbers.p2, false);
    }

    this.questions = IntervalQuestionGenerator.generateRoundQuestions(this.currentCategory);

    this.showScreen('game');
    this.loadQuestion(0);
  }

  loadQuestion(index) {
    this.currentRound = index + 1;
    this.currentQuestion = this.questions[index];
    this.isAnsweringActive = true;

    this.clearLock('p1');
    this.clearLock('p2');

    this.roundBadge.textContent = `第 ${this.currentRound} / ${this.totalQuestions} 題`;
    this.categoryBadge.textContent = this.currentQuestion.title;
    this.questionText.textContent = this.currentQuestion.question;

    this.renderPlayerOptions('p1', this.p1OptionsContainer);
    this.renderPlayerOptions('p2', this.p2OptionsContainer);

    this.startTimer();
  }

  renderPlayerOptions(playerKey, container) {
    container.innerHTML = '';
    const letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];

    this.currentQuestion.options.forEach((optText, idx) => {
      const btn = document.createElement('button');
      btn.className = `option-btn ${playerKey}-btn`;
      btn.setAttribute('data-option', optText);

      btn.innerHTML = `
        <span class="option-tag">${letters[idx] || (idx + 1)}</span>
        <span class="option-content">${optText}</span>
      `;

      btn.addEventListener('pointerdown', (e) => {
        e.preventDefault();
        this.handlePlayerAnswer(playerKey, optText, btn);
      });

      container.appendChild(btn);
    });
  }

  handlePlayerAnswer(playerKey, selectedOption, btnElement) {
    if (!this.isAnsweringActive) return;
    if (this.locks[playerKey]) return;

    const isCorrect = selectedOption === this.currentQuestion.answer;

    if (isCorrect) {
      this.isAnsweringActive = false;
      this.stopTimer();
      this.scores[playerKey]++;
      this.p1ScoreEl.textContent = this.scores.p1;
      this.p2ScoreEl.textContent = this.scores.p2;

      btnElement.classList.add('correct-glow');
      window.soundManager.playCorrect();

      setTimeout(() => {
        this.showExplanationModal(playerKey);
      }, 700);

    } else {
      window.soundManager.playWrong();
      btnElement.classList.add('wrong-shake');
      this.applyFreezeLock(playerKey);
    }
  }

  applyFreezeLock(playerKey) {
    this.locks[playerKey] = true;
    const overlay = playerKey === 'p1' ? this.p1LockOverlay : this.p2LockOverlay;
    const countdownEl = playerKey === 'p1' ? this.p1LockCountdown : this.p2LockCountdown;

    overlay.classList.add('active');

    let remainingSec = 5;
    if (countdownEl) {
      countdownEl.textContent = remainingSec;
    }

    if (this.lockTimers[playerKey]) {
      clearInterval(this.lockTimers[playerKey]);
    }

    this.lockTimers[playerKey] = setInterval(() => {
      remainingSec--;
      if (countdownEl) {
        countdownEl.textContent = remainingSec;
      }
      if (remainingSec <= 0) {
        this.clearLock(playerKey);
      }
    }, 1000);
  }

  clearLock(playerKey) {
    this.locks[playerKey] = false;
    const overlay = playerKey === 'p1' ? this.p1LockOverlay : this.p2LockOverlay;
    overlay.classList.remove('active');

    const countdownEl = playerKey === 'p1' ? this.p1LockCountdown : this.p2LockCountdown;
    if (countdownEl) {
      countdownEl.textContent = '5';
    }

    if (this.lockTimers[playerKey]) {
      clearInterval(this.lockTimers[playerKey]);
      this.lockTimers[playerKey] = null;
    }
  }

  startTimer() {
    this.stopTimer();
    this.timeLeft = this.timeLimit;
    this.updateTimerUI();

    this.timer = setInterval(() => {
      this.timeLeft--;
      this.updateTimerUI();

      if (this.timeLeft <= 5 && this.timeLeft > 0) {
        window.soundManager.playCountdownTick();
      }

      if (this.timeLeft <= 0) {
        this.handleTimeout();
      }
    }, 1000);
  }

  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  updateTimerUI() {
    this.timerText.textContent = `${this.timeLeft}s`;
    const percent = (this.timeLeft / this.timeLimit) * 100;
    this.timerBar.style.width = `${percent}%`;

    if (this.timeLeft <= 10) {
      this.timerBar.classList.add('warning');
    } else {
      this.timerBar.classList.remove('warning');
    }
  }

  handleTimeout() {
    this.stopTimer();
    this.isAnsweringActive = false;
    window.soundManager.playWrong();
    setTimeout(() => {
      this.showExplanationModal(null);
    }, 500);
  }

  showExplanationModal(winnerKey) {
    if (winnerKey === 'p1') {
      const seat = this.lotteryNumbers.p1 ? `(${this.lotteryNumbers.p1}號)` : '';
      this.expResultTitle.textContent = `🎯 ${this.teamNames.p1}${seat} 搶先答對！ (+1分)`;
      this.expResultTitle.className = 'exp-title p1-win';
    } else if (winnerKey === 'p2') {
      const seat = this.lotteryNumbers.p2 ? `(${this.lotteryNumbers.p2}號)` : '';
      this.expResultTitle.textContent = `🎯 ${this.teamNames.p2}${seat} 搶先答對！ (+1分)`;
      this.expResultTitle.className = 'exp-title p2-win';
    } else {
      this.expResultTitle.textContent = '⏰ 時間到！本題兩隊皆未得分';
      this.expResultTitle.className = 'exp-title no-win';
    }

    this.expBadge.textContent = this.currentQuestion.title;
    this.expAnswerText.textContent = `正確答案：${this.currentQuestion.answer}`;

    if (this.expDiagramBox) {
      if (this.currentQuestion && this.currentQuestion.svgDiagram) {
        this.expDiagramBox.innerHTML = this.currentQuestion.svgDiagram;
        this.expDiagramBox.style.display = 'flex';
      } else {
        this.expDiagramBox.innerHTML = '';
        this.expDiagramBox.style.display = 'none';
      }
    }

    this.expBody.innerHTML = this.currentQuestion.explanation;
    this.screens.explanation.classList.add('active');
  }

  advanceQuestion() {
    if (this.currentRound < this.totalQuestions) {
      this.loadQuestion(this.currentRound);
    } else {
      this.showVictoryScreen();
    }
  }

  showVictoryScreen() {
    this.stopTimer();
    this.showScreen('victory');
    window.soundManager.playVictory();

    this.finalScoreText.textContent = `${this.teamNames.p1} ${this.scores.p1} : ${this.scores.p2} ${this.teamNames.p2}`;

    if (this.scores.p1 > this.scores.p2) {
      this.winnerTitle.textContent = `🏆 ${this.teamNames.p1} 榮獲冠軍！`;
      this.winnerTitle.className = 'winner-title p1-text';
      this.winnerSub.textContent = `恭喜${this.teamNames.p1}在 4 題植樹與間隔對決中勝出！`;
    } else if (this.scores.p2 > this.scores.p1) {
      this.winnerTitle.textContent = `🏆 ${this.teamNames.p2} 榮獲冠軍！`;
      this.winnerTitle.className = 'winner-title p2-text';
      this.winnerSub.textContent = `恭喜${this.teamNames.p2}在 4 題植樹與間隔對決中勝出！`;
    } else {
      this.winnerTitle.textContent = '🤝 勢均力敵，雙方平手！';
      this.winnerTitle.className = 'winner-title tie-text';
      this.winnerSub.textContent = '兩隊表現不分伯仲，間隔問題的觀念都掌握得非常扎實！';
    }

    this.launchConfetti();
  }

  launchConfetti() {
    if (!this.confettiCanvas) return;
    const canvas = this.confettiCanvas;
    const ctx = canvas.getContext('2d');
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    const pieces = [];
    const colors = ['#f43f5e', '#0ea5e9', '#facc15', '#10b981', '#a855f7', '#fb923c'];

    for (let i = 0; i < 90; i++) {
      pieces.push({
        x: Math.random() * canvas.width,
        y: -20 - Math.random() * 200,
        size: Math.random() * 9 + 5,
        color: colors[Math.floor(Math.random() * colors.length)],
        velY: Math.random() * 4 + 3,
        velX: (Math.random() - 0.5) * 3,
        rot: Math.random() * 360,
        velRot: (Math.random() - 0.5) * 6
      });
    }

    let frameCount = 0;
    const anim = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      pieces.forEach(p => {
        p.y += p.velY;
        p.x += p.velX;
        p.rot += p.velRot;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate((p.rot * Math.PI) / 180);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size);
        ctx.restore();
      });

      frameCount++;
      if (frameCount < 200) {
        requestAnimationFrame(anim);
      } else {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
    anim();
  }
}

// 初始化全域實例
window.addEventListener('DOMContentLoaded', () => {
  window.soundManager = new SoundManager();
  window.game = new IntervalBattleGame();
});
