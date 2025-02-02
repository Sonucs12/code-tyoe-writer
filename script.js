let typingInterval;
let isTyping = false;
let paused = false;
let typewriterContext = null;
let typeSpeed = 100;
let width = 35;
let font = 20;

let cursorElement;
function refreshPrism() {
  Prism.highlightAll();
  setTimeout(() => Prism.highlightAll(), 100); // Double refresh
}
const editor = document.getElementById("typewriter");

showAlert("Welcome to CodePen Clone", "success");
document
  .getElementById("realTimeSpeed")
  .addEventListener("input", updateTypingSpeed);
document.getElementById("widthControl").addEventListener("input", updateWidth);
document.getElementById("fontControl").addEventListener("input", updateFont);
document.body.addEventListener("click", function (event) {
  if (event.target.classList.contains("startBtn")) {
    startTyping();
  } else if (event.target.classList.contains("stopBtn")) {
    toggleTyping();
  }
});
document.getElementById("bgColor").addEventListener("input", updateBackground);
function checkContent() {
  const htmlContent = document.getElementById("htmlInput").value.trim();
  const cssContent = document.getElementById("cssInput").value.trim();
  const jsContent = document.getElementById("jsInput").value.trim();
  document.querySelectorAll(".startBtn").forEach((button) => {
    button.disabled = !(htmlContent || cssContent || jsContent);
  });
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
    document.querySelectorAll(".stopBtn").forEach((button) => {
      button.disabled = true;
      button.textContent = "Pause";
    });
    return;
  }
  if (
    currentLineIndex === 0 &&
    currentCharIndex === 0 &&
    currentBlockIndex > 0
  ) {
    const previousBlock = allCode[currentBlockIndex - 1];
    if (previousBlock.code.length > 0) {
      typewriterElement.innerHTML += `\n\n/* Starting ${currentBlock.tag.toUpperCase()} Code */`;
      Prism.highlightElement(typewriterElement);
    }
  }
  const currentLine = currentBlock.code[currentLineIndex] || "";
  if (currentCharIndex < currentLine.length) {
    const char = currentLine[currentCharIndex];

    if (currentLine.includes("(PAUSE_HERE)")) {
      console.log("Pause triggered");
      typewriterContext.currentLineIndex++;
      typewriterContext.currentCharIndex = 0;
      setTimeout(typeNextChar, codeSwitchDelay);
      return;
    }
    if (currentCharIndex === 0) {
      typewriterElement.textContent +=
        "\n" + currentLine.slice(0, currentCharIndex + 1);
    } else {
      typewriterElement.textContent += char;
      Prism.highlightElement(typewriterElement);
    }

    if (
      currentBlock.tag === "html" ||
      currentBlock.tag === "css" ||
      currentBlock.tag === "js"
    ) {
      const removeWordWrapClass =
        typewriterElement.classList.contains("removeWordWrap");
      typewriterElement.className = `language-${currentBlock.tag}`;
      if (removeWordWrapClass) {
        typewriterElement.classList.add("removeWordWrap");
      }
      Prism.highlightElement(typewriterElement);
    }
    const iframeDoc =
      livePreviewElement.contentDocument ||
      livePreviewElement.contentWindow.document;
    if (currentBlock.tag === "html") {
      document.querySelector(".currentCode").textContent = "HTML";
      iframeDoc.body.innerHTML = typewriterElement.textContent;
    } else if (currentBlock.tag === "css") {
      document.querySelector(".currentCode").textContent = "CSS";
      styleElement.textContent += char;
      iframeDoc.head.appendChild(styleElement);
    } else if (currentBlock.tag === "js") {
      document.querySelector(".currentCode").textContent = "JavaScript";
      if (
        currentLineIndex === currentBlock.code.length - 1 &&
        currentCharIndex === currentLine.length - 1
      ) {
        const htmlContent = document.getElementById("htmlInput").value;
        iframeDoc.body.innerHTML = htmlContent;

        const existingScripts = iframeDoc.querySelectorAll("script");
        existingScripts.forEach((script) => script.remove());

        try {
          const script = document.createElement("script");
          script.type = "text/javascript";

          script.textContent = `(function() {
              ${currentBlock.code.join("\n")}
          })();`;

          iframeDoc.body.appendChild(script);

          iframeDoc.defaultView.onerror = (
            message,
            source,
            lineno,
            colno,
            error
          ) => {
            const errorMessage = `JavaScript Error: ${message} at line ${lineno}, column ${colno}\nSource: ${source}`;

            parent.showAlert(errorMessage, "danger");
            return true;
          };
        } catch (error) {
          parent.showAlert("JavaScript Error: " + error.message, "danger");
        }
      }
    }
    typewriterElement.scrollTo(0, typewriterElement.scrollHeight);
    livePreviewElement.scrollTop = livePreviewElement.scrollHeight;
    typewriterContext.currentCharIndex++;
    typingInterval = setTimeout(typeNextChar, typeSpeed);
  } else {
    typewriterContext.currentCharIndex = 0;
    typewriterContext.currentLineIndex++;
    if (typewriterContext.currentLineIndex >= currentBlock.code.length) {
      typewriterContext.currentBlockIndex++;
      typewriterContext.currentLineIndex = 0;
    }
    Prism.highlightElement(typewriterElement);
    typingInterval = requestAnimationFrame(typeNextChar, typeSpeed);
  }
  toggleAutomaticHideOnTypingEnd();
}
function startTyping() {
  if (isTyping) return;
  isTyping = true;
  paused = false;
  const typewrite = document.querySelector("#typewriter");
  const typewriter = document.getElementById("typewriter");
  typewriter.classList.add("typing");
  typewriter.textContent = "";
  document.querySelector("#editeditor").style.color = "white";
  typewrite.contentEditable = false;
  const htmlCode = document.getElementById("htmlInput").value.split("\n");
  const cssCode = document.getElementById("cssInput").value.split("\n");
  const jsCode = document.getElementById("jsInput").value.split("\n");
  const codeSwitchDelay = parseInt(
    document.getElementById("codeSwitchDelay").value,
    10
  );
  // Check if the delay is a valid number
  if (isNaN(codeSwitchDelay) || codeSwitchDelay < 0) {
    console.error("Invalid delay value");
    return;
  }
  Prism.highlightAll(htmlCode);
  Prism.highlightAll(cssCode);
  Prism.highlightAll(jsCode);
  const typewriterElement = document.getElementById("typewriter");
  const livePreviewElement = document.getElementById("livePreview");
  typewriterElement.textContent = "";
  const iframeDoc =
    livePreviewElement.contentDocument ||
    livePreviewElement.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(
    ` <!DOCTYPE html> <html> <head> <meta name="viewport" content="width=device-width, initial-scale=1"> <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer"/> <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css"><style>body{padding:20px 20px 20px 20px;} body::-webkit-scrollbar{display: none;}<style> </head> <body></body> </html> `
  );
  iframeDoc.close();
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
    styleElement: iframeDoc.createElement("style"),
    codeSwitchDelay,
    htmlContent: "",
    cssContent: "",
    jsContent: "",
  };
  iframeDoc.head.appendChild(typewriterContext.styleElement);
  document.querySelectorAll(".stopBtn").forEach((button) => {
    button.disabled = false;
  });
  typeNextChar();
}
document.getElementById("refreshButton").addEventListener("click", refreshIframe);

