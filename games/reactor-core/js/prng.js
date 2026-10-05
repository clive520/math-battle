/**
 * prng.js - 確定性偽隨機數生成器 (Seeded Random Number Generator)
 * 確保同座號題目完全一致，不同座號數值完全不同，徹底防止抄襲。
 */
class SeededRandom {
  constructor(seed) {
    this.seed = typeof seed === 'number' ? seed : this.hashString(String(seed || '12345678'));
  }

  hashString(str) {
    let hash = 2166136261;
    for (let i = 0; i < str.length; i++) {
      hash ^= str.charCodeAt(i);
      hash = Math.imul(hash, 16777619);
    }
    return hash >>> 0;
  }

  // 生成 0 ~ 1 之間的浮點數
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  // 生成 [min, max] 範圍內的整數
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // 從陣列中隨機抽取一個元素
  choice(arr) {
    if (!arr || arr.length === 0) return null;
    const idx = Math.floor(this.next() * arr.length);
    return arr[idx];
  }

  // 洗牌陣列 (Fisher-Yates Shuffle)
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
