/**
 * 題目語音報讀系統 (Text-to-Speech / Speech Synthesis Reader)
 * 使用原生 Web Speech API，零外部套件，無延遲，完美支援中英雙語發音
 */
class DungeonSpeechReader {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.currentUtterance = null;
    this.isSpeaking = false;
    this.voices = [];
    this.onStateChange = null; // 外部回調：(isSpeaking) => void

    if (this.synth) {
      this._loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }
  }

  _loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices() || [];
  }

  // 取得最佳匹配的語言語音
  _getVoiceForLang(lang = 'zh') {
    if (!this.voices || this.voices.length === 0) {
      this._loadVoices();
    }

    if (lang === 'zh') {
      // 優先尋找繁體中文 (zh-TW, zh-HK)
      const twVoice = this.voices.find(v => v.lang === 'zh-TW' || v.lang === 'zh_TW');
      if (twVoice) return twVoice;
      const hkVoice = this.voices.find(v => v.lang === 'zh-HK' || v.lang === 'zh_HK');
      if (hkVoice) return hkVoice;
      const zhVoice = this.voices.find(v => v.lang.startsWith('zh'));
      return zhVoice || null;
    } else {
      // 英語 (en-US, en-GB, en)
      const usVoice = this.voices.find(v => v.lang === 'en-US' || v.lang === 'en_US');
      if (usVoice) return usVoice;
      const gbVoice = this.voices.find(v => v.lang === 'en-GB' || v.lang === 'en_GB');
      if (gbVoice) return gbVoice;
      const enVoice = this.voices.find(v => v.lang.startsWith('en'));
      return enVoice || null;
    }
  }

  // 清洗文字，將 HTML 標籤與特殊數學符號轉換為易朗讀之自然語音
  cleanTextForSpeech(htmlText, lang = 'zh') {
    if (!htmlText) return '';

    // 1. 去除 HTML 標籤
    let text = htmlText.replace(/<[^>]*>/g, ' ');

    // 2. 替換數學符號為易讀單詞
    if (lang === 'zh') {
      text = text.replace(/÷/g, ' 除以 ')
                 .replace(/×/g, ' 乘以 ')
                 .replace(/＋/g, ' 加 ')
                 .replace(/－/g, ' 減 ')
                 .replace(/＝/g, ' 等於 ')
                 .replace(/⋯⋯/g, ' 依此類推 ')
                 .replace(/⋯/g, ' 餘數 ')
                 .replace(/gcd\s*\(([^,]+),\s*([^)]+)\)/gi, ' $1 與 $2 的最大公因數 ');
    } else {
      text = text.replace(/÷/g, ' divided by ')
                 .replace(/×/g, ' times ')
                 .replace(/＋/g, ' plus ')
                 .replace(/－/g, ' minus ')
                 .replace(/＝/g, ' equals ')
                 .replace(/⋯⋯/g, ' and so on ')
                 .replace(/gcd\s*\(([^,]+),\s*([^)]+)\)/gi, ' greatest common divisor of $1 and $2 ');
    }

    // 3. 去除多餘空格與特殊表情符號干擾
    text = text.replace(/[🩸💀🦂👁️🦴⚖️⏳🧪🪙📏⛩️⭕🏛️🔑⚠️📜💡]+/g, ' ')
               .replace(/\s+/g, ' ')
               .trim();

    return text;
  }

  // 開始報讀
  speak(text, lang = 'zh', onEndCallback = null) {
    if (!this.synth) {
      console.warn('Speech synthesis not supported on this browser');
      return false;
    }

    this.stop(); // 停止先前的朗讀

    const clean = this.cleanTextForSpeech(text, lang);
    if (!clean) return false;

    const utterance = new SpeechSynthesisUtterance(clean);
    utterance.lang = (lang === 'zh') ? 'zh-TW' : 'en-US';
    utterance.rate = (lang === 'zh') ? 0.95 : 0.92; // 稍慢節奏，適合學生聽題
    utterance.pitch = 1.0;

    const voice = this._getVoiceForLang(lang);
    if (voice) {
      utterance.voice = voice;
    }

    utterance.onstart = () => {
      this.isSpeaking = true;
      if (this.onStateChange) this.onStateChange(true);
    };

    utterance.onend = () => {
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
      if (onEndCallback) onEndCallback();
    };

    utterance.onerror = (e) => {
      console.warn('TTS error:', e);
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
    };

    this.currentUtterance = utterance;
    this.synth.speak(utterance);
    return true;
  }

  // 停止報讀
  stop() {
    if (!this.synth) return;
    if (this.isSpeaking || this.synth.speaking) {
      this.synth.cancel();
      this.isSpeaking = false;
      this.currentUtterance = null;
      if (this.onStateChange) this.onStateChange(false);
    }
  }

  // 切換朗讀狀態（播放中則暫停/停止，否則播放）
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
