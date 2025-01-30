# CodePen Clone - Live Typing & Preview Tool

## Overview
This project replicates a **CodePen-like environment**, allowing users to type HTML, CSS, and JavaScript code in real time. The code is dynamically displayed with syntax highlighting, and changes are immediately previewed in a live iframe.

Key Features:
- Real-time live preview for HTML, CSS, and JavaScript code.
- Typing simulation with adjustable typing speed.
- Background color customization.
- Editable preview area with dynamic updates.
- Fully customizable layout dimensions and font size.

---

## Features
1. **Live Typing Simulation**
   - Code is typed line-by-line with an adjustable typing speed.
   - Supports HTML, CSS, and JavaScript blocks.

2. **Dynamic Live Preview**
   - HTML updates the structure inside the preview iframe.
   - CSS styles are applied in real time.
   - JavaScript runs dynamically, with error handling for debugging.

3. **Customization Options**
   - Change typing speed.
   - Adjust the preview window's width and font size.
   - Modify the background color.

4. **Pause/Resume Typing**
   - Pause and resume functionality for the typing simulation.

5. **Error Handling**
   - Captures JavaScript errors and displays alerts in the UI.

---

## Technologies Used
- **HTML, CSS, JavaScript**
- [Prism.js](https://prismjs.com/) for syntax highlighting.
- Iframe for live code preview.

---

## How to Use
### Setup
1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd <repository-folder>
## Open the index.html file in a browser.
Input Fields
HTML Input: Add your HTML code.
CSS Input: Add your CSS code.
JavaScript Input: Add your JavaScript code.
Controls
Typing Speed:
Adjust typing speed using the slider or input field (realTimeSpeed).
Preview Width:
Change the width of the preview window using the widthControl slider.
Font Size:
Modify the font size of the code display using the fontControl slider.
Background Color:
Update the preview area’s background color using the color picker (bgColor).
Buttons
Start Button: Starts the typing simulation for the given code.
Pause/Resume Button: Pauses or resumes the typing simulation.
Stop Button: Stops the typing simulation completely.
Project Structure
bash
Copy
Edit
project-folder/
├── index.html     # Main HTML structure
├── style.css      # Styles for the UI
├── script.js      # JavaScript logic (this file)
└── README.md      # Project documentation
Important Notes
Typing Simulation:

Uses setTimeout for typing delays.
Pauses typing on encountering (delay) keyword in the code.
JavaScript Execution:

Injects JavaScript dynamically into the iframe.
Handles errors and displays alerts with showAlert.
Syntax Highlighting:

Highlighted using Prism.js based on the current code type (HTML, CSS, or JavaScript).
Future Enhancements
Add support for saving projects.
Enhance UI responsiveness for mobile views.
Add drag-and-drop file upload for importing code.
Author
Sonu Kumar

This project is licensed under the MIT License. Feel free to fork, modify, and use as needed.
