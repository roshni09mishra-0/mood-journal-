const STORAGE_KEY = "mood-journal-entries-v1";

const moods = [
  {
    id: "joyful",
    label: "Khush",
    emoji: "😄",
    score: 5,
    hint: "Light, energetic, positive",
    color: "#f59e0b",
  },
  {
    id: "calm",
    label: "Shant",
    emoji: "😌",
    score: 4,
    hint: "Steady, grounded, peaceful",
    color: "#14b8a6",
  },
  {
    id: "neutral",
    label: "Theek-thaak",
    emoji: "🙂",
    score: 3,
    hint: "Okay, stable, in-between",
    color: "#3b82f6",
  },
  {
    id: "stressed",
    label: "Stress",
    emoji: "😵",
    score: 2,
    hint: "Busy, tense, overloaded",
    color: "#fb923c",
  },
  {
    id: "sad",
    label: "Udaas",
    emoji: "😔",
    score: 1,
    hint: "Low, heavy, drained",
    color: "#6366f1",
  },
];

const state = {
  selectedMood: "calm",
  entries: loadEntries(),
  currentMonth: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
};

const elements = {
  todayDate: document.getElementById("todayDate"),
  moodPicker: document.getElementById("moodPicker"),
  notesInput: document.getElementById("notesInput"),
  saveEntryBtn: document.getElementById("saveEntryBtn"),
  saveMessage: document.getElementById("saveMessage"),
  todayMoodLabel: document.getElementById("todayMoodLabel"),
  streakCount: document.getElementById("streakCount"),
  weeklyVibe: document.getElementById("weeklyVibe"),
  insightHeadline: document.getElementById("insightHeadline"),
  insightSummary: document.getElementById("insightSummary"),
  insightList: document.getElementById("insightList"),
  barChart: document.getElementById("barChart"),
  distributionChart: document.getElementById("distributionChart"),
  historyList: document.getElementById("historyList"),
  calendarMonthLabel: document.getElementById("calendarMonthLabel"),
  calendarGrid: document.getElementById("calendarGrid"),
  prevMonthBtn: document.getElementById("prevMonthBtn"),
  nextMonthBtn: document.getElementById("nextMonthBtn"),
};

init();

function init() {
  elements.todayDate.textContent = formatLongDate(new Date());
  renderMoodPicker();
  hydrateTodayEntry();
  renderAll();
  bindEvents();
}

function bindEvents() {
  elements.saveEntryBtn.addEventListener("click", saveTodayEntry);
  elements.prevMonthBtn.addEventListener("click", () => {
    state.currentMonth = new Date(
      state.currentMonth.getFullYear(),
      state.currentMonth.getMonth() - 1,
      1
    );
    renderCalendar();
  });
  elements.nextMonthBtn.addEventListener("click", () => {
    state.currentMonth = new Date(
      state.currentMonth.getFullYear(),
      state.currentMonth.getMonth() + 1,
      1
    );
    renderCalendar();
  });
}

function renderMoodPicker() {
  elements.moodPicker.innerHTML = "";

  moods.forEach((mood) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = `mood-option ${state.selectedMood === mood.id ? "active" : ""}`;
    button.innerHTML = `
      <span class="emoji">${mood.emoji}</span>
      <span class="label">${mood.label}</span>
      <span class="sub">${mood.hint}</span>
    `;

    button.addEventListener("click", () => {
      state.selectedMood = mood.id;
      document.body.dataset.theme = mood.id;
      renderMoodPicker();
    });

    elements.moodPicker.appendChild(button);
  });
}

function saveTodayEntry() {
  const todayKey = getDateKey(new Date());
  const note = elements.notesInput.value.trim();
  const selected = getMood(state.selectedMood);

  const entry = {
    date: todayKey,
    mood: selected.id,
    note,
    score: selected.score,
    updatedAt: new Date().toISOString(),
  };

  const existingIndex = state.entries.findIndex((item) => item.date === todayKey);

  if (existingIndex >= 0) {
    state.entries[existingIndex] = entry;
  } else {
    state.entries.push(entry);
  }

  state.entries.sort((a, b) => new Date(b.date) - new Date(a.date));
  saveEntries(state.entries);
  elements.saveMessage.textContent = "Saved. Aaj ka mood journal update ho gaya.";
  renderAll();
}

function hydrateTodayEntry() {
  const todayEntry = state.entries.find((entry) => entry.date === getDateKey(new Date()));

  if (todayEntry) {
    state.selectedMood = todayEntry.mood;
    elements.notesInput.value = todayEntry.note || "";
    document.body.dataset.theme = todayEntry.mood;
  } else {
    document.body.dataset.theme = state.selectedMood;
  }

  renderMoodPicker();
}

function renderAll() {
  renderStats();
  renderInsights();
  renderBarChart();
  renderDistributionChart();
  renderHistory();
  renderCalendar();
}

