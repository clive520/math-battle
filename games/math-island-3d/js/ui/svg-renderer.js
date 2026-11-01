/**
 * 3D 數學立體群島大冒險 - 動態向量 SVG 圖解鷹架引擎
 * 為所有 25 個關卡提供高解析、高互動性的向量思維鷹架圖，輔助學生直觀理解幾何與數論本質。
 */

export function renderScaffoldSVG(svgType) {
  switch (svgType) {
    case "prime_grid":
      return `
        <svg viewBox="0 0 520 220" class="scaffold-svg">
          <text x="260" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【1 ~ 25 質數與合數篩法分佈圖】</text>
          <g transform="translate(30, 45)">
            ${Array.from({ length: 25 }, (_, i) => {
              const num = i + 1;
              const row = Math.floor(i / 5);
              const col = i % 5;
              const x = col * 92;
              const y = row * 32;
              const primes = [2, 3, 5, 7, 11, 13, 17, 19, 23];
              const isPrime = primes.includes(num);
              const isOne = num === 1;

              const bg = isPrime ? "#fef3c7" : (isOne ? "#f1f5f9" : "#e2e8f0");
              const stroke = isPrime ? "#d97706" : (isOne ? "#94a3b8" : "#cbd5e1");
              const textFill = isPrime ? "#b45309" : (isOne ? "#64748b" : "#475569");
              const label = isPrime ? "質數" : (isOne ? "非質非合" : "合數");

              return `
                <rect x="${x}" y="${y}" width="84" height="26" rx="6" fill="${bg}" stroke="${stroke}" stroke-width="1.5"/>
                <text x="${x + 24}" y="${y + 17}" font-size="13" font-weight="bold" fill="${textFill}" text-anchor="middle">${num}</text>
                <text x="${x + 60}" y="${y + 16}" font-size="10" fill="${textFill}" text-anchor="middle">${label}</text>
              `;
            }).join("")}
          </g>
        </svg>
      `;

    case "prime_tree":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【180 質因數分解短除法與樹狀結構】</text>
          <g transform="translate(60, 45)">
            <!-- 階梯短除法 -->
            <path d="M 40,20 L 140,20 L 140,110" fill="none" stroke="#64748b" stroke-width="2"/>
            <path d="M 40,50 L 140,50" fill="none" stroke="#64748b" stroke-width="2"/>
            <path d="M 40,80 L 140,80" fill="none" stroke="#64748b" stroke-width="2"/>
            <path d="M 40,110 L 140,110" fill="none" stroke="#64748b" stroke-width="2"/>

            <text x="25" y="16" fill="#d97706" font-size="14" font-weight="bold">2</text>
            <text x="70" y="16" fill="#1e293b" font-size="14">180</text>

            <text x="25" y="46" fill="#d97706" font-size="14" font-weight="bold">2</text>
            <text x="70" y="46" fill="#1e293b" font-size="14">90</text>

            <text x="25" y="76" fill="#d97706" font-size="14" font-weight="bold">3</text>
            <text x="70" y="76" fill="#1e293b" font-size="14">45</text>

            <text x="25" y="106" fill="#d97706" font-size="14" font-weight="bold">3</text>
            <text x="70" y="106" fill="#1e293b" font-size="14">15</text>

            <text x="70" y="132" fill="#d97706" font-size="14" font-weight="bold">5</text>

            <!-- 結論 -->
            <rect x="180" y="40" width="220" height="60" rx="10" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="290" y="66" text-anchor="middle" font-size="14" font-weight="bold" fill="#166534">180 = 2 × 2 × 3 × 3 × 5</text>
            <text x="290" y="88" text-anchor="middle" font-size="12" fill="#15803d">外側全為質數連乘積</text>
          </g>
        </svg>
      `;

    case "gcd_lcm_venn":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【質因數集合文氏圖：甲與乙的因數共鳴】</text>
          <g transform="translate(60, 40)">
            <!-- 圓甲 -->
            <circle cx="140" cy="80" r="70" fill="rgba(56, 189, 248, 0.2)" stroke="#0284c7" stroke-width="2"/>
            <text x="100" y="30" font-size="14" font-weight="bold" fill="#0369a1">甲 = 2 × 3 × a</text>
            <text x="110" y="85" font-size="16" font-weight="bold" fill="#0284c7">3</text>

            <!-- 圓乙 -->
            <circle cx="240" cy="80" r="70" fill="rgba(245, 158, 11, 0.2)" stroke="#f59e0b" stroke-width="2"/>
            <text x="270" y="30" font-size="14" font-weight="bold" fill="#b45309">乙 = 2 × 7 × a</text>
            <text x="265" y="85" font-size="16" font-weight="bold" fill="#d97706">7</text>

            <!-- 重疊交集 (GCD) -->
            <rect x="170" y="55" width="40" height="50" rx="6" fill="#fef3c7" stroke="#d97706" stroke-width="1.5"/>
            <text x="190" y="76" font-size="12" font-weight="bold" fill="#92400e" text-anchor="middle">2</text>
            <text x="190" y="94" font-size="12" font-weight="bold" fill="#92400e" text-anchor="middle">a = 11</text>

            <text x="190" y="140" font-size="12" font-weight="bold" fill="#d97706" text-anchor="middle">GCD = 2 × a = 22</text>
          </g>
        </svg>
      `;

    case "tile_grid":
      return `
        <svg viewBox="0 0 500 210" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【360cm × 240cm 鋪設 120cm 最大正方形金磚】</text>
          <g transform="translate(85, 45)">
            <!-- 大長方形 (360 x 240 比例 3:2，畫布取 330 x 120) -->
            <rect x="0" y="0" width="330" height="120" fill="#f8fafc" stroke="#334155" stroke-width="2"/>
            
            <!-- 6 塊正方形金磚 (每塊 110 x 60) -->
            <rect x="0" y="0" width="110" height="60" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
            <rect x="110" y="0" width="110" height="60" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
            <rect x="220" y="0" width="110" height="60" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
            
            <rect x="0" y="60" width="110" height="60" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>
            <rect x="110" y="60" width="110" height="60" fill="#fef08a" stroke="#ca8a04" stroke-width="1.5"/>
            <rect x="220" y="60" width="110" height="60" fill="#fef9c3" stroke="#ca8a04" stroke-width="1.5"/>

            <text x="55" y="35" text-anchor="middle" font-size="12" fill="#854d0e" font-weight="bold">120cm</text>
            <text x="165" y="35" text-anchor="middle" font-size="12" fill="#854d0e">第 2 塊</text>
            <text x="275" y="35" text-anchor="middle" font-size="12" fill="#854d0e">第 3 塊</text>

            <!-- 標註尺寸 -->
            <text x="165" y="-8" text-anchor="middle" font-size="12" font-weight="bold" fill="#0284c7">長 360 公分 (360 ÷ 120 = 3 塊)</text>
            <text x="-40" y="65" text-anchor="middle" font-size="12" font-weight="bold" fill="#0284c7" transform="rotate(-90, -40, 65)">寬 240 公分 (2 塊)</text>

            <text x="165" y="145" text-anchor="middle" font-size="13" font-weight="bold" fill="#16a34a">總塊數 ＝ 3 × 2 ＝ 6 塊最大金磚</text>
          </g>
        </svg>
      `;

    case "number_line_lcm":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【公倍數 [15, 20] = 60 數線軌道分析】</text>
          <g transform="translate(40, 70)">
            <!-- 數線軸 -->
            <line x1="20" y1="40" x2="420" y2="40" stroke="#475569" stroke-width="3"/>
            
            <!-- 區間高亮 (200 ~ 260) -->
            <rect x="230" y="15" width="110" height="50" rx="8" fill="rgba(22, 163, 74, 0.2)" stroke="#16a34a" stroke-width="1.5" stroke-dasharray="4,4"/>
            <text x="285" y="8" text-anchor="middle" font-size="11" font-weight="bold" fill="#15803d">目標區間 200 ~ 260 艘</text>

            <!-- 刻度與標記 -->
            ${[
              { n: 60, x: 70 },
              { n: 120, x: 140 },
              { n: 180, x: 210 },
              { n: 240, x: 285, target: true },
              { n: 300, x: 360 }
            ].map(p => `
              <circle cx="${p.x}" cy="40" r="${p.target ? 8 : 5}" fill="${p.target ? '#e11d48' : '#38bdf8'}"/>
              <text x="${p.x}" y="${p.target ? 68 : 64}" text-anchor="middle" font-size="${p.target ? 14 : 12}" font-weight="${p.target ? 'bold' : 'normal'}" fill="${p.target ? '#be123c' : '#334155'}">${p.n}</text>
            `).join("")}
            
            <text x="285" y="92" text-anchor="middle" font-size="13" font-weight="bold" fill="#e11d48">唯一符合：240 艘！</text>
          </g>
        </svg>
      `;

    case "fraction_divide_concept":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【分數除法大小法則：除數與 1 的關係】</text>
          <g transform="translate(50, 45)">
            <rect x="20" y="15" width="380" height="35" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="35" y="38" font-size="13" font-weight="bold" fill="#166534">除數 > 1 (如 1 1/5)</text>
            <text x="260" y="38" font-size="13" fill="#15803d">每瓶裝得多 ➔ 總瓶數 < 18 瓶 (商變小)</text>

            <rect x="20" y="60" width="380" height="35" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
            <text x="35" y="83" font-size="13" font-weight="bold" fill="#991b1b">除數 < 1 (如 7/9, 3/4)</text>
            <text x="260" y="83" font-size="13" fill="#b91c1c">每瓶裝得少 ➔ 總瓶數 > 18 瓶 (商變大)</text>

            <text x="210" y="125" text-anchor="middle" font-size="13" font-weight="bold" fill="#0284c7">要讓瓶數比 18 瓶少，除數必須大於 1！</text>
          </g>
        </svg>
      `;

    case "fraction_cancel":
      return `
        <svg viewBox="0 0 500 190" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【48/84 約分與 2 2/3 ÷ 1 1/3 假分數乘倒數】</text>
          <g transform="translate(60, 45)">
            <!-- 約分部分 -->
            <rect x="10" y="10" width="160" height="70" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="90" y="35" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e40af">48 ÷ 12 ＝ 4</text>
            <line x1="40" y1="45" x2="140" y2="45" stroke="#3b82f6" stroke-width="2"/>
            <text x="90" y="65" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e40af">84 ÷ 12 ＝ 7</text>

            <!-- 除法乘倒數部分 -->
            <rect x="200" y="10" width="180" height="70" rx="8" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
            <text x="290" y="35" text-anchor="middle" font-size="13" fill="#854d0e">2 2/3 ÷ 1 1/3</text>
            <text x="290" y="60" text-anchor="middle" font-size="13" font-weight="bold" fill="#a16207">＝ 8/3 × 3/4 ＝ 2 (公尺)</text>
          </g>
        </svg>
      `;

    case "rectangle_fraction":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【長方形面積公式：寬 ＝ 面積 ÷ 長】</text>
          <g transform="translate(90, 45)">
            <rect x="0" y="0" width="240" height="90" fill="#e0f2fe" stroke="#0284c7" stroke-width="2"/>
            <text x="120" y="45" text-anchor="middle" font-size="14" font-weight="bold" fill="#0369a1">面積 ＝ 7 1/2 平方公尺 (15/2)</text>
            
            <text x="120" y="-8" text-anchor="middle" font-size="13" font-weight="bold" fill="#1e293b">長 ＝ 2 1/4 公尺 (9/4)</text>
            <text x="-35" y="48" text-anchor="middle" font-size="13" font-weight="bold" fill="#e11d48" transform="rotate(-90, -35, 48)">寬 ＝ ? 公尺</text>

            <text x="120" y="125" text-anchor="middle" font-size="13" font-weight="bold" fill="#16a34a">寬 ＝ 15/2 ÷ 9/4 ＝ 15/2 × 4/9 ＝ 10/3 ＝ 3 1/3 公尺</text>
          </g>
        </svg>
      `;

    case "fraction_remainder_bottles":
      return `
        <svg viewBox="0 0 500 210" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【帶分數除法餘數陷阱：分裝水晶瓶分析】</text>
          <g transform="translate(40, 45)">
            <rect x="15" y="10" width="400" height="50" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="35" y="35" font-size="14" fill="#1e40af">7 1/2 ÷ 4/5 ＝ 15/2 × 5/4 ＝ 75/8 ＝ <tspan font-weight="bold" fill="#e11d48">9 又 3/8 (瓶)</tspan></text>

            <!-- 兩路解析 -->
            <rect x="15" y="70" width="180" height="55" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="105" y="93" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">整數『9』</text>
            <text x="105" y="112" text-anchor="middle" font-size="13" font-weight="bold" fill="#15803d">裝滿 9 瓶</text>

            <rect x="235" y="70" width="180" height="55" rx="6" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
            <text x="325" y="93" text-anchor="middle" font-size="12" font-weight="bold" fill="#991b1b">分數『3/8 瓶』(非公升！)</text>
            <text x="325" y="112" text-anchor="middle" font-size="12" font-weight="bold" fill="#b91c1c">3/8 × 4/5 ＝ 3/10 公升</text>
          </g>
        </svg>
      `;

    case "fraction_bar_scale":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【燃料槽基準量逆推線段圖】</text>
          <g transform="translate(60, 45)">
            <!-- 全長 9 格 -->
            <rect x="0" y="20" width="360" height="35" rx="6" fill="#f8fafc" stroke="#475569" stroke-width="2"/>
            
            <!-- 用掉 4 格 (4/9) -->
            <rect x="0" y="20" width="160" height="35" rx="6" fill="#cbd5e1" stroke="#64748b" stroke-width="1.5"/>
            <text x="80" y="42" text-anchor="middle" font-size="12" fill="#334155">用掉 4/9</text>

            <!-- 剩下 5 格 (5/9) = 15 公斤 -->
            <rect x="160" y="20" width="200" height="35" rx="6" fill="#bbf7d0" stroke="#16a34a" stroke-width="1.5"/>
            <text x="260" y="42" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">剩下 5/9 ＝ 15 公斤</text>

            <text x="180" y="90" text-anchor="middle" font-size="13" font-weight="bold" fill="#0284c7">全槽重 ＝ 15 ÷ (5/9) ＝ 15 × (9/5) ＝ 27 公斤</text>
          </g>
        </svg>
      `;

    case "invariant_scales":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【年齡差恆定：時光流逝差不變】</text>
          <g transform="translate(60, 45)">
            <rect x="20" y="10" width="360" height="35" rx="6" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
            <text x="35" y="32" font-size="13" fill="#854d0e">今年：長老 42 歲，勇者 14 歲 ➔ 相差 42 － 14 ＝ <tspan font-weight="bold" fill="#b45309">28 歲</tspan></text>

            <rect x="20" y="55" width="360" height="35" rx="6" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
            <text x="35" y="77" font-size="13" fill="#854d0e">10 年後：長老 52 歲，勇者 24 歲 ➔ 相差 52 － 24 ＝ <tspan font-weight="bold" fill="#b45309">28 歲</tspan></text>

            <text x="200" y="125" text-anchor="middle" font-size="13" font-weight="bold" fill="#16a34a">兩人年齡同步增加，年齡差永恆不變！</text>
          </g>
        </svg>
      `;

    case "octagon_pattern":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【相連正八邊形光柱生長規律】</text>
          <g transform="translate(60, 40)">
            <rect x="15" y="10" width="105" height="55" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
            <text x="67" y="32" text-anchor="middle" font-size="12" fill="#065f46">排 1 個</text>
            <text x="67" y="52" text-anchor="middle" font-size="14" font-weight="bold" fill="#047857">8 根</text>

            <rect x="135" y="10" width="105" height="55" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
            <text x="187" y="32" text-anchor="middle" font-size="12" fill="#065f46">排 2 個 (+7)</text>
            <text x="187" y="52" text-anchor="middle" font-size="14" font-weight="bold" fill="#047857">15 根</text>

            <rect x="255" y="10" width="105" height="55" rx="8" fill="#ecfdf5" stroke="#10b981" stroke-width="1.5"/>
            <text x="307" y="32" text-anchor="middle" font-size="12" fill="#065f46">排 3 個 (+7)</text>
            <text x="307" y="52" text-anchor="middle" font-size="14" font-weight="bold" fill="#047857">22 根</text>

            <text x="190" y="100" text-anchor="middle" font-size="13" font-weight="bold" fill="#0284c7">規律公式：8 ＋ 7(n － 1) ＝ 7n ＋ 1</text>
            <text x="190" y="125" text-anchor="middle" font-size="13" font-weight="bold" fill="#e11d48">n ＝ 80 ➔ 7 × 80 ＋ 1 ＝ 561 根光柱</text>
          </g>
        </svg>
      `;

    case "flow_rate_chart":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【水槽容量固定 240 公升：流量與時間反比】</text>
          <g transform="translate(60, 45)">
            <rect x="10" y="10" width="370" height="70" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <text x="25" y="35" font-size="12" fill="#334155">流量 10L × 24分 ＝ 240</text>
            <text x="210" y="35" font-size="12" fill="#334155">流量 15L × 16分 ＝ 240</text>
            
            <text x="25" y="62" font-size="12" font-weight="bold" fill="#0284c7">流量 20L × <tspan fill="#e11d48">甲(12分)</tspan> ＝ 240</text>
            <text x="210" y="62" font-size="12" font-weight="bold" fill="#0284c7"><tspan fill="#e11d48">乙(30L)</tspan> × 8分 ＝ 240</text>

            <text x="195" y="115" text-anchor="middle" font-size="13" font-weight="bold" fill="#16a34a">每分鐘注入流量 × 注滿所需時間 ＝ 240 (積不變)</text>
          </g>
        </svg>
      `;

    case "tree_interval_line":
      return `
        <svg viewBox="0 0 500 210" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【長廊掛風鈴：兩端都立植樹原理】</text>
          <g transform="translate(45, 50)">
            <line x1="20" y1="40" x2="400" y2="40" stroke="#475569" stroke-width="3"/>
            
            <!-- 第 4 號到第 16 號 (12 間隔) -->
            <rect x="90" y="15" width="220" height="50" rx="6" fill="rgba(56, 189, 248, 0.2)" stroke="#0284c7" stroke-width="1.5"/>
            <text x="200" y="10" text-anchor="middle" font-size="11" font-weight="bold" fill="#0369a1">第 4 號 ~ 第 16 號 (16－4＝12 間隔，共 180m)</text>

            <!-- 間距 = 15m -->
            <text x="200" y="90" text-anchor="middle" font-size="12" font-weight="bold" fill="#0284c7">間距 ＝ 180 ÷ 12 ＝ 15 公尺</text>
            <text x="200" y="115" text-anchor="middle" font-size="13" font-weight="bold" fill="#e11d48">全長 480m ➔ 間隔數 ＝ 480 ÷ 15 ＝ 32 個</text>
            <text x="200" y="138" text-anchor="middle" font-size="13" font-weight="bold" fill="#16a34a">兩端都立風鈴數 ＝ 32 ＋ 1 ＝ 33 個！</text>
          </g>
        </svg>
      `;

    case "circle_tree_pattern":
      return `
        <svg viewBox="0 0 500 210" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【圓形封閉迴路植樹：棵數 ＝ 間隔數】</text>
          <g transform="translate(70, 45)">
            <!-- 圓形周長示意 -->
            <circle cx="100" cy="70" r="55" fill="none" stroke="#f59e0b" stroke-width="3"/>
            <text x="100" y="65" text-anchor="middle" font-size="11" fill="#92400e">原 8m 插 1 支</text>
            <text x="100" y="85" text-anchor="middle" font-size="12" font-weight="bold" fill="#b45309">共 30 支</text>

            <rect x="180" y="15" width="220" height="95" rx="8" fill="#f8fafc" stroke="#64748b" stroke-width="1.5"/>
            <text x="195" y="40" font-size="12" fill="#1e293b">1. 周長 ＝ 8 × 30 ＝ <tspan font-weight="bold" fill="#0284c7">240 公尺</tspan></text>
            <text x="195" y="65" font-size="12" fill="#1e293b">2. 改 5m 插 1 支 ➔ 240 ÷ 5 ＝ <tspan font-weight="bold" fill="#0284c7">48 支</tspan></text>
            <text x="195" y="90" font-size="12" font-weight="bold" fill="#e11d48">3. 需多補上 ＝ 48 － 30 ＝ 18 支</text>
          </g>
        </svg>
      `;

    case "decimal_shift_unit":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【小數除法算理：換算計數單位】</text>
          <g transform="translate(60, 45)">
            <rect x="20" y="15" width="360" height="40" rx="6" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="35" y="40" font-size="13" fill="#1e40af">6.48 ＝ <tspan font-weight="bold" fill="#e11d48">648 個 0.01</tspan>，0.18 ＝ <tspan font-weight="bold" fill="#e11d48">18 個 0.01</tspan></text>

            <rect x="20" y="65" width="360" height="50" rx="6" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="200" y="88" text-anchor="middle" font-size="13" font-weight="bold" fill="#166534">6.48 ÷ 0.18 ＝ 648 ÷ 18 ＝ 36</text>
            <text x="200" y="106" text-anchor="middle" font-size="11" fill="#15803d">以 0.01 為單位包含除，商直接為 36 (不用再移回 0.36)</text>
          </g>
        </svg>
      `;

    case "decimal_quotient_rules":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【基準算式 57.6 ÷ 2.4 = 24 之縮放變化】</text>
          <g transform="translate(50, 45)">
            <rect x="20" y="15" width="380" height="75" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <text x="40" y="40" font-size="13" fill="#334155">• 被除數 57.6 ➔ 5.76 (縮小 10 倍 ➔ 商 ÷ 10)</text>
            <text x="40" y="65" font-size="13" fill="#334155">• 除數 2.4 ➔ 0.024 (縮小 100 倍 ➔ 商 × 100)</text>

            <text x="210" y="125" text-anchor="middle" font-size="14" font-weight="bold" fill="#e11d48">新商 ＝ 24 ÷ 10 × 100 ＝ 240</text>
          </g>
        </svg>
      `;

    case "decimal_long_division":
      return `
        <svg viewBox="0 0 500 210" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【18.36 ÷ 0.45 直式劃點與補零示範】</text>
          <g transform="translate(160, 45)">
            <text x="-50" y="35" font-size="14" fill="#64748b"><tspan text-decoration="line-through">0.45</tspan> <tspan font-weight="bold" fill="#0284c7">45</tspan></text>
            <path d="M 0,20 L 15,45 L 120,45" fill="none" stroke="#334155" stroke-width="2"/>
            <text x="25" y="40" font-size="14" fill="#64748b"><tspan text-decoration="line-through">18.36</tspan> <tspan font-weight="bold" fill="#0284c7">1836</tspan></text>

            <text x="25" y="15" font-size="15" font-weight="bold" fill="#e11d48">4 0 . 8</text>
            
            <text x="25" y="65" font-size="13" fill="#64748b">180</text>
            <line x1="20" y1="70" x2="60" y2="70" stroke="#64748b" stroke-width="1.5"/>
            <text x="35" y="85" font-size="13" fill="#64748b">360 (不夠除商補0，補0點小數點)</text>
            <text x="35" y="105" font-size="13" fill="#64748b">360</text>
            <line x1="30" y1="110" x2="65" y2="110" stroke="#64748b" stroke-width="1.5"/>
            <text x="50" y="125" font-size="13" font-weight="bold" fill="#16a34a">0 (整除，得 40.8)</text>
          </g>
        </svg>
      `;

    case "speed_distance_time":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【速率三角公式：平均時速 ＝ 距離 ÷ 時間】</text>
          <g transform="translate(100, 45)">
            <polygon points="140,15 60,110 220,110" fill="#f0fdf4" stroke="#16a34a" stroke-width="2"/>
            <line x1="100" y1="65" x2="180" y2="65" stroke="#16a34a" stroke-width="2"/>
            <line x1="140" y1="65" x2="140" y2="110" stroke="#16a34a" stroke-width="2"/>

            <text x="140" y="50" text-anchor="middle" font-size="13" font-weight="bold" fill="#166534">距離 86.8 km</text>
            <text x="100" y="95" text-anchor="middle" font-size="12" font-weight="bold" fill="#e11d48">時速 ?</text>
            <text x="180" y="95" text-anchor="middle" font-size="12" font-weight="bold" fill="#0369a1">時間 3.5 hr</text>

            <text x="140" y="135" text-anchor="middle" font-size="13" font-weight="bold" fill="#0284c7">時速 ＝ 86.8 ÷ 3.5 ＝ 868 ÷ 35 ＝ 24.8 km/hr</text>
          </g>
        </svg>
      `;

    case "unit_price_compare":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【乾糧補給袋單價比划算】</text>
          <g transform="translate(60, 45)">
            <rect x="15" y="15" width="170" height="70" rx="8" fill="#fef2f2" stroke="#ef4444" stroke-width="1.5"/>
            <text x="100" y="38" text-anchor="middle" font-size="13" font-weight="bold" fill="#991b1b">甲袋 (1.4kg / 25金幣)</text>
            <text x="100" y="60" text-anchor="middle" font-size="12" fill="#b91c1c">25 ÷ 1.4 ≈ 17.857...</text>
            <text x="100" y="78" text-anchor="middle" font-size="12" font-weight="bold" fill="#991b1b">約 17.9 金幣/kg</text>

            <rect x="205" y="15" width="170" height="70" rx="8" fill="#f0fdf4" stroke="#16a34a" stroke-width="1.5"/>
            <text x="290" y="38" text-anchor="middle" font-size="13" font-weight="bold" fill="#166534">乙袋 (2.2kg / 38金幣)</text>
            <text x="290" y="60" text-anchor="middle" font-size="12" fill="#15803d">38 ÷ 2.2 ≈ 17.272...</text>
            <text x="290" y="78" text-anchor="middle" font-size="12" font-weight="bold" fill="#166534">約 17.3 金幣/kg 🏆</text>

            <text x="195" y="115" text-anchor="middle" font-size="13" font-weight="bold" fill="#16a34a">17.3 < 17.9 ➔ 每公斤單價較低，買乙袋划算！</text>
          </g>
        </svg>
      `;

    case "ratio_bar_concept":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【比與比值概念：前項 3 : 後項 8】</text>
          <g transform="translate(60, 45)">
            <text x="20" y="35" font-size="13" font-weight="bold" fill="#334155">風靈草 (前項 3 份)：</text>
            <rect x="150" y="20" width="90" height="22" rx="4" fill="#38bdf8" stroke="#0284c7" stroke-width="1.5"/>
            
            <text x="20" y="70" font-size="13" font-weight="bold" fill="#334155">暴雨水 (後項 8 份)：</text>
            <rect x="150" y="55" width="240" height="22" rx="4" fill="#a855f7" stroke="#7e22ce" stroke-width="1.5"/>

            <text x="190" y="115" text-anchor="middle" font-size="13" font-weight="bold" fill="#0284c7">比值 ＝ 前項 ÷ 後項 ＝ 3 ÷ 8 ＝ 3/8 (前項是後項的 3/8 倍)</text>
          </g>
        </svg>
      `;

    case "grid_ratio_puzzle":
      return `
        <svg viewBox="0 0 500 210" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【20 格紋章面積比值與連鎖比 2:3】</text>
          <g transform="translate(40, 45)">
            <!-- 4x5 網格 -->
            <rect x="10" y="10" width="125" height="100" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <!-- 金色 8 格 -->
            <text x="72" y="55" text-anchor="middle" font-size="12" font-weight="bold" fill="#ca8a04">金色 8 格</text>
            <text x="72" y="75" text-anchor="middle" font-size="12" font-weight="bold" fill="#64748b">銀白 12 格</text>

            <rect x="160" y="10" width="250" height="100" rx="8" fill="#f8fafc" stroke="#475569" stroke-width="1.5"/>
            <text x="175" y="35" font-size="12" fill="#334155">1. 比值 ＝ 8 ÷ 12 ＝ <tspan font-weight="bold" fill="#0284c7">2/3</tspan></text>
            <text x="175" y="60" font-size="12" fill="#334155">2. 2 : 3 ＝ 10 : A ➔ A ＝ 3 × 5 ＝ <tspan font-weight="bold" fill="#e11d48">15</tspan></text>
            <text x="175" y="85" font-size="12" fill="#334155">3. 2 : 3 ＝ B : 21 ➔ B ＝ 2 × 7 ＝ <tspan font-weight="bold" fill="#e11d48">14</tspan></text>
            <text x="285" y="125" text-anchor="middle" font-size="13" font-weight="bold" fill="#16a34a">A ＋ B ＝ 15 ＋ 14 ＝ 29</text>
          </g>
        </svg>
      `;

    case "ratio_simplification":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【最簡整數比化簡步驟】</text>
          <g transform="translate(60, 45)">
            <rect x="15" y="10" width="170" height="75" rx="8" fill="#eff6ff" stroke="#3b82f6" stroke-width="1.5"/>
            <text x="100" y="32" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e40af">3.2 : 0.48</text>
            <text x="100" y="52" text-anchor="middle" font-size="11" fill="#3b82f6">同乘 100 ➔ 320 : 48</text>
            <text x="100" y="72" text-anchor="middle" font-size="13" font-weight="bold" fill="#1d4ed8">同除 16 ➔ 20 : 3</text>

            <rect x="205" y="10" width="170" height="75" rx="8" fill="#fefce8" stroke="#ca8a04" stroke-width="1.5"/>
            <text x="290" y="32" text-anchor="middle" font-size="12" font-weight="bold" fill="#854d0e">1.2 : 1 3/5</text>
            <text x="290" y="52" text-anchor="middle" font-size="11" fill="#ca8a04">化小數 ➔ 1.2 : 1.6</text>
            <text x="290" y="72" text-anchor="middle" font-size="13" font-weight="bold" fill="#a16207">同除 0.4 ➔ 3 : 4</text>
          </g>
        </svg>
      `;

    case "ratio_tape_diagram":
      return `
        <svg viewBox="0 0 500 200" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【精金與烏金 5:8 比例差額線段圖】</text>
          <g transform="translate(60, 45)">
            <text x="10" y="32" font-size="12" font-weight="bold" fill="#334155">精金 (5份)：</text>
            <rect x="90" y="18" width="150" height="20" rx="4" fill="#fde047" stroke="#ca8a04" stroke-width="1.5"/>
            
            <text x="10" y="65" font-size="12" font-weight="bold" fill="#334155">烏金 (8份)：</text>
            <rect x="90" y="50" width="240" height="20" rx="4" fill="#94a3b8" stroke="#475569" stroke-width="1.5"/>

            <!-- 差額 3 份 = 120kg -->
            <rect x="240" y="50" width="90" height="20" rx="4" fill="rgba(239, 68, 68, 0.2)" stroke="#ef4444" stroke-width="1.5"/>
            <text x="285" y="42" text-anchor="middle" font-size="11" font-weight="bold" fill="#b91c1c">差 3 份 ＝ 120kg</text>

            <text x="190" y="105" text-anchor="middle" font-size="12" font-weight="bold" fill="#0284c7">1 份 ＝ 120 ÷ 3 ＝ 40 kg</text>
            <text x="190" y="125" text-anchor="middle" font-size="13" font-weight="bold" fill="#16a34a">總共 (5 ＋ 8 ＝ 13 份) ＝ 40 × 13 ＝ 520 公斤！</text>
          </g>
        </svg>
      `;

    case "perimeter_ratio_rect":
      return `
        <svg viewBox="0 0 500 210" class="scaffold-svg">
          <text x="250" y="24" text-anchor="middle" font-size="14" font-weight="bold" fill="#0284c7">【長方形結界周長 100m 關鍵：半周長】</text>
          <g transform="translate(90, 45)">
            <rect x="0" y="0" width="240" height="90" fill="#fef3c7" stroke="#d97706" stroke-width="2"/>
            <text x="120" y="50" text-anchor="middle" font-size="14" font-weight="bold" fill="#b45309">面積 ＝ 長 × 寬 ＝ 30 × 20 ＝ 600 m²</text>
            
            <text x="120" y="-8" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b">長 ＝ 3 份 (30 公尺)</text>
            <text x="-35" y="48" text-anchor="middle" font-size="12" font-weight="bold" fill="#1e293b" transform="rotate(-90, -35, 48)">寬 ＝ 2 份 (20m)</text>

            <text x="120" y="120" text-anchor="middle" font-size="13" font-weight="bold" fill="#e11d48">半周長 (長＋寬) ＝ 100 ÷ 2 ＝ 50 公尺！(共 5 份，1 份 10m)</text>
          </g>
        </svg>
      `;

    default:
      return `
        <svg viewBox="0 0 500 160" class="scaffold-svg">
          <rect x="20" y="20" width="460" height="120" rx="10" fill="#f8fafc" stroke="#cbd5e1" stroke-width="1.5"/>
          <text x="250" y="85" text-anchor="middle" font-size="14" fill="#64748b">💡 仔細閱讀題幹條件，一步一步推導解題步驟。</text>
        </svg>
      `;
  }
}
