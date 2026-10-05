/**
 * 動態幾何與數學數線圖解渲染器 (Diagram Renderer)
 * 支援繁體中文 (zh) 與英文 (en) 雙語獨立渲染，僅提供解題概念與結構鷹架，絕不洩漏最終答案。
 */
class DungeonDiagramRenderer {
  static render(diagramType, data, lang = 'zh') {
    if (!data) {
      return lang === 'en' 
        ? '<p class="no-diagram">(No schematic discovered in this chamber)</p>'
        : '<p class="no-diagram">（此密室尚未發現機關透視圖）</p>';
    }

    switch (diagramType) {
      case 'runes':
        return DungeonDiagramRenderer._renderRunes(data, lang);
      case 'matchsticks':
        return DungeonDiagramRenderer._renderMatchsticks(data, lang);
      case 'sumInvariant':
        return DungeonDiagramRenderer._renderSumInvariant(data, lang);
      case 'diffInvariant':
        return DungeonDiagramRenderer._renderDiffInvariant(data, lang);
      case 'prodInvariant':
        return DungeonDiagramRenderer._renderProdInvariant(data, lang);
      case 'quotInvariant':
        return DungeonDiagramRenderer._renderQuotInvariant(data, lang);
      case 'numberLine':
        return DungeonDiagramRenderer._renderNumberLine(data, lang);
      case 'treeBothEnds':
        return DungeonDiagramRenderer._renderTreeBothEnds(data, lang);
      case 'closedCircle':
        return DungeonDiagramRenderer._renderClosedCircle(data, lang);
      case 'rectangleGcd':
        return DungeonDiagramRenderer._renderRectangleGcd(data, lang);
      default:
        return '';
    }
  }

