// test/test-objetivo.js
// Tests unitarios de la Spec 002 (Objetivo semanal de estudio) - tareas T1 a T4.
// Se ejecutan con: node --test test/test-objetivo.js
//
// app.js depende de la API del navegador, así que se simula un entorno DOM
// mínimo ANTES de cargarlo, para que el módulo se ejecute sin errores en Node.

// ---------- Entorno DOM mínimo (solo lo que app.js necesita al cargarse) ----------
function crearElementoFalso() {
  return {
    addEventListener() {},
    removeEventListener() {},
    get value() { return this._valor || ""; },
    set value(v) { this._valor = String(v); },
    get textContent() { return this._textContent || ""; },
    set textContent(v) { this._textContent = String(v); },
    get style() { return this._style || {}; },
    set style(v) { this._style = v; },
    get className() { return this._className || ""; },
    set className(v) { this._className = String(v); },
    get innerHTML() { return this._innerHTML || ""; },
    set innerHTML(v) { this._innerHTML = String(v); },
    get disabled() { return this._disabled || false; },
    set disabled(v) { this._disabled = Boolean(v); },
    get dataset() { return this._dataset || {}; },
    set dataset(v) { this._dataset = v; },
    get classList() {
      return this._classList || { add() {}, remove() {}, contains() { return false; }, toggle() {} };
    },
    set classList(v) { this._classList = v; },
    appendChild() {},
    removeChild() {},
    setAttribute() {},
    removeAttribute() {},
    querySelector() { return null; },
    querySelectorAll() { return []; },
  };
}

global.document = {
  getElementById() { return crearElementoFalso(); },
  createElement() { return crearElementoFalso(); },
};

// Simular localStorage (no existe en Node): vacío por defecto.
global.localStorage = {
  store: {},
  getItem(key) { return this.store[key] || null; },
  setItem(key, value) { this.store[key] = String(value); },
  removeItem(key) { delete this.store[key]; },
  clear() { this.store = {}; },
};

// ---------- Cargar app.js (lógica) ----------
const { test } = require("node:test");
const assert = require("node:assert");
const app = require("../app.js");

// ---------- Datos de prueba ----------
// Hoy: domingo 2026-10-04. Semana en análisis: lunes 28/09 - domingo 04/10.
const SESIONES_EN_SEMANA = [
  { date: "2026-09-28", topic: "Matemáticas", minutes: 60 },
  { date: "2026-09-29", topic: "Física", minutes: 45 },
  { date: "2026-10-01", topic: "Historia", minutes: 90 },
  { date: "2026-10-03", topic: "Biología", minutes: 30 },
  { date: "2026-10-04", topic: "Química", minutes: 75 },
];
// total = 60 + 45 + 90 + 30 + 75 = 300

const SESION_SEMANA_ANTERIOR = { date: "2026-09-21", topic: "Repaso", minutes: 60 };
const SESION_FUTURA = { date: "2026-10-06", topic: "Anticipado", minutes: 120 };

// ---------- T1: calcularMinutosSemanaHastaHoy (RF-3, RF-6, RF-11) ----------

test("T1-obtenerLunesSemana: hoy 2026-10-04 (domingo) tiene lunes 2026-09-28", () => {
  assert.strictEqual(app.obtenerLunesSemana("2026-10-04"), "2026-09-28");
});

test("T1-calcularMinutosSemanaHastaHoy: sesiones de la semana suman 300", () => {
  assert.strictEqual(
    app.calcularMinutosSemanaHastaHoy(SESIONES_EN_SEMANA, "2026-10-04"),
    300
  );
});

test("T1-calcularMinutosSemanaHastaHoy: sesión de la semana anterior (21/09) no suma -> 0", () => {
  const sesiones = [SESION_SEMANA_ANTERIOR];
  assert.strictEqual(
    app.calcularMinutosSemanaHastaHoy(sesiones, "2026-10-04"),
    0
  );
});

