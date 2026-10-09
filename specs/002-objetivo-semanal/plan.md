# Plan — Spec 002: Objetivo semanal de estudio

**Estado: aprobado** | **Fecha: 2026-10-04** | **Escala estimada: ≤ 10 tareas, 20–30 min c/u.**

## 1. Archivos y responsabilidades

- **`app.js`** (lógica + datos + interfaz, sin cambios de stack):
  - *Datos:* `const CLAVE_OBJETIVO = "diario-estudio-objetivo"`, `cargarObjetivo()` (devuelve `null` si no hay o si está corrupto), `guardarObjetivo(minutos)`, `eliminarObjetivo()`. Aisladas de las sesiones para no poner en riesgo `diario-estudio-sesiones` (RNF-4).
  - *Cálculos puros (sin DOM, sin localStorage, `hoy` inyectado como texto "YYYY-MM-DD"):*
    - `calcularMinutosSemanaHastaHoy(sesiones, hoy)` — RF-3, RF-6, RF-11.
    - `calcularProgresoPorcentaje(minutosAcumulados, objetivo)` — RF-4.
    - `calcularEstado(minutosAcumulados, objetivo)` → `'adelante' | 'alcanzado' | 'superado'` — RF-5.
    - `esObjetivoValido(valor)` — RF-1, RF-2, RF-12.
  - *Renderizado y UI:* `mostrarObjetivoYProgreso(sesiones, hoy, objetivo)`, control del formulario (abrir/cerrar/guardar/eliminar), `actualizarInterfaz()` (se añade la llamada).
- **`index.html`**: una única sección nueva `.objetivo` con el botón disparador (`Fijar objetivo` / `Editar objetivo`), el formulario oculto con campo minutos y botones Guardar/Eliminar, y el bloque de barra + porcentaje + mensaje de estado. No se toca el formulario de sesión ni ninguna métrica existente.
- **`styles.css`**: estilos del bloque objetivo, de la barra, de los estados (adelante / alcanzado / superado) y del formulario desplegable, usando solo la paleta existente; asegura sin scroll horizontal en 320 px.
- **`test/test-objetivo.js`** (nuevo, `node --test`): cubre todas las funciones puras; la UI se verifica manualmente en el navegador (no hay tests automáticos de DOM en este proyecto).

## 2. Funciones puras (`hoy` o datos inyectables)

| Función | Parámetros | Retorna | RF que cubre |
|---|---|---|---|
| `obtenerLunesSemana(hoy)` | `hoy: "YYYY-MM-DD"` | `lunes: "YYYY-MM-DD"` | RF-6 (ya existe en app.js, se reutiliza) |
| `calcularMinutosSemanaHastaHoy(sesiones, hoy)` | sesiones, hoy | `minutos: number` | RF-3, RF-6, RF-11 |
| `calcularProgresoPorcentaje(minutosAcumulados, objetivo)` | números | `pct: number` 0..100 | RF-3, RF-4 |
| `calcularEstado(minutosAcumulados, objetivo)` | números | `'adelante' \| 'alcanzado' \| 'superado'` | RF-5 |
| `esObjetivoValido(valor)` | `valor: string` | `boolean` | RF-1, RF-2, RF-12 |
| `cargarObjetivo()` / `guardarObjetivo()` / `eliminarObjetivo()` | — | `number?` | RF-8, RF-10, RNF-4, RNF-5 (no son puras por el efecto en localStorage, pero encapsulan el dato) |

`hoy` siempre es un texto local "YYYY-MM-DD", nunca un `Date` construido desde milisegundos ni UTC, para que los tests puedan inyectar cualquier fecha controlada.

## 3. Algoritmo en pseudocódigo

