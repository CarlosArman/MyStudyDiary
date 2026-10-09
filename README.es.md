<div align="center">

# 📚 Diario de Estudio

![Versión](https://img.shields.io/badge/versión-1.0.0-blue?style=flat)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=flat&logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=flat&logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=flat&logo=javascript&logoColor=black)
![Tests](https://img.shields.io/badge/tests-59%20pasados-brightgreen?style=flat)
[![Demo en vivo](https://img.shields.io/badge/demo-en%20vivo-brightgreen?style=flat&logo=github)](https://carlosarman.github.io/MyStudyDiary/)

🌐 **Language / Idioma**

[🇬🇧 English](README.md) &nbsp;|&nbsp; 🇪🇸 Español

Aplicación web estática para registrar sesiones de estudio y mantener la motivación viendo tu racha de días consecutivos.

Proyecto de práctica desarrollado siguiendo el curso gratuito **[Curso de Desarrollo con IA: el Nuevo Programador](https://mouredev.com)** de [Brais Moure](https://github.com/mouredev).

![Captura en móvil](captura-movil-375px.png)

</div>

---

## 🎯 Por qué este proyecto importa

Este repositorio es un **proyecto de portafolio front-end** que va más allá de una simple aplicación de tareas. Demuestra cómo construir una aplicación web que funciona solo en el navegador sin frameworks, sin herramientas de build y sin servidor — solo código limpio y legible.

Pone en práctica conceptos front-end reales como:

- **Manejo de fechas en hora local** — evita el clásico bug de desfase UTC con `toISOString()` y `new Date("AAAA-MM-DD")`
- **Lógica de racha** — calcula días consecutivos de estudio correctamente, incluso cruzando límites de semana y mes
- **Persistencia de datos** — usa `localStorage` con claves separadas para proteger los datos existentes del usuario
- **Diseño responsive** — layout mobile-first probado desde 320 px con un lenguaje visual de "cuaderno de estudio"
- **Flujo SDD** (Spec-Driven Development) — cada funcionalidad pasa por spec → plan → tasks → implementación → tests antes de tocar código
- **Tests de lógica pura** — 59 casos con `node --test`, sin dependencias externas

---

## ✨ Funcionalidades

| Funcionalidad | Descripción |
|---|---|
| 🔥 Racha actual | Días consecutivos estudiando hasta hoy |
| 🏆 Mejor racha | El récord histórico de días seguidos |
| ⚡ Estudio esta semana | Minutos acumulados desde el lunes hasta hoy |
| 🎯 Objetivo semanal | Meta en minutos con barra de progreso y estado (adelante / alcanzado / superado) |
| 📅 Días este mes | Días únicos con al menos una sesión en el mes actual |
| 🗓️ Mapa de calor | Las últimas 8 semanas con 5 niveles de actividad (como GitHub Contributions) |
| 📝 Registrar sesión | Formulario para añadir fecha, tema y minutos |
| 📋 Historial | Lista de todas las sesiones de más a menos reciente |

---

## 🚀 Cómo usarla

No necesita instalación ni servidor. Solo descarga el repositorio y abre `index.html` con doble clic en tu navegador.

```
MyStudyDiary/
├── index.html    ← abre este archivo
├── styles.css
└── app.js
```

---

## 🛠️ Tecnologías

- **HTML, CSS y JavaScript** puros — sin frameworks, sin npm, sin paso de build.
- **localStorage** para persistir las sesiones y el objetivo entre visitas.
- Funciona desde `file://` con doble clic; no requiere servidor.
- Diseño **responsive** — probado desde 320 px.

---

## 📦 Estructura del proyecto

```
MyStudyDiary/
├── index.html              # Estructura de la página
├── styles.css              # Estilos (paleta "cuaderno de estudio")
├── app.js                  # Toda la lógica y el renderizado
├── docs/
│   └── constitution.md     # Principios de diseño y reglas técnicas
├── specs/
│   ├── 001-heat-map/       # Spec del mapa de calor
│   └── 002-objetivo-semanal/  # Spec del objetivo semanal
└── test/
    └── test-objetivo.js    # Tests de lógica pura (node --test)
```

---

## 🧪 Tests

Los tests cubren la lógica pura del objetivo semanal (59 casos). No requieren dependencias externas:

```bash
node --test test/test-objetivo.js
```

---

## 📐 Decisiones técnicas destacadas

- **Fechas en hora local siempre**: nunca `toISOString()` ni `new Date("AAAA-MM-DD")` para evitar desfases UTC.
- **Racha correcta**: días consecutivos que terminan hoy; si hoy no hay sesión pero ayer sí, la racha sigue viva.
- **Estado del objetivo por minutos exactos**, no por el porcentaje redondeado (299 min con meta 300 → no alcanzado, aunque el porcentaje visual muestre 100 %).
- **Claves de localStorage separadas**: sesiones (`diario-estudio-sesiones`) y objetivo (`diario-estudio-objetivo`) guardados de forma independiente para no mezclar datos ni romper registros existentes.

---

## 🎓 Sobre el curso

Este proyecto forma parte del curso gratuito de [Brais Moure](https://github.com/mouredev) sobre programación asistida por IA. Vídeos del taller donde se construyó este proyecto:

| # | Título | Enlace |
|---|---|---|
| 1 | Taller — Parte 1 | [▶ YouTube](https://www.youtube.com/watch?v=qHYi92zRn-s&t=41s) |
| 2 | Taller — Parte 2 | [▶ YouTube](https://www.youtube.com/watch?v=hzQNE092cW0) |
| 3 | Taller — En directo | [▶ YouTube](https://www.youtube.com/live/R1UGk4rb9BM) |

---

## 📄 Licencia

Proyecto educativo de uso libre.