function refreshIframe() {
  const iframe = document.getElementById("livePreview"); 
  const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
  const savedContent = iframeDoc.body.innerHTML;
  const savedStyles = iframeDoc.head.innerHTML;
  iframe.contentWindow.location.reload();
  iframe.onload = () => {
    console.log("refresh ifrsme")
    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
    iframeDoc.open();
    iframeDoc.write(`
      <!DOCTYPE html>
      <html>
      <head>
        ${savedStyles}
      </head>
      <body>
        ${savedContent}
      </body>
      </html>
    `);
    iframeDoc.close();
  };
}

document.addEventListener("keydown", (event) => {
  const recordingSection = document.querySelector("#recordingSection");
  if (event.code === "Space" && recordingSection.classList.contains("fullscreen")) {
    event.preventDefault();
    toggleTyping();
  }
});
document.querySelectorAll(".toggleDashboard").forEach((toggle) => {
  toggle.addEventListener("click", () =>
    toggleClass("body", "hidden-dashboard")
  );
});
document.querySelector("#expand-dashboard").addEventListener("click", () => {
  toggleClass("body", "ex-dashboard");
  const icon = document.querySelector("#expand-dashboard i");
  icon.className = document.body.classList.contains("ex-dashboard")
    ? "bi bi-arrow-left-circle-fill float-end"
    : "bi bi-arrow-right-circle-fill float-end";
});

function toggleTyping() {
  const toggleButton = document.getElementById("stopBtn");
  const toggleBtn = document.getElementById("rstopbtn");
  const typewriter = document.getElementById("typewriter");
  if (isTyping) {
    toggleButton.disabled = false;
    toggleBtn.disabled = false;

    if (paused) {
      paused = false;
      const typewrite = document.querySelector("#typewriter");
      toggleButton.textContent = "Stop Writing ";
      typewrite.contentEditable = false;
      document.querySelector("#editeditor").style.color = "white";
      toggleBtn.innerHTML = `<i class="bi bi-pause-circle-fill"></i> stop`;
      typewriter.classList.add("typing");
      typeNextChar();
    } else {
      paused = true;
      toggleButton.textContent = "Resume";
      toggleBtn.innerHTML = `<i class="bi bi-resume-circle-fill"></i> resume`;
      clearTimeout(typingInterval);
    }
  }
}