```
// --- Semana y minutos acumulados (RF-3, RF-6, RF-11) ---
funcion calcularMinutosSemanaHastaHoy(sesiones, hoy):
    lunes = obtenerLunesSemana(hoy)
    total = 0
    para cada sesion en sesiones:
        f = obtenerFecha(sesion)
        si f >= lunes Y f <= hoy:        # RF-6: cuenta desde el lunes hasta hoy (no futuro)
            total = total + obtenerMinutos(sesion)
    devolver total

// --- Porcentaje mostrado (RF-3, RF-4) ---
funcion calcularProgresoPorcentaje(minutosAcumulados, objetivo):
    p = Math.round(minutosAcumulados / objetivo * 100)
    devolver max(0, min(100, p))          # RF-4: nunca negativo, ancho limitado a 100%

// --- Estado por minutos exactos, nunca por el porcentaje (RF-5) ---
funcion calcularEstado(minutosAcumulados, objetivo):
    si minutosAcumulados == objetivo: devolver 'alcanzado'   # RF-5: exactamente igual
    si minutosAcumulados > objetivo:  devolver 'superado'    # RF-5: estrictamente mayor
    devolver 'adelante'

// --- Validación de entrada (RF-1, RF-2, RF-12) ---
funcion esObjetivoValido(valor):
    s = valor.trim()
    si s == "" O s == "-" O no es un patron de entero positivo: devolver falso
    si "e" en s.toLowerCase(): devolver falso                 # RF-2: rechazar notación científica (1e3)
    n = Number(s)
    devolver esEntero(n) Y n > 0                               # RF-1: entero > 0; RF-12: sin tope

// --- Ciclo de guardar (RF-8, RF-12) ---
funcion guardarMetaDesdeFormulario(campo):
    si NO esObjetivoValido(campo):
        mostrar error en español: "Los minutos deben ser un número entero mayor que 0"
        mantener el objetivo anterior (no guardar)               # RF-2
    sino:
        guardarObjetivo(Number(campo))                           # RF-8, RF-12
        cerrarFormulario()

// --- Ciclo de mostrar (RF-3, RF-4, RF-5, RF-9, RF-10, RF-11) ---
funcion mostrarObjetivoYProgreso(sesiones, hoy, objetivo):
    si objetivo == null:
        ocultar bloque objetivo
        textoBoton = "Fijar objetivo"                            # RF-10
    sino:
        minutos = calcularMinutosSemanaHastaHoy(sesiones, hoy)   # RF-6
        pct = calcularProgresoPorcentaje(minutos, objetivo)      # RF-4
        estado = calcularEstado(minutos, objetivo)               # RF-5
        pintar barra con ancho = pct % (max 100%)                # RF-4
        pintar texto pct ("%")                                   # RF-3
        segun estado:
            'alcanzado': texto "Objetivo alcanzado", barra llena # RF-5
            'superado':  texto adicional "¡Objetivo superado!", barra llena  # RF-5
            'adelante':  sin mensaje de estado                   # RF-5
        textoBoton = "Editar objetivo"                           # RF-9

funcion alternarFormulario():
    si formulario esta visible: ocultarlo sin guardar              # RF-9, RF-10
    sino: mostrar formulario (con valor actual si existe)         # RF-9, RF-10

funcion eliminarMeta():
    eliminarObjetivo()                                           # RF-9
    volver al estado sin objetivo (RF-10)
```

## 4. Interfaz / UI

- **Sección `.objetivo`** (`index.html`), insertada junto a la métrica "Estudio esta semana":
  - Botón disparador `#botonFijarObjetivo` — texto dinámico "Fijar objetivo" (sin meta) / "Editar objetivo" (con meta). RF-9, RF-10.
  - Formulario oculto por defecto `#formularioObjetivo` (oculto con `display: none`) con: label "Minutos de objetivo semanal", input `type="number" step="1"`, botón "Guardar" y botón "Eliminar". RF-1, RF-2, RF-9.
  - Bloque `#bloqueObjetivo` oculto hasta que exista una meta: etiqueta "Tu objetivo semanal", barra `.progreso__barra` con ancho dinámico, texto "%", y mensaje de estado según el estado. RF-3, RF-4, RF-5.
- **CSS** (`styles.css`), paleta existing:
  - Barra: contenedor color papel/linea; relleno bermellón (`--llama`) en progreso; al alcanzar, relleno completo bermellón; al superar, marcador amarillo con borde/acento bermellón (RNF-1, sin nuevos colores).
  - Formulario desplegable: tarjeta discreta dentro de la misma sección, inputs y botones alineados verticalmente; sin scroll horizontal a 320 px (RNF-2).
  - Estados: 'alcanzado' y 'superado' se comunican por color de barra + texto, sin animaciones (RNF-1, fuera de alcance celebraciones).
- **Controlador en `app.js`**: `mostrarObjetivoYProgreso()` se invoca desde `actualizarInterfaz()` (junto a `mostrarMinutosSemana`), no crea una segunda métrica de minutos — solo complementa el bloque "Estudio esta semana" (RF-3, RNF-3).

## 5. Decisiones justificadas (con alternativa descartada)