function renderStats() {
  const todayEntry = state.entries.find((entry) => entry.date === getDateKey(new Date()));
  const todayMood = todayEntry ? getMood(todayEntry.mood) : null;
  elements.todayMoodLabel.textContent = todayMood
    ? `${todayMood.emoji} ${todayMood.label}`
    : "Abhi mood log nahi hua";

  const streak = calculateStreak(state.entries);
  elements.streakCount.textContent = `${streak} din`;

  const weeklyEntries = getLastNDaysEntries(7);
  const dominantMood = getDominantMood(weeklyEntries);
  elements.weeklyVibe.textContent = dominantMood ? dominantMood.label : "Balanced";
}

function renderInsights() {
  const weeklyEntries = getLastNDaysEntries(7);

  if (weeklyEntries.length === 0) {
    elements.insightHeadline.textContent = "Logging start karo aur apni mood story dekho.";
    elements.insightSummary.textContent =
      "Kuch daily entries add karo aur yeh section aapke weekly emotional pattern, changes, aur simple suggestions dikhayega.";
    elements.insightList.innerHTML = "";
    return;
  }

  const avgScore =
    weeklyEntries.reduce((sum, entry) => sum + entry.score, 0) / weeklyEntries.length;
  const dominantMood = getDominantMood(weeklyEntries);
  const bestDay = [...weeklyEntries].sort((a, b) => b.score - a.score)[0];
  const challengingDays = weeklyEntries.filter((entry) => entry.score <= 2).length;
  const reflectiveWords = extractCommonWords(weeklyEntries.map((entry) => entry.note));

  let headline = "Is hafte aapka mood mostly balanced raha.";
  if (avgScore >= 4.2) headline = "Is hafte positive energy kaafi strong rahi.";
  if (avgScore < 3.2) headline = "Yeh hafta usual se thoda emotionally heavy laga.";
  if (challengingDays >= 3) headline = "Is hafte stress ka pattern baar-baar dikha.";

  elements.insightHeadline.textContent = headline;
  elements.insightSummary.textContent = buildInsightSummary({
    avgScore,
    dominantMood,
    challengingDays,
    entryCount: weeklyEntries.length,
  });

  const suggestions = [];
  suggestions.push(
    `${dominantMood ? dominantMood.label : "Mixed"} aapka sabse frequent mood raha ${weeklyEntries.length} logged dinon me.`
  );

  if (bestDay) {
    suggestions.push(
      `Aapka best day ${formatShortDate(bestDay.date)} tha jahan mood ${
        getMood(bestDay.mood).emoji
      } ${getMood(bestDay.mood).label}.`
    );
  }

  if (reflectiveWords.length > 0) {
    suggestions.push(`Aapke notes me yeh words baar-baar aaye: ${reflectiveWords.join(", ")}.`);
  }

  if (challengingDays >= 3) {
    suggestions.push("Intense days par lighter schedule, short walk, ya wind-down routine try karo.");
  } else if (avgScore >= 4) {
    suggestions.push("Jo routine aapko support kar rahi hai, woh kaam kar rahi lagti hai. Use continue rakho.");
  } else {
    suggestions.push("Din ke end par chhota reflection aapko mood shift samajhne me help kar sakta hai.");
  }

  elements.insightList.innerHTML = suggestions.map((item) => `<li>${item}</li>`).join("");
}

function renderBarChart() {
  const weeklyEntries = getLastNDaysEntries(7).reverse();

  if (weeklyEntries.length === 0) {
    elements.barChart.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">Last 7 days ke liye abhi data nahi hai.</div>`;
    return;
  }

  elements.barChart.innerHTML = weeklyEntries
    .map((entry) => {
      const mood = getMood(entry.mood);
      const height = Math.max(18, entry.score * 38);
      return `
        <div class="bar-group">
          <span class="bar-value">${mood.emoji}</span>
          <div class="bar" style="height:${height}px; background: linear-gradient(180deg, ${mood.color}, ${withOpacity(
        mood.color,
        0.7
      )});"></div>
          <span class="bar-label">${formatTinyDate(entry.date)}</span>
        </div>
      `;
    })
    .join("");
}

function renderDistributionChart() {
  if (state.entries.length === 0) {
    elements.distributionChart.innerHTML = `<div class="empty-state">Jaise hi entries save hongi, mood mix yahan dikh jayega.</div>`;
    return;
  }

  const total = state.entries.length;
  elements.distributionChart.innerHTML = moods
    .map((mood) => {
      const count = state.entries.filter((entry) => entry.mood === mood.id).length;
      const percentage = Math.round((count / total) * 100);
      return `
        <div class="distribution-row">
          <span class="distribution-label">${mood.emoji} ${mood.label}</span>
          <div class="distribution-track">
            <div class="distribution-fill" style="width:${percentage}%; background:${mood.color};"></div>
          </div>
          <strong>${percentage}%</strong>
        </div>
      `;
    })
    .join("");
}

