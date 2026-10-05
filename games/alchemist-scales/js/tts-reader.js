/**
 * 擬真人聲神經語音題目報讀系統 (TTSReader)
 * 特色：
 * 1. 深度評分演算法優先挑選微軟 Natural、Google Neural、Apple Siri 真人語音
 * 2. 嚴格扣分懲罰 Windows 20 年前陳舊的 SAPI5 Desktop 機械音
 * 3. 教師級口語文字淨化（口語化單位、符號、小數點，濾除操作提示括號與表情圖示）
 * 4. 200ms 自然換氣分句隊列，徹底規避 Chromium 15 秒語音凍結 Bug
 */
class TTSReader {
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

    // 篩選中文語音 (zh-TW, zh-HK, zh-CN)
    const zhVoices = voices.filter(v => v.lang.startsWith('zh'));
    this.voiceZh = this._pickBestVoice(zhVoices, 'zh');

    // 篩選英文語音 (en-US, en-GB)
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

      // 微軟自然神經語音 (頂級音質)
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

      // 嚴重懲罰陳舊機械聲音 (SAPI5 Desktop voices)
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

  // 教師口語化文字淨化 (Text Sanitizer)
  cleanText(text, lang = 'zh') {
    if (!text) return '';
    let s = text;

    // 1. 移除括號內的介面操作提示（如：若為小數...請輸入...）
    s = s.replace(/（[^）]*?(?:輸入|密碼|撥|代碼)[^）]*?）/gi, '');
    s = s.replace(/\([^)]*?(?:enter|code|dial|input)[^)]*?\)/gi, '');

    // 2. 移除所有 Emoji 與圖示裝飾
    s = s.replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '');
    s = s.replace(/[【】『』「」［］\[\]]/g, ' ');

    if (lang === 'zh') {
      // 3. 中文數學運算子與小數點口語化
      s = s.replace(/÷/g, ' 除以 ');
      s = s.replace(/×/g, ' 乘以 ');
      s = s.replace(/＝/g, ' 等於 ');
      s = s.replace(/=/g, ' 等於 ');
      s = s.replace(/(\d+)\.(\d+)/g, '$1點$2'); // 4.5 -> 4點5

      // 4. 單位口語化
      s = s.replace(/(\d+)\s*kg/gi, '$1公斤');
      s = s.replace(/(\d+)\s*g(?!\w)/gi, '$1公克');
      s = s.replace(/(\d+)\s*m(?!\w)/gi, '$1公尺');
      s = s.replace(/(\d+)\s*L(?!\w)/gi, '$1公升');

      // 5. 冒號轉逗號產生自然停頓
      s = s.replace(/[:：]/g, '，');
    } else {
      // 英文數學運算子與單位口語化
      s = s.replace(/÷/g, ' divided by ');
      s = s.replace(/×/g, ' multiplied by ');
      s = s.replace(/=/g, ' equals ');
      s = s.replace(/(\d+)\.(\d+)/g, '$1 point $2');

      s = s.replace(/(\d+)\s*kg/gi, '$1 kilograms');
      s = s.replace(/(\d+)\s*g(?!\w)/gi, '$1 grams');
      s = s.replace(/(\d+)\s*m(?!\w)/gi, '$1 meters');
      s = s.replace(/(\d+)\s*L(?!\w)/gi, '$1 liters');

      s = s.replace(/[:：]/g, ', ');
    }

    // 壓縮連續空白
    return s.replace(/\s+/g, ' ').trim();
  }

  // 朗讀文字
  speak(rawText, lang = 'zh', onStart = null, onEnd = null) {
    this.stop();
    if (!this.synth) return;

    this._loadVoices();
    const cleaned = this.cleanText(rawText, lang);
    if (!cleaned) return;

    // 將長文依標點切為短句隊列，句間停頓 200ms
    const splitRegex = lang === 'zh' ? /([。！？\n]+)/ : /([.!?\n]+)/;
    const rawChunks = cleaned.split(splitRegex);

    this.sentenceQueue = [];
    let temp = '';
    for (let c of rawChunks) {
      if (!c) continue;
      if (splitRegex.test(c)) {
        if (temp) {
          this.sentenceQueue.push(temp.trim());
          temp = '';
        }
      } else {
        temp += c;
      }
    }
    if (temp.trim()) this.sentenceQueue.push(temp.trim());

    if (this.sentenceQueue.length === 0) return;

    this.isPlaying = true;
    this.queueIndex = 0;
    if (onStart) onStart();

    const playNext = () => {
      if (!this.isPlaying || this.queueIndex >= this.sentenceQueue.length) {
        this.isPlaying = false;
        if (onEnd) onEnd();
        return;
      }

      const sentence = this.sentenceQueue[this.queueIndex++];
      const utter = new SpeechSynthesisUtterance(sentence);
      utter.lang = (lang === 'en') ? 'en-US' : 'zh-TW';

      const chosenVoice = (lang === 'en') ? this.voiceEn : this.voiceZh;
      if (chosenVoice) utter.voice = chosenVoice;

      utter.rate = (lang === 'en') ? 0.95 : 1.0;
      utter.pitch = 1.0;

      utter.onend = () => {
        // 句間自然換氣停頓 200ms
        this.timer = setTimeout(playNext, 200);
      };

      utter.onerror = () => {
        this.isPlaying = false;
        if (onEnd) onEnd();
      };

      this.currentUtterance = utter;
      this.synth.speak(utter);
    };

    playNext();
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
    this.sentenceQueue = [];
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = TTSReader;
}
