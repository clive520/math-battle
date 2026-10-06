/**
 * math-formatter.js - 數學符號標準化格式化器
 * 將比（a：b）、比值、分數（水平分數線）轉換為標準數學印刷體排版
 * 徹底告別斜線「/」與「又」等雜糅寫法，維護國小數學教材視覺嚴謹度。
 */
class MathFormatter {
  /**
   * 格式化單一分數或帶分數為 HTML
   */
  static formatFraction(whole = 0, num = 0, den = 1) {
    const w = Number(whole) || 0;
    const n = num !== undefined && num !== null ? num : 0;
    const d = den !== undefined && den !== null ? den : 1;
    const isNumZero = (n === 0 || n === '0');

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
   * 格式化標準的比 (a：b)
   */
  static formatRatio(ante, cons) {
    return `<span class="math-ratio" role="math" aria-label="${ante}比${cons}"><span class="ratio-ante">${ante}</span><span class="ratio-colon">：</span><span class="ratio-cons">${cons}</span></span>`;
  }

  /**
   * 將字串中的各類分數、帶分數、比、括號數值替換為標準 HTML
   */
  static formatText(text, lang = 'zh') {
    if (!text) return '';
    let result = text;

    // 1. 處理帶分數 (中文)：例如 2又30/45, 10又1/2, 1又1/6
    result = result.replace(/(\d+)\s*又\s*(\d+|[？?])\/(\d+)/g, (match, w, n, d) => {
      return this.formatFraction(w, n, d);
    });

    // 2. 處理帶分數 (英文)：例如 2 and 30/45, 10 1/2
    result = result.replace(/(\d+)\s+(?:and\s+)?(\d+|[？?])\/(\d+)/g, (match, w, n, d) => {
      return this.formatFraction(w, n, d);
    });

    // 3. 處理真假分數：例如 15/16, 7/5, 3/16, ？/12
    result = result.replace(/(?<![\d\w\/-])(\d+|[？?])\/(\d+)(?![\d\w\/-])/g, (match, n, d) => {
      return this.formatFraction(0, n, d);
    });

    // 4. 處理比的符號美化 (例如 7:2, 24:30, 16:9, 3:4)
    result = result.replace(/(?<!\d:)(\b\d+)\s*:\s*(\d+\b)(?!:\d)/g, (match, ante, cons) => {
      return this.formatRatio(ante, cons);
    });

    // 5. 處理【...】科技括號與數值標籤美化
    result = result.replace(/【([^】]+)】/g, (match, content) => {
      return `<span class="math-bracket-badge"><span class="bracket-sym">【</span>${content}<span class="bracket-sym">】</span></span>`;
    });

    // 6. 處理英文 [...] 括號標籤
    result = result.replace(/\[([^\]]+)\]/g, (match, content) => {
      return `<span class="math-bracket-badge"><span class="bracket-sym">[</span>${content}<span class="bracket-sym">]</span></span>`;
    });

    return result;
  }

  /**
   * 渲染標準數學橫線分數的 SVG 元件
   */
  static svgFraction(whole, num, den, x, y, options = {}) {
    const color = options.color || '#4fc3f7';
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

  /**
   * 渲染標準比 (ante：cons) 的 SVG 元件
   */
  static svgRatio(ante, cons, x, y, options = {}) {
    const anteColor = options.anteColor || '#ffd60a';
    const consColor = options.consColor || '#4fc3f7';
    const colonColor = options.colonColor || '#ffffff';
    const size = options.size || 18;
    const align = options.align || 'center';

    return `
      <g class="svg-math-ratio" transform="translate(${x}, ${y})">
        <text x="-12" y="${Math.round(size * 0.35)}" font-size="${size}" fill="${anteColor}" font-weight="bold" text-anchor="end">${ante}</text>
        <text x="0" y="${Math.round(size * 0.35)}" font-size="${size}" fill="${colonColor}" font-weight="bold" text-anchor="middle">：</text>
        <text x="12" y="${Math.round(size * 0.35)}" font-size="${size}" fill="${consColor}" font-weight="bold" text-anchor="start">${cons}</text>
      </g>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = MathFormatter;
}
