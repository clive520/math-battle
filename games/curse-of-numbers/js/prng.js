/**
 * 確定性種子偽隨機數產生器 (Deterministic PRNG)
 * 讓不同座號的學生獲得不同題目參數，但同一座號在多次運行下始終獲得一致題目，方便教師輔導與課堂驗算。
 */
class SeededRandom {
  constructor(seedInput = 'default-adventurer') {
    this.seed = this._hashString(String(seedInput));
    this.initialSeed = this.seed;
    this.state = this.seed;
  }

  // 將字串（如班級-座號 "601-15"）轉換為 32 位元整數雜湊
  _hashString(str) {
    let hash = 1779033703 ^ str.length;
    for (let i = 0; i < str.length; i++) {
      hash = Math.imul(hash ^ str.charCodeAt(i), 3432918353);
      hash = (hash << 13) | (hash >>> 19);
    }
    return hash >>> 0;
  }

  // Mulberry32 隨機數算法
  next() {
    let z = (this.state += 0x6D2B79F5);
    z = Math.imul(z ^ (z >>> 15), z | 1);
    z ^= z + Math.imul(z ^ (z >>> 7), z | 61);
    return ((z ^ (z >>> 14)) >>> 0) / 4294967296;
  }

  // 取得 [min, max] 閉區間之整數
  int(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  // 從陣列中隨機選擇一項
  choice(array) {
    if (!array || array.length === 0) return null;
    const idx = Math.floor(this.next() * array.length);
    return array[idx];
  }

  // 重設回最初種子狀態
  reset() {
    this.state = this.initialSeed;
  }
}

window.SeededRandom = SeededRandom;
