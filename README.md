# 🔐 Caesar Cipher Lab

> **Caesar Cipher Lab** is a complete, interactive browser-based cryptography education tool. No installation, no backend, no dependencies — just open and run.

---

## 🚀 How to Run

### Method 1: Direct Browser (Recommended)
```
Double-click   →   index.html
```
That's it. The app runs entirely in your browser — no server needed.

### Method 2: Local HTTP Server (Optional, for best CORS/font support)
```bash
# Using Python (usually pre-installed)
python -m http.server 8080

# Then open: http://localhost:8080
```

### Method 3: VS Code Live Server
- Install the **Live Server** extension in VS Code
- Right-click `index.html` → **Open with Live Server**

---

## 📁 Project Structure

```
INS miniproject/
├── index.html     # Main application (all markup + structure)
├── styles.css     # Premium dark-blue security theme
├── app.js         # Caesar cipher engine + all interactivity
└── README.md      # This file
```

---

## ✨ Features

| Feature | Description |
|---|---|
| **Encrypt** | Shift any text forward by K (0–25) |
| **Decrypt** | Shift text backward by K |
| **Shift Slider** | Drag or click ± buttons to change shift |
| **Quick Presets** | ROT-3, ROT-13, None, +1, Lucky 7 |
| **Brute-Force Attack** | All 26 decryptions ranked by English score |
| **Char-by-char Trace** | See every letter's shift formula |
| **Alphabet Visualizer** | Full A–Z mapping table + row view |
| **Cipher Wheel** | Animated concentric ring visualization |
| **Copy Result** | One-click clipboard copy |
| **Swap** | Use output as new input instantly |
| **Sample Texts** | 7 built-in example messages |
| **Concepts Section** | Encryption, decryption, keys, brute-force, history, frequency analysis |
| **Responsive** | Fully mobile-friendly down to 320px |

---

## 🔢 Algorithm

### Encryption
```
C = (P + K) mod 26
```
- `P` = plaintext letter position (A=0 … Z=25)  
- `K` = shift key (0–25)  
- `C` = ciphertext letter position

### Decryption
```
P = (C − K + 26) mod 26
```
Adding 26 prevents negative modulo results.

### Brute-Force Scoring
Each of the 26 candidates is scored by:
1. Sum of English letter frequencies for all alphabetic chars
2. Bonus points for each recognized English common word

The highest-scoring candidate(s) are marked as **Likely Plaintext**.

---

## ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|---|---|
| `Ctrl + Enter` | Encrypt current text |
| `Ctrl + Shift + Enter` | Decrypt current text |
| `Ctrl + Enter` (brute-force box) | Launch brute-force attack |

---

## ⚠️ Security Notice

Caesar cipher is a **substitution cipher** from ~100 BC. It provides:
- **Zero real-world security** — broken in under 1 second
- Only **26 possible keys** (trivially brute-forced)
- Vulnerable to **frequency analysis** attacks
- Used today only in ROT-13 for spoiler text on forums

**Never use Caesar cipher to protect real sensitive information.**

---

## 🏛️ Browser Support

| Browser | Status |
|---|---|
| Chrome 90+ | ✅ Full support |
| Firefox 88+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| Safari 14+ | ✅ Full support |
| Mobile browsers | ✅ Responsive |
