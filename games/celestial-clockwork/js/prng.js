/**
 * 線性同餘確定性隨機數生成器 (PRNG - Linear Congruential Generator)
 * 依據學生「班級」與「座號」字串產生確定性整數種子，
 * 確保同座號題目數值確定，不同座號題目數值完全相異（鄰座防抄襲）。
 */
class SeededRandom {
  constructor(seedStr = '601-01') {
    this.initialSeedStr = String(seedStr);
    this.seed = this._hashString(this.initialSeedStr);
  }

  _hashString(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return (hash >>> 0);
  }

  reset() {
    this.seed = this._hashString(this.initialSeedStr);
  }

  // 生成 [0, 1) 的浮點數
  next() {
    this.seed = (Math.imul(1664525, this.seed) + 1013904223) >>> 0;
    return this.seed / 4294967296;
  }

  // 生成 [min, max] 的整數（含端點）
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  nextInt(min, max) {
    return this.int(min, max);
  }

  // 從陣列中隨機挑選一個元素
  pick(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[this.int(0, arr.length - 1)];
  }

  pickOne(arr) {
    return this.pick(arr);
  }

  // Fisher-Yates 洗牌演算法
  shuffle(arr) {
    const copy = [...arr];
    for (let i = copy.length - 1; i > 0; i--) {
      const j = Math.floor(this.next() * (i + 1));
      [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = SeededRandom;
}
