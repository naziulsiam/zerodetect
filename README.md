# ZeroDetect – Offline AI Text Detector

ZeroDetect is a **privacy‑first, fully offline AI text detector**.  
Paste text in your browser and get an estimated **AI‑generated vs Human‑written probability** with a quick breakdown of core metrics.

---

## Features

- 100% **offline**, no backend or external APIs.
- AI probability score (0–100%) with human‑readable labels.
- Uses burstiness, a perplexity‑style proxy, n‑gram patterns, and basic linguistic stats.
- Clean, responsive UI with light/dark mode.

---

## Tech Stack

- HTML5, CSS3, Vanilla JavaScript  
- No build tools or dependencies required.

---

## Getting Started

git clone https://github.com/naziulsiam/zerodetect.git
cd zerodetect

text

Then either:

- Open `index.html` directly in your browser, **or**
- Serve locally (example with Python):

python -m http.server 8000
then open http://localhost:8000

text

---

## Usage

1. Open the app in your browser.  
2. Paste text into the input area.  
3. Click **Analyze** (or press Ctrl/Cmd + Enter).  
4. Read the AI % score and the analysis breakdown.

---

## License

Released under the **MIT License**.
