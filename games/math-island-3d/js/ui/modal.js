/**
 * 3D 數學立體群島大冒險 - 答題試煉彈窗與全方位即時反饋視窗
 * 確保學生清楚知曉答對或答錯：
 * 1. 選項卡片即時變色 (答對鮮綠 ✓ / 答錯鮮紅 ✕ 並左右抖動)
 * 2. 視窗自動平滑滾動至反饋卡片 (提示迷思陷阱與解題覆盤)
 * 3. 悅耳上行和弦 (答對) vs 溫和低音警示 (答錯)
 * 4. 頂部狀態標籤即時顯示星級
 */

import { sound } from "../audio.js";
import { i18n } from "../i18n.js";

export class QuizModal {
  constructor(container, onLevelCompleted) {
    this.container = container;
    this.onLevelCompleted = onLevelCompleted;
    this.currentQuestion = null;
    this.selectedOptionIndex = -1;
    this.attempts = 0;

    this.renderContainer();
    this.bindEvents();
  }

  renderContainer() {
    this.container.innerHTML = `
      <div id="quizOverlay" class="quiz-overlay">
        <div class="quiz-modal-box toy-pop">
          <!-- 頂部標題列 -->
          <div class="quiz-header">
            <div class="quiz-badge-row">
              <span id="quizUnitBadge" class="quiz-pill pill-unit">單元</span>
              <span id="quizTypeBadge" class="quiz-pill pill-type">題型</span>
              <span id="quizStatusBadge" class="quiz-pill pill-status">狀態</span>
            </div>
            <button id="btnQuizClose" class="quiz-close-btn" title="關閉視窗 (Esc)">✕</button>
          </div>

          <!-- 主體內容區 (可滾動) -->
          <div class="quiz-body" id="quizScrollBody">
            <h2 id="quizTitle" class="quiz-title">關卡名稱</h2>

            <!-- RPG 劇情情境引導 -->
            <div id="quizStoryBox" class="quiz-story-box">
              <span class="story-icon">📜</span>
              <p id="quizStoryText" class="story-text"></p>
            </div>

            <!-- 核心數學題目 -->
            <div class="quiz-question-box">
              <span class="q-label">【試煉題目】</span>
              <p id="quizQuestionText" class="question-text"></p>
            </div>

            <!-- 四選一選項卡片 -->
            <div id="quizOptionsList" class="quiz-options-grid"></div>

            <!-- 作答結果反饋區 (答題後展開並自動滾動至可見區域) -->
            <div id="quizFeedbackBox" class="quiz-feedback-box" style="display: none;"></div>
          </div>

          <!-- 底部操作列 -->
          <div class="quiz-footer">
            <button id="btnQuizSubmit" class="quiz-btn-primary" disabled>
              ⚡ 提交驗證解答
            </button>
          </div>
        </div>
      </div>
    `;
  }

  bindEvents() {
    document.getElementById("btnQuizClose").addEventListener("click", () => {
      sound.playClick();
      this.close();
    });

    document.getElementById("quizOverlay").addEventListener("click", e => {
      if (e.target.id === "quizOverlay") {
        sound.playClick();
        this.close();
      }
    });

    window.addEventListener("keydown", e => {
      if (e.key === "Escape" && this.isOpen()) {
        this.close();
      }
    });

    document.getElementById("btnQuizSubmit").addEventListener("click", () => {
      this.submitAnswer();
    });
  }

