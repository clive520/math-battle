/**
 * diagram-renderer.js - 分數除法專屬 SVG 動態幾何與概念鷹架渲染器
 * 依據關卡題型即時渲染向量圖，嚴禁直接洩漏最終計算商數，專注於概念圖解與架構指引。
 */
class DiagramRenderer {
  static render(type, data, lang = 'zh') {
    switch (type) {
      case 'reduction':
        return this.renderReduction(data, lang);
      case 'tape_measure':
        return this.renderTapeMeasure(data, lang);
      case 'common_denominator':
        return this.renderCommonDenominator(data, lang);
      case 'reciprocal_inversion':
        return this.renderReciprocalInversion(data, lang);
      case 'bucket_rate':
        return this.renderBucketRate(data, lang);
      case 'wire_density':
        return this.renderWireDensity(data, lang);
      case 'base_amount':
        return this.renderBaseAmount(data, lang);
      case 'bypass_gauge':
        return this.renderBypassGauge(data, lang);
      case 'rect_area':
        return this.renderRectArea(data, lang);
      default:
        return '';
    }
  }

  // 1. 最簡分數約分圖解 (Reduction Ladder)
  static renderReduction(data, lang) {
    const { whole, num, den, gcdVal } = data;
    const wholePrefix = whole > 0 ? `${whole} ` : '';
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 原始分數 -->
        <g transform="translate(60, 45)">
          ${whole > 0 ? `<text x="0" y="45" font-size="28" fill="#ffd60a" font-weight="bold">${whole}</text>` : ''}
          <text x="${whole > 0 ? 35 : 15}" y="28" font-size="24" fill="#64d2ff" text-anchor="middle">${num}</text>
          <line x1="${whole > 0 ? 15 : 0}" y1="36" x2="${whole > 0 ? 55 : 30}" y2="36" stroke="#64d2ff" stroke-width="3"/>
          <text x="${whole > 0 ? 35 : 15}" y="62" font-size="24" fill="#64d2ff" text-anchor="middle">${den}</text>
        </g>

        <!-- 約分箭頭與最大公因數標記 -->
        <g transform="translate(145, 75)">
          <path d="M 0 0 L 80 0 M 65 -10 L 80 0 L 65 10" stroke="#ff9f0a" stroke-width="3" fill="none"/>
          <text x="40" y="-14" font-size="14" fill="#ff9f0a" text-anchor="middle">÷ GCD (${gcdVal})</text>
          <text x="40" y="24" font-size="13" fill="#8e8e93" text-anchor="middle">${isZh ? '分子分母同除以公因數' : 'Divide by common factor'}</text>
        </g>

        <!-- 最簡分數鷹架 -->
        <g transform="translate(265, 45)">
          ${whole > 0 ? `<text x="0" y="45" font-size="28" fill="#ffd60a" font-weight="bold">${whole}</text>` : ''}
          <text x="${whole > 0 ? 35 : 15}" y="28" font-size="24" fill="#30d158" text-anchor="middle" font-weight="bold">？</text>
          <line x1="${whole > 0 ? 15 : 0}" y1="36" x2="${whole > 0 ? 55 : 30}" y2="36" stroke="#30d158" stroke-width="3"/>
          <text x="${whole > 0 ? 35 : 15}" y="62" font-size="24" fill="#30d158" text-anchor="middle" font-weight="bold">？</text>
          <text x="${whole > 0 ? 80 : 55}" y="45" font-size="14" fill="#30d158">${isZh ? '(最簡分數)' : '(Simplest)'}</text>
        </g>
      </svg>
    `;
  }

  // 2. 數線/等分緞帶圖解 (Tape Measure)
  static renderTapeMeasure(data, lang) {
    const { totalNum, unitStep, den } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 頂部總長度大括號標記 -->
        <path d="M 40 45 L 40 35 L 200 35 L 200 25 L 200 35 L 360 35 L 360 45" fill="none" stroke="#64d2ff" stroke-width="2"/>
        <text x="200" y="20" font-size="15" fill="#64d2ff" text-anchor="middle" font-weight="bold">
          ${isZh ? `總量：${totalNum}/${den}` : `Total: ${totalNum}/${den}`}
        </text>

        <!-- 緞帶本體 -->
        <rect x="40" y="55" width="320" height="34" rx="4" fill="#2c3e50" stroke="#4fc3f7" stroke-width="2"/>
        
        <!-- 單位分割弧線示意 -->
        <rect x="40" y="55" width="70" height="34" fill="#0288d1" opacity="0.6"/>
        <rect x="110" y="55" width="70" height="34" fill="#03a9f4" opacity="0.4"/>
        <text x="75" y="77" font-size="13" fill="#ffffff" text-anchor="middle">${unitStep}/${den}</text>
        <text x="145" y="77" font-size="13" fill="#ffffff" text-anchor="middle">${unitStep}/${den}</text>
        <text x="250" y="77" font-size="16" fill="#8e8e93" text-anchor="middle">⋯ ⋯</text>

        <!-- 底部計算引導 -->
        <text x="210" y="125" font-size="14" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `「${totalNum} 個 1/${den}」分成「每份 ${unitStep} 個 1/${den}」 ➡️ ${totalNum} ÷ ${unitStep} ＝ ？` : `Divide numerators directly: ${totalNum} ÷ ${unitStep} = ?`}
        </text>
      </svg>
    `;
  }

