/**
 * 密室逃脫主控制器 (Game Controller)
 * 負責關卡流轉、理智值 (Sanity)、多國語系切換 (zh/en)、語音報讀 (TTS)、線索筆記本與通關結算
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
    this.chamberWrongCount = 0;
    this.lockSystem = null;
    this.lang = localStorage.getItem('curse_of_numbers_lang') || 'zh'; // 'zh' 或 'en'
    this.ttsReader = new DungeonSpeechReader();

    this.dom = {};
  }

  init() {
    this._cacheDom();
    this._bindGlobalEvents();
    this._initMouseTorch();
    this._updateLanguageUI();

    // 檢查是否有儲存的進度
    const saved = localStorage.getItem('curse_of_numbers_save');
    if (saved) {
      try {
        const data = JSON.parse(saved);
        this.studentInfo = data.studentInfo;
        this.sanity = data.sanity || 100;
        this.currentChamberIdx = data.currentChamberIdx || 0;
        this.wrongCount = data.wrongCount || 0;
        this.chamberWrongCount = data.chamberWrongCount || 0;
        this.startTime = data.startTime ? new Date(data.startTime) : new Date();
        this._startWithSeed(data.chamberOrder);
        return;
      } catch (e) {
        console.warn('Failed to restore save', e);
      }
    }

    // 顯示初次登入設定彈窗
    this._showLoginModal();
  }

  _cacheDom() {
    this.dom.loginModal = document.getElementById('loginModal');
    this.dom.journalModal = document.getElementById('journalModal');
    this.dom.victoryScreen = document.getElementById('victoryScreen');
    this.dom.gameMain = document.getElementById('gameMain');

    // 頂部狀態列
    this.dom.chamberBadge = document.getElementById('chamberBadge');
    this.dom.studentBadge = document.getElementById('studentBadge');
    this.dom.sanityLabel = document.querySelector('.sanity-label');
    this.dom.sanityFill = document.getElementById('sanityFill');
    this.dom.sanityVal = document.getElementById('sanityVal');

    this.dom.btnLang = document.getElementById('btnLang');
    this.dom.btnTTS = document.getElementById('btnTTS');
    this.dom.btnMute = document.getElementById('btnMute');
    this.dom.btnJournal = document.getElementById('btnJournal');
    this.dom.btnLogout = document.getElementById('btnLogout');
    this.dom.journalBtnText = document.getElementById('journalBtnText');
    this.dom.logoutBtnText = document.getElementById('logoutBtnText');

    // 密室內容
    this.dom.chamberTitle = document.getElementById('chamberTitle');
    this.dom.chamberSubtitle = document.getElementById('chamberSubtitle');
    this.dom.chamberLore = document.getElementById('chamberLore');
    this.dom.chamberStory = document.getElementById('chamberStory');
    this.dom.targetQuestion = document.getElementById('targetQuestion');
    this.dom.lockMount = document.getElementById('lockMount');
    this.dom.whisperAlert = document.getElementById('whisperAlert');
    this.dom.gateOverlay = document.getElementById('gateOverlay');
    this.dom.torchMask = document.getElementById('torchMask');
  }

  // 手電筒/火把光暈跟隨效果 (Torchlight Vignette: 理智 <= 30% 時跟隨鼠標/觸控)
  _initMouseTorch() {
    window.addEventListener('pointermove', (e) => {
      if (!this.dom.torchMask || this.sanity > 30) return;
      const x = e.clientX;
      const y = e.clientY;
      this.dom.torchMask.style.background = `radial-gradient(circle 380px at ${x}px ${y}px, rgba(0, 0, 0, 0.05) 0%, rgba(5, 5, 10, 0.78) 70%, rgba(3, 3, 5, 0.96) 100%)`;
    }, { passive: true });
  }

  _bindGlobalEvents() {
    // 座號步進按鈕 (▲ / ▼)
    const btnDownCurse = document.getElementById('btnSeatDownCurse');
    const btnUpCurse = document.getElementById('btnSeatUpCurse');
    const selectSeatCurse = document.getElementById('inputSeatNum');
    if (btnDownCurse && selectSeatCurse) {
      btnDownCurse.addEventListener('click', () => {
        if (selectSeatCurse.selectedIndex > 0) {
          selectSeatCurse.selectedIndex--;
          this.audio?.playDialTick?.();
        }
      });
    }
    if (btnUpCurse && selectSeatCurse) {
      btnUpCurse.addEventListener('click', () => {
        if (selectSeatCurse.selectedIndex < selectSeatCurse.options.length - 1) {
          selectSeatCurse.selectedIndex++;
          this.audio?.playDialTick?.();
        }
      });
    }

    // 登入確認按鈕
    const btnStart = document.getElementById('btnStartAdventure');
    if (btnStart) {
      btnStart.addEventListener('click', () => {
        const cName = document.getElementById('inputClassName').value.trim() || '601';
        const sNum = document.getElementById('inputSeatNum').value.trim() || '01';
        const defaultNick = (this.lang === 'en') ? 'Adventurer' : '冒險者';
        const nick = document.getElementById('inputNickname').value.trim() || defaultNick;

        this.studentInfo = {
          className: cName,
          seatNum: sNum.padStart(2, '0'),
          nickname: nick
        };

        // 記住本次輸入的班級、座號與姓名
        try {
          localStorage.setItem('math_student_profile', JSON.stringify({
            classNum: cName,
            seatNum: sNum.padStart(2, '0'),
            name: nick
          }));
        } catch (e) {}

        this.startTime = new Date();
        this.sanity = 100;
        this.currentChamberIdx = 0;
        this._hideLoginModal();
        this._startWithSeed();
      });
    }

    // 語言切換按鈕 (中英無縫切換，拒絕混雜並排)
    this.dom.btnLang?.addEventListener('click', () => {
      this.toggleLanguage();
    });

    // 語音報讀按鈕 (TTS)
    this.dom.btnTTS?.addEventListener('click', () => {
      this.toggleTTS();
    });

    // 登出換座號
    this.dom.btnLogout?.addEventListener('click', () => {
      const confirmMsg = (this.lang === 'en')
        ? 'Are you sure you want to log out and start fresh with a new seat number?'
        : '確定要登出並換新的座號重新闖關嗎？';
      if (confirm(confirmMsg)) {
        this.logout();
      }
    });

    // 靜音切換
    this.dom.btnMute?.addEventListener('click', () => {
      const isMuted = window.audioMgr.toggleMute();
      this.dom.btnMute.innerHTML = isMuted ? '🔇' : '🔊';
      this.dom.btnMute.title = isMuted 
        ? (this.lang === 'en' ? 'Unmute' : '解除靜音') 
        : (this.lang === 'en' ? 'Mute' : '靜音');
    });

    // 打開線索筆記本
    this.dom.btnJournal?.addEventListener('click', () => {
      this._openJournal();
    });

    // 關閉線索筆記本
    document.getElementById('btnCloseJournal')?.addEventListener('click', () => {
      this._closeJournal();
    });

    // 鍵盤快捷鍵：J 鍵開筆記本、M 鍵靜音、R 鍵報讀
    window.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT') return;
      if (e.key === 'j' || e.key === 'J') {
        this._openJournal();
      } else if (e.key === 'm' || e.key === 'M') {
        this.dom.btnMute?.click();
      } else if (e.key === 'r' || e.key === 'R') {
        this.toggleTTS();
      }
    });

    // TTS 狀態回調
    this.ttsReader.onStateChange = (isSpeaking) => {
      this._updateTTSButtonUI(isSpeaking);
    };
  }

  // 切換語言
  toggleLanguage() {
    this.ttsReader.stop();
    this.lang = (this.lang === 'zh') ? 'en' : 'zh';
    localStorage.setItem('curse_of_numbers_lang', this.lang);
    this._updateLanguageUI();
    if (this.chambers && this.chambers.length > 0) {
      this._loadChamber(this.currentChamberIdx);
    }
  }

  // 語音報讀切換
  toggleTTS() {
    const chamber = this.chambers[this.currentChamberIdx];
    if (!chamber) return;

    if (this.ttsReader.isSpeaking) {
      this.ttsReader.stop();
      this._updateTTSButtonUI(false);
    } else {
      const titleText = chamber.getTitle(this.lang);
      const storyText = chamber.getStory(this.lang);
      const fullSpeech = (this.lang === 'en')
        ? `${titleText}. ${storyText}`
        : `${titleText}。${storyText}`;

      this.ttsReader.speak(fullSpeech, this.lang, () => {
        this._updateTTSButtonUI(false);
      });
      this._updateTTSButtonUI(true);
    }
  }

  _updateTTSButtonUI(isSpeaking) {
    if (!this.dom.btnTTS) return;
    if (isSpeaking) {
      this.dom.btnTTS.innerHTML = (this.lang === 'en') ? '⏹️ Stop' : '⏹️ 停止';
      this.dom.btnTTS.classList.add('tts-speaking');
    } else {
      this.dom.btnTTS.innerHTML = (this.lang === 'en') ? '🔊 Read' : '🔊 朗讀';
      this.dom.btnTTS.classList.remove('tts-speaking');
    }
  }

  // 更新所有靜態 UI 語言文字
  _updateLanguageUI() {
    const isEn = (this.lang === 'en');

    if (this.dom.btnLang) {
      this.dom.btnLang.innerHTML = isEn ? '🌐 中文' : '🌐 English';
    }
    if (this.dom.journalBtnText) {
      this.dom.journalBtnText.textContent = isEn ? 'Notes' : '染血筆記';
    }
    if (this.dom.logoutBtnText) {
      this.dom.logoutBtnText.textContent = isEn ? 'Logout' : '登出';
    }
    if (this.dom.sanityLabel) {
      this.dom.sanityLabel.textContent = isEn ? 'Sanity' : '理智';
    }
    if (this.dom.studentBadge && this.studentInfo?.nickname) {
      this.dom.studentBadge.textContent = `👤 ${this.studentInfo.nickname}`;
    }
    this._updateTTSButtonUI(this.ttsReader.isSpeaking);

    // 登入彈窗文案
    const loginHeader = document.querySelector('#loginModal .modal-header h2');
    const loginDesc = document.querySelector('#loginModal .login-desc');
    const labelClass = document.querySelector('#loginModal label[for="inputClassName"]');
    const labelSeat = document.querySelector('#loginModal label[for="inputSeatNum"]');
    const labelNick = document.querySelector('#loginModal label[for="inputNickname"]');
    const btnStart = document.getElementById('btnStartAdventure');

    if (loginHeader) loginHeader.textContent = isEn ? '🏰 Adventurer Sign-in' : '🏰 冒險者登錄・踏入禁忌地牢';
    if (loginDesc) {
      loginDesc.innerHTML = isEn 
        ? `Welcome to <em>The Curse of Numbers: Dungeon Escape</em>!<br>Designed in accordance with Grade 6 Mathematics Unit 3 <em>"Quantitative Relations"</em>.<br><span style="color: #ffd54f;">⚠️ The labyrinth randomly generates unique numbers and codes based on your [Class & Seat Number]. Every student has different puzzles, so cheating is impossible! Think carefully!</span>`
        : `歡迎來到《數之咒印：禁忌地牢逃脫》！<br>本遊戲依據<strong>國小六年級康軒數學第 03 單元《數量關係》</strong>設計。<br><span style="color: #ffd54f;">⚠️ 系統會依據您的【班級與座號】自動生成您專屬的迷宮數值與開鎖密碼，每位同學題目參數完全不同，無法抄襲！請認真推導！</span>`;
    }
    if (labelClass) labelClass.textContent = isEn ? 'Class ID' : '班級代號';
    if (labelSeat) labelSeat.textContent = isEn ? 'Seat No. (Seed Code)' : '座號 (關鍵種子碼)';
    if (labelNick) labelNick.textContent = isEn ? 'Adventurer Name' : '冒險者暱稱 / 姓名';
    if (btnStart) btnStart.innerHTML = isEn ? '🔥 Light Torch & Enter Dungeon' : '🔥 點燃火把・踏入密室';
  }

  _showLoginModal() {
    this.dom.loginModal.classList.remove('hidden');

    // 載入前一次記住的學生資料
    try {
      const savedProfile = localStorage.getItem('math_student_profile');
      if (savedProfile) {
        const p = JSON.parse(savedProfile);
        const classEl = document.getElementById('inputClassName');
        const seatEl = document.getElementById('inputSeatNum');
        const nickEl = document.getElementById('inputNickname');
        if (classEl && p.classNum) classEl.value = p.classNum;
        if (seatEl && p.seatNum) seatEl.value = p.seatNum;
        if (nickEl && p.name) nickEl.value = p.name;
      }
    } catch (e) {}
  }

  _hideLoginModal() {
    this.dom.loginModal.classList.add('hidden');
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
    }, 50);
    window.audioMgr.ensureContext();
  }

  // 根據種子啟動遊戲
  _startWithSeed(customOrder = null) {
    const seed = `${this.studentInfo.className}-${this.studentInfo.seatNum}`;
    const engine = new DungeonQuestionEngine(seed);
    this.chambers = engine.generateAllChambers(customOrder);

    // 更新個人銘牌 (僅顯示暱稱)
    if (this.dom.studentBadge) {
      this.dom.studentBadge.textContent = `👤 ${this.studentInfo.nickname}`;
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

    // 關卡切換置頂
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;

    const chamber = this.chambers[index];
    this.currentChamberIdx = index;
    this.chamberWrongCount = 0; // 重置該關的失誤次數
    this._saveProgress();

    // 停止上一題的語音報讀
    this.ttsReader.stop();
    this._updateTTSButtonUI(false);

    const isEn = (this.lang === 'en');

    // 更新關卡徽章 (動態反映洗牌後的當前關卡序號)
    if (this.dom.chamberBadge) {
      const stageNo = chamber.stageIndex || (index + 1);
      this.dom.chamberBadge.textContent = isEn 
        ? `🏰 Chamber ${stageNo} / ${this.chambers.length}`
        : `🏰 關卡 ${stageNo} / ${this.chambers.length}`;
    }

    // 更新文案
    if (this.dom.chamberTitle) this.dom.chamberTitle.textContent = chamber.getTitle(this.lang);
    if (this.dom.chamberSubtitle) this.dom.chamberSubtitle.textContent = chamber.getSubtitle(this.lang);
    if (this.dom.chamberLore) this.dom.chamberLore.textContent = chamber.getLore(this.lang);
    if (this.dom.chamberStory) this.dom.chamberStory.innerHTML = chamber.getStory(this.lang);

    const qPrefix = isEn ? '⚠️ <strong>Gate Riddle: </strong>' : '⚠️ <strong>開門機關謎語：</strong>';
    if (this.dom.targetQuestion) this.dom.targetQuestion.innerHTML = qPrefix + chamber.getTargetQuestion(this.lang);

    // 清空前次警報
    if (this.dom.whisperAlert) {
      this.dom.whisperAlert.classList.add('hidden');
      this.dom.whisperAlert.textContent = '';
    }

    // 初始化開鎖元件
    this.lockSystem = new DungeonLockSystem(this.dom.lockMount, (isSuccess, code) => {
      this._handleUnlockAttempt(isSuccess, code);
    });
    this.lockSystem.setup(chamber.correctCode, this.lang);

    // 播放心跳聲 (隨理智值調節)
    if (this.sanity <= 30) {
      window.audioMgr.startHeartbeat(115);
    } else if (this.sanity < 50) {
      window.audioMgr.startHeartbeat(100);
    } else {
      window.audioMgr.stopHeartbeat();
    }
  }

  // 處理開鎖嘗試
  _handleUnlockAttempt(isSuccess, code) {
    const chamber = this.chambers[this.currentChamberIdx];
    const isEn = (this.lang === 'en');

    if (isSuccess) {
      this.ttsReader.stop();

      // 方案 3：精準解鎖加成動態恢復理智
      // 該關 0 次失誤: +25%
      // 該關 1 次失誤: +15%
      // 該關 2 次以上失誤: +10%
      let healAmount = 25;
      if (this.chamberWrongCount === 1) {
        healAmount = 15;
      } else if (this.chamberWrongCount >= 2) {
        healAmount = 10;
      }

      const { recovered, liftedDarkness } = this._restoreSanity(healAmount);
      window.audioMgr.playSanityHeal();

      let msg = '';
      if (isEn) {
        msg = `✨ [Stone Gate Rumbles] Code [${code}] is correct! Sanity +${healAmount}%!`;
        if (liftedDarkness) {
          msg += ' ☀️ Darkness dispelled, vision restored!';
        }
      } else {
        msg = `✨【石門轟鳴】密碼【${code}】完全正確！理智 ＋${healAmount}%！`;
        if (liftedDarkness) {
          msg += ' ☀️ 驅散黑暗，視野重現光明！';
        }
      }

      this._showWhisper(msg, 'success');
      this._animateGateOpen(() => {
        this._loadChamber(this.currentChamberIdx + 1);
      });
    } else {
      this.wrongCount++;
      this.chamberWrongCount = (this.chamberWrongCount || 0) + 1;
      this._reduceSanity(15);
      const hints = chamber.getHints(this.lang);
      const hint = hints[0] || (isEn ? 'Incorrect! Observe the pattern closely.' : '數字不對！請仔細觀察題目的規律與算式！');
      const msg = isEn
        ? `💀 [Dungeon Mockery] Lock jammed! Code [${code}] is wrong! ${hint}`
        : `💀【惡靈嘲弄】鎖栓卡死！密碼【${code}】錯誤！${hint}`;
      this._showWhisper(msg, 'danger');

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

    const gateTitle = this.dom.gateOverlay.querySelector('.gate-title');
    const gateSub = this.dom.gateOverlay.querySelector('p');
    if (gateTitle) {
      gateTitle.textContent = (this.lang === 'en') ? '[Stone Gate Rumbles・Ward Collapses]' : '【石門轟鳴震顫・咒印瓦解】';
    }
    if (gateSub) {
      gateSub.textContent = (this.lang === 'en') ? 'Stepping into the next dark chamber...' : '踏入下一間幽暗密室⋯⋯';
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

  // 恢復理智值 (答對開鎖激勵)
  _restoreSanity(amount) {
    const prevSanity = this.sanity;
    this.sanity = Math.min(100, this.sanity + amount);
    this._updateSanityUI();

    // 綠光治療動畫特效
    if (this.dom.sanityFill) {
      this.dom.sanityFill.classList.add('sanity-heal-pulse');
      setTimeout(() => {
        this.dom.sanityFill?.classList.remove('sanity-heal-pulse');
      }, 800);
    }

    return {
      recovered: this.sanity - prevSanity,
      liftedDarkness: prevSanity <= 30 && this.sanity > 30
    };
  }

  // 扣除理智值
  _reduceSanity(amount) {
    const prevSanity = this.sanity;
    this.sanity = Math.max(0, this.sanity - amount);
    this._updateSanityUI();

    if (this.sanity <= 30) {
      window.audioMgr.startHeartbeat(115);
      if (prevSanity > 30) {
        const isEn = (this.lang === 'en');
        const alertMsg = isEn
          ? '⚠️ [Darkness Closes In] Sanity fell below 30%! The darkness encroaches; flashlight mode activated!'
          : '⚠️【黑暗降臨】理智跌破 30%！黑暗壟罩地牢，已啟動手電筒暗黑探索模式！';
        this._showWhisper(alertMsg, 'danger');
      }
    } else if (this.sanity < 50) {
      window.audioMgr.startHeartbeat(100);
    } else {
      window.audioMgr.stopHeartbeat();
    }

    if (this.sanity <= 0) {
      const isEn = (this.lang === 'en');
      const msg = isEn
        ? `🕯️ [Sanity Restored] You fainted in the dark... Ancient spirits revived part of your wits! Check your notes for guidance!`
        : `🕯️【微光復甦】你在黑暗中昏厥了過去⋯古老英靈為你恢復了部分神智，並在牆上留下了強烈的提示！快查看筆記本！`;
      this._showWhisper(msg, 'warning');
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

    // 理智值 <= 30% 啟用手電筒暗黑遮罩效果，> 30% 則關閉恢復正常
    this._updateTorchMaskState();
  }

  _updateTorchMaskState() {
    if (!this.dom.torchMask) return;
    if (this.sanity <= 30) {
      this.dom.torchMask.classList.add('active');
    } else {
      this.dom.torchMask.classList.remove('active');
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

    const isEn = (this.lang === 'en');
    if (titleEl) {
      titleEl.textContent = isEn 
        ? `📖 Bloody Notes: ${chamber.getTitle('en')}` 
        : `📖 染血筆記本：${chamber.getTitle('zh')}`;
    }
    if (conceptEl) {
      conceptEl.textContent = isEn 
        ? `Core Concept: ${chamber.getConcept('en')}` 
        : `核心概念：${chamber.getConcept('zh')}`;
    }

    if (hintsEl) {
      hintsEl.innerHTML = chamber.getHints(this.lang).map(h => `<li>${h}</li>`).join('');
    }

    if (diagramEl) {
      diagramEl.innerHTML = DungeonDiagramRenderer.render(chamber.diagramType, chamber.diagramData, this.lang);
    }

    this.dom.journalModal.classList.remove('hidden');
  }

  _closeJournal() {
    window.audioMgr.playDialTick();
    this.dom.journalModal.classList.add('hidden');
  }

  // 登出並切換座號
  logout() {
    this.ttsReader.stop();
    localStorage.removeItem('curse_of_numbers_save');
    window.audioMgr.stopHeartbeat();
    this.sanity = 100;
    this.currentChamberIdx = 0;
    this.wrongCount = 0;
    this.chamberWrongCount = 0;
    this._updateSanityUI();
    this._showLoginModal();
  }

  // 通關勝利結算
  _triggerVictory() {
    this.ttsReader.stop();
    this.endTime = new Date();
    const durationSec = Math.floor((this.endTime - this.startTime) / 1000);
    const mins = Math.floor(durationSec / 60);
    const secs = durationSec % 60;
    const isEn = (this.lang === 'en');
    const timeFormatted = isEn ? `${mins}m ${secs}s` : `${mins} 分 ${secs} 秒`;

    window.audioMgr.stopHeartbeat();
    window.audioMgr.playEscapeVictory();
    this.dom.torchMask?.classList.remove('active');

    let stars = '⭐⭐⭐';
    let titleHonor = isEn ? 'Legendary Cursebreaker' : '傳奇破咒大師';
    if (this.sanity < 50 || this.wrongCount > 6) {
      stars = '⭐';
      titleHonor = isEn ? 'Hardened Survivor' : '歷劫生還勇者';
    } else if (this.sanity < 80 || this.wrongCount > 3) {
      stars = '⭐⭐';
      titleHonor = isEn ? 'Calm Pathfinder' : '沉著解謎先驅';
    }

    if (this.dom.victoryScreen) {
      this.dom.victoryScreen.innerHTML = `
        <div class="certificate-container">
          <div class="cert-border">
            <div class="cert-header">
              <div class="cert-icon">🏆</div>
              <h1 class="cert-title">${isEn ? 'Certificate of Dungeon Escape' : '禁忌地牢・生還脫出證書'}</h1>
              <p class="cert-sub">${isEn ? 'Grade 6 Mathematics "Quantitative Relations" Escape Verification' : '國小六年級數學《數量關係》密室解謎認證'}</p>
            </div>

            <div class="cert-body">
              <p class="cert-player">
                ${isEn 
                  ? `Congratulations to <strong>Class ${this.studentInfo.className} #${this.studentInfo.seatNum} [${this.studentInfo.nickname}]</strong>`
                  : `恭喜 <strong>${this.studentInfo.className} 班 ${this.studentInfo.seatNum} 號【${this.studentInfo.nickname}】</strong>`}
              </p>
              <p class="cert-desc">
                ${isEn
                  ? 'Having conquered cyclic patterns, invariant quantities, lantern intervals, and maximum corner spacing with greatest common divisors, you have successfully lifted the ancient curse and survived the dungeon!'
                  : '成功破解幾何規律、和差積商不變法則、引魂間隔與長寬最大公因數之四象陣眼，斬斷幽暗詛咒，全員平安生還逃出密室！'}
              </p>

              <div class="cert-stats-grid">
                <div class="stat-card">
                  <div class="stat-lbl">${isEn ? 'Escape Time' : '生還耗時'}</div>
                  <div class="stat-val">${timeFormatted}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-lbl">${isEn ? 'Remaining Sanity' : '剩餘理智值'}</div>
                  <div class="stat-val ${this.sanity <= 30 ? 'low' : ''}">${this.sanity}%</div>
                </div>
                <div class="stat-card">
                  <div class="stat-lbl">${isEn ? 'Mistakes' : '失誤次數'}</div>
                  <div class="stat-val">${this.wrongCount} ${isEn ? '' : '次'}</div>
                </div>
                <div class="stat-card">
                  <div class="stat-lbl">${isEn ? 'Rank' : '評定階級'}</div>
                  <div class="stat-val star-val">${stars} ${titleHonor}</div>
                </div>
              </div>
            </div>

            <div class="cert-footer">
              <div class="cert-date">${isEn ? 'Certified on: ' + new Date().toLocaleDateString('en-US') : '認證時間：' + new Date().toLocaleDateString('zh-TW')}</div>
              <div class="cert-actions">
                <button type="button" class="btn-cert btn-print" onclick="window.print()">🖨️ ${isEn ? 'Print / Save' : '列印/截圖留存'}</button>
                <button type="button" class="btn-cert btn-restart" onclick="localStorage.removeItem('curse_of_numbers_save'); location.reload();">🔄 ${isEn ? 'Try Again' : '再次挑戰'}</button>
                <a href="../../index.html" class="btn-cert btn-home">🏠 ${isEn ? 'Lobby' : '返回學習大廳'}</a>
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
      startTime: this.startTime,
      chamberOrder: this.chambers.map(c => c.id),
      wrongCount: this.wrongCount,
      chamberWrongCount: this.chamberWrongCount || 0
    };
    localStorage.setItem('curse_of_numbers_save', JSON.stringify(data));
  }
}

// 頁面載入後自動啟動
window.addEventListener('DOMContentLoaded', () => {
  window.dungeonGame = new DungeonEscapeController();
  window.dungeonGame.init();
});
