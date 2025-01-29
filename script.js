let typingInterval;
let isTyping = false;
let paused = false;
let typewriterContext = null;
let typeSpeed = 100;
let width = 200;
let font = 20;
showAlert("Welcome to CodePen Clone", "success");

document
  .getElementById("realTimeSpeed")
  .addEventListener("input", updateTypingSpeed);
document.getElementById("widthControl").addEventListener("input", updateWidth);
document.getElementById("fontControl").addEventListener("input", updateFont);
document.querySelectorAll(".startBtn").forEach((button) => {
  button.addEventListener("click", startTyping);
});
document.querySelectorAll(".stopBtn").forEach((button) => {
  button.addEventListener("click", toggleTyping);
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

    const iframeDoc =
      livePreviewElement.contentDocument ||
      livePreviewElement.contentWindow.document;

    if (
      currentBlock.tag === "html" ||
      currentBlock.tag === "css" ||
      currentBlock.tag === "js"
    ) {
      typewriterElement.className = `language-${currentBlock.tag}`;
      Prism.highlightElement(typewriterElement);
    }

    if (currentBlock.tag === "html") {
      document.querySelector(".currentCode").textContent = "HTML";
      iframeDoc.body.innerHTML = typewriterElement.textContent;
    } else if (currentBlock.tag === "css") {
      document.querySelector(".currentCode").textContent = "CSS";
      styleElement.textContent += char;
      iframeDoc.head.appendChild(styleElement);
    }else if (currentBlock.tag === "js") {
      document.querySelector(".currentCode").textContent = "JavaScript";
      iframeDoc.body.innerHTML = document.getElementById("htmlInput").value;
    
      try {
        const script = document.createElement("script");
        script.textContent = currentBlock.code.join("\n");
        iframeDoc.body.appendChild(script);
    
        
        iframeDoc.defaultView.onerror = (message, source, lineno, colno, error) => {
          const errorMessage = `JavaScript Error: ${message} at line ${lineno}, column ${colno}\nSource: ${source}`;
          console.error(errorMessage);
          showAlert(errorMessage, "danger");
          
          
          return true; 
        };
    
      } catch (error) {
        console.error("Error in JS code:", error);
        showAlert(`JavaScript Error: ${error.message}`, "danger");
        
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
    typingInterval = setTimeout(typeNextChar, typeSpeed);
  }
  toggleAutomaticHideOnTypingEnd();
}

function startTyping() {
  if (isTyping) return;
  isTyping = true;
  paused = false;
  const typewrite = document.querySelector("#typewriter");
  document.querySelector("#editeditor").style.color = "white";
  typewrite.contentEditable = false;

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

  const iframeDoc =
    livePreviewElement.contentDocument ||
    livePreviewElement.contentWindow.document;
  iframeDoc.open();
  iframeDoc.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <meta name="viewport" content="width=device-width, initial-scale=1">
          <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossorigin="anonymous" referrerpolicy="no-referrer"/>
          <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bootstrap-icons@1.11.3/font/bootstrap-icons.min.css">
        </head>
        <body></body>
      </html>
    `);
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

function toggleTyping() {
  const toggleButton = document.getElementById("stopBtn");
  const toggleBtn = document.getElementById("rstopbtn");

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
  document.querySelector(".iphone").style.width = width + "px";
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

document.querySelector(".settingBtn").addEventListener("click", (e) => {
  const button = e.currentTarget;

  if (button.style.backgroundColor === "red") {
    button.style.backgroundColor = "";
  } else {
    button.style.backgroundColor = "red";
  }
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

document.querySelector("#editeditor").addEventListener("click", (e) => {
  const typewriter = document.querySelector("#typewriter");

  if (typewriter.contentEditable === "false") {
    typewriter.contentEditable = "true"; // Make typewriter editable
    e.target.style.color = "red"; // Change edit button color
    paused = true;
  } else {
    typewriter.contentEditable = "false";
    e.target.style.color = "white";
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
  alertContainer.innerHTML = `
  <span>${message}</span>
  `;
  
  document.body.appendChild(alertContainer);
  alertContainer.style.transform = "translateX(-50%) scale(0)";
  setTimeout(() => {
    alertContainer.style.transition = "transform 0.3s ease-in-out";
    alertContainer.style.transform = "translateX(-50%) scale(1)";
  }, 10);

  setTimeout(() => {
    alertContainer.style.transform = "translateX(-50%) scale(0)"; 
    setTimeout(() => {
      alertContainer.remove();
    }, 300); 
  }, 2000);
}