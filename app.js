// Diario de Estudio - Lógica principal

const CLAVE_STORAGE = "diario-estudio-sesiones";

// Elementos de la página
const formulario = document.getElementById("formularioSesion");
const inputFecha = document.getElementById("fecha");
const inputTema = document.getElementById("tema");
const inputMinutos = document.getElementById("minutos");
const rachaNumero = document.getElementById("rachaNumero");
const mejorRachaNumero = document.getElementById("mejorRachaNumero");
const minutosSemana = document.getElementById("minutosSemana");
const diasMes = document.getElementById("diasMes");
const mapaGrid = document.getElementById("mapaGrid");
const mapaDetalle = document.getElementById("mapaDetalle");
const mensajeMapaVacio = document.getElementById("mensajeMapaVacio");
const listaSesiones = document.getElementById("listaSesiones");
const mensajeVacio = document.getElementById("mensajeVacio");

// Elementos del bloque de objetivo semanal
const botonFijarObjetivo = document.getElementById("botonFijarObjetivo");
const bloqueObjetivo = document.getElementById("bloqueObjetivo");
const objetivoMinutos = document.getElementById("objetivoMinutos");
const barraObjetivo = document.getElementById("barraObjetivo");
const porcentajeObjetivo = document.getElementById("porcentajeObjetivo");
const estadoObjetivo = document.getElementById("estadoObjetivo");
const formularioObjetivo = document.getElementById("formularioObjetivo");
const minutosObjetivo = document.getElementById("minutosObjetivo");
const errorObjetivo = document.getElementById("errorObjetivo");
const botonEliminarObjetivo = document.getElementById("botonEliminarObjetivo");

// ----- Datos -----

// Funciones auxiliares para compatibilidad con datos anteriores
const obtenerFecha = (s) => s.date || s.fecha;
const obtenerTema = (s) => s.topic || s.tema;
const obtenerMinutos = (s) => (s.minutes !== undefined ? s.minutes : s.minutos);

// Carga las sesiones guardadas (o devuelve un array vacío si no hay nada)
// RNF-5: si los datos están corruptos (no es JSON válido), se trata como vacío
function cargarSesiones() {
  let datos = localStorage.getItem(CLAVE_STORAGE);
  if (!datos) {
    datos = localStorage.getItem("diarioDeEstudio.sesiones");
  }
  if (!datos) return [];
  try {
    return JSON.parse(datos);
  } catch {
    return [];
  }
}

// Guarda las sesiones en localStorage
function guardarSesiones(sesiones) {
  localStorage.setItem(CLAVE_STORAGE, JSON.stringify(sesiones));
}

// ----- Objetivo semanal: persistencia (RF-8, RF-10, RNF-4, RNF-5) -----

// Clave de almacenamiento del objetivo semanal (configuración del usuario,
// independiente de las sesiones). RNF-4: ninguna de estas funciones toca
// la clave `diario-estudio-sesiones`.
const CLAVE_OBJETIVO = "diario-estudio-objetivo";

// Guarda el objetivo semanal del usuario en localStorage.
// RNF-4: solo afecta a `diario-estudio-objetivo`, nunca a las sesiones.
function guardarObjetivo(minutos) {
  localStorage.setItem(CLAVE_OBJETIVO, JSON.stringify(minutos));
}

// Lee e interpreta el objetivo guardado.
// RNF-5: si no hay nada guardado, si el dato está corrupto o no es un entero
// positivo, devuelve null (se trata como "sin objetivo") sin lanzar.
// Reutiliza `esObjetivoValido` (RF-1, RF-2): el mismo criterio al escribir y
// al leer, así que un objetivo nunca se valida de dos maneras distintas.
function cargarObjetivo() {
  try {
    const datos = localStorage.getItem(CLAVE_OBJETIVO);
    if (!datos) return null;
    // "abc", "3.5", "1e3", "0", "-1"... -> null sin lanzar error.
    if (!esObjetivoValido(datos)) return null;
    return JSON.parse(datos);
  } catch {
    return null;
  }
}

// Quita el objetivo guardado (vuelve al estado "sin objetivo").
function eliminarObjetivo() {
  localStorage.removeItem(CLAVE_OBJETIVO);
}

// ----- Fechas (siempre en local, nunca UTC) -----