1. **Estado por minutos exactos, no por porcentaje (RF-5).** Se decide explícitamente porque `299/300` redondea a 100 % pero no debe marcar "alcanzado". Alternativa descartada: usar el porcentaje >= 100 para decidir el estado — llevaría a falsos positivos y contradice la spec.
2. **Bloque complementario junto a "Estudio esta semana", sin duplicar la métrica de minutos (RF-3).** Alternativa descartada: meter la barra dentro de la tarjeta `.semana__progreso` — duplicaría el concepto de "minutos" y violaría el requisito de no crear una segunda métrica.
3. **Segunda clave de localStorage (`diario-estudio-objetivo`), no se extiende el array de sesiones (RF-8, RNF-4).** El objetivo es configuración del usuario, no una sesión. Alternativa descartada: guardar una sesión tipo "meta" en el mismo array — mezclaba datos de configuración con datos de sesiones y ponía en riesgo RNF-4 y la compatibilidad.
4. **`hoy` inyectado en las funciones de cálculo (calcularMinutosSemanaHastaHoy, obtenerLunesSemana).** Alternativa descartada: `new Date()` dentro de cada función — impide testear con fechas controladas con `node --test`, rompiendo el principio de lógica pura de la constitution.
5. **Fecha local "YYYY-MM-DD" en todo el cálculo de semanas (RNF-3).** Alternativa descartada: UTC o ISO strings — desplaza la semana cuando el usuario está en otra zona horaria.
6. **Mensaje de sobresfuerzo "¡Objetivo superado!" como texto simple, sin animación (RNF-1).** Alternativa descartada: confeti, sonido o animación — fuera de alcance y prohibido por "sin animaciones de celebración".
7. **Validación que rechaza explícitamente notación científica "1e3" (RF-2).** `Number("1e3") === 1000` en JS, que pasaría como entero, así que se detecta la letra "e" antes de validar. Alternativa descartada: solo `Number(x)` + `isInteger` — dejaría pasar "1e3".
8. **Un único formulario para "Fijar" y "Editar" (RF-9, RF-10).** Alternativa descartada: dos formularios separados — más código y HTML duplicado para una misma entrada.
9. **Cambio de semana solo recalcular al recargar (como el mapa de calor).** Alternativa descartada: `setInterval` que recalcule cada minuto — innecesario, añadido sin requerimiento y costoso de testear.

## 6. Estrategia de testeo con `node --test`

Se crea `test/test-objetivo.js`. Los tests son unitarios y cubren solo la lógica pura (los tests de DOM/interfaz se hacen manualmente en el navegador, como marca `AGENTS.md`).

| Test | RF que cubre | Comprobación clave |
|---|---|---|
| `obtenerLunesSemana` con hoy = "2026-10-04" (domingo) | RF-6 | Devuelve "2026-09-28" (lunes de esa semana natural) |
| `calcularMinutosSemanaHastaHoy` | RF-3, RF-6, RF-11 | 300 min de sesiones entre 28/09 y 04/10 → 300; sesión del 21/09 (semana pasada) → 0; sesión del 06/10 (futura) → 0; 0 sesiones → 0 |
| `calcularProgresoPorcentaje` | RF-4 | 0/300 → 0; 150/300 → 50; 299/300 → 100; 300/300 → 100; 600/300 → 100 (clamp); meta 1 → 1/1 → 100, 2/1 → 100 |
| `calcularEstado` (RF-5) | RF-5 | 299/300 → 'adelante' (¡no 'alcanzado' aunque el % sea 100!); 300/300 → 'alcanzado'; 301/300 → 'superado'; 0/300 → 'adelante'; meta 1: 1/1 → 'alcanzado', 2/1 → 'superado' |
| `esObjetivoValido` | RF-1, RF-2, RF-12 | "300" y "100000" → true; "", "abc", "3.5", "1e3", "0", "-5", "2e2" → false |
| `cargarObjetivo` / `guardarObjetivo` / `eliminarObjetivo` | RF-8, RF-10, RNF-4, RNF-5 | localStorage mock: guardar 300 → leer 300; eliminar → null; valor corrupto ("abc", "3.5", "1e3", "0", "-1") → null sin lanzar; sesiones intactas |

Lanzamiento: `node --test test/test-objetivo.js`. Los tests de UI (botón Fijar/Edit, ciclo abrir/cerrar, cambio de barra, 320 px / 375 px) se verifican manualmente abriendo `index.html` con Chrome DevTools (ver `## Verificación` de AGENTS.md).