  // 1. 週期循環圖解
  static _renderRunes(data, lang) {
    const { pattern, targetSymbol, total, groups, rem } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '📜 Rune Pattern Analysis' : '📜 咒文規律分析透視圖'}</div>
        <div class="runes-flow">
          <div class="runes-group-label">${isEn ? 'Repeating cycle of 4:' : '每 4 個為一組循環：'}</div>
          <div class="runes-row">
            ${pattern.map(s => `<span class="rune-token ${s === targetSymbol ? 'highlight' : ''}">${s}</span>`).join('')}
          </div>
        </div>
        <div class="math-breakdown">
          <p>✦ ${isEn ? `Total runes: <strong>${total}</strong>` : `總咒印數：<strong>${total}</strong> 個`}</p>
          <p>✦ ${isEn ? `Cycle equation: <strong>${total} ÷ 4 ＝ ${groups} (groups) ⋯ remainder ${rem}</strong>` : `分組算式：<strong>${total} ÷ 4 ＝ ${groups}（組） ⋯ 餘 ${rem}（個）</strong>`}</p>
          <p>✦ ${isEn ? `First ${groups} full cycles each contain 1 [${targetSymbol}], totaling ${groups} times.` : `前 ${groups} 組中，每組都有 1 個【${targetSymbol}】，共出現 ${groups} 次。`}</p>
          <p>✦ ${isEn ? `Check if the remaining ${rem} runes include [${targetSymbol}].` : `剩下的餘數 ${rem} 個中，請觀察是否還有【${targetSymbol}】？`}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Solving Guide: Total [${targetSymbol}] ＝ ${groups} ＋ (in remainder) ＝ <strong>？</strong> times (Compute this)` 
            : `💡 解謎指引：【${targetSymbol}】總次數 ＝ ${groups} ＋ (餘數中的次數) ＝ <strong>？</strong> 次（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 2. 火柴棒/骨杖圖解
  static _renderMatchsticks(data, lang) {
    const { isTriangle, count } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '🦴 Skeletal Cage Growth Schematic' : '🦴 骨牢生長公共邊透視圖'}</div>
        <svg viewBox="0 0 420 110" class="diagram-svg">
          ${isTriangle ? `
            <polygon points="40,90 70,30 100,90" fill="none" stroke="#e0a96d" stroke-width="4"/>
            <polygon points="100,90 130,30 160,90" fill="none" stroke="#e0a96d" stroke-width="4"/>
            <polygon points="160,90 190,30 220,90" fill="none" stroke="#e0a96d" stroke-width="4"/>
            <text x="240" y="70" fill="#a0a0a0" font-size="16">${isEn ? `⋯⋯ (${count} cages)` : `⋯⋯ (共 ${count} 個)`}</text>
            <text x="45" y="105" fill="#f0c040" font-size="12">${isEn ? '1st(3 rods)' : '第1個(3根)'}</text>
            <text x="110" y="105" fill="#f0c040" font-size="12">${isEn ? '+2 rods' : '+2根'}</text>
            <text x="170" y="105" fill="#f0c040" font-size="12">${isEn ? '+2 rods' : '+2根'}</text>
          ` : `
            <rect x="30" y="30" width="50" height="50" fill="none" stroke="#e0a96d" stroke-width="4"/>
            <rect x="80" y="30" width="50" height="50" fill="none" stroke="#e0a96d" stroke-width="4"/>
            <rect x="130" y="30" width="50" height="50" fill="none" stroke="#e0a96d" stroke-width="4"/>
            <text x="200" y="65" fill="#a0a0a0" font-size="16">${isEn ? `⋯⋯ (${count} cages)` : `⋯⋯ (共 ${count} 個)`}</text>
            <text x="30" y="98" fill="#f0c040" font-size="12">${isEn ? '1st(4 rods)' : '第1個(4根)'}</text>
            <text x="90" y="98" fill="#f0c040" font-size="12">${isEn ? '+3 rods' : '+3根'}</text>
            <text x="140" y="98" fill="#f0c040" font-size="12">${isEn ? '+3 rods' : '+3根'}</text>
          `}
        </svg>
        <div class="math-breakdown">
          <p>✦ ${isEn 
            ? `Rule: Beyond the 1st base rod, each extra cage requires ${isTriangle ? '2' : '3'} rods (shared edges).` 
            : `規律：除了第 1 根基準骨杖，每多排 1 個牢籠就多需要 ${isTriangle ? '2' : '3'} 根骨杖（共用邊）。`}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: ${isTriangle ? `1 + 2 × ${count}` : `1 + 3 × ${count}`} ＝ <strong>？</strong> rods (Compute this)` 
            : `💡 解謎公式：${isTriangle ? `1 ＋ 2 × ${count}` : `1 ＋ 3 × ${count}`} ＝ <strong>？</strong> 根（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 3. 和不變圖解
  static _renderSumInvariant(data, lang) {
    const { total, partA } = data;
    const isEn = (lang === 'en');
    const pctA = (partA / total) * 100;
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '⚖️ Day & Night Invariant Balance Bar' : '⚖️ 晝夜能量平衡長條圖（總和恆為 24 小時）'}</div>
        <div class="balance-bar-wrapper">
          <div class="bar-total-label">${isEn ? 'Total Day Duration: 24 Hours' : '全日總時數：24 小時'}</div>
          <div class="balance-bar">
            <div class="bar-segment day-seg" style="width: ${pctA}%;">${isEn ? `Daylight ${partA}h` : `白晝 ${partA} 時`}</div>
            <div class="bar-segment night-seg" style="width: ${100 - pctA}%;">${isEn ? 'Darkness ?h' : '黑夜 ？ 時'}</div>
          </div>
        </div>
        <div class="math-breakdown">
          <p>✦ ${isEn ? 'Core Invariant: <strong>Daylight ＋ Darkness ＝ 24 Hours</strong>' : '核心不變量：<strong>白晝 ＋ 黑夜 ＝ 24 小時</strong>'}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: Darkness ＝ 24 － ${partA} ＝ <strong>？</strong> hours (Compute this)` 
            : `💡 解謎公式：黑夜時數 ＝ 24 － ${partA} ＝ <strong>？</strong> 小時（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 4. 差不變圖解
  static _renderDiffInvariant(data, lang) {
    const { diff, elder1, young1, elder2 } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '⏳ Age Difference Invariant Table' : '⏳ 永恆時光數線（年齡差永遠不變）'}</div>
        <div class="table-compare">
          <table class="dungeon-table">
            <thead>
              <tr>
                <th>${isEn ? 'Time State' : '時間狀態'}</th>
                <th>${isEn ? 'Sorcerer Age' : '幽靈法師年齡'}</th>
                <th>${isEn ? 'Apprentice Age' : '侍從年齡'}</th>
                <th>${isEn ? 'Age Difference (Invariant)' : '年齡差 (恆常不變)'}</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>${isEn ? 'Currently' : '當前狀態'}</td>
                <td>${elder1}</td>
                <td>${young1}</td>
                <td><strong>${isEn ? `Diff: ${diff}` : `相差 ${diff} 歲`}</strong></td>
              </tr>
              <tr class="highlight-row">
                <td>${isEn ? 'Future' : '未來歲月'}</td>
                <td>${elder2}</td>
                <td>?</td>
                <td><strong>${isEn ? `Still Diff: ${diff}` : `仍相差 ${diff} 歲`}</strong></td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="math-breakdown">
          <p>✦ ${isEn 
            ? `Core Invariant: Age difference is always <strong>${diff} years</strong>!` 
            : `核心不變量：兩人經過相同的歲月，兩人的<strong>年齡差距始終為 ${diff} 歲</strong>！`}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: Apprentice Future Age ＝ ${elder2} － ${diff} ＝ <strong>？</strong> years old` 
            : `💡 解謎公式：侍從未來年齡 ＝ ${elder2} － ${diff} ＝ <strong>？</strong> 歲（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 5. 積不變圖解
  static _renderProdInvariant(data, lang) {
    const { capacity, targetTime } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '🧪 Reservoir Volume & Flow Rate Inverse Proportion' : '🧪 水牢容量與流速反比圖解'}</div>
        <div class="math-breakdown">
          <p>✦ ${isEn 
            ? `Core Invariant: <strong>Drain rate per min × Time ＝ Total capacity (${capacity} Liters)</strong>` 
            : `核心不變量：<strong>每分鐘排水量 × 所需時間 ＝ 總容積（${capacity} 公升）</strong>`}</p>
          <p>✦ ${isEn ? 'Shorter time requires proportionally greater drain rate.' : '時間縮短，需要的每分鐘排水量就必須成反比增加。'}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: Drain Rate ＝ ${capacity} ÷ ${targetTime} ＝ <strong>？</strong> L/min (Compute this)` 
            : `💡 解謎公式：每分鐘排毒量 ＝ ${capacity} ÷ ${targetTime} ＝ <strong>？</strong> 公升/分鐘（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 6. 商不變圖解
  static _renderQuotInvariant(data, lang) {
    const { unitPrice, sampleQty, sampleTotal, targetTotal } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '🪙 Unit Price Quotient Invariant' : '🪙 靈魂寶石等價商不變圖解'}</div>
        <div class="math-breakdown">
          <p>✦ ${isEn 
            ? 'Core Invariant: <strong>Total coins ÷ Quantity ＝ Unit Price (Constant)</strong>' 
            : '核心不變量：<strong>總金額 ÷ 數量 ＝ 每一顆的單價（商不變）</strong>'}</p>
          <p>✦ ${isEn 
            ? `Unit Price: ${sampleTotal} ÷ ${sampleQty} ＝ <strong>${unitPrice}</strong> coins/crystal` 
            : `先算單價：${sampleTotal} ÷ ${sampleQty} ＝ <strong>${unitPrice}</strong> 暗黑幣/顆`}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: Obtainable Quantity ＝ ${targetTotal} ÷ ${unitPrice} ＝ <strong>？</strong> crystals (Compute this)` 
            : `💡 解謎公式：可換得數量 ＝ ${targetTotal} ÷ ${unitPrice} ＝ <strong>？</strong> 顆（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 7. 兩點間隔數線圖
  static _renderNumberLine(data, lang) {
    const { startNum, endNum, intervalDist, intervals } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '📏 Numbered Posts & Interval Line' : '📏 引魂燈編號與間距數線圖'}</div>
        <svg viewBox="0 0 420 90" class="diagram-svg">
          <line x1="40" y1="50" x2="380" y2="50" stroke="#888" stroke-width="4"/>
          <circle cx="60" cy="50" r="8" fill="#4deeea"/>
          <text x="40" y="30" fill="#4deeea" font-size="13" font-weight="bold">${isEn ? `#${startNum}` : `第${startNum}盞`}</text>
          <circle cx="360" cy="50" r="8" fill="#4deeea"/>
          <text x="340" y="30" fill="#4deeea" font-size="13" font-weight="bold">${isEn ? `#${endNum}` : `第${endNum}盞`}</text>
          <path d="M 60,50 Q 210,10 360,50" fill="none" stroke="#f0c040" stroke-width="2" stroke-dasharray="6,4"/>
          <text x="160" y="25" fill="#f0c040" font-size="13">${isEn ? `${intervals} intervals in between` : `中間共 ${intervals} 個間隔`}</text>
          <text x="160" y="75" fill="#e0a96d" font-size="13">${isEn ? `${intervalDist}m per interval` : `每個間隔 ${intervalDist} 公尺`}</text>
        </svg>
        <div class="math-breakdown">
          <p>✦ ${isEn 
            ? `Intervals Count: <strong>${endNum} － ${startNum} ＝ ${intervals} intervals</strong>` 
            : `間隔數計算：<strong>${endNum} － ${startNum} ＝ ${intervals}（個間隔）</strong>`}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: Total Distance ＝ ${intervals} × ${intervalDist} ＝ <strong>？</strong> meters (Compute this)` 
            : `💡 解謎公式：總距離 ＝ ${intervals} × ${intervalDist} ＝ <strong>？</strong> 公尺（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 8. 兩端都設 + 兩側圖解
  static _renderTreeBothEnds(data, lang) {
    const { totalLength, intervalDist, intervals, oneSide } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '⛩️ Linear Intervals (Both Ends + Both Sides)' : '⛩️ 斷魂長廊雙側與兩端封印圖解'}</div>
        <div class="math-breakdown">
          <p>✦ <strong>${isEn ? 'Step 1 (One-side intervals)' : '步驟 1（求單側間隔數）'}</strong>：${totalLength} ÷ ${intervalDist} ＝ <strong>${intervals}</strong> ${isEn ? 'intervals' : '個間隔'}</p>
          <p>✦ <strong>${isEn ? 'Step 2 (Both ends included)' : '步驟 2（頭尾兩端都放）'}</strong>：${isEn ? `One-side items ＝ ${intervals} ＋ 1 ＝ <strong>${oneSide}</strong>` : `單側顆數 ＝ 間隔數 ＋ 1 ＝ ${intervals} ＋ 1 ＝ <strong>${oneSide}</strong> 顆`}</p>
          <p>✦ <strong>${isEn ? 'Step 3 (Both sides of hallway)' : '步驟 3（長廊兩側皆設）'}</strong>：${isEn ? 'Notice it asks for BOTH SIDES, so multiply by 2!' : '請注意是長廊「兩側」，需再乘以 2！'}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: Total Gems ＝ ${oneSide} × 2 ＝ <strong>？</strong> gems (Compute this)` 
            : `💡 解謎公式：晶石總數 ＝ ${oneSide} × 2 ＝ <strong>？</strong> 顆（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 9. 封閉圓形圖解
  static _renderClosedCircle(data, lang) {
    const { perimeter, intervalDist } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '⭕ Closed Loop (Circular Perimeter)' : '⭕ 銜尾蛇封閉石陣（圓形迴路）'}</div>
        <div class="math-breakdown">
          <p>✦ <strong>${isEn ? 'Core Closed-Loop Secret' : '封閉圖形核心秘密'}</strong>：${isEn 
            ? 'Looping in a full circle, <strong>Pillars ＝ Intervals</strong> (neither add nor subtract 1)!' 
            : '繞行一圈頭尾相接，<strong>柱子數 ＝ 間隔數</strong>（不必加 1 也不能減 1）！'}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: Total Pillars ＝ ${perimeter} ÷ ${intervalDist} ＝ <strong>？</strong> pillars (Compute this)` 
            : `💡 解謎公式：柱子總數 ＝ ${perimeter} ÷ ${intervalDist} ＝ <strong>？</strong> 根（請動手計算）`}</p>
        </div>
      </div>
    `;
  }

  // 10. 最大公因數綜合題
  static _renderRectangleGcd(data, lang) {
    const { length, width } = data;
    const isEn = (lang === 'en');
    return `
      <div class="diagram-box">
        <div class="diagram-title">${isEn ? '🏛️ Altar Corner Spacing (Greatest Common Divisor)' : '🏛️ 終極祭壇四象陣眼（長方形最大公因數）'}</div>
        <svg viewBox="0 0 360 140" class="diagram-svg">
          <rect x="50" y="25" width="260" height="90" fill="none" stroke="#7e57c2" stroke-width="3" stroke-dasharray="6,4"/>
          <circle cx="50" cy="25" r="7" fill="#ff5252"/>
          <circle cx="310" cy="25" r="7" fill="#ff5252"/>
          <circle cx="50" cy="115" r="7" fill="#ff5252"/>
          <circle cx="310" cy="115" r="7" fill="#ff5252"/>
          <text x="140" y="20" fill="#f0c040" font-size="13">${isEn ? `Length ${length}m` : `長 ${length} 公尺`}</text>
          <text x="318" y="75" fill="#f0c040" font-size="13">${isEn ? `Width ${width}m` : `寬 ${width}m`}</text>
        </svg>
        <div class="math-breakdown">
          <p>✦ ${isEn 
            ? `Candles at corners with equal spacing must divide both length (${length}m) and width (${width}m) evenly (Common Divisor).` 
            : `四角都要安插，且間距相同 ➔ 間距必須同時整除長（${length}m）與寬（${width}m），即為兩者的「公因數」。`}</p>
          <p>✦ ${isEn 
            ? 'Finding the MAXIMUM distance means calculating the <strong>Greatest Common Divisor (GCD)</strong>!' 
            : '要求「最大距離」 ➔ 就是求兩數的【最大公因數】！'}</p>
          <p class="final-ans-box">${isEn 
            ? `💡 Formula Guide: Greatest Common Divisor gcd(${length}, ${width}) ＝ <strong>？</strong> meters (Compute this)` 
            : `💡 解謎公式：求 ${length} 與 ${width} 的【最大公因數】＝ <strong>？</strong> 公尺（請動手計算）`}</p>
        </div>
      </div>
    `;
  }
}

window.DungeonDiagramRenderer = DungeonDiagramRenderer;