// Convierte un objeto Date a "YYYY-MM-DD" según la fecha local del usuario
function formatoFechaLocal(fecha) {
  const anio = fecha.getFullYear();
  const mes = String(fecha.getMonth() + 1).padStart(2, "0");
  const dia = String(fecha.getDate()).padStart(2, "0");
  return `${anio}-${mes}-${dia}`;
}

// Suma (o resta) días a una fecha "YYYY-MM-DD"
function sumarDias(fechaTexto, dias) {
  const [anio, mes, dia] = fechaTexto.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  fecha.setDate(fecha.getDate() + dias);
  return formatoFechaLocal(fecha);
}

// ----- Rachas -----

function calcularRacha(sesiones) {
  const fechasConSesion = new Set(sesiones.map(obtenerFecha));

  const hoy = formatoFechaLocal(new Date());
  const ayer = sumarDias(hoy, -1);

  let puntoDePartida = hoy;

  // Si hoy no has estudiado pero ayer sí, la racha sigue viva
  if (!fechasConSesion.has(hoy)) {
    if (fechasConSesion.has(ayer)) {
      puntoDePartida = ayer;
    } else {
      return 0;
    }
  }

  // Cuenta días consecutivos hacia atrás desde el punto de partida
  let racha = 0;
  let diaActual = puntoDePartida;
  while (fechasConSesion.has(diaActual)) {
    racha++;
    diaActual = sumarDias(diaActual, -1);
  }
  return racha;
}

function calcularMejorRacha(sesiones) {
  if (sesiones.length === 0) return 0;

  const hoy = formatoFechaLocal(new Date());

  // Fechas únicas sin contar fechas futuras
  const fechasUnicas = [...new Set(sesiones.map(obtenerFecha))]
    .filter((fecha) => fecha <= hoy)
    .sort();

  if (fechasUnicas.length === 0) return 0;

  let mejorRacha = 1;
  let rachaActual = 1;

  for (let i = 1; i < fechasUnicas.length; i++) {
    const fechaAnterior = fechasUnicas[i - 1];
    const fechaEsperada = sumarDias(fechaAnterior, 1);

    if (fechasUnicas[i] === fechaEsperada) {
      rachaActual++;
    } else {
      rachaActual = 1;
    }

    if (rachaActual > mejorRacha) {
      mejorRacha = rachaActual;
    }
  }

  // Si la racha actual está activa hoy o desde ayer, se compara también
  const rachaActiva = calcularRacha(sesiones);
  return Math.max(mejorRacha, rachaActiva);
}

// ----- Progreso Semanal -----

// Obtiene la fecha "YYYY-MM-DD" del lunes de la semana que contiene hoy (texto "YYYY-MM-DD")
function obtenerLunesSemana(hoy) {
  const [anio, mes, dia] = hoy.split("-").map(Number);
  const fecha = new Date(anio, mes - 1, dia);
  const diaSemana = fecha.getDay(); // 0 es Domingo, 1 es Lunes, etc.

  // En español la semana empieza el lunes (1).
  // Si hoy es domingo (0), el lunes fue hace 6 días.
  // Si hoy es de lunes a sábado (1..6), el lunes fue hace (diaSemana - 1) días.
  const diferenciaDias = diaSemana === 0 ? -6 : 1 - diaSemana;

  return sumarDias(hoy, diferenciaDias);
}

// Obtiene la fecha "YYYY-MM-DD" del lunes de la semana actual (fecha local)
function obtenerLunesSemanaActual() {
  return obtenerLunesSemana(formatoFechaLocal(new Date()));
}

// Formatea minutos a formato legible (ej: 135 -> "2h 15m", 45 -> "45 min")
function formatearTiempo(minutosTotales) {
  if (minutosTotales < 60) {
    return `${minutosTotales} min`;
  }
  const horas = Math.floor(minutosTotales / 60);
  const minutos = minutosTotales % 60;
  return minutos > 0 ? `${horas}h ${minutos}m` : `${horas}h`;
}

// Calcula los minutos totales estudiados esta semana (de lunes a domingo, fecha local)
function calcularMinutosSemana(sesiones) {
  const hoy = formatoFechaLocal(new Date());
  const lunes = obtenerLunesSemanaActual();
  const domingo = sumarDias(lunes, 6);

  let totalMinutos = 0;
  sesiones.forEach((sesion) => {
    const fecha = obtenerFecha(sesion);
    // Filtrar sesiones de esta semana (lunes <= fecha <= domingo) hasta hoy
    if (fecha >= lunes && fecha <= domingo && fecha <= hoy) {
      totalMinutos += obtenerMinutos(sesion);
    }
  });

  return totalMinutos;
}

