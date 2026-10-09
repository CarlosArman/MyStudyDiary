# 📚 Study Diary (Diario de Estudio)

> A static web app to log study sessions and stay motivated by tracking your streak of consecutive study days.

Practice project built while following the free course **[Curso de Desarrollo con IA: el Nuevo Programador](https://mouredev.com)** by [Brais Moure](https://github.com/mouredev) — learn to code with the help of AI agents.

![Mobile screenshot](captura-movil-375px.png)

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔥 Current streak | Consecutive days studied up to today |
| 🏆 Best streak | All-time record of consecutive days |
| ⚡ This week | Minutes accumulated from Monday to today |
| 🎯 Weekly goal | Minute-based target with progress bar and status (behind / reached / exceeded) |
| 📅 Days this month | Unique days with at least one session in the current month |
| 🗓️ Heat map | Last 8 weeks with 5 activity levels (like GitHub Contributions) |
| 📝 Log session | Form to add a date, topic and duration in minutes |
| 📋 History | All sessions listed from most to least recent |

---

## 🚀 How to run it

No installation or server needed. Just download the repository and open `index.html` with a double-click in your browser.

```
MyStudyDiary/
├── index.html    ← open this file
├── styles.css
└── app.js
```

---

## 🛠️ Tech stack

![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)

- **Pure HTML, CSS and JavaScript** — no frameworks, no npm, no build step.
- **localStorage** to persist sessions and the weekly goal between visits.
- Works from `file://` with a double-click; no server required.
- **Responsive** design — tested down to 320 px.

---

## 📦 Project structure

```
MyStudyDiary/
├── index.html              # Page structure
├── styles.css              # Styles ("study notebook" colour palette)
├── app.js                  # All logic and rendering
├── docs/
│   └── constitution.md     # Design principles and technical rules
├── specs/
│   ├── 001-heat-map/       # Heat map feature spec
│   └── 002-objetivo-semanal/  # Weekly goal feature spec
└── test/
    └── test-objetivo.js    # Pure-logic tests (node --test)
```

---

## 🧪 Tests

Tests cover the pure logic of the weekly goal (59 cases). No external dependencies required:

```bash
node --test test/test-objetivo.js
```

---

## 📐 Key technical decisions

- **Always use local dates**: never `toISOString()` or `new Date("YYYY-MM-DD")` to avoid UTC offset bugs.
- **Correct streak logic**: consecutive days ending today; if there is no session today but there was yesterday, the streak stays alive.
- **Goal status based on exact minutes**, not on the rounded percentage (299 min with goal 300 → not reached, even if the visual percentage shows 100 %).
- **Separate localStorage keys**: sessions (`diario-estudio-sesiones`) and goal (`diario-estudio-objetivo`) are stored independently to avoid data mixing and protect existing records.
- **SDD workflow** (Spec-Driven Development): every feature goes through spec → plan → tasks → implementation → tests before touching code.

---

## 🎓 About the course

This project is part of [Brais Moure](https://github.com/mouredev)'s free course on AI-assisted programming. Workshop videos where this project was built:

| # | Title | Link |
|---|---|---|
| 1 | Workshop — Part 1 | [▶ YouTube](https://www.youtube.com/watch?v=qHYi92zRn-s&t=41s) |
| 2 | Workshop — Part 2 | [▶ YouTube](https://www.youtube.com/watch?v=hzQNE092cW0) |
| 3 | Workshop — Live session | [▶ YouTube](https://www.youtube.com/live/R1UGk4rb9BM) |

---

## 📄 License

Educational project — free to use.