test("T1-calcularMinutosSemanaHastaHoy: sesión futura (06/10) no suma -> 0", () => {
  const sesiones = [SESION_FUTURA];
  assert.strictEqual(
    app.calcularMinutosSemanaHastaHoy(sesiones, "2026-10-04"),
    0
  );
});

test("T1-calcularMinutosSemanaHastaHoy: sin sesiones -> 0", () => {
  assert.strictEqual(
    app.calcularMinutosSemanaHastaHoy([], "2026-10-04"),
    0
  );
});

test("T1-calcularMinutosSemanaHastaHoy: varias sesiones el mismo día suman", () => {
  const sesiones = [
    { date: "2026-10-02", topic: "Día 1", minutes: 40 },
    { date: "2026-10-02", topic: "Día 1 (otra)", minutes: 50 },
  ];
  assert.strictEqual(app.calcularMinutosSemanaHastaHoy(sesiones, "2026-10-04"), 90);
});

test("T1-calcularMinutosSemanaHastaHoy: límite inferior (lunes 28/09) sí cuenta", () => {
  const sesiones = [{ date: "2026-09-28", topic: "x", minutes: 20 }];
  assert.strictEqual(app.calcularMinutosSemanaHastaHoy(sesiones, "2026-10-04"), 20);
});

test("T1-calcularMinutosSemanaHastaHoy: límite superior anterior (domingo 27/09) no cuenta", () => {
  const sesiones = [{ date: "2026-09-27", topic: "x", minutes: 20 }];
  assert.strictEqual(app.calcularMinutosSemanaHastaHoy(sesiones, "2026-10-04"), 0);
});

test("T1-calcularMinutosSemanaHastaHoy: sesión de hoy (2026-10-04) sí cuenta", () => {
  const sesiones = [{ date: "2026-10-04", topic: "x", minutes: 50 }];
  assert.strictEqual(app.calcularMinutosSemanaHastaHoy(sesiones, "2026-10-04"), 50);
});

test("T1-calcularMinutosSemanaHastaHoy: hoy inyectado, la función no construye fechas internas", () => {
  // Misma semana, hoy = lunes 2026-09-28: solo el lunes de SESIONES_EN_SEMANA cuenta.
  assert.strictEqual(app.calcularMinutosSemanaHastaHoy(SESIONES_EN_SEMANA, "2026-09-28"), 60);
  assert.strictEqual(app.calcularMinutosSemanaHastaHoy(SESIONES_EN_SEMANA, "2026-09-29"), 105);
});

test("T1-calcularMinutosSemanaHastaHoy: soporta formato de sesión legado { fecha, minutos }", () => {
  const sesiones = [
    { fecha: "2026-10-03", minutos: 45 },
    { fecha: "2026-10-04", minutos: 15 },
  ];
  assert.strictEqual(app.calcularMinutosSemanaHastaHoy(sesiones, "2026-10-04"), 60);
});

// ---------- T2: calcularProgresoPorcentaje (RF-4) y calcularEstado (RF-5) ----------

test("T2-calcularProgresoPorcentaje: 0/300 -> 0", () => {
  assert.strictEqual(app.calcularProgresoPorcentaje(0, 300), 0);
});

test("T2-calcularProgresoPorcentaje: 150/300 -> 50", () => {
  assert.strictEqual(app.calcularProgresoPorcentaje(150, 300), 50);
});

test("T2-calcularProgresoPorcentaje: 299/300 -> 100 (redondeo 99,67%)", () => {
  assert.strictEqual(app.calcularProgresoPorcentaje(299, 300), 100);
});

test("T2-calcularProgresoPorcentaje: 300/300 -> 100", () => {
  assert.strictEqual(app.calcularProgresoPorcentaje(300, 300), 100);
});

test("T2-calcularProgresoPorcentaje: 600/300 -> 100 (clamp, no desborda)", () => {
  assert.strictEqual(app.calcularProgresoPorcentaje(600, 300), 100);
});

