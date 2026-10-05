/**
 * 題目語音報讀系統 (Text-to-Speech / Speech Synthesis Reader)
 * - 優先挑選微軟自然神經語音 (Microsoft Natural/Online) 與 Google 神經語音，徹底告別生硬機械音
 * - 智能題目語音淨化：過濾密碼鎖輸入提示、括號標點、符號雜訊，將單位與數學公式轉換為真人自然語調
 * - 分句擬真朗讀：以自然語句節奏循環播放，模擬真人呼吸停頓，並徹底根絕 Chrome 15 秒中斷臭蟲
 */
class DungeonSpeechReader {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.isSpeaking = false;
    this.voices = [];
    this.queue = [];
    this.sentenceTimer = null;
    this.currentUtterance = null;
    this.onStateChange = null;

    if (this.synth) {
      this._loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => {
          this._loadVoices();
        };
      }
    }
  }

  _loadVoices() {
    if (!this.synth) return;
    try {
      const list = this.synth.getVoices();
      if (list && list.length > 0) {
        this.voices = list;
      }
    } catch (e) {
      console.warn('Failed to get voices:', e);
    }
  }

  /**
   * 智能語音評分與挑選演算法
   * 優先級：微軟 Natural/Neural > Google 神經語音 > Apple Siri/Meijia/Samantha > 其他真實語音
   * 嚴厲淘汰扣分：Windows 傳統 SAPI5 舊型桌面機械音 (Hanhan Desktop, David Desktop, Zira Desktop)
   */
  _getBestVoice(lang = 'zh') {
    if (!this.synth) return null;
    this._loadVoices();
    if (!this.voices || this.voices.length === 0) return null;

    const isZh = (lang === 'zh');

    const scored = this.voices.map(voice => {
      let score = 0;
      const name = (voice.name || '').toLowerCase();
      const vLang = (voice.lang || '').toLowerCase().replace(/_/g, '-');

      if (isZh) {
        const isTW = vLang === 'zh-tw' || vLang === 'cmn-tw' || name.includes('taiwan') || name.includes('台灣') || name.includes('臺灣');
        const isHK = vLang === 'zh-hk' || vLang === 'yue-hk';
        const isGeneralZh = vLang.startsWith('zh') || vLang.startsWith('cmn');

        if (!isGeneralZh && !isTW && !isHK) return { voice, score: -5000 };

        // 1. 微軟自然神經語音 (Edge / Windows 11 最高品質真人聲音：曉臻、雲哲、曉雨)
        if (name.includes('natural')) score += 1500;
        if (name.includes('hsiaochen') || name.includes('yunjhe') || name.includes('hsiaoyu')) score += 1000;
        if (name.includes('online')) score += 600;

        // 2. Google 神經網路語音 (Chrome 內建極流暢國語)
        if (name.includes('google')) {
          score += 1200;
          if (name.includes('臺灣') || name.includes('台灣') || isTW) score += 400;
        }

        // 3. Apple 擬真語音 (iOS / macOS Siri, Meijia 美佳)
        if (name.includes('meijia') || name.includes('sinji') || name.includes('siri') || name.includes('premium')) score += 1100;

        // 地區偏好：台灣繁體 > 香港 > 其他中文
        if (isTW) score += 500;
        else if (isHK) score += 300;
        else if (isGeneralZh) score += 150;

        // 淘汰 Windows 傳統 SAPI5 機械聲音
        if (name.includes('desktop') || name.includes('hanhan') || name.includes('huihui') || name.includes('yaoyao') || name.includes('kangkang')) {
          score -= 2500;
        }
      } else {
        const isUS = vLang === 'en-us';
        const isGB = vLang === 'en-gb';
        const isGeneralEn = vLang.startsWith('en');

        if (!isGeneralEn) return { voice, score: -5000 };

        // 1. 微軟自然神經語音 (Jenny, Guy, Aria, Steffan 等真人發音)
        if (name.includes('natural')) score += 1500;
        if (name.includes('jenny') || name.includes('guy') || name.includes('aria') || name.includes('steffan')) score += 1000;
        if (name.includes('online')) score += 600;

        // 2. Google 英文神經網路語音
        if (name.includes('google')) {
          score += 1200;
          if (isUS) score += 300;
        }

        // 3. Apple 擬真英文語音 (Samantha, Alex, Siri, Daniel)
        if (name.includes('samantha') || name.includes('siri') || name.includes('alex') || name.includes('daniel') || name.includes('karen') || name.includes('premium')) score += 1100;

        // 地區偏好：en-US > en-GB > 其他
        if (isUS) score += 500;
        else if (isGB) score += 350;
        else if (isGeneralEn) score += 150;

        // 淘汰 Windows 傳統 SAPI5 舊型機械聲音
        if (name.includes('desktop') || name.includes('david') || name.includes('zira') || name.includes('mark') || name.includes('george')) {
          score -= 2500;
        }
      }

      return { voice, score };
    });

    scored.sort((a, b) => b.score - a.score);
    const chosen = scored[0] && scored[0].score > -1000 ? scored[0].voice : null;

    if (chosen) {
      console.log(`[TTS] 啟動最佳擬真人聲: ${chosen.name} (${chosen.lang})`);
    }
    return chosen;
  }

  /**
   * 清理文字，使朗讀效果趨近真人教師讀題：
   * 1. 移除 HTML 標籤
   * 2. 移除密碼鎖介面操作提示 (例如 "(若為小數如 13.5，密碼請輸入 0135...)")
   * 3. 移除表情符號 (Emojis) 避免發出卡頓雜音
   * 4. 移除雙引號、括號等外框標點，避免朗讀引擎逐字唸出「引號」、「括號」
   * 5. 轉換單位與數學符號為自然語言單詞
   */
  cleanTextForSpeech(htmlText, lang = 'zh') {
    if (!htmlText) return '';

    let text = htmlText;

    // 1. 去除 HTML 標籤
    text = text.replace(/<[^>]*>/g, ' ');

    // 2. 移除密碼輸入引導括號內容
    text = text.replace(/（[^）]*(?:輸入|密碼|輸0|小數|整數)[^）]*）/gi, ' ')
               .replace(/\([^)]*(?:enter|code|decimal|integer|e\.g\.)[^)]*\)/gi, ' ')
               .replace(/（\s*例\s*[:：][^）]*）/gi, ' ')
               .replace(/\(\s*e\.g\.[^)]*\)/gi, ' ');

    // 3. 徹底清除所有 Emoji 圖示
    text = text.replace(/[\u{1F300}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, ' ');

    // 4. 清除外框括號與引號，避免機械逐字朗讀符號名稱
    text = text.replace(/[【】\[\]『』「」"“”'‘’《》]/g, ' ')
               .replace(/[（）()]/g, '，');

    if (lang === 'zh') {
      // 中文單位與數學符號轉為自然中文字詞
      text = text.replace(/(\d+)\s*m\b/gi, '$1公尺')
                 .replace(/(\d+)\s*hrs?\b/gi, '$1小時')
                 .replace(/(\d+)\s*mins?\b/gi, '$1分鐘')
                 .replace(/(\d+)\s*時\b/g, '$1小時')
                 .replace(/(\d+)\s*L\/min\b/gi, '$1公升每分鐘')
                 .replace(/(\d+)\s*L\b/gi, '$1公升')
                 .replace(/gcd\s*\(([^,]+),\s*([^)]+)\)/gi, '$1與$2的最大公因數')
                 .replace(/÷/g, ' 除以 ')
                 .replace(/×/g, ' 乘以 ')
                 .replace(/＋/g, ' 加 ')
                 .replace(/－/g, ' 減 ')
                 .replace(/＝/g, ' 等於 ')
                 .replace(/⋯⋯|\.{3,}|…/g, '，依此類推，')
                 .replace(/[:：]/g, '，'); // 冒號轉為逗號自然停頓
    } else {
      // 英文單位與數學符號轉為自然英語單詞
      text = text.replace(/#(\d+)\b/g, 'number $1')
                 .replace(/(\d+)\s*m\b/gi, '$1 meters')
                 .replace(/(\d+)\s*hrs?\b/gi, '$1 hours')
                 .replace(/(\d+)\s*mins?\b/gi, '$1 minutes')
                 .replace(/(\d+)\s*L\/min\b/gi, '$1 liters per minute')
                 .replace(/(\d+)\s*L\b/gi, '$1 liters')
                 .replace(/gcd\s*\(([^,]+),\s*([^)]+)\)/gi, 'greatest common divisor of $1 and $2')
                 .replace(/÷/g, ' divided by ')
                 .replace(/×/g, ' times ')
                 .replace(/＋|\+/g, ' plus ')
                 .replace(/－/g, ' minus ')
                 .replace(/＝|=/g, ' equals ')
                 .replace(/⋯⋯|\.{3,}|…/g, ', and so on, ')
                 .replace(/[:：]\s*/g, ', '); // 冒號轉為逗號自然停頓
    }

    // 5. 整理標點與連續空白
    text = text.replace(/[,，]{2,}/g, '，')
               .replace(/[.]{2,}/g, '.')
               .replace(/\s+/g, ' ')
               .trim();

    return text;
  }

  // 將文字依標點符號分割為多個自然語句
  _splitIntoSentences(text, lang = 'zh') {
    if (!text) return [];

    let rawList = [];
    if (lang === 'zh') {
      rawList = text.split(/([。！？!?；\n]+)/);
    } else {
      // 英文切句時保護小數點 (例如 9.5)
      rawList = text.split(/(\.(?!\d)|[!?\n]+)/);
    }

    const sentences = [];
    let current = '';

    for (let i = 0; i < rawList.length; i++) {
      const part = rawList[i];
      if (!part) continue;

      if (/^[。！？!?；.\n]+$/.test(part)) {
        current += part.trim();
        if (current.trim().length > 0) {
          sentences.push(current.trim());
          current = '';
        }
      } else {
        if (current) {
          sentences.push(current.trim());
          current = '';
        }
        current = part.trim();
      }
    }

    if (current.trim().length > 0) {
      sentences.push(current.trim());
    }

    return sentences.filter(s => s.replace(/[。！？!?；.,，\s]/g, '').length > 0);
  }

  /**
   * 開始報讀
   */
  speak(text, lang = 'zh', onEndCallback = null) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this browser');
      return false;
    }

    this.stop(); // 停止先前的朗讀

    const clean = this.cleanTextForSpeech(text, lang);
    if (!clean) return false;

    const sentences = this._splitIntoSentences(clean, lang);
    if (sentences.length === 0) return false;

    this.queue = [...sentences];
    this.isSpeaking = true;
    if (this.onStateChange) this.onStateChange(true);

    const voice = this._getBestVoice(lang);

    const playNext = () => {
      if (!this.isSpeaking || this.queue.length === 0) {
        this.isSpeaking = false;
        this.currentUtterance = null;
        if (this.onStateChange) this.onStateChange(false);
        if (onEndCallback) onEndCallback();
        return;
      }

      const sentenceText = this.queue.shift();
      const utterance = new SpeechSynthesisUtterance(sentenceText);
      utterance.lang = (lang === 'zh') ? 'zh-TW' : 'en-US';
      utterance.rate = 1.0; // 原生標準速度，保持神經語音的自然韻律
      utterance.pitch = 1.0;
      utterance.volume = 1.0;

      if (voice) {
        utterance.voice = voice;
      }

      utterance.onend = () => {
        if (!this.isSpeaking) return;
        // 語句間自然呼吸停頓 (200ms)
        this.sentenceTimer = setTimeout(() => {
          playNext();
        }, 200);
      };

      utterance.onerror = (e) => {
        console.warn('TTS utterance error:', e);
        if (this.isSpeaking && this.queue.length > 0) {
          playNext();
        } else {
          this.stop();
        }
      };

      this.currentUtterance = utterance;

      // 喚醒可能的暫停狀態並播放
      try {
        if (this.synth.paused) {
          this.synth.resume();
        }
      } catch (err) {}

      this.synth.speak(utterance);
    };

    playNext();
    return true;
  }

  /**
   * 停止報讀
   */
  stop() {
    if (this.sentenceTimer) {
      clearTimeout(this.sentenceTimer);
      this.sentenceTimer = null;
    }
    this.queue = [];
    if (this.synth) {
      try {
        this.synth.cancel();
      } catch (e) {}
    }
    this.isSpeaking = false;
    this.currentUtterance = null;
    if (this.onStateChange) this.onStateChange(false);
  }

  toggle(text, lang = 'zh') {
    if (this.isSpeaking) {
      this.stop();
      return false;
    } else {
      return this.speak(text, lang);
    }
  }
}

window.DungeonSpeechReader = DungeonSpeechReader;