// Calcula los minutos acumulados de la semana actual hasta hoy.
// RF-3, RF-6, RF-11: suma las sesiones de la semana actual (lunes -> domingo)
// cuya fecha sea igual o anterior a hoy. Las fechas futuras no cuentan.
// Pura: recibe 'sesiones' y 'hoy' como parámetros; no construye fechas internas
// (no hay new Date()), no toca DOM ni localStorage.
function calcularMinutosSemanaHastaHoy(sesiones, hoy) {
  const lunes = obtenerLunesSemana(hoy);

  let totalMinutos = 0;
  sesiones.forEach((sesion) => {
    const fecha = obtenerFecha(sesion);
    // Solo cuenta dentro del rango lunes..hoy (incluidos); las sesiones futuras se descartan.
    if (fecha >= lunes && fecha <= hoy) {
      totalMinutos += obtenerMinutos(sesion);
    }
  });

  return totalMinutos;
}

// Calcula el porcentaje mostrado del progreso semanal.
// RF-4: formula exacta Math.round(minutosAcumulados / objetivo * 100),
// limitado al rango [0, 100] para que nunca sea negativo ni desborde la barra.
// Pura: solo opera con números.
function calcularProgresoPorcentaje(minutosAcumulados, objetivo) {
  const porcentaje = Math.round(minutosAcumulados / objetivo * 100);
  return Math.max(0, Math.min(100, porcentaje));
}

// Calcula el estado del objetivo semanal según los minutos exactos, nunca por el
// porcentaje mostrado.
// RF-5:
//   - exactamente igual al objetivo -> 'alcanzado'
//   - estrictamente mayor -> 'superado'
//   - menor -> 'adelante'
// Ejemplo clave (RF-5): 299 min con meta 300 -> 'adelante', aunque el % redondee a 100.
// Pura: solo opera con números.
function calcularEstado(minutosAcumulados, objetivo) {
  if (minutosAcumulados === objetivo) {
    return "alcanzado";
  }
  if (minutosAcumulados > objetivo) {
    return "superado";
  }
  return "adelante";
}

// Valida la entrada del objetivo semanal (RF-1, RF-2, RF-12).
// Pura: solo opera con el valor recibido.
// Devuelve true solo si es un número entero positivo mayor que 0.
// Rechaza: vacío, texto, decimales, notación científica (1e3), 0 y negativos.
function esObjetivoValido(valor) {
  // Convertimos a cadena para inspeccionar la notación científica ANTES de
  // convertir: Number("1e3") === 1000 y pasaría como un entero válido.
  let cadena = typeof valor === "string" ? valor : String(valor);
  // RF-2: notación científica (1e3, 2E2, 1e10, ...) -> siempre rechazada.
  if (cadena.toLowerCase().includes("e")) {
    return false;
  }
  // Quitamos espacios en los extremos.
  cadena = cadena.trim();
  // RF-2: vacío o solo espacios -> no válido.
  if (cadena === "") {
    return false;
  }
  // Convertimos y verificamos: debe ser un número entero.
  const numero = Number(cadena);
  if (!Number.isInteger(numero)) {
    return false;
  }
  // RF-1: entero positivo > 0 (el 0 y los negativos no valen).
  // RF-12: sin tope máximo -> no hay límite superior.
  return numero > 0;
}

// Calcula cuántos días únicos se ha estudiado este mes hasta hoy
function calcularDiasMes(sesiones) {
  const hoyTexto = formatoFechaLocal(new Date());
  const anioMesActual = hoyTexto.slice(0, 7); // "YYYY-MM"

  const fechasUnicas = new Set();
  sesiones.forEach((sesion) => {
    const fecha = obtenerFecha(sesion);
    // Solo días de este mes y que no sean futuros
    if (fecha.startsWith(anioMesActual) && fecha <= hoyTexto) {
      fechasUnicas.add(fecha);
    }
  });

  return fechasUnicas.size;
}

// ----- Mapa de calor (8 semanas: actual + 7 anteriores) -----

// Suma los minutos por día a partir de las sesiones (formato legado incluido)
function sumarMinutosPorDia(sesiones) {
  const totales = {};
  sesiones.forEach((sesion) => {
    const fecha = obtenerFecha(sesion);
    totales[fecha] = (totales[fecha] || 0) + obtenerMinutos(sesion);
  });
  return totales;
}

