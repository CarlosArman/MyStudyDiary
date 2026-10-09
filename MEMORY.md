# MEMORY.md — Diario de Estudio

Memoria del proyecto entre sesiones. Máximo ~50 líneas: resume o elimina lo que ya no aporte.

## Estado actual (2026-10-04)
- **Spec 002 (objetivo semanal) implementada y verificada: T1-T10 completadas.** Lógica pura en `app.js` (todas reciben `hoy` como texto local "AAAA-MM-DD", nunca `new Date()` dentro, y se exportan con `module.exports` protegido por `typeof module !== "undefined"`):
  `calcularMinutosSemanaHastaHoy(sesiones, hoy)`, `calcularProgresoPorcentaje(min, objetivo)`,
  `calcularEstado(min, objetivo)`, `esObjetivoValido(valor)`.
- Persistencia del objetivo en clave propia `diario-estudio-objetivo`: `guardarObjetivo`,
  `cargarObjetivo`, `eliminarObjetivo`. Valor corrupto o no válido → `null` ("sin objetivo") sin romper la página.
- Interfaz: bloque `.objetivo` junto a «Estudio esta semana» con `#botonFijarObjetivo`
  ("Fijar objetivo" / "Editar objetivo"), `#formularioObjetivo` (`novalidate`: minutos + "Guardar" + "Eliminar")
  y `#bloqueObjetivo` con barra, `#porcentajeObjetivo`, `#estadoObjetivo` y `#objetivoMinutos`.
  Contrato con CSS: estado en `data-estado="adelante|alcanzado|superado"`, ancho en `style.width` de `#barraObjetivo`.
- `actualizarInterfaz()` refresca también el bloque objetivo; `pintarObjetivoActual()` solo repinta ese bloque
  (la usan guardar/eliminar objetivo y el ciclo del formulario).
- Tests `node --test`: **59/59 verdes** en `test/test-objetivo.js`. UI verificada a mano con Chrome DevTools
  (consola limpia, 320/375 px sin scroll, umbrales 299/300/301, cambio de semana, datos corruptos).
- Ya implementado antes: «Mejor Racha» (🏆) junto a «Racha Actual» (🔥), «Estudio esta semana» (⚡, `2h 15m`),
  «Días estudiados este mes» (📅) y mapa de calor `Constancia` (8 semanas × 7 días, 5 niveles fijos, futuros huecos e inertes).
- Clave `diario-estudio-sesiones` con retrocompatibilidad (formato viejo `fecha/tema/minutos`). Spec 001 en `specs/001-heat-map/`.
- **Pendiente:** cerrar formalmente la spec 002 (estado "implementada" en `spec.md` y revisión de criterios de finalización).

## Decisiones (y por qué)
- **Segunda clave de localStorage** (`diario-estudio-objetivo`): el objetivo es configuración del usuario, no una sesión;
  meterlo en el array de sesiones mezclaría datos y pondría en riesgo lo ya guardado (RNF-4).
- **El estado (adelante/alcanzado/superado) se decide por minutos exactos, no por el porcentaje**: con meta 300 y 299 min
  el 99,67 % redondea a 100 %, así que decidir por el % daría falsos positivos. `calcularEstado` compara con `===` y `>`.
- **Porcentaje = `Math.round(minutos / meta * 100)` limitado a [0, 100]**: es solo indicador visual; la barra puede
  llenarse sin que la meta esté alcanzada. Sin tope máximo de objetivo (RF-12).
- **`esObjetivoValido` rechaza la notación científica** detectando la letra "e" antes de convertir, porque
  `Number("1e3") === 1000` pasaría como entero válido. Acepta cualquier entero > 0.
- **La vista de objetivo se refresca dentro de `actualizarInterfaz()`**: al añadir 150 min con meta 300 la barra sube al 50 % sin recargar.
- **Cálculo dinámico de mejor racha** a partir del historial completo, no un contador guardado. **Semana de lunes a
  domingo** (convención española) y recalculo solo al recargar, sin temporizadores.
- **Fecha local siempre**; `docs/constitution.md` fija 6 principios innegociables y eleva `MEMORY.md` al rango de spec.

## Errores a evitar
- Nunca `toISOString()` ni `new Date("AAAA-MM-DD")` para días o semanas (desfase UTC). Para probar fechas, desplaza
  el `hoy` inyectado, no el reloj.
- Nunca llames a `actualizarInterfaz()` completa al guardar o eliminar el objetivo: reconstruiría el mapa de calor.
  Usa `pintarObjetivoActual()`.
- Con `<input type="number" step="1">` la validación nativa bloquea el `submit` con un aviso **en inglés** y el mensaje
  en español de RF-2 nunca aparece: por eso `#formularioObjetivo` lleva `novalidate` y valida `app.js`.
- En la UI no uses `document.querySelector` (el mock de los tests solo trae `getElementById` y `createElement`):
  para `role="progressbar"` usa `bloqueObjetivo.querySelector(".progreso")` comprobando `null`.
- Al testear `app.js` en Node hace falta un mock mínimo de DOM y localStorage antes de cargarlo; nunca expongas
  `module.exports` sin la protección `typeof module !== "undefined"` o se rompe la página abierta con doble clic.
- La app **no tiene botón de borrar ni de editar sesión** (queda fuera del alcance de la spec 002): para simular
  cambios en el historial se edita `localStorage` y se recarga.
- Diseño: evitar el kit genérico de "tarjetas redondeadas idénticas con sombra gris y gradiente"; el acento
  memorable vive en un solo sitio (marcador amarillo + washi en la ficha de racha).
