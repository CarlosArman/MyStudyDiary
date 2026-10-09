# Tareas 001 — Mapa de calor de estudio

Origen: `spec.md` + `plan.md`. Ordenadas por dependencia. Tamaño estimado: 20-30 min cada una. Verificación: manual con Chrome DevTools (constitución, principio 4).

## Implementación

- [x] **T1. Estructura HTML de la sección del mapa.**
  Añade la sección entre las tarjetas de métricas y el formulario: contenedor de cuadrícula (`mapaGrid`), zona de detalle (`mapaDetalle`, `aria-live`), leyenda con 5 muestras y mensaje de vacío (`mensajeMapaVacio`).
  RF: RF-1 (posición), RF-5, RF-6, RF-7.
  **Hecho cuando:** la página carga con la nueva sección visible (vacía) entre las métricas y el formulario, y la consola no muestra errores. *(Nota: ya aplicada; marcar tras verificarla en el arranque del entorno.)*

- [x] **T2. Funciones puras de lógica.**
  En `app.js`: `sumarMinutosPorDia`, `calcularNivel`, refactor de `obtenerLunesSemanaActual` a una versión parametrizable con `hoy`, `construirSemanasMapa(sesiones, hoy)` y `formatearFechaLarga(fecha)`.
  RF: RF-1, RF-2, RF-3, RF-4, RNF-6 y base de RF-5.
  **Hecho cuando:**probar en consola DevTools: `construirSemanasMapa([], "2026-10-03")` devuelve 8 semanas × 7 días con el lunes arriba, y `calcularNivel(30)` = 1, `calcularNivel(31)` = 2.

- [x] **T3. Pintura de la cuadrícula (`mostrarMapa`).**
  Implementa el render: 56 celdas como botones, clases por nivel, futuras deshabilitadas y huecas, `aria-label` por celda, mensaje de vacío, llamada desde `actualizarInterfaz`. Toca el DOM (lógica pura intacta).
  RF: RF-1, RF-2, RF-3, RF-4, RF-7, RNF-3.
  **Hecho cuando:** con las sesiones existentes (hoy 45, ayer 30, anteayer 60) se ven 8 columnas con los días en nivel 1 o 2 en el lugar correcto; semana actual = última columna; vacío muestra el mensaje si se borra la clave.

- [x] **T4. Estilos del mapa.**
  En `styles.css`: tarjeta, grid 8×7, celdas cuadradas ≥ 24 px con `aspect-ratio`, escala marcador→bermellón con nivel 0 gris atenuado, futura hueca, celda activa, leyenda, zona de detalle, mensaje de vacío, foco visible.
  RF: RF-2, RF-4, RF-6, RF-8, RNF-1, RNF-2, RNF-3.
  **Hecho cuando:** a 375 px y 320 px son legibles sin scroll horizontal, los 5 niveles se distinguen, el foco es visible y el diseño sigue «cuaderno de estudio».

- [x] **T5. Interacción del detalle.**
  Delegación de clicks en la cuadrícula: muestra fecha larga + minutos (nivel 0 = «Sin estudio»), sustituye al cambiar de día, se cierra al repetir, futuras no responden. Teclado: Tab/Enter/Espacio nativos de `<button>`.
  RF: RF-5, RF-8, RNF-3.
  **Hecho cuando:** pulsar/teclear sobre días cambia el detalle bajo la cuadrícula con fecha larga en español y «Xh Ym»; las celdas huecas no hacen nada.

- [x] **T6. Blindaje de datos corruptos.**
  En `cargarSesiones` de `app.js`: envolver el parseo con `try/catch` que devuelva `[]` sin romper la página.
  RF: RNF-5.
  **Hecho cuando:** escribiendo texto no-JSON en la clave `diario-estudio-sesiones` y recargando, la página muestra el estado vacío y la consola está limpia.

- [x] **T7. Actualización de docs (constitución, principio 2).**
  `AGENTS.md`: regla de mapa (ventana 8 semanas, niveles fijos). `MEMORY.md`: estado y decisiones (rango, umbrales, huecas vs nivel 0, estado vacío, blindaje corrupto).
  RF: criterio de finalización 6.
  **Hecho cuando:** las dos notas quedan coherentes con la spec y el código.

## Verificación (matriz de pruebas manuales del §6 del plan)

- [x] **T8. Umbrales fijos.**
  Sembrar por DevTools sesiones de 30/31, 60/61, 90/91 min; comprobar niveles 1/2, 2/3, 3/4.
  RF: RF-2.
  **Hecho cuando:** el color de cada celda cambia exactamente en esos umbrales.

- [x] **T9. Suma por día + futuras.**
  Dos sesiones el mismo día (45 + 45 = 90 min → nivel 3); sesión con fecha futura → celda hueca.
  RF: RF-3, RF-4.
  **Hecho cuando:** el día con dos sesiones sube de nivel y la futura sigue hueca e inerte.

- [x] **T10. Legado + cruce de mes + responsive.**
  Datos con campos `fecha/tema/minutos`; ventana que cruza un cambio de mes; 320 px y 375 px.
  RF: RNF-5, casos límite, RNF-2.
  **Hecho cuando:** cuentan igual que las nuevas, no hay scroll horizontal y las celdas ≥ 24 px.

- [x] **T11. Vacío + corrupto + recarga.**
  Borrar la clave → RF-7; texto corrupto → sin error; recargar → mapa idéntico.
  RF: RF-7, RNF-5, finalización 5.
  **Hecho cuando:** los tres escenarios se observan sin errores de consola.

- [x] **T12. Cierre general.**
  Consola limpia tras todas las interacciones; captura móvil a 375 px; comprobación de persistencia final.
  RF: finalización 1, 2, 4, 5.
  **Hecho cuando:** cero errores en consola y la captura refleja el diseño «cuaderno de estudio».
