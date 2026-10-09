# Spec 001 — Mapa de calor de estudio

Estado: revisada por QA | Fecha: 2026-10-03

## Contexto y objetivo

El Diario de Estudio ya muestra rachas y totales, pero no permite *ver* la constancia de un golpe de vista. Queremos un mapa de calor tipo GitHub: una cuadrícula de días donde el color es más intenso cuantos más minutos se estudió. **Por qué**: ver la constancia visualmente es la herramienta de motivación más potente del diario; un solo vistazo debe responder «¿llevo una buena racha de verdad?».

## Usuarios

- **Estudiante autodidacta (único usuario)**: quiere motivación visual y comprobar su constancia. Usa la app sobre todo en el móvil.

## Historias de usuario

- **HU-1**: Como estudiante, quiero ver mis días de estudio recientes en una cuadrícula de colores para comprobar mi constancia sin leer la lista.
- **HU-2**: Como estudiante, quiero que los días con más minutos destaquen más para sentir el progreso.
- **HU-3**: Como estudiante, quiero tocar un día para ver cuánto estudié exactamente ese día.

## Requisitos funcionales

- **RF-1** Rango visible. El sistema deberá mostrar un mapa de calor de 8 semanas: la semana actual y las 7 anteriores, con semanas de lunes a domingo en fecha local. La semana actual será la última columna del mapa. El mapa aparecerá en la página tras las tarjetas de métricas (rachas, semana, mes) y antes del formulario. Los anteriores al rango no se dibujan; no afectan a rachas ni a totales.
- **RF-2** Cinco niveles de intensidad. El sistema deberá colorear cada día según sus minutos totales: nivel 0 (0 min), nivel 1 (1-30 min), nivel 2 (31-60 min), nivel 3 (61-90 min), nivel 4 (>90 min). Cada nivel será visualmente distinguible del anterior.
  - Criterio de aceptación (EARS): Cuando un día suma exactamente 30 minutos, el sistema mostrará nivel 1; cuando suma 31 minutos, nivel 2; cuando suma 90, nivel 3; cuando suma 91, nivel 4.
- **RF-3** Suma por día. Si un día contiene varias sesiones, entonces el sistema deberá sumar sus minutos antes de calcular el nivel.
- **RF-4** Futuros no cuentan. Mientras un día sea posterior a la fecha local actual, su celda se mostrará hueca (sin fondo), sin datos, y no responderá a la interacción. Dos estados visuales distintos: hueca ≠ nivel 0 (gris atenuado).
- **RF-5** Detalle al seleccionar. Cuando el usuario toque o seleccione con teclado un día con nivel 1 a 4, el sistema mostrará debajo de la cuadrícula y encima de la leyenda la fecha en formato «jueves, 2 de octubre de 2026» y sus minutos totales (p. ej. «2h 15m»). Si el día es nivel 0, mostrará «Sin estudio el [fecha]». Tocar otro día sustituye el detalle; tocar el mismo día lo cierra. Las celdas futuras no producen ningún detalle.
- **RF-6** Leyenda. El sistema mostrará una leyenda con las 5 muestras de nivel (0 a 4) y los textos «menos» y «más» a los extremos, sin cifras de umbral.
- **RF-7** Estado vacío. Si no existe ninguna sesión registrada, el sistema mostrará la cuadrícula completa con todas las celdas en nivel 0 y, debajo de ella, un mensaje invitando a registrar la primera sesión.
- **RF-8** Tamaño e interacción de celdas. Cada celda será un cuadrado de al menos 24 × 24 px, seleccionable con puntero y con teclado (Tab para enfocar, Enter o Espacio para activar el detalle del RF-5).

## Requisitos no funcionales

- **RNF-1** Coherencia visual: la escala niveles 1-4 derivará de la paleta existente («cuaderno de estudio»: de marcador amarillo a bermellón); el nivel 0 será gris muy atenuado, distinguible del papel de fondo; las celdas futuras serán huecas. No se introducen acentos nuevos.
- **RNF-2** Responsividad: el mapa completo debe ser legible sin scroll horizontal desde 320 px de ancho en adelante.
- **RNF-3** Accesibilidad: ninguna información dependerá solo del color; niveles consecutivos distinguibles a simple vista; las celdas operables con teclado.
- **RNF-4** Textos en español claro.
- **RNF-5** Datos: fechas locales (prohibido UTC); los datos guardados en formatos anteriores (formato legado) cuentan en el mapa igual que en rachas y totales; los datos fuera de la ventana de 8 semanas simplemente no se dibujan; si el almacenamiento guardado no puede leerse (datos corruptos), el sistema lo tratará como vacío sin romper la página.
- **RNF-6** Refresco: el mapa se calcula al cargar la página; un cambio de día con la página abierta no se refleja hasta recargar.

## Casos límite

- Varios minutos el mismo día → se suman (RF-3), no cuentan como varios días.
- Minutos exactos 30 / 60 / 90 → nivel 1 / 2 / 3 respectivamente (RF-2).
- Minutos por encima de 90 (incluidos valores muy altos, p. ej. 10 000) → nivel 4, sin tope adicional.
- Sesiones futuras registradas por error → celda hueca, sin efecto (RF-4).
- Semana actual casi toda futura (p. ej. hoy lunes) → se muestran las celdas futuras de esa semana huecas; solo los días pasados hasta hoy pueden tener color.
- Datos anteriores a la ventana de 8 semanas → no dibujados; rachas y totales no cambian.
- Almacenamiento corrupto o ilegible → mapa vacío como el estado RF-7, sin error visible.
- Salto de mes dentro de la ventana (p. ej. una semana a caballo entre dos meses) → cada celda sigue a su fecha real; no hay reinicio por mes.
- Recarga → el mapa se reconstruye igual a partir de los datos guardados.

## Fuera de alcance

- Navegar más allá de 8 semanas (vista anual o paginación).
- Editar o eliminar sesiones desde el mapa.
- Animaciones o efectos especiales.
- Comparativas, metas ni exportación.
- Cambios de fecha del sistema del dispositivo más allá de recalcular con la fecha local vigente (RNF-6).

## Criterios de finalización

1. RF-1 a RF-8 cumplidos y verificados en el navegador con Chrome DevTools (interfaz, consola sin errores, `localStorage` y vista móvil a 375 px, y comprobación del ancho 320 px).
2. Verificación de umbrales del RF-2 con datos reales (sesiones de 30 y 31 min, 60/61, 90/91) y de RF-3 con dos sesiones el mismo día.
3. Comprobación de una ventana que cruza un cambio de mes.
4. Consola sin errores (`F12` → Console) tras cada interacción, incluido el caso de almacenamiento corrupto.
5. Datos existentes reflejados tras recargar (persistencia).
6. `AGENTS.md` y `MEMORY.md` actualizados.

## Dudas abiertas

Ninguna.

Nota de QA (resuelta el 2026-10-03): `AGENTS.md` listaba `node --test`, en tensión con el principio 4 de la constitución. Resolución: la constitución prevalece; `AGENTS.md` ya declara que no hay tests automáticos y toda verificación es manual con Chrome DevTools.