document.querySelectorAll(".stopBtn").forEach((button) => {
  button.disabled = true;
});

function updateBackground() {
  document.getElementById("recordingSection").style.backgroundColor =
    document.getElementById("bgColor").value;
}

function updateTypingSpeed() {
  typeSpeed = parseInt(document.getElementById("realTimeSpeed").value, 10);
  document.getElementById("typingSpeedValue").textContent = typeSpeed + "ms";
}

function updateWidth() {
  const width = `${parseInt(document.getElementById("widthControl").value)}%`;
  document.getElementById("livePreview").style.width = width;
  document.querySelector(".iphone").style.width = width;
  document.getElementById("widthValue").textContent = width;
}

function updateFont() {
  let font = document.getElementById("fontControl").value;
  document.getElementById("typewriter").style.fontSize = font + "px";
  document.getElementById("fontValue").textContent = font + "px";
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
    return;
  }
  const { allCode, currentBlockIndex } = typewriterContext;
  const currentBlock = allCode[currentBlockIndex];
  if (!currentBlock && !paused) {
    console.log("Typing ended, running automatic hide");
    setTimeout(() => {
      toggleClass("#recordingSection", "automaticHide", true);
    }, 2000);
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

document.querySelector(".settingBtn").addEventListener("click", (e) => {
  const button = e.currentTarget;
  button.style.backgroundColor =
    button.style.backgroundColor === "red" ? "" : "red";
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
  document.getElementById("prismTheme").disabled = isDarkMode;
  document.getElementById("prismDarkTheme").disabled = !isDarkMode;
  document
    .querySelectorAll(".darkMode")
    .forEach((toggle) => (toggle.checked = isDarkMode));
}

function loadDarkModeState() {
  const isDarkMode = localStorage.getItem("darkMode") === "true";
  toggleClass("body", "dark-mode", isDarkMode);
  document.getElementById("prismTheme").disabled = isDarkMode;
  document.getElementById("prismDarkTheme").disabled = !isDarkMode;
  document
    .querySelectorAll(".darkMode")
    .forEach((toggle) => (toggle.checked = isDarkMode));
}

document
  .querySelectorAll(".darkMode")
  .forEach((toggle) => toggle.addEventListener("change", toggleDarkMode));
loadDarkModeState();

document.querySelector("#editeditor").addEventListener("click", (e) => {
  const typewriter = document.querySelector("#typewriter");
  if (typewriter.contentEditable === "false") {
    typewriter.contentEditable = "true";
    e.target.style.color = "red";
    paused = true;
  } else {
    typewriter.contentEditable = "false";
    e.target.style.color = "";
    paused = false;
  }
});

function clickonEdit() {
  paused = true;
  const toggleButton = document.getElementById("stopBtn");
  const toggleBtn = document.getElementById("rstopbtn");
  toggleButton.textContent = "Resume";
  toggleBtn.innerHTML = `<i class="bi bi-resume-circle-fill"></i> resume`;
  clearTimeout(typingInterval);
}

function showAlert(message, type) {
  const alertContainer = document.createElement("div");
  alertContainer.className = `alert alert-${type} alert-dismissible fade show alert-container`;
  alertContainer.role = "alert";
  alertContainer.innerHTML = `<span>${message}</span>`;
  document.body.appendChild(alertContainer);
  alertContainer.style.transform = "translateX(-50%) scale(0)";
  setTimeout(() => {
    alertContainer.style.transition = "transform 0.3s ease-in-out";
    alertContainer.style.transform = "translateX(-50%) scale(1)";
  }, 10);
  setTimeout(() => {
    alertContainer.style.transform = "translateX(-50%) scale(0)";
    setTimeout(() => alertContainer.remove(), 300);
  }, 4000);
}

function copyCode() {
  navigator.clipboard
    .writeText(document.getElementById("typewriter").textContent)
    .then(
      () => showAlert("Code copied to clipboard", "success"),
      () => showAlert("Failed to copy code", "danger")
    );
}
function copyPause() {
  navigator.clipboard.writeText("(PAUSE_HERE)").then(
    () => showAlert("PAUSE_HERE copied to clipboard", "success"),
    () => showAlert("Failed to copy PAUSE_HERE", "danger")
  );
}
document.addEventListener("dblclick", function () {
  let dashboardHidden = document.querySelector(".hidden-dashboard");
  let recordingSection = document.querySelector("#recordingSection");
  if (dashboardHidden) {
    document.body.classList.toggle("noselect");
    recordingSection.classList.toggle("fullscreen");
  }
});
