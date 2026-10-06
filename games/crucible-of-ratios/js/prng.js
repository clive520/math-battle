/**
 * prng.js - 偽隨機數生成器 (依班級座號產生確定性隨機種子)
 * 確保同班同座號重複挑戰時題目一致，不同座號題目數值各不相同，防作弊防抄襲。
 */
class PRNG {
  constructor(seedStr) {
    let h = 1779033703 ^ seedStr.length;
    for (let i = 0; i < seedStr.length; i++) {
      h = Math.imul(h ^ seedStr.charCodeAt(i), 3432918353);
      h = (h << 13) | (h >>> 19);
    }
    this.seed = h >>> 0;
  }

  // 0 到 1 之間的浮點數
  random() {
    let t = (this.seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  // 整數區間 [min, max]
  range(min, max) {
    return Math.floor(this.random() * (max - min + 1)) + min;
  }

  // 從陣列挑選一項
  choice(arr) {
    if (!arr || arr.length === 0) return null;
    return arr[Math.floor(this.random() * arr.length)];
  }

  // 洗牌陣列 (Fisher-Yates)
  shuffle(arr) {
    const res = [...arr];
    for (let i = res.length - 1; i > 0; i--) {
      const j = Math.floor(this.random() * (i + 1));
      [res[i], res[j]] = [res[j], res[i]];
    }
    return res;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = PRNG;
}
