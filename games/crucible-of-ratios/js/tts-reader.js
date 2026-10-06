/**
 * tts-reader.js - 擬真人聲語音朗讀與比值口語化淨化器
 * 將數學比與分數轉化為自然教學口語（例：7:2 ->「七比二」，7/5 ->「五分之七」），切分子句佇列防超時。
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

  _getBestVoice(lang = 'zh') {
    if (!this.voices || this.voices.length === 0) {
      this._loadVoices();
    }
    const targetPrefix = lang === 'zh' ? 'zh' : 'en';
    const candidates = this.voices.filter(v => v.lang.toLowerCase().startsWith(targetPrefix));
    if (candidates.length === 0) return null;

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
      if (name.includes('desktop') || name.includes('hanhan') || name.includes('david')) score -= 60;

      if (score > maxScore) {
        maxScore = score;
        best = v;
      }
    });

    return best || candidates[0];
  }

  cleanText(text, lang = 'zh') {
    if (!text) return '';
    let cleaned = text;

    // 移除 HTML 標籤
    cleaned = cleaned.replace(/<[^>]+>/g, ' ');

    // 移除括號與操作標註
    cleaned = cleaned.replace(/（[^）]*）/g, ' ');
    cleaned = cleaned.replace(/\([^)]*\)/g, ' ');
    cleaned = cleaned.replace(/【|】|『|』|「|」/g, ' ');

    if (lang === 'zh') {
      // 處理帶分數：例如 1又1/2 -> 1又2分之1
      cleaned = cleaned.replace(/(\d+)\s*又\s*(\d+)\/(\d+)/g, '$1又$3分之$2');
      // 處理分數：例如 7/5 -> 5分之7
      cleaned = cleaned.replace(/(\d+)\/(\d+)/g, '$2分之$1');
      // 處理比：例如 7:2 或 7：2 -> 7比2
      cleaned = cleaned.replace(/(\d+)\s*[:：]\s*(\d+)/g, '$1比$2');

      // 單位與符號口語化
      cleaned = cleaned.replace(/÷/g, ' 除以 ');
      cleaned = cleaned.replace(/×/g, ' 乘以 ');
      cleaned = cleaned.replace(/＝|=/g, ' 等於 ');
      cleaned = cleaned.replace(/公分|cm/g, '公分');
      cleaned = cleaned.replace(/公克|g/g, '公克');
      cleaned = cleaned.replace(/毫升|mL/g, '毫升');
      cleaned = cleaned.replace(/兆焦耳|MJ/g, '兆焦耳');
      cleaned = cleaned.replace(/平方公尺|m²/g, '平方公尺');
      cleaned = cleaned.replace(/□/g, '方框');
    } else {
      cleaned = cleaned.replace(/(\d+)\s*[:：]\s*(\d+)/g, '$1 to $2');
      cleaned = cleaned.replace(/(\d+)\s+(?:and\s+)?(\d+)\/(\d+)/g, '$1 and $2 over $3');
      cleaned = cleaned.replace(/(\d+)\/(\d+)/g, '$1 over $2');
      cleaned = cleaned.replace(/÷/g, ' divided by ');
      cleaned = cleaned.replace(/×/g, ' multiplied by ');
      cleaned = cleaned.replace(/=/g, ' equals ');
      cleaned = cleaned.replace(/□/g, 'blank');
    }

    // 移除特殊 Emoji 與多餘空格
    cleaned = cleaned.replace(/[\u{1F300}-\u{1F6FF}\u{1F900}-\u{1F9FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu, '');
    cleaned = cleaned.replace(/\s+/g, ' ').trim();
    return cleaned;
  }

  speak(text, lang = 'zh') {
    if (!this.synth) return;
    this.stop();

    const cleaned = this.cleanText(text, lang);
    if (!cleaned) return;

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

      const utter = new SpeechSynthesisUtterance(sentences[curIdx]);
      this.currentUtterance = utter;

      if (voice) utter.voice = voice;
      utter.lang = lang === 'zh' ? 'zh-TW' : 'en-US';
      utter.rate = 1.0;
      utter.pitch = 1.0;

      utter.onend = () => {
        curIdx++;
        speakNext();
      };

      utter.onerror = (e) => {
        if (e.error !== 'canceled') {
          curIdx++;
          speakNext();
        }
      };

      this.synth.speak(utter);
    };

    speakNext();
  }

  stop() {
    if (!this.synth) return;
    this.isPlaying = false;
    this.synth.cancel();
    this.currentUtterance = null;
    if (this.onStateChange) this.onStateChange(false);
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSReader;
}