  open(question, currentStars = 0) {
    this.currentQuestion = question;
    this.selectedOptionIndex = -1;
    this.attempts = 0;
    this.usedHint = false;

    const lang = i18n.getLang();

    // 填入題目基本資訊
    const unitText = lang === "en" 
      ? `${question.unitId}-0${question.levelNum} | Unit 0${question.unitId}`
      : `${question.unitId}-0${question.levelNum} | 第 0${question.unitId} 單元`;
    const typeText = lang === "en" ? (question.type_en || question.type) : question.type;
    const titleText = lang === "en" ? (question.title_en || question.title) : question.title;
    const storyText = lang === "en" ? (question.story_en || question.story) : question.story;
    const questionText = lang === "en" ? (question.question_en || question.question) : question.question;

    document.getElementById("quizUnitBadge").innerText = unitText;
    document.getElementById("quizTypeBadge").innerText = typeText;
    document.getElementById("quizTitle").innerText = titleText;
    document.getElementById("quizStoryText").innerText = storyText;
    document.getElementById("quizQuestionText").innerText = questionText;

    const qLabel = document.querySelector(".quiz-question-box .q-label");
    if (qLabel) qLabel.innerText = i18n.t("qLabel");

    // 更新狀態徽章
    const statusBadge = document.getElementById("quizStatusBadge");
    if (statusBadge) {
      if (currentStars > 0) {
        statusBadge.innerText = i18n.t("statusCleared", { s: currentStars });
        statusBadge.className = "quiz-pill pill-status cleared";
      } else {
        statusBadge.innerText = i18n.t("statusNew");
        statusBadge.className = "quiz-pill pill-status new";
      }
    }

    // 重置反饋區與送出按鈕
    const feedbackBox = document.getElementById("quizFeedbackBox");
    feedbackBox.style.display = "none";
    feedbackBox.className = "quiz-feedback-box";
    const submitBtn = document.getElementById("btnQuizSubmit");
    submitBtn.disabled = true;
    submitBtn.innerText = i18n.t("submitBtn");

    // 渲染選項
    this.renderOptions();

    // 滾動條重置回頂部
    const scrollBody = document.getElementById("quizScrollBody");
    if (scrollBody) scrollBody.scrollTop = 0;

    // 顯示視窗
    const overlay = document.getElementById("quizOverlay");
    overlay.classList.add("active");
    sound.playClick();
  }

  renderOptions() {
    const list = document.getElementById("quizOptionsList");
    const letters = ["A", "B", "C", "D"];
    const lang = i18n.getLang();

    list.innerHTML = this.currentQuestion.options.map((opt, idx) => {
      const optText = lang === "en" ? (opt.text_en || opt.text) : opt.text;
      return `
      <div class="option-card" data-idx="${idx}">
        <span class="opt-letter">${letters[idx]}</span>
        <div class="opt-text">${optText}</div>
      </div>
      `;
    }).join("");

    list.querySelectorAll(".option-card").forEach(card => {
      card.addEventListener("click", () => {
        sound.playSelect();
        const idx = parseInt(card.getAttribute("data-idx"), 10);
        this.selectOption(idx);
      });
    });
  }

  selectOption(index) {
    this.selectedOptionIndex = index;

    // 清除所有卡片的答對/答錯樣式與標籤
    const cards = document.querySelectorAll(".option-card");
    cards.forEach((card, idx) => {
      card.classList.toggle("selected", idx === index);
      card.classList.remove("correct", "wrong");
      const oldTag = card.querySelector(".opt-status-tag");
      if (oldTag) oldTag.remove();
    });

    const submitBtn = document.getElementById("btnQuizSubmit");
    submitBtn.disabled = false;
    submitBtn.innerText = i18n.t("submitBtn");
    submitBtn.className = "quiz-btn-primary";
    submitBtn.onclick = () => this.submitAnswer();
  }