test("T2-calcularProgresoPorcentaje: meta 1 con 1 min -> 100", () => {
  assert.strictEqual(app.calcularProgresoPorcentaje(1, 1), 100);
});

test("T2-calcularProgresoPorcentaje: meta 1 con 2 min -> 100 (clamp)", () => {
  assert.strictEqual(app.calcularProgresoPorcentaje(2, 1), 100);
});

test("T2-calcularProgresoPorcentaje: 1/300 -> 0 (redondeo a cero, no negativo)", () => {
  assert.strictEqual(app.calcularProgresoPorcentaje(1, 300), 0);
});

test("T2-calcularEstado: 299/300 -> 'adelante' (no 'alcanzado' aunque el % redondee a 100)", () => {
  assert.strictEqual(app.calcularEstado(299, 300), "adelante");
});

test("T2-calcularEstado: 300/300 -> 'alcanzado' (minutos exactos)", () => {
  assert.strictEqual(app.calcularEstado(300, 300), "alcanzado");
});

test("T2-calcularEstado: 301/300 -> 'superado' (estrictamente mayor)", () => {
  assert.strictEqual(app.calcularEstado(301, 300), "superado");
});

test("T2-calcularEstado: 0/300 -> 'adelante'", () => {
  assert.strictEqual(app.calcularEstado(0, 300), "adelante");
});

test("T2-calcularEstado: meta 1 con 1 min -> 'alcanzado'", () => {
  assert.strictEqual(app.calcularEstado(1, 1), "alcanzado");
});

test("T2-calcularEstado: meta 1 con 2 min -> 'superado'", () => {
  assert.strictEqual(app.calcularEstado(2, 1), "superado");
});

test("T2-calcularEstado: meta 1 con 0 min -> 'adelante'", () => {
  assert.strictEqual(app.calcularEstado(0, 1), "adelante");
});

// ---------- T3: esObjetivoValido (RF-1, RF-2, RF-12) ----------

test("T3-esObjetivoValido: '300' es valido", () => {
  assert.strictEqual(app.esObjetivoValido("300"), true);
});

test("T3-esObjetivoValido: '100000' es valido (sin tope maximo, RF-12)", () => {
  assert.strictEqual(app.esObjetivoValido("100000"), true);
});

test("T3-esObjetivoValido: cadena vacia -> false", () => {
  assert.strictEqual(app.esObjetivoValido(""), false);
});

test("T3-esObjetivoValido: texto no numerico -> false", () => {
  assert.strictEqual(app.esObjetivoValido("abc"), false);
});

test("T3-esObjetivoValido: decimal '3.5' -> false", () => {
  assert.strictEqual(app.esObjetivoValido("3.5"), false);
});

test("T3-esObjetivoValido: notacion cientifica '1e3' -> false (detectada antes de convertir)", () => {
  assert.strictEqual(app.esObjetivoValido("1e3"), false);
});

test("T3-esObjetivoValido: notacion cientifica '2e2' -> false (detectada antes de convertir)", () => {
  assert.strictEqual(app.esObjetivoValido("2e2"), false);
});

test("T3-esObjetivoValido: notacion cientifica mayusculas '2E2' -> false", () => {
  assert.strictEqual(app.esObjetivoValido("2E2"), false);
});

test("T3-esObjetivoValido: cero '0' -> false (debe ser > 0)", () => {
  assert.strictEqual(app.esObjetivoValido("0"), false);
});

test("T3-esObjetivoValido: negativo '-5' -> false", () => {
  assert.strictEqual(app.esObjetivoValido("-5"), false);
});

test("T3-esObjetivoValido: solo espacios -> false", () => {
  assert.strictEqual(app.esObjetivoValido("  "), false);
});

test("T3-esObjetivoValido: espacios en los extremos se trimpean -> true", () => {
  assert.strictEqual(app.esObjetivoValido("  300  "), true);
});

