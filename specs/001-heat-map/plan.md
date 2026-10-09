# Plan 001 — Mapa de calor de estudio

Spec: `specs/001-heat-map/spec.md` | Estado: propuesta | Sin código en este documento.

## 1. Archivos y responsabilidades (sin archivos nuevos de app — principio 1)

| Archivo | Cambio | Responsabilidad | RF cubierto |
|---|---|---|---|
| `index.html` | modificar | Nueva sección del mapa entre las métricas y el formulario: cuadrícula, zona de detalle y leyenda (solo estructura e IDs). | RF-1, RF-5, RF-6, RF-7 |
| `styles.css` | modificar | Clases nuevas `mapa__*`: grid, celdas cuadradas ≥ 24 px, escala de 5 colores, celda futura hueca, leyenda. | RF-2, RF-4, RF-6, RF-8, RNF-1, RNF-2, RNF-3 |
| `app.js` | modificar | Funciones puras `calcular*` (con `hoy` como parámetro) + una `mostrarMapa` (única que toca el DOM) + delegación de eventos del mapa. | todos |
| `AGENTS.md` | modificar | Añadir la regla del mapa (niveles fijos de color, ventana de 8 semanas). | finalización 6 |
| `MEMORY.md` | modificar | Estado y decisiones de la funcionalidad. | finalización 6 |

## 2. Funciones puras de lógica (todas toman `hoy` como parámetro, formato «AAAA-MM-DD») — principio 3

| Función (conceptual) | Entrada | Salida | RF |
|---|---|---|---|
| `sumarMinutosPorDia(sesiones)` | sesiones (incluye legado vía las `obtener*` ya existentes) | diccionario fecha → minutos totales | RF-3, RNF-5 |
| `calcularNivel(minutos)` | número | 0..4 según umbrales fijos 1-30 / 31-60 / 61-90 / >90 | RF-2 |
| `obtenerLunesVentana(hoy)` | «hoy» | «AAAA-MM-DD» del lunes 7 semanas atrás | RF-1 |
| `construirSemanasMapa(sesiones, hoy)` | sesiones + hoy | 8 semanas × 7 días (lunes→domingo), cada celda = { fecha, minutos, nivel ó futura } | RF-1, RF-3, RF-4 |
| `formatearFechaLarga(fecha)` | «AAAA-MM-DD» | «jueves, 2 de octubre de 2026» | RF-5 |

## 3. Algoritmo del mapa (pseudocódigo)

```
sumarMinutosPorDia(sesiones):
    totales = mapa vacío
    para cada sesión:
        totales[obtenerFecha(sesión)] += obtenerMinutos(sesión)
    devolver totales

construirSemanasMapa(sesiones, hoy):
    totales = sumarMinutosPorDia(sesiones)
    lunesFin = lunes de la semana de hoy          // reutiliza obtenerLunesSemanaActual
    lunesInicio = sumarDias(lunesFin, -49)        // 7 semanas atrás
    semanas = []
    para semana S en 0..7:
        para día D en 0..6:                        // 0 = lunes
            fecha = sumarDias(lunesInicio, S*7 + D)
            si fecha > hoy  → celda futura (sin nivel, gris-hueca, sin interacción)
            si no           → nivel = calcularNivel(totales[fecha] o 0)
    devolver semanas (la última columna es la semana actual)
```

Complejidad trivial: ≤ 56 celdas por pintado; no hace falta optimización.

## 4. Cómo se pinta en la interfaz

- **Cuadrícula**: rejilla de 8 columnas (semanas) × 7 filas (días), orden lunes arriba — coherente con la regla «semana = lunes a domingo». La última columna es la semana actual, así «hoy» está siempre a la derecha (RF-1 verificable a simple vista).
- **Celdas como botones**: cada celda es un botón cuadrado con clase `nivel-0..4` o `futura`; los botones futuros se crean deshabilitados → foco de teclado gratis y RF-8 cumplido sin gestores extra.
- **Delegación de eventos**: un único escuchador en el contenedor; al activar una celda escribe en la zona de detalle (sustituye), y volver a activarla la vacía — RF-5. Zona de detalle con `aria-live` para lectores de pantalla (RNF-3).
- **Leyenda**: 5 muestras 0→4 entre los textos «menos» y «más», estáticas (RF-6).
- **Estado vacío**: con 0 sesiones la cuadrícula se pinta igual (todo nivel 0) y se añade el mensaje invitando a registrar (RF-7).
- **`mostrarMapa`** se llama desde `actualizarInterfaz` como las demás métricas; los minutos se renderizan con la `formatearTiempo` ya existente («2h 15m»).

