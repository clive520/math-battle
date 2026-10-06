/**
 * math-formatter.js - 數學符號標準化格式化器
 * 將分數、帶分數、算式等轉換為標準數學印刷體符號（水平分數線、整數在左、分子居上、分母居下）
 * 徹底解決小學數學中出現 "2又30/45" 或 "15/16" 等斜線與文字雜糅之非正規符號問題。
 */
class MathFormatter {
  /**
   * 格式化單一分數或帶分數為標準 HTML
   * @param {number} whole 整數部分
   * @param {number|string} num 分子
   * @param {number|string} den 分母
   * @returns {string} HTML 結構
   */
  static formatFraction(whole = 0, num = 0, den = 1) {
    const w = Number(whole) || 0;
    const n = num !== undefined && num !== null ? num : 0;
    const d = den !== undefined && den !== null ? den : 1;
    const isNumZero = (n === 0 || n === '0');

    // 只有整數
    if (isNumZero && w > 0) {
      return `<span class="math-whole">${w}</span>`;
    }
    if (isNumZero && w === 0) {
      return `<span class="math-whole">0</span>`;
    }

    const ariaLabel = w > 0 ? `${w}又${d}分之${n}` : `${d}分之${n}`;

    if (w > 0) {
      return `<span class="math-fraction" role="math" aria-label="${ariaLabel}"><span class="math-whole">${w}</span><span class="math-frac"><span class="math-num">${n}</span><span class="math-den">${d}</span></span></span>`;
    } else {
      return `<span class="math-fraction" role="math" aria-label="${ariaLabel}"><span class="math-frac"><span class="math-num">${n}</span><span class="math-den">${d}</span></span></span>`;
    }
  }

  /**
   * 將字串中的各類分數、帶分數、括號數值替換為標準數學 HTML 符號
   * @param {string} text 原始文字
   * @param {string} lang 語言 ('zh' 或 'en')
   * @returns {string} 格式化後的 HTML
   */
  static formatText(text, lang = 'zh') {
    if (!text) return '';
    let result = text;

    // 1. 處理帶分數 (中文)：例如 2又30/45, 10又1/2, 1又1/6, 21又1/3
    result = result.replace(/(\d+)\s*又\s*(\d+|[？?])\/(\d+)/g, (match, w, n, d) => {
      return this.formatFraction(w, n, d);
    });

    // 2. 處理帶分數 (英文)：例如 2 and 30/45, 10 1/2
    result = result.replace(/(\d+)\s+(?:and\s+)?(\d+|[？?])\/(\d+)/g, (match, w, n, d) => {
      return this.formatFraction(w, n, d);
    });

    // 3. 處理真假分數：例如 15/16, 3/16, ？/12, 12/18
    // 使用負向零寬斷言避免匹配日期或已替換的標籤
    result = result.replace(/(?<![\d\w\/-])(\d+|[？?])\/(\d+)(?![\d\w\/-])/g, (match, n, d) => {
      return this.formatFraction(0, n, d);
    });

    // 4. 處理【...】科技括號與數值標籤美化
    result = result.replace(/【([^】]+)】/g, (match, content) => {
      return `<span class="math-bracket-badge"><span class="bracket-sym">【</span>${content}<span class="bracket-sym">】</span></span>`;
    });

    // 5. 處理英文 [...] 括號標籤
    result = result.replace(/\[([^\]]+)\]/g, (match, content) => {
      return `<span class="math-bracket-badge"><span class="bracket-sym">[</span>${content}<span class="bracket-sym">]</span></span>`;
    });

    return result;
  }

  /**
   * 渲染標準數學橫線分數的 SVG 向量元件
   * @param {number} whole 整數部分 (0 表示無整數)
   * @param {number|string} num 分子
   * @param {number|string} den 分母
   * @param {number} x X 座標中心或起點
   * @param {number} y Y 座標基準線 (分數線高度)
   * @param {object} options 樣式選項 { color, wholeColor, size, align, barStroke }
   * @returns {string} SVG 字串
   */
  static svgFraction(whole, num, den, x, y, options = {}) {
    const color = options.color || '#64d2ff';
    const wholeColor = options.wholeColor || '#ffd60a';
    const size = options.size || 16;
    const align = options.align || 'center';

    const w = Number(whole) || 0;
    const isNumZero = (!num || num === 0 || num === '0');

    if (isNumZero && w > 0) {
      return `<text x="${x}" y="${y + Math.round(size * 0.35)}" font-size="${size}" fill="${wholeColor}" font-weight="bold" ${align === 'center' ? 'text-anchor="middle"' : ''}>${w}</text>`;
    }

    const wholeSize = Math.round(size * 1.15);
    const fracSize = Math.round(size * 0.8);
    const numLen = String(num).length;
    const denLen = String(den).length;
    const maxLen = Math.max(numLen, denLen);
    const barWidth = Math.max(16, maxLen * (fracSize * 0.68) + 6);
    const barStroke = options.barStroke || 2;

    const hasWhole = w > 0;
    const wholeWidth = hasWhole ? String(w).length * (wholeSize * 0.6) + 4 : 0;
    const totalWidth = wholeWidth + barWidth;

    const startX = align === 'center' ? x - (totalWidth / 2) : x;
    const fracStartX = startX + wholeWidth;
    const fracCenterX = fracStartX + (barWidth / 2);

    return `
      <g class="svg-math-fraction">
        ${hasWhole ? `
          <text x="${startX}" y="${y + Math.round(wholeSize * 0.35)}" font-size="${wholeSize}" fill="${wholeColor}" font-weight="bold">${w}</text>
        ` : ''}
        <text x="${fracCenterX}" y="${y - Math.round(fracSize * 0.3)}" font-size="${fracSize}" fill="${color}" text-anchor="middle" font-weight="bold">${num}</text>
        <line x1="${fracStartX}" y1="${y}" x2="${fracStartX + barWidth}" y2="${y}" stroke="${color}" stroke-width="${barStroke}"/>
        <text x="${fracCenterX}" y="${y + Math.round(fracSize * 1.05)}" font-size="${fracSize}" fill="${color}" text-anchor="middle" font-weight="bold">${den}</text>
      </g>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathFormatter;
}