function renderHistory() {
  if (state.entries.length === 0) {
    elements.historyList.innerHTML =
      '<div class="empty-state">Abhi entries nahi hain. Pehla mood log karo aur journal start karo.</div>';
    return;
  }

  elements.historyList.innerHTML = state.entries
    .slice(0, 8)
    .map((entry) => {
      const mood = getMood(entry.mood);
      return `
        <article class="history-item">
          <div class="history-top">
            <span class="history-mood">${mood.emoji} ${mood.label}</span>
            <span class="history-date">${formatLongDate(new Date(entry.date))}</span>
          </div>
          <p class="history-note">${entry.note || "Is din ke liye koi note add nahi kiya gaya."}</p>
        </article>
      `;
    })
    .join("");
}

function renderCalendar() {
  const year = state.currentMonth.getFullYear();
  const month = state.currentMonth.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const todayKey = getDateKey(new Date());

  elements.calendarMonthLabel.textContent = state.currentMonth.toLocaleDateString("en-US", {
    month: "long",
    year: "numeric",
  });

  const cells = [];
  for (let i = 0; i < firstDayIndex; i += 1) {
    cells.push('<div class="calendar-cell empty"></div>');
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const date = new Date(year, month, day);
    const dateKey = getDateKey(date);
    const entry = state.entries.find((item) => item.date === dateKey);
    const mood = entry ? getMood(entry.mood) : null;
    cells.push(`
      <div class="calendar-cell ${dateKey === todayKey ? "today" : ""}">
        <span class="calendar-day-number">${day}</span>
        <div class="calendar-mood">${mood ? mood.emoji : ""}</div>
        <p class="calendar-note">${entry ? truncate(entry.note || mood.label, 42) : ""}</p>
      </div>
    `);
  }

  elements.calendarGrid.innerHTML = cells.join("");
}

function loadEntries() {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

function saveEntries(entries) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
}

function getMood(id) {
  return moods.find((mood) => mood.id === id) || moods[2];
}

function getDateKey(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function formatLongDate(date) {
  return new Date(date).toLocaleDateString("en-US", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatShortDate(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function formatTinyDate(dateKey) {
  return new Date(dateKey).toLocaleDateString("en-US", {
    weekday: "short",
  });
}

function getLastNDaysEntries(days) {
  const from = new Date();
  from.setDate(from.getDate() - (days - 1));
  const fromKey = getDateKey(from);
  return state.entries
    .filter((entry) => entry.date >= fromKey)
    .sort((a, b) => new Date(a.date) - new Date(b.date));
}

function getDominantMood(entries) {
  if (entries.length === 0) return null;
  const counts = entries.reduce((acc, entry) => {
    acc[entry.mood] = (acc[entry.mood] || 0) + 1;
    return acc;
  }, {});

  const dominantId = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  return getMood(dominantId);
}

function calculateStreak(entries) {
  if (entries.length === 0) return 0;
  const keys = new Set(entries.map((entry) => entry.date));
  let streak = 0;
  const cursor = new Date();

  if (!keys.has(getDateKey(cursor))) {
    cursor.setDate(cursor.getDate() - 1);
  }

  while (keys.has(getDateKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function extractCommonWords(notes) {
  const stopWords = new Set([
    "the",
    "and",
    "for",
    "with",
    "that",
    "this",
    "have",
    "from",
    "about",
    "felt",
    "today",
    "just",
    "very",
    "into",
    "was",
    "are",
    "but",
    "had",
    "got",
    "because",
    "after",
    "before",
    "your",
    "you",
    "work",
    "life",
    "mood",
  ]);

  const words = notes
    .join(" ")
    .toLowerCase()
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 3 && !stopWords.has(word));

  const counts = words.reduce((acc, word) => {
    acc[word] = (acc[word] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(counts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([word]) => word);
}

function buildInsightSummary({ avgScore, dominantMood, challengingDays, entryCount }) {
  const averageText =
    avgScore >= 4
      ? "overall halka aur zyada positive"
      : avgScore >= 3
      ? "kaafi steady, bas thoda variation ke saath"
      : "emotionally zyada intense aur draining";

  const challengeText =
    challengingDays > 0
      ? `${challengingDays} din low-energy side par gaye.`
      : "Is hafte koi heavy dip nahi dikha.";

  return `${entryCount} logged dinon me aapka mood ${averageText} laga. ${
    dominantMood ? dominantMood.label : "Mixed mood blend"
  } sabse zyada dikha, aur ${challengeText}`;
}

function withOpacity(hex, opacity) {
  const value = hex.replace("#", "");
  const bigint = parseInt(value, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

function truncate(text, maxLength) {
  if (!text) return "";
  return text.length > maxLength ? `${text.slice(0, maxLength - 1)}…` : text;
}
