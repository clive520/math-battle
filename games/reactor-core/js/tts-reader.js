/**
 * tts-reader.js - 擬真人聲神經語音朗讀與數學分數口語化淨化系統
 * 將分數算式自然轉化為國小教學口語（例：7/8 轉為「八分之七」），切分子句佇列防止瀏覽器超時中斷。
 */
class TTSReader {
  constructor() {
    this.synth = window.speechSynthesis || null;
    this.isPlaying = false;
    this.voices = [];
    this.currentUtterance = null;
    this.onStateChange = null;

    if (this.synth) {
      this._loadVoices();
      if (this.synth.onvoiceschanged !== undefined) {
        this.synth.onvoiceschanged = () => this._loadVoices();
      }
    }
  }

  _loadVoices() {
    if (!this.synth) return;
    this.voices = this.synth.getVoices();
  }

  // 評分最佳神經人聲
  _getBestVoice(lang = 'zh') {
    if (!this.voices || this.voices.length === 0) {
      this._loadVoices();
    }
    const targetPrefix = lang === 'zh' ? 'zh' : 'en';

    const candidates = this.voices.filter(v => v.lang.toLowerCase().startsWith(targetPrefix));
    if (candidates.length === 0) return null;

    // 評分篩選
    let best = null;
    let maxScore = -999;

    candidates.forEach(v => {
      let score = 0;
      const name = v.name.toLowerCase();

      if (name.includes('natural') || name.includes('online')) score += 50;
      if (name.includes('hianyue') || name.includes('hsiaochen') || name.includes('yunjhe')) score += 40;
      if (name.includes('jenny') || name.includes('guy') || name.includes('aria')) score += 40;
      if (name.includes('google')) score += 30;
      if (name.includes('apple') || name.includes('siri')) score += 25;

      // 懲罰陳舊機械聲音
      if (name.includes('desktop') || name.includes('hanhan') || name.includes('david') || name.includes('zira')) {
        score -= 60;
      }

      if (score > maxScore) {
        maxScore = score;
        best = v;
      }
    });

    return best || candidates[0];
  }

  // 將分數符號與數學符號淨化為自然口語
  cleanText(text, lang = 'zh') {
    if (!text) return '';
    let cleaned = text;

    // 移除 HTML 標籤
    cleaned = cleaned.replace(/<[^>]+>/g, ' ');

    // 移除括號與操作提示
    cleaned = cleaned.replace(/（[^）]*）/g, ' ');
    cleaned = cleaned.replace(/\([^)]*\)/g, ' ');
    cleaned = cleaned.replace(/【|】|『|』|「|」/g, ' ');

    if (lang === 'zh') {
      // 處理帶分數：例如 1又1/6 -> 1又6分之1
      cleaned = cleaned.replace(/(\d+)\s*又\s*(\d+)\/(\d+)/g, '$1又$3分之$2');
      // 處理真假分數：例如 7/8 -> 八分之七
      cleaned = cleaned.replace(/(\d+)\/(\d+)/g, '$2分之$1');

      // 單位與符號
      cleaned = cleaned.replace(/÷/g, ' 除以 ');
      cleaned = cleaned.replace(/×/g, ' 乘以 ');
      cleaned = cleaned.replace(/＝|=/g, ' 等於 ');
      cleaned = cleaned.replace(/公尺|m/g, '公尺');
      cleaned = cleaned.replace(/公斤|kg/g, '公斤');
      cleaned = cleaned.replace(/公升|L/g, '公升');
      cleaned = cleaned.replace(/兆瓦|MW/g, '兆瓦');
      cleaned = cleaned.replace(/兆焦耳|MJ/g, '兆焦耳');
      cleaned = cleaned.replace(/m²/g, '平方公尺');
      cleaned = cleaned.replace(/⋯/g, '依此類推');
    } else {
      // 英文分數口語化
      cleaned = cleaned.replace(/(\d+)\s+(?:and\s+)?(\d+)\/(\d+)/g, '$1 and $2 over $3');
      cleaned = cleaned.replace(/(\d+)\/(\d+)/g, '$1 over $2');
      cleaned = cleaned.replace(/÷/g, ' divided by ');
      cleaned = cleaned.replace(/×/g, ' multiplied by ');
      cleaned = cleaned.replace(/=/g, ' equals ');
      cleaned = cleaned.replace(/m²/g, ' square meters ');
    }

    // 移除特殊 Emoji 與連續空格
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  speak(text, lang = 'zh') {
    if (!this.synth) return;
    this.stop();

    const cleaned = this.cleanText(text, lang);
    if (!cleaned) return;

    // 分割句子
    const sentences = cleaned.split(/[。！？!?\n]+/).map(s => s.trim()).filter(Boolean);
    if (sentences.length === 0) return;

    this.isPlaying = true;
    if (this.onStateChange) this.onStateChange(true);

    let curIdx = 0;
    const voice = this._getBestVoice(lang);

    const speakNext = () => {
      if (!this.isPlaying || curIdx >= sentences.length) {
        this.isPlaying = false;
        if (this.onStateChange) this.onStateChange(false);
        return;
      }

      const s = sentences[curIdx++];
      const utter = new SpeechSynthesisUtterance(s);
      if (voice) utter.voice = voice;
      utter.lang = lang === 'zh' ? 'zh-TW' : 'en-US';
      utter.rate = 1.0;
      utter.pitch = 1.0;

      utter.onend = () => {
        setTimeout(speakNext, 180);
      };

      utter.onerror = () => {
        this.isPlaying = false;
        if (this.onStateChange) this.onStateChange(false);
      };

      this.currentUtterance = utter;
      this.synth.speak(utter);
    };

    speakNext();
  }

  stop() {
    this.isPlaying = false;
    if (this.synth) {
      this.synth.cancel();
    }
    if (this.onStateChange) {
      this.onStateChange(false);
    }
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSReader;
}
