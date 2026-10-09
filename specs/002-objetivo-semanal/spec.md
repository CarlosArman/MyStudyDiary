# Spec 002 — Objetivo semanal de estudio

Estado: borrador | Fecha: 2026-10-04

## Contexto y objetivo

El Diario de Estudio ya muestra cuánto se ha estudiado esta semana (⚡ «Estudio esta semana»), pero no permite fijarse una meta. Queremos que el usuario pueda definir cuántos minutos quiere estudiar cada semana y ver de un vistazo cuánto lleva respecto a ese objetivo. **Por qué**: una meta clara convierte un dato frío («2h 15m») en un reto personal y aumenta la motivación para cumplirla semana a semana.

## Usuarios

- **Estudiante autodidacta (único usuario)**: quiere fijarse una meta semanal y comprobar su avance. Usa la app sobre todo en el móvil, abriendo `index.html` con doble clic.

## Historias de usuario

- **HU-1**: Como estudiante, quiero fijar cuántos minutos quiero estudiar cada semana para tener una meta concreta que cumplir.
- **HU-2**: Como estudiante, quiero ver cuánto llevo de esa meta esta semana para saber cómo voy sin hacer cálculos.
- **HU-3**: Como estudiante, quiero saber cuándo he alcanzado o superado la meta para sentir que la he cumplido.
- **HU-4**: Como estudiante, quiero poder cambiar o quitar mi objetivo más adelante, y que se recuerde entre visitas, para no reconfigurarlo cada vez.

## Definiciones

- **Objetivo semanal**: número entero de minutos que el usuario fija como meta. Es único y personal (un solo valor vigente en todo momento) y se reutiliza en todas las semanas hasta que el usuario lo cambie o lo quite; no se pide uno nuevo cada semana.
- **Semana**: semana natural de lunes a domingo en fecha local. La semana «actual» es la que contiene la fecha local de hoy. La meta se aplica a cada semana natural y el progreso se reinicia cada lunes a las 00:00 (hora local). Solo cuenta el tiempo estudiado desde el lunes de esa semana hasta hoy (nunca fechas futuras).
- **Minutos acumulados**: suma de los minutos de todas las sesiones cuya fecha pertenece a la semana actual y no es posterior a hoy. Varias sesiones el mismo día y días distintos dentro de la semana suman.
- **Progreso (porcentaje mostrado)**: valor entero que resulta de `Math.round(minutosAcumulados / objetivo * 100)` (redondeo estándar: los valores con fracción 0,5 suben). Es un indicador visual; se muestra siempre como texto legible (p. ej. «75 %») además de la barra.
- **Barra de avance**: representación visual cuyo ancho es el porcentaje mostrado, limitado a un máximo de 100 % (nunca se desborda aunque los minutos superen la meta).
- **Objetivo alcanzado**: los minutos acumulados son exactamente iguales al objetivo fijado. El estado se decide por **minutos exactos**, no por el porcentaje mostrado.
- **Objetivo superado**: los minutos acumulados son estrictamente mayores que el objetivo fijado. El estado se decide igualmente por minutos exactos.

## Requisitos funcionales