  // 3. 異分母通分圖解 (Common Denominator)
  static renderCommonDenominator(data, lang) {
    const { n1, d1, n2, d2, lcd } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 170" class="scaffold-svg">
        <rect width="420" height="170" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <text x="210" y="30" font-size="15" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `先通分為公分母 [ ${lcd} ]` : `Align to LCD [ ${lcd} ]`}
        </text>

        <!-- 分數1 通分 -->
        <g transform="translate(60, 50)">
          <text x="0" y="24" font-size="18" fill="#64d2ff">${n1}/${d1}</text>
          <path d="M 45 18 L 85 18 M 75 10 L 85 18 L 75 26" fill="none" stroke="#64d2ff" stroke-width="2"/>
          <text x="115" y="24" font-size="18" fill="#30d158">？/${lcd}</text>
        </g>

        <!-- 分數2 通分 -->
        <g transform="translate(60, 95)">
          <text x="0" y="24" font-size="18" fill="#ff9f0a">${n2}/${d2}</text>
          <path d="M 45 18 L 85 18 M 75 10 L 85 18 L 75 26" fill="none" stroke="#ff9f0a" stroke-width="2"/>
          <text x="115" y="24" font-size="18" fill="#30d158">？/${lcd}</text>
        </g>

        <!-- 結論提示 -->
        <text x="210" y="150" font-size="13" fill="#e0e0e0" text-anchor="middle">
          ${isZh ? '通分成分母相同後，分子直接相除！' : 'Once denominators match, divide the new numerators!'}
        </text>
      </svg>
    `;
  }

  // 4. 顛倒相乘倒數翻轉 (Reciprocal Inversion)
  static renderReciprocalInversion(data, lang) {
    const { a, b, c, d } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 左側：原始除法算式 -->
        <g transform="translate(45, 55)">
          <text x="20" y="18" font-size="20" fill="#64d2ff">${a}/${b}</text>
          <text x="65" y="18" font-size="22" fill="#ffd60a">÷</text>
          <rect x="85" y="-5" width="55" height="36" rx="6" fill="#ff453a" fill-opacity="0.2" stroke="#ff453a" stroke-dasharray="3,3"/>
          <text x="112" y="20" font-size="20" fill="#ff453a" text-anchor="middle">${c}/${d}</text>
        </g>

        <!-- 中間轉換大箭頭 -->
        <g transform="translate(195, 65)">
          <path d="M 0 5 L 45 5 M 35 -3 L 45 5 L 35 13" fill="none" stroke="#ffd60a" stroke-width="3"/>
          <path d="M 15 -18 C 30 -28, 45 -28, 55 -16" fill="none" stroke="#ff3b30" stroke-width="2" stroke-dasharray="4,2"/>
          <text x="35" y="-30" font-size="12" fill="#ff453a" text-anchor="middle">${isZh ? '顛倒上下' : 'Invert'}</text>
        </g>

        <!-- 右側：乘法與倒數 -->
        <g transform="translate(255, 55)">
          <text x="15" y="18" font-size="20" fill="#64d2ff">${a}/${b}</text>
          <text x="60" y="18" font-size="22" fill="#30d158">×</text>
          <rect x="80" y="-5" width="55" height="36" rx="6" fill="#30d158" fill-opacity="0.2" stroke="#30d158"/>
          <text x="107" y="20" font-size="20" fill="#30d158" text-anchor="middle" font-weight="bold">${d}/${c}</text>
        </g>

        <text x="210" y="138" font-size="13" fill="#ffd60a" text-anchor="middle">
          ${isZh ? '除號變乘號，除數分子與分母顛倒！相乘前可先交叉約分' : 'Change ÷ to × and invert the divisor fraction! Cross-cancel first.'}
        </text>
      </svg>
    `;
  }

  // 5. 注水水龍頭與水槽 (Bucket Rate)
  static renderBucketRate(data, lang) {
    const { rateW, rateN, rateD, capW, capN, capD } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 水槽外框 -->
        <rect x="60" y="45" width="140" height="80" rx="8" fill="#1e3a5f" stroke="#64d2ff" stroke-width="2"/>
        <rect x="65" y="65" width="130" height="55" rx="4" fill="#007aff" opacity="0.6"/>
        <text x="130" y="100" font-size="15" fill="#ffffff" text-anchor="middle" font-weight="bold">
          ${capW}又${capN}/${capD} L
        </text>

        <!-- 水龍頭符號 -->
        <path d="M 120 20 L 140 20 L 140 38" fill="none" stroke="#b0bec5" stroke-width="6"/>
        <circle cx="140" cy="46" r="3" fill="#64d2ff"/>

        <!-- 右側運算引導 -->
        <g transform="translate(230, 50)">
          <text x="0" y="20" font-size="14" fill="#ffd60a">💧 ${isZh ? '每分鐘注水：' : 'Rate / min:'}</text>
          <text x="20" y="42" font-size="16" fill="#64d2ff">${rateW}又${rateN}/${rateD} L/min</text>
          <text x="0" y="70" font-size="14" fill="#30d158">⏱️ ${isZh ? '注滿時間 ＝ 總量 ÷ 速率' : 'Time = Total ÷ Rate'}</text>
        </g>
      </svg>
    `;
  }

  // 6. 導線每公尺密度 (Wire Density)
  static renderWireDensity(data, lang) {
    const { lenW, lenN, lenD, wtN, wtD } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 150" class="scaffold-svg">
        <rect width="420" height="150" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 電纜金屬棒 -->
        <rect x="50" y="55" width="310" height="20" rx="10" fill="#c07d32" stroke="#e6a15c" stroke-width="2"/>
        
        <!-- 頂部總重標註 -->
        <path d="M 50 45 L 50 35 L 205 35 L 205 25 L 205 35 L 360 35 L 360 45" fill="none" stroke="#ff9f0a" stroke-width="2"/>
        <text x="205" y="20" font-size="14" fill="#ff9f0a" text-anchor="middle">
          ${isZh ? `全段長 ${lenW}又${lenN}/${lenD} m ➡️ 重 ${wtN}/${wtD} kg` : `Length: ${lenW} ${lenN}/${lenD} m ➡️ Weight: ${wtN}/${wtD} kg`}
        </text>

        <!-- 底部 1 公尺標註 -->
        <path d="M 50 85 L 50 95 L 140 95 L 140 105 L 140 95 L 230 95 L 230 85" fill="none" stroke="#30d158" stroke-width="2"/>
        <text x="140" y="125" font-size="14" fill="#30d158" text-anchor="middle" font-weight="bold">
          ${isZh ? '1 公尺重 ＝ 總重量 ÷ 總長度 ＝ ？ kg' : '1 Meter Weight = Weight ÷ Length = ? kg'}
        </text>
      </svg>
    `;
  }

  // 7. 基準量求全部 (Base Amount)
  static renderBaseAmount(data, lang) {
    const { part, num, den } = data;
    const isZh = lang === 'zh';
    const fillPercent = (num / den) * 100;
    return `
      <svg viewBox="0 0 420 150" class="scaffold-svg">
        <rect width="420" height="150" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 長條底框 (全部 100%) -->
        <rect x="50" y="55" width="320" height="30" rx="6" fill="#2c3e50" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 部分著色 -->
        <rect x="50" y="55" width="${(320 * num) / den}" height="30" rx="6" fill="#007aff" opacity="0.8"/>
        
        <text x="${50 + (160 * num) / den}" y="75" font-size="14" fill="#ffffff" text-anchor="middle" font-weight="bold">
          ${part} (${num}/${den})
        </text>

        <text x="210" y="35" font-size="14" fill="#64d2ff" text-anchor="middle">
          ${isZh ? `部分是 ${part}，佔全部的 ${num}/${den}` : `Portion: ${part}, representing ${num}/${den}`}
        </text>

        <text x="210" y="125" font-size="14" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `全部基準量 ＝ 部分 ÷ 比率 ＝ ${part} ÷ ${num}/${den} ＝ ？` : `Total = Portion ÷ Ratio = ${part} ÷ ${num}/${den} = ?`}
        </text>
      </svg>
    `;
  }

  // 8. 旁路閥門比較圖解 (Bypass Gauge)
  static renderBypassGauge(data, lang) {
    const { k, divStr, relation } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 160" class="scaffold-svg">
        <rect width="420" height="160" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <g transform="translate(50, 45)">
          <text x="40" y="30" font-size="22" fill="#64d2ff" font-weight="bold">${k} ÷ ${divStr}</text>
          <circle cx="160" cy="22" r="22" fill="#2c3e50" stroke="#ffd60a" stroke-width="2"/>
          <text x="160" y="30" font-size="24" fill="#ffd60a" text-anchor="middle" font-weight="bold">？</text>
          <text x="235" y="30" font-size="22" fill="#64d2ff" font-weight="bold">${k}</text>
        </g>

        <!-- 比較法則指針 -->
        <g transform="translate(40, 105)">
          <text x="20" y="20" font-size="13" fill="#30d158">除數 &lt; 1 ➡️ 🔺 商 &gt; 被除數</text>
          <text x="180" y="20" font-size="13" fill="#ffd60a">除數 ＝ 1 ➡️ ⚖️ 商 ＝ 被除數</text>
          <text x="320" y="20" font-size="13" fill="#ff453a">除數 &gt; 1 ➡️ 🔻 商 &lt; 被除數</text>
        </g>
      </svg>
    `;
  }

  // 9. 長方形面積求寬 (Rect Area)
  static renderRectArea(data, lang) {
    const { areaW, areaN, areaD, lenW, lenN, lenD } = data;
    const isZh = lang === 'zh';
    return `
      <svg viewBox="0 0 420 150" class="scaffold-svg">
        <rect width="420" height="150" rx="10" fill="#1b242e" stroke="#3a4f66" stroke-width="2"/>
        
        <!-- 長方形本體 -->
        <rect x="70" y="35" width="230" height="85" fill="#1c3a4f" stroke="#00e5ff" stroke-width="2"/>
        
        <text x="185" y="80" font-size="15" fill="#ffd60a" text-anchor="middle" font-weight="bold">
          ${isZh ? `面積：${areaW}又${areaN}/${areaD} m²` : `Area: ${areaW} ${areaN}/${areaD} m²`}
        </text>

        <!-- 長與寬標註 -->
        <text x="185" y="25" font-size="13" fill="#64d2ff" text-anchor="middle">
          ${isZh ? `長：${lenW}又${lenN}/${lenD} m` : `Length: ${lenW} ${lenN}/${lenD} m`}
        </text>
        <text x="45" y="82" font-size="14" fill="#30d158" text-anchor="middle" font-weight="bold">
          寬: ？
        </text>

        <!-- 右側公式引導 -->
        <text x="360" y="82" font-size="13" fill="#e0e0e0" text-anchor="middle">
          ${isZh ? '寬 ＝ 面積 ÷ 長' : 'Width = Area ÷ Length'}
        </text>
      </svg>
    `;
  }
}

if (typeof module !== 'undefined' && module.exports) {
  module.exports = DiagramRenderer;
}
