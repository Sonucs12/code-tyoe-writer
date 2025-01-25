let typingInterval;
let isTyping = false;
let paused = false;
let typewriterContext = null;
let typeSpeed = 100;
let width = 200;
let font = 20;

document
  .getElementById("realTimeSpeed")
  .addEventListener("input", updateTypingSpeed);
document.getElementById("widthControl").addEventListener("input", updateWidth);
document.getElementById("fontControl").addEventListener("input", updateFont);
document.getElementById("startBtn").addEventListener("click", startTyping);
document.getElementById("stopBtn").addEventListener("click", toggleTyping);
document.getElementById("bgColor").addEventListener("input", updateBackground);

// Check if content exists in the input fields initially
function checkContent() {
  const htmlContent = document.getElementById("htmlInput").value.trim();
  const cssContent = document.getElementById("cssInput").value.trim();
  const jsContent = document.getElementById("jsInput").value.trim();
  document.getElementById("startBtn").disabled = !(
    htmlContent ||
    cssContent ||
    jsContent
  );
}

document.getElementById("htmlInput").addEventListener("input", checkContent);
document.getElementById("cssInput").addEventListener("input", checkContent);
document.getElementById("jsInput").addEventListener("input", checkContent);
checkContent();

function typeNextChar() {
  if (!typewriterContext || paused) return;
  const {
    allCode,
    currentBlockIndex,
    currentLineIndex,
    currentCharIndex,
    typewriterElement,
    livePreviewElement,
    styleElement,
    codeSwitchDelay,
  } = typewriterContext;

  const currentBlock = allCode[currentBlockIndex];
  if (!currentBlock) {
    isTyping = false;

    const toggleButton = document.getElementById("stopBtn");
    toggleButton.disabled = true;
    toggleButton.textContent = "Pause";
    return;
  }

  const currentLine = currentBlock.code[currentLineIndex] || "";
  if (currentCharIndex < currentLine.length) {
    const char = currentLine[currentCharIndex];
    if (currentLine.trim() === "(delay)") {
      typewriterContext.currentLineIndex++;
      typewriterContext.currentCharIndex = 0;
      typingInterval = setTimeout(typeNextChar, codeSwitchDelay);
      return;
    }
    if (currentCharIndex === 0) {
      typewriterElement.textContent +=
        "\n" + currentLine.slice(0, currentCharIndex + 1);
    } else {
      typewriterElement.textContent += char;
    }

    // Update live preview
    if (currentBlock.tag === "html") {
      document.querySelector(".currentCode").textContent = "HTML";
      livePreviewElement.innerHTML = typewriterElement.textContent;
      livePreviewElement.scrollTop = livePreviewElement.scrollHeight;
    } else if (currentBlock.tag === "css") {
      document.querySelector(".currentCode").textContent = "CSS";
      styleElement.textContent += char;
      livePreviewElement.innerHTML = document.getElementById("htmlInput").value;
      livePreviewElement.scrollTop = livePreviewElement.scrollHeight;
    } else if (currentBlock.tag === "js") {
      document.querySelector(".currentCode").textContent = "JavaScript";
      livePreviewElement.innerHTML = document.getElementById("htmlInput").value;
      const script = document.createElement("script");
      script.textContent = currentBlock.code.join("\n");
      livePreviewElement.appendChild(script);
      livePreviewElement.scrollTop = livePreviewElement.scrollHeight;
    }

    typewriterElement.scrollTo(0, typewriterElement.scrollHeight);
    typewriterContext.currentCharIndex++;
    typingInterval = setTimeout(typeNextChar, typeSpeed);
  } else {
    typewriterContext.currentCharIndex = 0;
    typewriterContext.currentLineIndex++;
    if (typewriterContext.currentLineIndex >= currentBlock.code.length) {
      typewriterContext.currentBlockIndex++;
      typewriterContext.currentLineIndex = 0;
    }
    typingInterval = setTimeout(typeNextChar, typeSpeed);
  }
  toggleAutomaticHideOnTypingEnd();
}