## 5. Decisiones técnicas y alternativas descartadas

| Decisión | Por qué | Alternativa descartada |
|---|---|---|
| Todo en `app.js`, sin archivo nuevo | Principio 1: stack de 3 archivos | Módulo `mapa.js`: exigiría `type="module"`, prohibido por `AGENTS.md` (`file://`). |
| `hoy` como parámetro en las puras | Determinismo: el mismo cálculo devuelve lo mismo con la misma entrada; facilita la verificación manual con fechas construidas | Leer el reloj dentro de cada función. |
| Celdas como `<button>` nativos | Tab/Enter/Espacio y `disabled` para futuros sin código extra (RF-8, RNF-3) | `div` + `tabindex` + listeners propios: más código y más errores. |
| `Intl.DateTimeFormat('es-ES', {weekday:'long', day:'numeric', month:'long', year:'numeric'})` para RF-5 | API nativa del navegador, cero dependencias, español real | Arrays manuales de días/meses: más líneas didácticas pero duplican lo que el navegador ya hace. |
| Escala: 5 pasos interpolados entre `#ffd34d` (marcador) y `#e4572e` (llama), nivel 0 `#efe9da`, futura transparente | Un solo acento cromático existente (RNF-1); niveles consecutivos distinguibles | Escala verde estilo GitHub: rompe la identidad «cuaderno». |
| Mapear colores por clase (`nivel-0`…) y no por estilo inline | Paleta centralizada en variables CSS; cambiar la escala = 5 líneas | Calcular el color en JS: mezcla lógica e interfaz (principio 3). |

## 6. Estrategia de verificación — `node --test` descartado

**Conflicto resuelto**: el principio 4 de la constitución y `AGENTS.md` (alineados el 2026-10-03) prohíben tests automáticos y frameworks. Además, `node --test` no podría importar `app.js` sin añadir módulos ES (vetados en `AGENTS.md`). Las funciones puras con `hoy` como parámetro quedan *listas* para un futuro testeo, pero la estrategia v1 es la manual obligatoria de la constitución.

Matriz de pruebas manuales (datos sembrados por DevTools → `localStorage`, consola limpia tras cada paso):

| # | Prueba | Verifica |
|---|---|---|
| 1 | Sembrar sesiones de 30 y 31 min en días distintos (repetir con 60/61 y 90/91) | umbrales RF-2 |
| 2 | Dos sesiones el mismo día (45 + 45) | suma RF-3, un solo día |
| 3 | Una sesión con fecha futura → celda hueca, no responde, no colorea | RF-4 |
| 4 | Sesiones en formato legado (`fecha/tema/minutos`) | RNF-5 |
| 5 | Ventana con semana a caballo entre dos meses | salto de mes (casos límite) |
| 6 | Tocar un día → fecha larga + «2h 15m»; tocar otro → sustituye; mismo → cierra; nivel 0 → «Sin estudio»; futura → nada | RF-5 |
| 7 | Navegar con Tab y activar con Enter/Espacio | RF-8, RNF-3 |
| 8 | Redimensionar a 375 px y 320 px sin scroll horizontal, celdas ≥ 24 px | RF-8, RNF-2 |
| 9 | Borrar la clave de `localStorage` → cuadrícula todo nivel 0 + mensaje RF-7 | RF-7 |
| 10 | Escribir basura no-JSON en la clave → mapa como vacío y consola limpia | RNF-5 |
| 11 | Recargar con datos → mapa idéntico | persistencia / finalización 5 |
| 12 | Revisar consola tras cada interacción | finalización 4 |

## 7. Cobertura RF/RNF

- Lógica pura: RF-1, RF-2, RF-3, RF-4, RNF-5, RNF-6.
- Pintura y eventos: RF-1, RF-5, RF-6, RF-7, RF-8, RNF-3.
- Estilos: RF-2, RF-4, RF-6, RF-8, RNF-1, RNF-2, RNF-3.
- Pruebas 1–12 → finalización 1–5; actualización de docs → finalización 6.

Sin cobertura pendiente: los 8 RF y los 6 RNF quedan asignados.
