let typingInterval;
let isTyping = false;
let paused = false; 
let typewriterContext = null; 
let typeSpeed = 100; 
let width = 200;
let font = 20;

document.getElementById("realTimeSpeed").addEventListener("input", updateTypingSpeed);
document.getElementById("widthControl").addEventListener("input", updateWidth);
document.getElementById("fontControl").addEventListener("input", updateFont);
document.getElementById("startBtn").addEventListener("click", startTyping);
document.getElementById("stopBtn").addEventListener("click", toggleTyping);
document.getElementById("toggleDashboard").addEventListener("click", toggleDashboard);
document.getElementById("bgColor").addEventListener("input", updateBackground);




function typeNextChar() {
    if (!typewriterContext || paused) return; 

    const { allCode, currentBlockIndex, currentLineIndex, currentCharIndex, typewriterElement, livePreviewElement, styleElement, codeSwitchDelay } = typewriterContext;

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
            typewriterElement.textContent += "\n" + currentLine.slice(0, currentCharIndex + 1);
        } else {
            typewriterElement.textContent += char;
        }

        if (currentBlock.tag === "html" || currentBlock.tag === "css" || currentBlock.tag === "js") {
            typewriterElement.className = `language-${currentBlock.tag}`;
            Prism.highlightElement(typewriterElement);
        }
    // Update live preview
if (currentBlock.tag === "html") {
    livePreviewElement.innerHTML = typewriterElement.textContent;
    livePreviewElement.scrollTop = livePreviewElement.scrollHeight;
    livePreviewElement.scrollLeft = livePreviewElement.scrollWidth;
    livePreviewElement.scrollRight = livePreviewElement.scrollWidth;
  } else if (currentBlock.tag === "css") {
    styleElement.textContent += char;
    livePreviewElement.innerHTML = document.getElementById("htmlInput").value;
    livePreviewElement.scrollTop = livePreviewElement.scrollHeight;
    livePreviewElement.scrollLeft = livePreviewElement.scrollWidth;
  } else if (currentBlock.tag === "js") {
    livePreviewElement.innerHTML = document.getElementById("htmlInput").value;
    const script = document.createElement("script");
    script.textContent = currentBlock.code.join("\n");
    livePreviewElement.appendChild(script);
    livePreviewElement.scrollTop = livePreviewElement.scrollHeight;
    livePreviewElement.scrollLeft = livePreviewElement.scrollWidth;
  }
  
  typewriterElement.scrollTo(typewriterElement.scrollWidth - typewriterElement.clientWidth, typewriterElement.scrollHeight);
  
    

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

    const codeSwitchDelay = parseInt(document.getElementById("codeSwitchDelay").value, 10);

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

function toggleDashboard() {
    document.body.classList.toggle("hidden-dashboard");
}

function updateBackground() {
    const color = document.getElementById("bgColor").value;
    document.getElementById("recordingSection").style.backgroundColor = color;
}

function updateTypingSpeed() {
    typeSpeed = parseInt(document.getElementById("realTimeSpeed").value, 10);
    document.getElementById("typingSpeed").value = typeSpeed; 
}

function updateWidth(){
    let width = parseInt(document.getElementById("widthControl").value);
    document.getElementById("livePreview").style.width = width + "px";
    document.getElementById("typewriter").style.width = width + "px";
    
}

function updateFont(){
    let font = document.getElementById("fontControl").value;
    document.getElementById("typewriter").style.fontSize = font + "px";

}