- **RF-1** Fijar objetivo. El sistema deberá permitir al usuario introducir un número entero de minutos mayor que 0 como objetivo semanal, en minutos (no en horas ni en texto libre).
- **RF-2** Validación de la entrada. Si el usuario intenta guardar un objetivo vacío, no numérico, no entero (decimales o notación científica como `1e3`), cero o negativo, entonces el sistema deberá rechazarlo y mostrar un mensaje en español explicando que los minutos deben ser un número entero mayor que 0. El objetivo anterior, si existía, se mantendrá sin cambios.
- **RF-3** Ver el avance. Mientras exista un objetivo fijado, el sistema deberá mostrar los minutos acumulados de la semana actual, el objetivo y una barra de avance acompañada del porcentaje mostrado como texto legible (p. ej. «75 %»). El bloque de objetivo convive con la métrica «Estudio esta semana» y la complementa: no crea una segunda métrica de minutos duplicada.
- **RF-4** Cálculo del progreso. El sistema deberá calcular el porcentaje mostrado como `Math.round(minutosAcumulados / objetivo * 100)` (redondeo estándar, 0,5 sube). Como los minutos acumulados nunca son negativos y el objetivo siempre es mayor que 0, el porcentaje nunca es negativo. El ancho de la barra será el porcentaje mostrado limitado a un máximo de 100 %, de modo que puede mostrar «100 %» sin que el objetivo esté aún alcanzado. El estado «alcanzado» o «superado» no depende del porcentaje, sino de los minutos exactos (RF-5).
- **RF-5** Alcanzado y superado. El estado se decidirá por minutos exactos, nunca por el porcentaje mostrado. Cuando los minutos acumulados sean exactamente iguales que el objetivo, el sistema deberá marcar visualmente el objetivo como cumplido («objetivo alcanzado») con la barra completa. Cuando los minutos acumulados sean estrictamente mayores que el objetivo, el sistema deberá mostrar además un mensaje adicional de sobresfuerzo (p. ej. «¡Objetivo superado!»), manteniendo la barra completa. Si los minutos son menores que el objetivo (p. ej. 299 min con meta 300, aunque el 99,67 % redondee a 100 %), el objetivo NO estará alcanzado. Superar la meta no genera error ni aviso negativo.
- **RF-6** Suma solo hasta hoy. El sistema deberá sumar únicamente las sesiones de la semana actual con fecha igual o anterior a la fecha local de hoy. Las sesiones con fecha futura no contarán para el progreso, aunque estén dentro de la semana.
- **RF-7** Solo una meta vigente. El sistema deberá mantener un único objetivo semanal vigente en todo momento; al fijar uno nuevo, el anterior se sustituye. El mismo objetivo se aplica a la semana actual y a las semanas siguientes (el progreso se reinicia cada lunes), sin metas históricas por semana.
- **RF-8** Persistencia entre visitas. El sistema deberá recordar el objetivo fijado y volver a mostrarlo al reabrir la página, incluso cerrando el navegador. La garantía de no alterar las sesiones ya guardadas se detalla en RNF-4.
- **RF-9** Editar y quitar. Mientras exista un objetivo fijado, el sistema deberá mostrar un botón «Editar objetivo» que, al activarlo, despliegue el formulario con el campo de minutos y los botones «Guardar» y «Eliminar». Al guardar un objetivo válido, el formulario se cerrará y se volverá a mostrar la barra de avance con el nuevo objetivo; al pulsar «Eliminar», el objetivo se quitará por completo y se volverá al estado sin objetivo (RF-10).
- **RF-10** Mostrar el formulario. Cuando no exista ningún objetivo fijado, el sistema deberá mostrar la métrica de minutos de la semana como hasta ahora (sin barra ni porcentaje) y un botón o enlace «Fijar objetivo» que despliegue el formulario para introducir la meta. Cuando ya exista un objetivo, el botón será «Editar objetivo» (RF-9). En ambos casos el formulario permanecerá oculto hasta que se active el botón, y pulsar de nuevo el botón (o el mismo botón que lo abrió) mientras está abierto lo cerrará sin guardar cambios.
- **RF-11** Sin sesiones esta semana. Si hay objetivo pero aún no hay minutos acumulados en la semana actual, entonces el sistema deberá mostrar el progreso en 0 % con la barra vacía, sin error.
- **RF-12** Sin tope máximo. El sistema deberá aceptar como válido cualquier número entero de minutos mayor que 0, sin límite máximo de objetivo ni de minutos acumulados.

## Requisitos no funcionales

- **RNF-1** Coherencia visual: la barra de progreso y los estados «alcanzado» y «superado» deben derivar de la paleta existente («cuaderno de estudio»: papel crema, marcador amarillo, bermellón) y no introducir acentos nuevos. Las celebraciones deben ser discretas, sin animaciones.
- **RNF-2** Responsividad: el bloque de objetivo y progreso (incluido el botón «Fijar objetivo» y el formulario desplegable) debe ser legible y usable sin scroll horizontal desde 320 px de ancho en adelante.
- **RNF-3** Fechas locales: los cálculos de semana, de «hasta hoy» y del reinicio semanal cada lunes a las 00:00 deben usar la fecha y hora local del usuario; nunca UTC.
- **RNF-4** Datos del usuario: guardar, cambiar o eliminar el objetivo no debe poner en riesgo ni sobrescribir las sesiones existentes; el formato de las sesiones no cambia. Es la única garantía sobre las sesiones (referenciada desde RF-8).
- **RNF-5** Datos corruptos: si el objetivo guardado no puede leerse o no es válido (incluido un valor decimal, cero o negativo), el sistema lo tratará como «sin objetivo» (RF-10) sin romper la página.
- **RNF-6** Compatibilidad: el objetivo debe expresarse como número entero de minutos; los textos de la interfaz, en español claro.

