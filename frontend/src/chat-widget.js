const STORAGE_KEYS = {
  language: "hospaccx-chat-language",
  history: "hospaccx-chat-history"
};

const WHATSAPP_URL = "https://wa.me/917384251751";
const QUICK_ACTIONS = ["appointment", "emergency", "diagnostics", "whatsapp"];
const MAX_HISTORY = 15;

const COPY = {
  en: {
    title: "Hospaccx Assistant",
    status: "Multilingual patient guidance",
    tooltip: "Chat with us",
    chooseLanguage:
      "Choose your language / \u092d\u093e\u0937\u093e \u091a\u0941\u0928\u0947\u0902 / \u09ad\u09be\u09b7\u09be \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u0995\u09b0\u09c1\u09a8",
    languageButtons: {
      en: "English",
      hi: "\u0939\u093f\u0928\u094d\u0926\u0940",
      bn: "\u09ac\u09be\u0982\u09b2\u09be"
    },
    greeting: "Hello! How can I help you today?",
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
    languageChanged: "Language updated. How can I help you now?",
    fallback:
      "Please try again in a moment. If needed, continue on WhatsApp or call the clinic directly."
  },
  hi: {
    title: "Hospaccx Assistant",
    status: "Hindi | Bengali | English support",
    tooltip: "Chat with us",
    chooseLanguage:
      "Choose your language / \u092d\u093e\u0937\u093e \u091a\u0941\u0928\u0947\u0902 / \u09ad\u09be\u09b7\u09be \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u0995\u09b0\u09c1\u09a8",
    languageButtons: {
      en: "English",
      hi: "\u0939\u093f\u0928\u094d\u0926\u0940",
      bn: "\u09ac\u09be\u0982\u09b2\u09be"
    },
    greeting: "Namaste! Main aaj aapki kaise madad kar sakta hoon?",
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
    languageChanged: "Language set ho gayi. Ab aap apna sawal pooch sakte hain.",
    fallback:
      "Abhi thodi der me phir se try kijiye. Zarurat ho to WhatsApp ya phone se clinic se connect kariye."
  },
  bn: {
    title: "Hospaccx Assistant",
    status: "\u09ac\u09be\u0982\u09b2\u09be | \u0939\u093f\u0928\u094d\u0926\u0940 | English support",
    tooltip: "Chat with us",
    chooseLanguage:
      "Choose your language / \u092d\u093e\u0937\u093e \u091a\u0941\u0928\u0947\u0902 / \u09ad\u09be\u09b7\u09be \u09a8\u09bf\u09b0\u09cd\u09ac\u09be\u099a\u09a8 \u0995\u09b0\u09c1\u09a8",
    languageButtons: {
      en: "English",
      hi: "\u0939\u093f\u0928\u094d\u0926\u0940",
      bn: "\u09ac\u09be\u0982\u09b2\u09be"
    },
    greeting:
      "\u09a8\u09ae\u09b8\u09cd\u0995\u09be\u09b0! \u0986\u09ae\u09bf \u0986\u099c \u0986\u09aa\u09a8\u09be\u0995\u09c7 \u0995\u09bf\u09ad\u09be\u09ac\u09c7 \u09b8\u09be\u09b9\u09be\u09af\u09cd\u09af \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09bf?",
    placeholder:
      "\u0986\u09aa\u09a8\u09be\u09b0 \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u09b2\u09bf\u0996\u09c1\u09a8...",
    send: "Send",
    typing:
      "Hospaccx Assistant \u09b2\u09bf\u0996\u099b\u09c7...",
    quick: {
      appointment: "Book Appointment",
      emergency: "Emergency Help",
      diagnostics: "Diagnostic Services",
      whatsapp: "WhatsApp Chat"
    },
    prompts: {
      appointment:
        "\u0986\u09ae\u09bf \u0985\u09cd\u09af\u09be\u09aa\u09af\u09bc\u09c7\u09a8\u09cd\u099f\u09ae\u09c7\u09a8\u09cd\u099f \u09ac\u09c1\u0995 \u0995\u09b0\u09a4\u09c7 \u099a\u09be\u0987\u0964",
      emergency:
        "\u0986\u09ae\u09be\u09b0 \u099c\u09b0\u09c1\u09b0\u09bf \u09b8\u09be\u09b9\u09be\u09af\u09cd\u09af \u09a6\u09b0\u0995\u09be\u09b0\u0964",
      diagnostics:
        "\u09a1\u09be\u09af\u09bc\u09be\u0997\u09a8\u09b8\u09cd\u099f\u09bf\u0995 \u09aa\u09b0\u09bf\u09b7\u09c7\u09ac\u09be \u09b8\u09ae\u09cd\u09aa\u09b0\u09cd\u0995\u09c7 \u09ac\u09b2\u09c1\u09a8\u0964",
      whatsapp:
        "WhatsApp-\u098f \u099a\u09be\u09b2\u09bf\u09af\u09bc\u09c7 \u09af\u09c7\u09a4\u09c7 \u099a\u09be\u0987\u0964"
    },
    languageChanged:
      "\u09ad\u09be\u09b7\u09be \u09b8\u09c7\u099f \u09b9\u09af\u09bc\u09c7\u099b\u09c7\u0964 \u098f\u0996\u09a8 \u0986\u09aa\u09a8\u09bf \u0986\u09aa\u09a8\u09be\u09b0 \u09aa\u09cd\u09b0\u09b6\u09cd\u09a8 \u0995\u09b0\u09a4\u09c7 \u09aa\u09be\u09b0\u09c7\u09a8\u0964",
    fallback:
      "\u0985\u09a8\u09c1\u0997\u09cd\u09b0\u09b9 \u0995\u09b0\u09c7 \u098f\u0995\u099f\u09c1 \u09aa\u09b0\u09c7 \u0986\u09ac\u09be\u09b0 \u099a\u09c7\u09b7\u09cd\u099f\u09be \u0995\u09b0\u09c1\u09a8\u0964 \u09aa\u09cd\u09b0\u09af\u09bc\u09cb\u099c\u09a8\u09c7 WhatsApp \u09ac\u09be \u09ab\u09cb\u09a8\u09c7 \u0995\u09cd\u09b2\u09bf\u09a8\u09bf\u0995\u09c7\u09b0 \u09b8\u09be\u09a5\u09c7 \u09af\u09cb\u0997\u09be\u09af\u09cb\u0997 \u0995\u09b0\u09c1\u09a8\u0964"
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

function normalizeHistory(history) {
  return history
    .filter((message) => message && typeof message.content === "string" && message.content.trim())
    .slice(-MAX_HISTORY);
}

function getStoredHistory() {
  try {
    return normalizeHistory(JSON.parse(localStorage.getItem(STORAGE_KEYS.history) || "[]"));
  } catch {
    return [];
  }
}

function setStoredHistory(history) {
  localStorage.setItem(STORAGE_KEYS.history, JSON.stringify(normalizeHistory(history)));
}

function createMessageElement(message) {
  const wrapper = document.createElement("div");
  wrapper.className = `chat-widget__message chat-widget__message--${message.role}`;
  wrapper.dataset.messageRole = message.role;
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
    <button type="button" class="chat-widget__launcher" aria-label="Chat with us" title="Chat with us">
      <span class="chat-widget__launcher-icon" aria-hidden="true">
        <svg viewBox="0 0 24 24" class="chat-widget__launcher-svg" focusable="false" aria-hidden="true">
          <path d="M12 3C6.477 3 2 7.03 2 12c0 2.095.814 4.02 2.18 5.55L3 21l4.051-1.06A10.82 10.82 0 0 0 12 21c5.523 0 10-4.03 10-9s-4.477-9-10-9Zm-4.5 8.5h9a1 1 0 1 1 0 2h-9a1 1 0 1 1 0-2Zm0-4h9a1 1 0 1 1 0 2h-9a1 1 0 1 1 0-2Z"></path>
        </svg>
      </span>
      <span class="chat-widget__tooltip">Chat with us</span>
    </button>
    <section class="chat-widget__panel" hidden aria-live="polite">
      <header class="chat-widget__header">
        <div class="chat-widget__header-copy">
          <strong class="chat-widget__title"></strong>
          <span class="chat-widget__status"></span>
        </div>
        <div class="chat-widget__header-actions">
          <button type="button" class="chat-widget__minimize" aria-label="Minimize chat">&#8722;</button>
          <button type="button" class="chat-widget__close" aria-label="Close chat">&times;</button>
        </div>
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
        <textarea class="chat-widget__input" rows="1" maxlength="500" required></textarea>
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
  const title = root.querySelector(".chat-widget__title");
  const status = root.querySelector(".chat-widget__status");
  const tooltip = root.querySelector(".chat-widget__tooltip");
  const languageTitle = root.querySelector(".chat-widget__language-title");
  const input = root.querySelector(".chat-widget__input");
  const send = root.querySelector(".chat-widget__send");
  const typing = root.querySelector(".chat-widget__typing");

  title.textContent = copy.title;
  status.textContent = copy.status;
  tooltip.textContent = copy.tooltip;
  languageTitle.textContent = copy.chooseLanguage;
  input.placeholder = copy.placeholder;
  send.textContent = copy.send;
  typing.textContent = copy.typing;

  root.querySelectorAll("[data-language]").forEach((button) => {
    button.textContent = copy.languageButtons[button.dataset.language];
  });
}

async function requestAssistantReply(messages, language) {
  const response = await fetch("/api/chat", {
    method: "POST",
    cache: "no-store",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      messages: normalizeHistory(messages),
      language,
      requestedAt: Date.now()
    })
  });

  if (!response.ok) {
    throw new Error(`Chat request failed: ${response.status}`);
  }

  const result = await response.json();
  if (!result || typeof result.reply !== "string" || !result.reply.trim()) {
    throw new Error("Invalid chat response");
  }
  return result;
}

