const STORAGE_KEYS = {
  language: "hospaccx-chat-language",
  history: "hospaccx-chat-history",
  open: "hospaccx-chat-open"
};

const WHATSAPP_URL = "https://wa.me/917384251751";
const QUICK_ACTIONS = ["appointment", "emergency", "diagnostics", "whatsapp"];

const COPY = {
  en: {
    launcher: "Chat with Hospaccx Assistant",
    title: "Hospaccx Assistant",
    status: "Multilingual patient guidance",
    chooseLanguage: "Choose your language / भाषा चुनें / ভাষা নির্বাচন করুন",
    languageButtons: {
      en: "English",
      hi: "हिन्दी",
      bn: "বাংলা"
    },
    greeting: "Hello! How can I help you?",
    placeholder: "Type your question...",
    send: "Send",
    typing: "Hospaccx Assistant is typing...",
    quick: {
      appointment: "Book Appointment",
      emergency: "Emergency Help",
      diagnostics: "Diagnostic Services",
      whatsapp: "WhatsApp Chat"
    },
    prompts: {
      appointment: "I want to book an appointment.",
      emergency: "I need emergency help.",
      diagnostics: "Tell me about your diagnostic services.",
      whatsapp: "Continue on WhatsApp"
    },
    whatsappLabel: "Continue on WhatsApp",
    languageChanged: "Language updated. How can I help you?"
  },
  hi: {
    launcher: "Hospaccx Assistant se baat karein",
    title: "Hospaccx Assistant",
    status: "Hindi | Bengali | English support",
    chooseLanguage: "Choose your language / भाषा चुनें / ভাষা নির্বাচন করুন",
    languageButtons: {
      en: "English",
      hi: "हिन्दी",
      bn: "বাংলা"
    },
    greeting: "Namaste! Main kaise madad kar sakta hoon?",
    placeholder: "Apna sawal likhiye...",
    send: "Send",
    typing: "Hospaccx Assistant likh raha hai...",
    quick: {
      appointment: "Book Appointment",
      emergency: "Emergency Help",
      diagnostics: "Diagnostic Services",
      whatsapp: "WhatsApp Chat"
    },
    prompts: {
      appointment: "Mujhe appointment book karna hai.",
      emergency: "Mujhe emergency help chahiye.",
      diagnostics: "Diagnostic services ke bare me batayein.",
      whatsapp: "WhatsApp par continue karna hai."
    },
    whatsappLabel: "Continue on WhatsApp",
    languageChanged: "Language set ho gayi. Ab aap pooch sakte hain."
  },
  bn: {
    launcher: "Hospaccx Assistant-এর সাথে কথা বলুন",
    title: "Hospaccx Assistant",
    status: "বাংলা | हिन्दी | English support",
    chooseLanguage: "Choose your language / भाषा चुनें / ভাষা নির্বাচন করুন",
    languageButtons: {
      en: "English",
      hi: "हिन्दी",
      bn: "বাংলা"
    },
    greeting: "নমস্কার! আমি কিভাবে সাহায্য করতে পারি?",
    placeholder: "আপনার প্রশ্ন লিখুন...",
    send: "Send",
    typing: "Hospaccx Assistant লিখছে...",
    quick: {
      appointment: "Book Appointment",
      emergency: "Emergency Help",
      diagnostics: "Diagnostic Services",
      whatsapp: "WhatsApp Chat"
    },
    prompts: {
      appointment: "আমি অ্যাপয়েন্টমেন্ট বুক করতে চাই।",
      emergency: "আমার জরুরি সাহায্য দরকার।",
      diagnostics: "ডায়াগনস্টিক পরিষেবা সম্পর্কে বলুন।",
      whatsapp: "WhatsApp-এ চালিয়ে যেতে চাই।"
    },
    whatsappLabel: "Continue on WhatsApp",
    languageChanged: "ভাষা সেট হয়েছে। এখন আপনি প্রশ্ন করতে পারেন।"
  }
};

