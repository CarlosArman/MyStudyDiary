# Tareas — Spec 002: Objetivo semanal de estudio

**Tamaño estimado: 10 tareas, 20–30 min c/u.** Cada tarea se implementa en orden de dependencia: primero la lógica pura con tests en verde (`node --test`), después la interfaz.

- [x] **T1. Función pura: minutos acumulados esta semana hasta hoy (`calcularMinutosSemanaHastaHoy`).** RF-3, RF-6, RF-11
  - Hecho cuando: tests en `test/test-objetivo.js` pasan con `hoy = "2026-10-04"`: 300 min de sesiones dentro de la semana (28/09–04/10) suman 300; una sesión del 21/09 (semana anterior) no suma; una sesión del 06/10 (futura) no suma; sin sesiones → 0 min. La función recibe `hoy` como parámetro, sin `new Date()` interno.

- [x] **T2. Cálculo de porcentaje y estado (`calcularProgresoPorcentaje`, `calcularEstado`).** RF-4, RF-5
  - Hecho cuando: tests pasan: 299/300 → 100 % y estado **'adelante'** (no 'alcanzado'); 300/300 → 100 % y 'alcanzado'; 301/300 → 100 % y 'superado'; 0/300 → 0 % y 'adelante'; meta 1 con 2 min → superado; 600/300 → 100 % sin desbordar.

- [x] **T3. Validación de entrada del objetivo (`esObjetivoValido`).** RF-1, RF-2, RF-12
  - Hecho cuando: tests pasan: "300" y "100000" → válido; "", "abc", "3.5", "1e3", "2e2", "0", "-5", "  " → rechazados. La función detecta la notación científica antes de convertir a número.

- [x] **T4. Persistencia del objetivo (`cargarObjetivo`, `guardarObjetivo`, `eliminarObjetivo`) y datos corruptos.** RF-8, RF-10, RNF-4, RNF-5
  - Hecho cuando: tests con localStorage simulado pasan: guardar 300 → se lee 300; eliminar → null; valores corruptos ("abc", "3.5", "1e3", "0", "-1") → null sin lanzar error; las sesiones (`diario-estudio-sesiones`) permanecen intactas tras guardar/eliminar el objetivo.

- [x] **T5. HTML: bloque objetivo, botón disparador y formulario oculto.** RF-3, RF-9, RF-10
  - Hecho cuando: sin objetivo aparece botón "Fijar objetivo"; con objetivo aparece botón "Editar objetivo" junto al bloque de progreso; formulario con label "Minutos de objetivo semanal", input `type="number"` y botones "Guardar" y "Eliminar", oculto por defecto (`display: none`) y se despliega al pulsar el botón.

- [x] **T6. CSS del bloque objetivo, barra y estados; responsivo.** RNF-1, RNF-2
  - Hecho cuando: al visualizar en 320 px y 375 px no hay scroll horizontal y todo el bloque (botón, formulario desplegado, barra) se lee completo; barra usa la paleta existente (papel/linea/bermellón/marcador); estados 'alcanzado' y 'superado' se diferencian por color de barra y texto sin animaciones.
  - Contrato CSS para T7 (decisión de T6): el estado se marca con `data-estado="adelante|alcanzado|superado"` en `#bloqueObjetivo`; el ancho va en `style="width: X%"` de `#barraObjetivo` (ya está en el HTML) y el texto del mensaje en `#estadoObjetivo`. Sin `data-estado` el bloque queda neutro (estado 'adelante').

- [x] **T7. Lógica de interfaz: alternar formulario, guardar, eliminar y actualizar barra + % + estado.** RF-3, RF-4, RF-5, RF-9, RF-11
  - Hecho cuando: ciclo completo funciona: pulsar el botón con el formulario abierto lo cierra sin guardar; guardar un objetivo válido actualiza la barra y el %, y cierra el formulario; eliminar vuelve al estado sin objetivo; con 0 min y meta 300 se muestra 0 % con barra vacía y sin error.