// Nivel de color por minutos del día: 0 (0 min), 1 (1-30), 2 (31-60), 3 (61-90), 4 (>90)
function calcularNivel(minutos) {
  if (minutos <= 0) return 0;
  if (minutos <= 30) return 1;
  if (minutos <= 60) return 2;
  if (minutos <= 90) return 3;
  return 4;
}

// Construye la cuadrícula: 8 semanas (actual + 7 anteriores), lunes arriba.
// hoy es un texto "AAAA-MM-DD" (fecha local, sin construir desde milisegundos)
function construirSemanasMapa(sesiones, hoy) {
  const totalesPorDia = sumarMinutosPorDia(sesiones);
  const lunesFin = obtenerLunesSemana(hoy); // lunes de la semana actual
  const lunesInicio = sumarDias(lunesFin, -49); // 7 semanas atrás

  const semanas = [];
  for (let semana = 0; semana < 8; semana++) {
    const lunesSemana = sumarDias(lunesInicio, semana * 7);
    const dias = [];
    for (let dia = 0; dia < 7; dia++) {
      const fecha = sumarDias(lunesSemana, dia);
      const esFutura = fecha > hoy;
      const minutos = esFutura ? 0 : totalesPorDia[fecha] || 0;
      dias.push({
        fecha,
        minutos,
        nivel: esFutura ? null : calcularNivel(minutos),
        esFutura,
      });
    }
    semanas.push(dias);
  }
  return semanas;
}

// Formatea "AAAA-MM-DD" como fecha larga en español, p. ej. "jueves, 2 de octubre de 2026"
function formatearFechaLarga(fecha) {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return new Intl.DateTimeFormat("es-ES", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(anio, mes - 1, dia));
}

// ----- Renderizado -----

function mostrarRachas(sesiones) {
  rachaNumero.textContent = calcularRacha(sesiones);
  mejorRachaNumero.textContent = calcularMejorRacha(sesiones);
}

function mostrarMinutosSemana(sesiones) {
  minutosSemana.textContent = formatearTiempo(calcularMinutosSemana(sesiones));
}

function mostrarDiasMes(sesiones) {
  const conteo = calcularDiasMes(sesiones);
  diasMes.textContent = conteo === 1 ? "1 día" : `${conteo} días`;
}

// Pinta la cuadrícula del mapa de calor: 6 columnas × 7 filas, lunes arriba
function mostrarMapa(sesiones) {
  const hoy = formatoFechaLocal(new Date());
  const semanas = construirSemanasMapa(sesiones, hoy);

  mapaGrid.innerHTML = "";
  semanas.forEach((semana) => {
    semana.forEach((diaDelMes) => {
      const celda = document.createElement("button");
      celda.type = "button";
      celda.className = "mapa__celda";
      celda.dataset.fecha = diaDelMes.fecha;
      if (diaDelMes.esFutura) {
        // Hueca y sin interacción (incluso Tab la salta)
        celda.disabled = true;
        celda.dataset.futura = "1";
      } else {
        celda.classList.add(`nivel-${diaDelMes.nivel}`);
        celda.setAttribute(
          "aria-label",
          diaDelMes.minutos > 0
            ? `${formatearFechaLarga(diaDelMes.fecha)}: ${formatearTiempo(diaDelMes.minutos)}`
            : `Sin estudio el ${formatearFechaLarga(diaDelMes.fecha)}`
        );
      }
      mapaGrid.appendChild(celda);
    });
  });

  // Estado vacío: mapa pintado en nivel 0 con mensaje invitando a registrar
  mensajeMapaVacio.style.display = sesiones.length === 0 ? "block" : "none";

  // Detalle: vacío al redibujar el mapa
  mapaDetalle.textContent = "";
  mapaGrid.querySelectorAll(".mapa__celda").forEach((c) => {
    c.removeAttribute("aria-pressed");
  });
}

// Interacción: tocar un día con color muestra su detalle; tocarlo de nuevo lo cierra
function activarDetalleDia(celda) {
  const yaActiva = celda.classList.contains("mapa__celda--activa");
  // Desactiva la que estuviera activa (si la hubiera)
  const anterior = mapaGrid.querySelector(".mapa__celda--activa");
  if (anterior) anterior.classList.remove("mapa__celda--activa");

  if (yaActiva) {
    mapaDetalle.textContent = "";
    return;
  }

  celda.classList.add("mapa__celda--activa");
  const fecha = celda.dataset.fecha;
  const sesiones = cargarSesiones();
  const minutosDia = sesiones
    .filter((s) => obtenerFecha(s) === fecha)
    .reduce((s, ss) => s + obtenerMinutos(ss), 0);

  mapaDetalle.textContent =
    minutosDia > 0
      ? `${formatearFechaLarga(fecha)}: ${formatearTiempo(minutosDia)}`
      : `Sin estudio el ${formatearFechaLarga(fecha)}.`;
}