test("T3-esObjetivoValido: notacion cientifica '1e10' -> false", () => {
  assert.strictEqual(app.esObjetivoValido("1e10"), false);
});

test("T3-esObjetivoValido: valor numerico valido 300 -> true", () => {
  assert.strictEqual(app.esObjetivoValido(300), true);
});

test("T3-esObjetivoValido: valor numerico cero -> false", () => {
  assert.strictEqual(app.esObjetivoValido(0), false);
});

// ---------- T4: persistencia del objetivo (RF-8, RF-10, RNF-4, RNF-5) ----------
//
// app.js resuelve `localStorage` en el ámbito global en cada llamada, así que
// cada test de T4 sustituye global.localStorage por su propio almacén aislado:
// un test nunca ve lo que dejó otro y el estado real del navegador no se toca.

const CLAVE_SESIONES = "diario-estudio-sesiones";

// Almacén simulado con las mismas reglas que el localStorage del navegador:
// los valores se guardan como texto y getItem devuelve null si no existe.
function crearAlmacenAislado() {
  const datos = new Map();
  return {
    getItem(key) {
      return datos.has(key) ? datos.get(key) : null;
    },
    setItem(key, value) {
      datos.set(key, String(value));
    },
    removeItem(key) {
      datos.delete(key);
    },
    clear() {
      datos.clear();
    },
    // Ayudas solo para los asserts.
    leer() {
      return Object.fromEntries(datos);
    },
  };
}

// Crea un almacén nuevo, con las sesiones ya guardadas, y lo pone en global.
function prepararAlmacenConSesiones() {
  const almacen = crearAlmacenAislado();
  almacen.setItem(CLAVE_SESIONES, JSON.stringify(SESIONES_EN_SEMANA));
  global.localStorage = almacen;
  return almacen;
}

test("T4-CLAVE_OBJETIVO: la clave del objetivo es 'diario-estudio-objetivo'", () => {
  assert.strictEqual(app.CLAVE_OBJETIVO, "diario-estudio-objetivo");
});

test("T4-cargarObjetivo: sin nada guardado -> null (sin objetivo)", () => {
  global.localStorage = crearAlmacenAislado();
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-guardarObjetivo: guardar 300 y leerlo devuelve 300 (RF-8)", () => {
  prepararAlmacenConSesiones();
  app.guardarObjetivo(300);
  assert.strictEqual(app.cargarObjetivo(), 300);
});

test("T4-guardarObjetivo: el objetivo se guarda en su propia clave, como texto JSON", () => {
  const almacen = prepararAlmacenConSesiones();
  app.guardarObjetivo(300);

  const guardado = almacen.leer();
  // El valor guardado es el número 300 en texto JSON.
  assert.strictEqual(guardado[app.CLAVE_OBJETIVO], "300");
  // Y va en su propia clave, no dentro del array de sesiones.
  assert.ok(!guardado[app.CLAVE_OBJETIVO].includes("date"));
  assert.deepStrictEqual(Object.keys(guardado), [CLAVE_SESIONES, app.CLAVE_OBJETIVO]);
});

test("T4-eliminarObjetivo: eliminar vuelve al estado sin objetivo -> null", () => {
  prepararAlmacenConSesiones();
  app.guardarObjetivo(300);
  assert.strictEqual(app.cargarObjetivo(), 300);

  app.eliminarObjetivo();
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-eliminarObjetivo: elimina la clave del objetivo del almacén", () => {
  const almacen = prepararAlmacenConSesiones();
  app.guardarObjetivo(300);
  app.eliminarObjetivo();
  assert.strictEqual(almacen.leer()["diario-estudio-objetivo"], undefined);
});

test("T4-eliminarObjetivo: eliminar sin objetivo guardado no lanza error", () => {
  prepararAlmacenConSesiones();
  assert.doesNotThrow(() => app.eliminarObjetivo());
  assert.strictEqual(app.cargarObjetivo(), null);
});

