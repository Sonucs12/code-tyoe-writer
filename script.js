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

    typewriterElement.scrollTo(
      0,
      typewriterElement.scrollHeight
    );

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
  typeNextChar();
}

function toggleTyping() {
  const toggleButton = document.getElementById("stopBtn");
  if (isTyping) {
    if (paused) {
      paused = false;
      toggleButton.textContent = "Pause";
      typeNextChar();
    } else {
      paused = true;
      toggleButton.textContent = "Resume";
      clearTimeout(typingInterval);
    }
  } else {
    startTyping();
    toggleButton.textContent = "Pause";
  }
}


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

function toggleDashboard() {
  document.body.classList.toggle("hidden-dashboard");
}



document.querySelectorAll(".toggleDashboard").forEach(function (toggle) {
  toggle.addEventListener("click", toggleDashboard);
});
function toggleDarkMode() {
    document.body.classList.toggle("dark-mode");
  
    const isDarkMode = document.body.classList.contains("dark-mode");
    localStorage.setItem("darkMode", isDarkMode);
  
    const darkModeToggles = document.querySelectorAll(".darkMode");
    darkModeToggles.forEach((toggle) => {
      toggle.checked = isDarkMode;
    });
  }
  
  function loadDarkModeState() {
    const isDarkMode = localStorage.getItem("darkMode") === "true";
  
    if (isDarkMode) {
      document.body.classList.add("dark-mode");
    } else {
      document.body.classList.remove("dark-mode");
    }
  
    const darkModeToggles = document.querySelectorAll(".darkMode");
    darkModeToggles.forEach((toggle) => {
      toggle.checked = isDarkMode;
    });
  }
  

  document.querySelectorAll(".darkMode").forEach((toggle) => {
    toggle.addEventListener("change", toggleDarkMode);
  });
  
  
  loadDarkModeState();


  document.querySelector(".settingBtn").addEventListener("click", () => {
    const settingDashboard = document.querySelector(".setting-dashboard");
    settingDashboard.classList.toggle("show");
  document.body.classList.toggle("dashboard-hidden");
  });
  
  document.querySelector(".enableWordWrap").addEventListener("change", (e) => {
    const typewriter = document.getElementById("typewriter");
    typewriter.classList.toggle("addWordWrap");
  });
  