mapaGrid.addEventListener("click", (evento) => {
  const celda = evento.target.closest(".mapa__celda");
  if (celda && !celda.disabled) activarDetalleDia(celda);
});

function mostrarSesiones(sesiones) {
  listaSesiones.innerHTML = "";

  if (sesiones.length === 0) {
    mensajeVacio.style.display = "block";
    return;
  }

  mensajeVacio.style.display = "none";

  // Ordena de la más reciente a la más antigua
  const ordenadas = [...sesiones].sort((a, b) =>
    obtenerFecha(b).localeCompare(obtenerFecha(a))
  );

  ordenadas.forEach((sesion) => {
    const item = document.createElement("li");

    const info = document.createElement("div");
    const tema = document.createElement("span");
    tema.className = "sesion__tema";
    tema.textContent = obtenerTema(sesion);

    const fecha = document.createElement("span");
    fecha.className = "sesion__fecha";
    fecha.textContent = " · " + obtenerFecha(sesion);
    fecha.style.display = "block";

    const minutos = document.createElement("span");
    minutos.className = "sesion__minutos";
    minutos.textContent = `${obtenerMinutos(sesion)} min`;

    info.appendChild(tema);
    info.appendChild(fecha);
    item.appendChild(info);
    item.appendChild(minutos);
    listaSesiones.appendChild(item);
  });
}

// ----- Objetivo semanal: barra de avance y estado (RF-3, RF-4, RF-5, RF-10, RF-11) -----

// Devuelve el mensaje que se escribe bajo la barra según el estado (RF-5).
// Con 'adelante' no hay mensaje: todavía no se ha llegado a la meta.
function mensajeEstadoObjetivo(estado) {
  if (estado === "alcanzado") return "Objetivo alcanzado";
  if (estado === "superado") return "¡Objetivo superado!";
  return "";
}

// Pinta el bloque de avance del objetivo semanal.
// RF-3: con objetivo, muestra la meta, la barra y el porcentaje en texto ("75 %").
// RF-4: el ancho de la barra es el porcentaje mostrado, siempre entre 0 y 100 %.
// RF-5: el estado se decide por minutos exactos (no por el porcentaje redondeado).
// RF-10: sin objetivo, oculta el bloque y el botón ofrece "Fijar objetivo".
// RF-11: sin minutos esta semana, muestra 0 % con la barra vacía, sin error.
function mostrarObjetivoYProgreso(sesiones, hoy, objetivo) {
  if (objetivo === null) {
    bloqueObjetivo.hidden = true;
    botonFijarObjetivo.textContent = "Fijar objetivo";
    return;
  }

  // 'hoy' llega como texto "AAAA-MM-DD" (fecha local), nunca como Date en UTC.
  const minutos = calcularMinutosSemanaHastaHoy(sesiones, hoy);
  const porcentaje = calcularProgresoPorcentaje(minutos, objetivo);
  const estado = calcularEstado(minutos, objetivo);

  bloqueObjetivo.hidden = false;
  botonFijarObjetivo.textContent = "Editar objetivo"; // RF-9
  // El CSS pinta 'alcanzado' y 'superado' según este atributo (contrato de T6).
  bloqueObjetivo.dataset.estado = estado;

  objetivoMinutos.textContent = `${objetivo} min`;
  barraObjetivo.style.width = `${porcentaje}%`;
  porcentajeObjetivo.textContent = `${porcentaje} %`;
  estadoObjetivo.textContent = mensajeEstadoObjetivo(estado);

  // El role="progressbar" también comunica el valor a lectores de pantalla.
  const barraProgreso = bloqueObjetivo.querySelector(".progreso");
  if (barraProgreso) {
    barraProgreso.setAttribute("aria-valuenow", porcentaje);
  }
}

// Repinta el bloque objetivo con lo que hay guardado ahora mismo.
// "hoy" se construye en fecha local con formatoFechaLocal(), como el resto de métricas.
function pintarObjetivoActual() {
  mostrarObjetivoYProgreso(
    cargarSesiones(),
    formatoFechaLocal(new Date()),
    cargarObjetivo()
  );
}