  submitAnswer() {
    if (this.selectedOptionIndex < 0 || !this.currentQuestion) return;

    this.attempts++;
    const chosen = this.currentQuestion.options[this.selectedOptionIndex];
    const feedbackBox = document.getElementById("quizFeedbackBox");
    const submitBtn = document.getElementById("btnQuizSubmit");
    const selectedCard = document.querySelector(`.option-card[data-idx="${this.selectedOptionIndex}"]`);
    const lang = i18n.getLang();
    const reasonText = lang === "en" ? (chosen.reason_en || chosen.reason) : chosen.reason;
    const solutionText = lang === "en" ? (this.currentQuestion.solution_en || this.currentQuestion.solution) : this.currentQuestion.solution;

    // 先清除卡片原有標籤
    if (selectedCard) {
      const oldTag = selectedCard.querySelector(".opt-status-tag");
      if (oldTag) oldTag.remove();
    }

    if (chosen.isCorrect) {
      // ==========================================
      // 🌟 答對反饋處理
      // ==========================================
      sound.playCorrect();

      // 1. 選項卡片標註為綠色打勾
      if (selectedCard) {
        selectedCard.classList.remove("selected", "wrong");
        selectedCard.classList.add("correct");
        const tag = document.createElement("span");
        tag.className = "opt-status-tag correct";
        tag.innerHTML = i18n.t("tagCorrect");
        selectedCard.appendChild(tag);
      }

      // 2. 計算獲得星級 (第 1 次答對得 3 星，第 2 次答對得 2 星，第 3 次以上答對得 1 星)
      let stars = 3;
      if (this.attempts === 2) stars = 2;
      if (this.attempts >= 3) stars = 1;
      const starStr = "⭐".repeat(stars);

      // 3. 填入綠色巨幅通過卡片
      feedbackBox.className = "quiz-feedback-box success toy-pop";
      feedbackBox.innerHTML = `
        <div class="feedback-header">
          <span class="feedback-icon">🎉</span>
          <div class="feedback-title">
            <h3 style="color: #15803d; font-size: 1.3rem;">${i18n.t("correctTitle")}${starStr}</h3>
            <span class="feedback-sub" style="color: #166534; font-size: 1.05rem; font-weight: 700;">${reasonText}</span>
          </div>
        </div>
        <div class="solution-text">
          <strong>${i18n.t("solutionTitle")}</strong>
          <pre>${solutionText}</pre>
        </div>
      `;
      feedbackBox.style.display = "block";

      // 4. 自動平滑滾動使反饋卡進入視線
      setTimeout(() => {
        feedbackBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);

      // 5. 底部按鈕改為「完成本關試煉」
      submitBtn.innerText = i18n.t("submitNext");
      submitBtn.className = "quiz-btn-primary success-btn";
      submitBtn.onclick = () => {
        this.close();
        if (this.onLevelCompleted) {
          this.onLevelCompleted(this.currentQuestion.id, stars);
        }
      };
    } else {
      // ==========================================
      // ⚠️ 答錯反饋處理
      // ==========================================
      sound.playWrong();

      // 1. 選項卡片標註為紅色打叉並觸發抖動
      if (selectedCard) {
        selectedCard.classList.remove("selected", "correct");
        selectedCard.classList.add("wrong");
        const tag = document.createElement("span");
        tag.className = "opt-status-tag wrong";
        tag.innerHTML = i18n.t("tagWrong");
        selectedCard.appendChild(tag);
      }

      // 2. 填入紅色醒目提示卡片 (指引具體迷思陷阱)
      feedbackBox.className = "quiz-feedback-box error toy-pop";
      feedbackBox.innerHTML = `
        <div class="feedback-header">
          <span class="feedback-icon">❌</span>
          <div class="feedback-title">
            <h3 style="color: #b91c1c; font-size: 1.3rem;">${i18n.t("wrongTitle")}</h3>
            <span class="feedback-sub" style="color: #991b1b; font-size: 1.05rem; font-weight: 700;">${reasonText}</span>
          </div>
        </div>
        <p class="error-tip">${i18n.t("wrongTip")}</p>
      `;
      feedbackBox.style.display = "block";

      // 3. 自動平滑滾動使反饋卡進入視線
      setTimeout(() => {
        feedbackBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
      }, 100);

      // 4. 底部按鈕提示換選項重試
      submitBtn.innerText = i18n.t("submitRetry");
      submitBtn.disabled = true; // 學生點擊其他選項時重新解鎖按鈕
    }
  }

  close() {
    const overlay = document.getElementById("quizOverlay");
    if (overlay) overlay.classList.remove("active");
  }

  isOpen() {
    const overlay = document.getElementById("quizOverlay");
    return overlay && overlay.classList.contains("active");
  }
}