function initChatWidget() {
  const root = createWidget();
  const panel = root.querySelector(".chat-widget__panel");
  const launcher = root.querySelector(".chat-widget__launcher");
  const closeButton = root.querySelector(".chat-widget__close");
  const minimizeButton = root.querySelector(".chat-widget__minimize");
  const languageSelector = root.querySelector(".chat-widget__language-selector");
  const quickActions = root.querySelector(".chat-widget__quick-actions");
  const messagesContainer = root.querySelector(".chat-widget__messages");
  const typingIndicator = root.querySelector(".chat-widget__typing");
  const form = root.querySelector(".chat-widget__form");
  const input = root.querySelector(".chat-widget__input");

  let currentLanguage = localStorage.getItem(STORAGE_KEYS.language) || detectPreferredLanguage();
  let history = getStoredHistory();
  let isOpen = false;
  let closeTimer = null;
  let isSending = false;

  function setOpenState(nextOpen) {
    if (nextOpen === isOpen) {
      return;
    }

    if (closeTimer) {
      clearTimeout(closeTimer);
      closeTimer = null;
    }

    isOpen = nextOpen;
    root.classList.toggle("is-open", nextOpen);

    if (nextOpen) {
      panel.hidden = false;
      ensureGreeting();
      syncLanguageUI();
      requestAnimationFrame(() => {
        input.focus();
        scrollMessages(messagesContainer);
      });
      return;
    }

    panel.classList.add("is-closing");
    closeTimer = window.setTimeout(() => {
      panel.hidden = true;
      panel.classList.remove("is-closing");
    }, 220);
  }

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

  function appendMessage(message) {
    messagesContainer.appendChild(createMessageElement(message));
    scrollMessages(messagesContainer);
  }

  function pushMessage(message) {
    history = normalizeHistory([...history, message]);
    setStoredHistory(history);
    appendMessage(message);
  }

  async function sendMessage(content) {
    const trimmed = content.trim();
    if (!trimmed || isSending) {
      return;
    }

    const lastMessage = history[history.length - 1];
    if (lastMessage?.role === "user" && lastMessage.content === trimmed) {
      return;
    }

    isSending = true;
    pushMessage({ role: "user", content: trimmed });
    input.value = "";
    input.style.height = "";
    typingIndicator.hidden = false;
    scrollMessages(messagesContainer);

    try {
      const result = await requestAssistantReply(history, currentLanguage);
      const previousAssistant = history[history.length - 1];
      if (previousAssistant?.role !== "assistant" || previousAssistant.content !== result.reply) {
        pushMessage({ role: "assistant", content: result.reply });
      }
    } catch (error) {
      console.error("Chat widget error:", error);
      const fallback = COPY[currentLanguage].fallback;
      const previousAssistant = history[history.length - 1];
      if (previousAssistant?.role !== "assistant" || previousAssistant.content !== fallback) {
        pushMessage({ role: "assistant", content: fallback });
      }
    } finally {
      typingIndicator.hidden = true;
      isSending = false;
      input.focus();
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
    history = [{ role: "assistant", content: COPY[currentLanguage].greeting }];
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
    setOpenState(true);
  });

  closeButton.addEventListener("click", () => {
    setOpenState(false);
  });

  minimizeButton.addEventListener("click", () => {
    setOpenState(false);
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

  input.addEventListener("input", () => {
    input.style.height = "auto";
    input.style.height = `${Math.min(input.scrollHeight, 120)}px`;
  });

  input.addEventListener("keydown", (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage(input.value);
    }
  });

  syncLanguageUI();
  renderHistory();
  panel.hidden = true;
  root.classList.remove("is-open");
}

initChatWidget();