function actualizarInterfaz() {
  const sesiones = cargarSesiones();
  mostrarRachas(sesiones);
  mostrarMinutosSemana(sesiones);
  // RF-3: el bloque objetivo se refresca aquí, junto a "Estudio esta semana",
  // para que la barra, el % y el estado no esperen a recargar la página al
  // añadir, editar o borrar una sesión. No repite la métrica de minutos: solo
  // la complementa (meta y avance). "hoy" se construye en fecha local.
  mostrarObjetivoYProgreso(sesiones, formatoFechaLocal(new Date()), cargarObjetivo());
  mostrarDiasMes(sesiones);
  mostrarMapa(sesiones);
  mostrarSesiones(sesiones);
}

// ----- Formulario -----

formulario.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const fecha = inputFecha.value;
  const tema = inputTema.value.trim();
  const minutos = Number(inputMinutos.value);

  if (minutos <= 0) {
    alert("Los minutos deben ser mayores que 0.");
    return;
  }

  const sesiones = cargarSesiones();
  sesiones.push({ date: fecha, topic: tema, minutes: minutos });
  guardarSesiones(sesiones);

  formulario.reset();
  inputFecha.value = formatoFechaLocal(new Date());

  actualizarInterfaz();
});

// ----- Objetivo semanal: formulario desplegable (RF-1, RF-2, RF-9, RF-10) -----

// Cierra el formulario y borra el mensaje de error. No guarda ni cambia nada.
function cerrarFormularioObjetivo() {
  formularioObjetivo.hidden = true;
  errorObjetivo.hidden = true;
  errorObjetivo.textContent = "";
}

// Abre o cierra el formulario (RF-9, RF-10).
// Si ya estaba abierto, el botón lo cierra sin guardar los cambios.
function alternarFormularioObjetivo() {
  if (!formularioObjetivo.hidden) {
    cerrarFormularioObjetivo();
    return;
  }

  // Al abrirlo, el campo viene relleno con el objetivo actual (RF-9);
  // si no hay objetivo, se muestra vacío para escribir uno nuevo.
  const objetivo = cargarObjetivo();
  minutosObjetivo.value = objetivo === null ? "" : objetivo;

  errorObjetivo.hidden = true;
  errorObjetivo.textContent = "";
  formularioObjetivo.hidden = false;
}

// Guarda el objetivo escrito en el formulario (RF-1, RF-2, RF-8, RF-12).
function guardarMetaDesdeFormulario() {
  const valor = minutosObjetivo.value;

  // RF-2: si no es un entero mayor que 0 (vacío, texto, decimal, "1e3", 0 o
  // negativo) se avisa en español y el objetivo anterior se queda como estaba.
  if (!esObjetivoValido(valor)) {
    errorObjetivo.textContent = "Los minutos deben ser un número entero mayor que 0";
    errorObjetivo.hidden = false;
    return;
  }

  guardarObjetivo(Number(valor)); // RNF-4: solo escribe en la clave del objetivo
  cerrarFormularioObjetivo();
  pintarObjetivoActual();
}

// Quita el objetivo y vuelve al estado sin objetivo (RF-9, RF-10).
function eliminarMeta() {
  eliminarObjetivo(); // RNF-4: no toca las sesiones
  cerrarFormularioObjetivo();
  pintarObjetivoActual();
}

botonFijarObjetivo.addEventListener("click", alternarFormularioObjetivo);

formularioObjetivo.addEventListener("submit", (evento) => {
  evento.preventDefault();
  guardarMetaDesdeFormulario();
});

botonEliminarObjetivo.addEventListener("click", eliminarMeta);

// ----- Inicio -----

inputFecha.value = formatoFechaLocal(new Date());
// Un solo punto de refresco: actualizarInterfaz() pinta también el bloque
// objetivo al cargar, así que no hace falta llamarlo aparte aquí.
actualizarInterfaz();

// ----- Exportaciones para testeo con `node --test` (lógica pura) ----------
// El navegador no entra aquí (en un script plano `module` no existe), así que
// esto no afecta a index.html; en Node expone las funciones para los tests.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    CLAVE_OBJETIVO,
    obtenerLunesSemana,
    calcularMinutosSemanaHastaHoy,
    calcularProgresoPorcentaje,
    calcularEstado,
    esObjetivoValido,
    cargarObjetivo,
    eliminarObjetivo,
    guardarObjetivo,
  };
}