function detectPreferredLanguage() {
  const browserLanguage = (navigator.language || "").toLowerCase();
  if (browserLanguage.startsWith("hi")) {
    return "hi";
  }
  if (browserLanguage.startsWith("bn")) {
    return "bn";
  }
  return "en";
}

function getStoredHistory() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]");
  } catch {
    return [];
  }
}

function setStoredHistory(history) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(history.slice(-20)));
}

function createMessageElement(message) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-widget__message chat-widget__message--${message.role}`;
  const bubble = document.createElement("div");
  bubble.className = "chat-widget__bubble";
  bubble.textContent = message.content;
  wrapper.appendChild(bubble);
  return wrapper;
}

function scrollMessages(container) {
  container.scrollTop = container.scrollHeight;
}

function launchAppointmentFlow() {
  if (window.location.pathname !== "/" && window.location.pathname !== "/index.html") {
    window.location.href = "/#appointment";
    return;
  }
  document.getElementById("appointment")?.scrollIntoView({ behavior: "smooth", block: "start" });
}

function createWidget() {
  const root = document.createElement("div");
  root.className = "chat-widget";
  root.innerHTML = `
    <button type="button" class="chat-widget__launcher" aria-label="Open chat assistant">
      <span class="chat-widget__launcher-icon" aria-hidden="true">AI</span>
      <span class="chat-widget__launcher-text"></span>
    </button>
    <section class="chat-widget__panel" hidden aria-live="polite">
      <header class="chat-widget__header">
        <div>
          <strong class="chat-widget__title"></strong>
          <span class="chat-widget__status"></span>
        </div>
        <button type="button" class="chat-widget__close" aria-label="Close chat">×</button>
      </header>
      <div class="chat-widget__language-selector">
        <p class="chat-widget__language-title"></p>
        <div class="chat-widget__language-actions">
          <button type="button" data-language="en"></button>
          <button type="button" data-language="hi"></button>
          <button type="button" data-language="bn"></button>
        </div>
      </div>
      <div class="chat-widget__quick-actions"></div>
      <div class="chat-widget__messages"></div>
      <div class="chat-widget__typing" hidden></div>
      <form class="chat-widget__form">
        <input type="text" class="chat-widget__input" maxlength="500" autocomplete="off" required>
        <button type="submit" class="chat-widget__send"></button>
      </form>
    </section>
  `;
  document.body.appendChild(root);
  return root;
}

function renderQuickActions(container, copy, onAction) {
  container.innerHTML = QUICK_ACTIONS.map(
    (action) => `<button type="button" class="chat-widget__quick-button" data-action="${action}">${copy.quick[action]}</button>`
  ).join("");

  container.querySelectorAll("[data-action]").forEach((button) => {
    button.addEventListener("click", () => onAction(button.dataset.action));
  });
}

function setLanguageLabels(root, language) {
  const copy = COPY[language];
  root.querySelector(".chat-widget__launcher-text").textContent = copy.launcher;
  root.querySelector(".chat-widget__title").textContent = copy.title;
  root.querySelector(".chat-widget__status").textContent = copy.status;
  root.querySelector(".chat-widget__language-title").textContent = copy.chooseLanguage;
  root.querySelector(".chat-widget__input").placeholder = copy.placeholder;
  root.querySelector(".chat-widget__send").textContent = copy.send;
  root.querySelector(".chat-widget__typing").textContent = copy.typing;
  root.querySelectorAll("[data-language]").forEach((button) => {
    button.textContent = copy.languageButtons[button.dataset.language];
  });
}

async function requestAssistantReply(messages, language) {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ messages, language })
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  return response.json();
}

function initChatWidget() {
  const root = createWidget();
  const panel = root.querySelector(".chat-widget__panel");
  const launcher = root.querySelector(".chat-widget__launcher");
  const closeButton = root.querySelector(".chat-widget__close");
  const languageSelector = root.querySelector(".chat-widget__language-selector");
  const quickActions = root.querySelector(".chat-widget__quick-actions");
  const messagesContainer = root.querySelector(".chat-widget__messages");
  const typingIndicator = root.querySelector(".chat-widget__typing");
  const form = root.querySelector(".chat-widget__form");
  const input = root.querySelector(".chat-widget__input");

  let currentLanguage = localStorage.getItem(STORAGE_KEYS.language) || detectPreferredLanguage();
  let history = getStoredHistory();

  function syncLanguageUI() {
    setLanguageLabels(root, currentLanguage);
    root.querySelectorAll("[data-language]").forEach((button) => {
      button.classList.toggle("is-active", button.dataset.language === currentLanguage);
    });
    renderQuickActions(quickActions, COPY[currentLanguage], handleQuickAction);
    languageSelector.hidden = history.length > 0;
  }

  function renderHistory() {
    messagesContainer.innerHTML = "";
    history.forEach((message) => {
      messagesContainer.appendChild(createMessageElement(message));
    });
    scrollMessages(messagesContainer);
  }

  function pushMessage(message) {
    history.push(message);
    setStoredHistory(history);
    messagesContainer.appendChild(createMessageElement(message));
    scrollMessages(messagesContainer);
  }

  async function sendMessage(content) {
    const trimmed = content.trim();
    if (!trimmed) {
      return;
    }

    pushMessage({ role: "user", content: trimmed });
    input.value = "";
    typingIndicator.hidden = false;
    scrollMessages(messagesContainer);

    try {
      const result = await requestAssistantReply(history, currentLanguage);
      pushMessage({ role: "assistant", content: result.reply });
    } catch (error) {
      console.error("Chat widget error:", error);
      const fallback =
        currentLanguage === "hi"
          ? "Abhi thodi der me phir se try kijiye. Zarurat ho to WhatsApp ya phone se clinic se connect kariye."
          : currentLanguage === "bn"
            ? "অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন। প্রয়োজনে WhatsApp বা ফোনে ক্লিনিকের সাথে যোগাযোগ করুন।"
            : "Please try again shortly. If needed, continue on WhatsApp or call the clinic directly.";
      pushMessage({ role: "assistant", content: fallback });
    } finally {
      typingIndicator.hidden = true;
    }
  }

  function handleQuickAction(action) {
    if (action === "appointment") {
      launchAppointmentFlow();
      sendMessage(COPY[currentLanguage].prompts.appointment);
      return;
    }
    if (action === "emergency") {
      sendMessage(COPY[currentLanguage].prompts.emergency);
      return;
    }
    if (action === "diagnostics") {
      sendMessage(COPY[currentLanguage].prompts.diagnostics);
      return;
    }
    if (action === "whatsapp") {
      window.open(WHATSAPP_URL, "_blank", "noopener,noreferrer");
    }
  }

  function ensureGreeting() {
    if (history.length > 0) {
      return;
    }
    const copy = COPY[currentLanguage];
    history = [{ role: "assistant", content: copy.greeting }];
    setStoredHistory(history);
    renderHistory();
  }

  function setLanguage(language) {
    currentLanguage = language;
    localStorage.setItem(STORAGE_KEYS.language, currentLanguage);
    if (history.length <= 1) {
      history = [{ role: "assistant", content: COPY[currentLanguage].greeting }];
      setStoredHistory(history);
      renderHistory();
    } else {
      pushMessage({ role: "assistant", content: COPY[currentLanguage].languageChanged });
    }
    syncLanguageUI();
  }

  launcher.addEventListener("click", () => {
    const nextState = panel.hidden;
    panel.hidden = !nextState ? true : false;
    localStorage.setItem(STORAGE_KEYS.open, String(nextState));
    if (nextState) {
      ensureGreeting();
      syncLanguageUI();
      input.focus();
    }
  });

  closeButton.addEventListener("click", () => {
    panel.hidden = true;
    localStorage.setItem(STORAGE_KEYS.open, "false");
  });

  root.querySelectorAll("[data-language]").forEach((button) => {
    button.addEventListener("click", () => {
      setLanguage(button.dataset.language);
    });
  });

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    sendMessage(input.value);
  });

  syncLanguageUI();
  renderHistory();

  if (localStorage.getItem(STORAGE_KEYS.open) === "true") {
    panel.hidden = false;
    ensureGreeting();
  }
}

initChatWidget();
