/**
 * 擬真人聲神經語音題目報讀系統 (ClockworkTtsReader)
 * 特色：
 * 1. 深度評分演算法優先挑選微軟 Natural、Google Neural、Apple Siri 真人語音
 * 2. 嚴格扣分懲罰 Windows 老舊 SAPI5 Desktop 機械音
 * 3. 教師級口語文字淨化（口語化單位、符號，濾除操作提示括號與 Emoji）
 * 4. 200ms 自然換氣分句隊列，徹底規避 Chromium 15 秒語音凍結 Bug
 */
class ClockworkTtsReader {
  constructor() {
    this.synth = window.speechSynthesis;
    this.currentUtterance = null;
    this.isPlaying = false;
    this.voiceZh = null;
    this.voiceEn = null;
    this.sentenceQueue = [];
    this.queueIndex = 0;
    this.timer = null;

    if (this.synth) {
      this._loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }
  }

  _loadVoices() {
    if (!this.synth) return;
    const voices = this.synth.getVoices();
    if (!voices || voices.length === 0) return;

    const zhVoices = voices.filter(v => v.lang.startsWith('zh'));
    this.voiceZh = this._pickBestVoice(zhVoices, 'zh');

    const enVoices = voices.filter(v => v.lang.startsWith('en'));
    this.voiceEn = this._pickBestVoice(enVoices, 'en');
  }

  _pickBestVoice(voices, lang = 'zh') {
    if (!voices || voices.length === 0) return null;

    let bestScore = -9999;
    let selected = voices[0];

    voices.forEach(v => {
      let score = 0;
      const name = (v.name || '').toLowerCase();
      const vLang = (v.lang || '').toLowerCase();

      // 微軟自然神經語音 (高音質)
      if (name.includes('natural') || name.includes('online')) score += 1000;
      if (name.includes('xiaochen') || name.includes('yunjhe')) score += 500;
      if (name.includes('jenny') || name.includes('guy') || name.includes('aria')) score += 500;

      // Google 神經人聲
      if (name.includes('google') || name.includes('neural')) score += 300;

      // Apple 高品質 Siri / 美佳 / Samantha
      if (name.includes('siri') || name.includes('meijia') || name.includes('samantha')) score += 250;

      // 語言精準匹配
      if (lang === 'zh' && (vLang === 'zh-tw' || vLang === 'zh_tw')) score += 150;
      if (lang === 'en' && (vLang === 'en-us' || vLang === 'en_us')) score += 150;

      // 嚴重懲罰陳舊機械聲音
      if (name.includes('desktop') || name.includes('hanhan') || name.includes('david') || name.includes('zira')) {
        score -= 1200;
      }

      if (score > bestScore) {
        bestScore = score;
        selected = v;
      }
    });

    return selected;
  }

  cleanText(text, lang = 'zh') {
    if (!text) return '';
    let s = text;

    // 移除括號內的介面操作提示
    s = s.replace(/（[^）]*?(?:輸入|密碼|撥|代碼)[^）]*?）/gi, '');
    s = s.replace(/\([^)]*?(?:enter|code|dial|input)[^)]*?\)/gi, '');

    // 移除所有 Emoji 與外框符號
    s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
    s = s.replace(/[【】『』「」［］\[\]]/g, ' ');

    if (lang === 'zh') {
      s = s.replace(/÷/g, ' 除以 ');
      s = s.replace(/×/g, ' 乘以 ');
      s = s.replace(/＝/g, ' 等於 ');
      s = s.replace(/=/g, ' 等於 ');
      s = s.replace(/＋/g, ' 加上 ');
      s = s.replace(/\+/g, ' 加上 ');
      s = s.replace(/GCD/gi, '最大公因數');
      s = s.replace(/LCM/gi, '最小公倍數');
      s = s.replace(/(\d+)\s*cm/gi, '$1公分');
    } else {
      s = s.replace(/÷/g, ' divided by ');
      s = s.replace(/×/g, ' multiplied by ');
      s = s.replace(/＝/g, ' equals ');
      s = s.replace(/=/g, ' equals ');
      s = s.replace(/\+/g, ' plus ');
      s = s.replace(/GCD/gi, 'Greatest Common Divisor');
      s = s.replace(/LCM/gi, 'Least Common Multiple');
      s = s.replace(/(\d+)\s*cm/gi, '$1 centimeters');
    }

    return s.trim();
  }

  speak(text, lang = 'zh', onEndCallback = null) {
    if (!this.synth) return;
    this.stop();

    const cleaned = this.cleanText(text, lang);
    if (!cleaned) return;

    // 分句隊列
    const delimiter = lang === 'zh' ? /(?<=[。！？!?\n])/ : /(?<=[.!?\n])/;
    this.sentenceQueue = cleaned
      .split(delimiter)
      .map(s => s.trim())
      .filter(s => s.length > 0);

    if (this.sentenceQueue.length === 0) return;

    this.queueIndex = 0;
    this.isPlaying = true;
    this._playNextSentence(lang, onEndCallback);
  }

  _playNextSentence(lang, onEndCallback) {
    if (!this.isPlaying) return;

    if (this.queueIndex >= this.sentenceQueue.length) {
      this.isPlaying = false;
      if (typeof onEndCallback === 'function') onEndCallback();
      return;
    }

    const sentence = this.sentenceQueue[this.queueIndex];
    this.queueIndex++;

    const utter = new SpeechSynthesisUtterance(sentence);
    const voice = lang === 'en' ? this.voiceEn : this.voiceZh;
    if (voice) {
      utter.voice = voice;
      utter.lang = voice.lang;
    } else {
      utter.lang = lang === 'en' ? 'en-US' : 'zh-TW';
    }

    utter.rate = lang === 'en' ? 0.95 : 1.0;
    utter.pitch = 1.0;

    utter.onend = () => {
      // 200ms 自然換氣停頓
      this.timer = setTimeout(() => {
        this._playNextSentence(lang, onEndCallback);
      }, 200);
    };

    utter.onerror = () => {
      this.isPlaying = false;
      if (typeof onEndCallback === 'function') onEndCallback();
    };

    this.currentUtterance = utter;
    this.synth.speak(utter);
  }

  stop() {
    this.isPlaying = false;
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }
    if (this.synth) {
      this.synth.cancel();
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = ClockworkTtsReader;
}