function startTyping() {
  if (isTyping) return;
  isTyping = true;
  paused = false;
  const htmlCode = document.getElementById("htmlInput").value.split("\n");
  const cssCode = document.getElementById("cssInput").value.split("\n");
  const jsCode = document.getElementById("jsInput").value.split("\n");
  const codeSwitchDelay = parseInt(
    document.getElementById("codeSwitchDelay").value,
    10
  );

  const typewriterElement = document.getElementById("typewriter");
  const livePreviewElement = document.getElementById("livePreview");
  typewriterElement.textContent = "";
  livePreviewElement.innerHTML = "";

  let allCode = [
    { tag: "html", code: htmlCode },
    { tag: "css", code: cssCode },
    { tag: "js", code: jsCode },
  ];

  typewriterContext = {
    allCode,
    currentBlockIndex: 0,
    currentLineIndex: 0,
    currentCharIndex: 0,
    typewriterElement,
    livePreviewElement,
    styleElement: document.createElement("style"),
    codeSwitchDelay,
  };

  document.head.appendChild(typewriterContext.styleElement);
  const toggleButton = document.getElementById("stopBtn");
  toggleButton.disabled = false;
  typeNextChar();
}

function toggleTyping() {
  const toggleButton = document.getElementById("stopBtn");

  if (isTyping) {
    toggleButton.disabled = false;
    if (paused) {
      paused = false;
      toggleButton.textContent = "Pause";
      typeNextChar();
    } else {
      paused = true;
      toggleButton.textContent = "Resume";
      clearTimeout(typingInterval);
    }
  }
}
document.getElementById("stopBtn").disabled = true;

function updateBackground() {
  const color = document.getElementById("bgColor").value;
  document.getElementById("recordingSection").style.backgroundColor = color;
}

function updateTypingSpeed() {
  typeSpeed = parseInt(document.getElementById("realTimeSpeed").value, 10);
  document.getElementById("typingSpeed").value = typeSpeed;
}

function updateWidth() {
  let width = parseInt(document.getElementById("widthControl").value);
  document.getElementById("livePreview").style.width = width + "px";
  document.getElementById("typewriter").style.width = width + "px";
}

function updateFont() {
  let font = document.getElementById("fontControl").value;
  document.getElementById("typewriter").style.fontSize = font + "px";
}

function toggleClass(targetSelector, className, condition = null) {
  const target = document.querySelector(targetSelector);
  if (!target) return;
  if (condition !== null) {
    target.classList.toggle(className, condition);
  } else {
    target.classList.toggle(className);
  }
}

function toggleAutomaticHideOnTypingEnd() {
  if (!typewriterContext) return;
  const checkbox = document.querySelector(".hideTypeWriter");
  if (!checkbox) {
    console.error("Checkbox with class '.hideTypeWriter' not found");
    return;
  }

  if (!checkbox.checked) {
    console.log("Checkbox is unchecked, skipping automatic hide");
    return;
  }
  const { allCode, currentBlockIndex } = typewriterContext;
  const currentBlock = allCode[currentBlockIndex];
  if (!currentBlock && !paused) {
    console.log("Typing ended, running automatic hide");
    setTimeout(() => {
      toggleClass("#recordingSection", "automaticHide", true);
    }, 1000);
    setTimeout(() => {
      toggleClass("#recordingSection", "automaticHide", false);
    }, 5000);
  }
}

document.querySelector(".hideTypeWriter").addEventListener("change", (e) => {
  const isChecked = e.target.checked;
  if (!isChecked) {
    toggleClass("#recordingSection", "automaticHide", false);
  }
});

document.querySelector(".hidetypingbox").addEventListener("change", (e) => {
  toggleClass("#recordingSection", "automaticHide", e.target.checked);
});
document.querySelectorAll(".toggleDashboard").forEach((toggle) => {
  toggle.addEventListener("click", () =>
    toggleClass("body", "hidden-dashboard")
  );
});

document.querySelector(".settingBtn").addEventListener("click", () => {
  toggleClass(".setting-dashboard", "show");
  toggleClass("body", "dashboard-hidden");
});

document.querySelector(".enableWordWrap").addEventListener("change", (e) => {
  toggleClass("#typewriter", "removeWordWrap", e.target.checked);
});

document.querySelector(".addBorder").addEventListener("change", (e) => {
  toggleClass("#livePreview", "adding-border", e.target.checked);
});

function toggleDarkMode() {
  toggleClass("body", "dark-mode");

  const isDarkMode = document.body.classList.contains("dark-mode");
  localStorage.setItem("darkMode", isDarkMode);

  document.querySelectorAll(".darkMode").forEach((toggle) => {
    toggle.checked = isDarkMode;
  });
}

// Load dark mode state
function loadDarkModeState() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  toggleClass("body", "dark-mode", isDarkMode);

  document.querySelectorAll(".darkMode").forEach((toggle) => {
    toggle.checked = isDarkMode;
  });
}

document.querySelectorAll(".darkMode").forEach((toggle) => {
  toggle.addEventListener("change", toggleDarkMode);
});

loadDarkModeState();