## Casos límite

- Objetivo exactamente igual a los minutos acumulados (p. ej. meta 300 y 300 min) → alcanzado (RF-5), progreso 100 %, sin mensaje de sobresfuerzo.
- Minutos por debajo del objetivo pero que redondean a 100 % (p. ej. meta 300 y 299 min → 99,67 %, mostrado «100 %») → la barra se muestra llena, pero el objetivo NO está alcanzado: no aparece el estado «alcanzado» ni el mensaje de sobresfuerzo (RF-4, RF-5).
- Minutos acumulados por encima del objetivo (p. ej. meta 300 y 450 min) → progreso mostrado 100 %, sin barra desbordada; mensaje adicional de sobresfuerzo (RF-5).
- Objetivo muy pequeño (p. ej. meta 1 min): con 0 min → 0 %; con 1 min → 100 % y alcanzado; con 2 min → 100 % y superado.
- Hoy es lunes y aún no hay sesiones → 0 % y barra vacía (RF-11); la meta sigue vigente.
- Sesión registrada con fecha futura dentro de la semana en curso → no suma al progreso (RF-6), pero sigue existiendo en el historial.
- Cambio de semana con la página abierta → el progreso se recalcula al recargar; no se actualiza solo. Al ser lunes, el progreso vuelve a 0 % con la meta intacta (RF-7).
- Semana a caballo entre dos meses (p. ej. del 29 de septiembre al 5 de octubre) → cuenta como una sola semana natural de lunes a domingo; el mes no reinicia nada.
- Cambio de hora estacional (entrada o salida del horario de verano) → la semana y el «hasta hoy» se calculan por fecha local «AAAA-MM-DD»; no hay desplazamientos de día ni de semana.
- Objetivo guardado corrupto o no válido (texto, decimal, notación científica, cero o negativo) → se ignora y se muestra «sin objetivo» con el botón «Fijar objetivo» (RF-10, RNF-5).
- Borrar todas las sesiones → el objetivo se conserva; el progreso pasa a 0 %.
- El usuario introduce un número enorme (p. ej. 100 000 min) → válido, sin tope máximo (RF-12); progreso muy bajo.
- Sin objetivo fijado, el formulario permanece oculto hasta que se pulse «Fijar objetivo»; con objetivo, se abre con «Editar objetivo». Pulsar el botón con el formulario abierto lo cierra sin guardar; tras «Eliminar», se vuelve al estado sin objetivo y el formulario se oculta (RF-9, RF-10).

## Fuera de alcance

- Objetivos por día, por mes o por materia/tema.
- Histórico de objetivos por semana pasada ni comparación entre semanas.
- Rachas, recordatorios, notificaciones o avisos automáticos al incumplir.
- Sugerencias automáticas de objetivo basadas en el historial.
- Recompensas, insignias, sonidos o animaciones de celebración.
- Cualquier cambio en el registro, edición o borrado de sesiones.

## Criterios de finalización

1. RF-1 a RF-12 cumplidos y verificados manualmente en el navegador con Chrome DevTools (interfaz, consola sin errores y vista móvil a 375 px, además de comprobar el ancho 320 px).
2. Verificación de los umbrales de RF-4 y RF-5 con datos reales (p. ej. 299/300/301 min con meta 300): 299 min NO alcanzado aunque el porcentaje redondee a 100 %; 300 min alcanzado; 301 min superado con mensaje de sobresfuerzo.
3. Verificación de RF-6 con una sesión de fecha futura dentro de la semana: no suma.
4. Verificación del ciclo del formulario (RF-9, RF-10): sin objetivo se abre con «Fijar objetivo»; con objetivo se abre con «Editar objetivo»; volver a pulsar el botón lo cierra; guardar cierra y actualiza la barra; eliminar vuelve al estado sin objetivo.
5. Verificación de RNF-5 introduciendo un objetivo corrupto en `localStorage` (incluido un valor decimal o en notación científica).
6. Comprobación de persistencia del objetivo tras recargar y cerrar el navegador, sin pérdida de sesiones.
7. Comprobación de que el progreso se reinicia al comenzar una nueva semana manteniendo la meta (RF-7).
8. `AGENTS.md` y `MEMORY.md` actualizados.

## Dudas abiertas

Ninguna pendiente. Todas las dudas de la ronda anterior quedaron resueltas el 2026-10-04 y están incorporadas en las Definiciones, los requisitos funcionales y los casos límite.