- [x] **T8. Integrar el bloque objetivo en `actualizarInterfaz()` y comprobar consola limpia.** RF-3
  - Hecho cuando: al cargar `index.html` el bloque objetivo aparece junto a "Estudio esta semana"; no hay mensajes duplicados de minutos; la consola de Chrome DevTools no registra errores.
  - Verificado (2026-10-04): objetivo 300 + sesión de 150 min → barra al 50 % sin recargar; al borrar la sesión vuelve al 0 % conservando la meta; guardar (600 → 25 %) y eliminar el objetivo refrescan al instante; tras recargar el bloque aparece con el 50 %; consola sin errores ni avisos. Nota: `actualizarInterfaz()` recibe las sesiones ya cargadas y reutiliza `formatoFechaLocal(new Date())`; la llamada suelta a `pintarObjetivoActual()` de la sección «Inicio» se eliminó (queda solo como helper del formulario de objetivo).

- [x] **T9. Verificación manual de casos límite y vista móvil.** Criterios de finalización 1–7
  - Hecho cuando: se prueban en el navegador 299/300/301 min con meta 300 (adelante/alcanzado/superado); meta de 1 min; sesión de fecha futura dentro de la semana (no suma); recarga al cambiar de lunes (progreso vuelve a 0 % con la meta intacta); localStorage corrupto (texto, decimal, `1e3`) → "sin objetivo"; persistencia tras recargar y cerrar; vista móvil a 375 px y 320 px sin scroll horizontal; `node --test` en verde.
  - Verificado (2026-10-04, sin cambios de código): umbrales 299/300/301 y 450 min con meta 300 correctos (`adelante` sin mensaje / `alcanzado` / `superado`, barra sin desbordar); meta 1 con 0/1/2 min y meta 100000 correctos; RF-6 comprobado desplazando "hoy" a miércoles 30/09 (las sesiones del 01/10 y 02/10, dentro de la misma semana, no suman y siguen en el historial); RF-7 comprobado con el mismo almacenamiento y "hoy" = lunes 05/10 → 0 % con la meta intacta; RF-11 (lunes sin sesiones) → 0 % sin error; ciclo del formulario completo con clics reales (abrir, cerrar sin guardar, guardar, editar, eliminar) y RF-2 con los 8 rechazos en español; RNF-5 con 15 valores corruptos (incluidos `"abc"`, `3.5`, `1e3`, `0`, `-1`, `{mal`) → siempre "sin objetivo" y página intacta; persistencia tras recargar y tras abrir una pestaña nueva; sin scroll horizontal a 320/375/768/1280 px con el bloque cerrado y con el formulario abierto (capturas revisadas); consola sin errores ni avisos; `node --test` 59/59 verde. La semana actual (28/09–04/10) es además el caso real de semana a caballo entre meses.

- [x] **T10. Actualizar MEMORY.md.**
  - Hecho cuando: `MEMORY.md` incluye el estado de la implementación (bloque objetivo + barra + persistencia), la clave `diario-estudio-objetivo` usada, la decisión de decidir el estado por minutos exactos (no porcentaje) y su motivo (caso 299/300); sin cambios en `AGENTS.md` porque la spec no introduce reglas permanentes nuevas.
  - Hecho (2026-10-04): `MEMORY.md` reescrito en 52 líneas (antes 36), compacted para respetar el límite de ~50: estado (spec 002 con T1-T10 completadas, 59/59 tests), decisiones con su porqué (clave propia, estado por minutos exactos, `Math.round` limitado a [0,100], rechazo de `1e3`, refresco dentro de `actualizarInterfaz()`) y errores a evitar (`novalidate` por el aviso nativo en inglés, no llamar a `actualizarInterfaz()` al guardar/eliminar el objetivo, sin botón de borrar/editar sesión). Sin cambios en `AGENTS.md`: no hay regla permanente nueva.