// RNF-5: datos corruptos -> se tratan como "sin objetivo", sin romper la página.
test("T4-cargarObjetivo: valor corrupto 'abc' -> null sin lanzar", () => {
  const almacen = prepararAlmacenConSesiones();
  almacen.setItem("diario-estudio-objetivo", "abc");
  assert.doesNotThrow(() => app.cargarObjetivo());
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-cargarObjetivo: texto JSON '\"abc\"' -> null sin lanzar", () => {
  const almacen = prepararAlmacenConSesiones();
  almacen.setItem("diario-estudio-objetivo", JSON.stringify("abc"));
  assert.doesNotThrow(() => app.cargarObjetivo());
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-cargarObjetivo: decimal '3.5' -> null sin lanzar", () => {
  const almacen = prepararAlmacenConSesiones();
  almacen.setItem("diario-estudio-objetivo", "3.5");
  assert.doesNotThrow(() => app.cargarObjetivo());
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-cargarObjetivo: notacion cientifica '1e3' -> null sin lanzar", () => {
  const almacen = prepararAlmacenConSesiones();
  almacen.setItem("diario-estudio-objetivo", "1e3");
  assert.doesNotThrow(() => app.cargarObjetivo());
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-cargarObjetivo: cero '0' -> null sin lanzar", () => {
  const almacen = prepararAlmacenConSesiones();
  almacen.setItem("diario-estudio-objetivo", "0");
  assert.doesNotThrow(() => app.cargarObjetivo());
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-cargarObjetivo: negativo '-1' -> null sin lanzar", () => {
  const almacen = prepararAlmacenConSesiones();
  almacen.setItem("diario-estudio-objetivo", "-1");
  assert.doesNotThrow(() => app.cargarObjetivo());
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-cargarObjetivo: si el almacenamiento falla al leer -> null sin lanzar", () => {
  global.localStorage = {
    getItem() {
      throw new Error("almacenamiento no disponible");
    },
    setItem() {},
    removeItem() {},
  };
  assert.doesNotThrow(() => app.cargarObjetivo());
  assert.strictEqual(app.cargarObjetivo(), null);
});

test("T4-cargarObjetivo: tras un valor corrupto se puede guardar y leer un objetivo valido", () => {
  const almacen = prepararAlmacenConSesiones();
  almacen.setItem("diario-estudio-objetivo", "abc");
  assert.strictEqual(app.cargarObjetivo(), null);

  app.guardarObjetivo(450);
  assert.strictEqual(app.cargarObjetivo(), 450);
});

// RNF-4: guardar, cambiar o eliminar el objetivo no toca las sesiones.
test("T4-RNF-4: guardar el objetivo deja las sesiones intactas", () => {
  const almacen = prepararAlmacenConSesiones();
  const antes = almacen.getItem(CLAVE_SESIONES);

  app.guardarObjetivo(300);

  assert.strictEqual(almacen.getItem(CLAVE_SESIONES), antes);
  assert.deepStrictEqual(JSON.parse(almacen.getItem(CLAVE_SESIONES)), SESIONES_EN_SEMANA);
});

test("T4-RNF-4: eliminar el objetivo deja las sesiones intactas", () => {
  const almacen = prepararAlmacenConSesiones();
  app.guardarObjetivo(300);
  const antes = almacen.getItem(CLAVE_SESIONES);

  app.eliminarObjetivo();

  assert.strictEqual(almacen.getItem(CLAVE_SESIONES), antes);
  assert.deepStrictEqual(JSON.parse(almacen.getItem(CLAVE_SESIONES)), SESIONES_EN_SEMANA);
});

test("T4-RNF-4: el objetivo se conserva cuando se borran todas las sesiones", () => {
  const almacen = prepararAlmacenConSesiones();
  app.guardarObjetivo(300);

  almacen.removeItem(CLAVE_SESIONES);

  assert.strictEqual(app.cargarObjetivo(), 300);
});
