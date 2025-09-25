// --- Estado en memoria ---
const tareas = [];
// Cada tarea: {
//   id: number,
//   titulo: string,
//   descripcion: string | null,
//   estado: "Pendiente" | "En curso" | "Terminada",
//   dificultad: 0 | 1 | 2 | 3 | null,
//   creadaEn: Date,
//   venceEn: Date | null,
//   ultimaEdicion: Date
// }

// --- prompt-sync ---
const prompt = require("prompt-sync")({ sigint: true });

// --- Helpers ---
function pausar() { prompt("\n(Enter para continuar) "); }

function parseFechaInput(s) {
  const raw = String(s ?? "");
  if (raw === " ") return null;        // espacio = borrar fecha (para edición)
  const str = raw.trim();
  if (!str) return null;               // vacío -> el llamador decide mantener
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(str);
  if (!m) return undefined;            // inválida
  const d = new Date(`${m[1]}-${m[2]}-${m[3]}T00:00:00`);
  if (Number.isNaN(d.getTime())) return undefined;
  return d;
}

function formatearFecha(d) { return d ? d.toISOString().slice(0, 10) : "Sin datos"; }

function renderDificultad(n) {
  if (n === null || n === undefined) return "--";
  const total = 3;
  return "★".repeat(n) + "☆".repeat(total - n);
}

function ordenarLista(lista, criterio) {
  const copia = [...lista];
  switch (criterio) {
    case "alfabetico":
      copia.sort((a, b) => a.titulo.localeCompare(b.titulo, "es", { sensitivity: "base" }));
      break;
    case "vence":
      copia.sort((a, b) => {
        const va = a.venceEn ? a.venceEn.getTime() : Number.POSITIVE_INFINITY;
        const vb = b.venceEn ? b.venceEn.getTime() : Number.POSITIVE_INFINITY;
        return va - vb;
      });
      break;
    case "creacion":
      copia.sort((a, b) => a.creadaEn.getTime() - b.creadaEn.getTime());
      break;
  }
  return copia;
}

function mostrarTareas(filtro = "todas", orden = "ninguno") {
  let lista = tareas;
  if (filtro === "pendientes") lista = tareas.filter(t => t.estado === "Pendiente");
  if (filtro === "curso")      lista = tareas.filter(t => t.estado === "En curso");
  if (filtro === "terminadas") lista = tareas.filter(t => t.estado === "Terminada");

  lista = ordenarLista(lista, orden);

  if (lista.length === 0) {
    console.log("\n🤖 No hay tareas para mostrar con ese filtro.");
    return [];
  }

  console.log("\n📋 Lista de tareas:");
  lista.forEach((t, idx) => {
    console.log(
      ` ${idx + 1}. [${t.estado}] ${t.titulo}  (creada: ${formatearFecha(t.creadaEn)} | vence: ${formatearFecha(t.venceEn)})`
    );
  });

  return lista;
}

/* ------------ EDICIÓN (formulario) ------------ */
function editarTareaFormulario(t) {
  console.log(`\nEstás editando la tarea: ${t.titulo}`);
  console.log("\n- Enter mantiene el valor actual.");
  console.log("- Espacio borra el valor (cuando aplica).\n");

  let huboCambios = false;

  // 0) Título (no permitimos vaciarlo)
  const nuevoTitulo = String(prompt("0. Título: ") ?? "");
  if (nuevoTitulo === " ") {
    console.log("🤖 El título no puede quedar vacío. Se mantiene el actual.");
  } else if (nuevoTitulo.trim() !== "") {
    t.titulo = nuevoTitulo.trim();
    huboCambios = true;
  }

  // 1) Descripción
  const nuevaDesc = String(prompt("1. Ingresa la descripción: ") ?? "");
  if (nuevaDesc === " ") {
    t.descripcion = null; huboCambios = true;
  } else if (nuevaDesc.trim() !== "") {
    t.descripcion = nuevaDesc.trim(); huboCambios = true;
  }

  // 2) Estado
  const estIn = String(prompt("2. Estado ([P]endiente / [E]n curso / [T]erminada): ") ?? "").trim().toUpperCase();
  if (estIn) {
    const mapa = { P: "Pendiente", E: "En curso", T: "Terminada", "1": "Pendiente", "2": "En curso", "3": "Terminada" };
    if (mapa[estIn]) { t.estado = mapa[estIn]; huboCambios = true; }
    else { console.log("🤖 Estado inválido. Se mantiene el actual."); }
  }

  // 3) Dificultad
  const difIn = String(prompt("3. Dificultad (0/1/2/3, espacio para borrar): ") ?? "");
  if (difIn === " ") { t.dificultad = null; huboCambios = true; }
  else if (difIn.trim() !== "") {
    if (/^[0-3]$/.test(difIn.trim())) { t.dificultad = Number(difIn.trim()); huboCambios = true; }
    else { console.log("🤖 Dificultad inválida. Se mantiene la anterior."); }
  }

  // 4) Vencimiento
  const venIn = prompt("4. Vencimiento (YYYY-MM-DD, espacio para borrar): ");
  if (venIn === "") {
    // mantener
  } else {
    const parsed = parseFechaInput(venIn);
    if (parsed === undefined) console.log("🤖 Fecha inválida. Se mantiene la anterior.");
    else { t.venceEn = parsed; huboCambios = true; }
  }

  if (huboCambios) {
    t.ultimaEdicion = new Date();
    console.log("\n✅ ¡Datos guardados!");
  } else {
    console.log("\nℹ️  No se realizaron cambios.");
  }
  pausar();
}

/* ------------ DETALLE ------------ */
function verDetalleTarea(t) {
  while (true) {
    console.log("\nEsta es la tarea que elegiste.\n");
    console.log(`  ${t.titulo}\n`);
    console.log(`${t.descripcion || ""}\n`);
    console.log(`  Estado:        ${t.estado}`);
    console.log(`  Dificultad:    ${renderDificultad(t.dificultad)}`);
    console.log(`  Vencimiento:   ${formatearFecha(t.venceEn)}`);
    console.log(`  Creación:      ${formatearFecha(t.creadaEn)}`);
    console.log(`  Última edición:${formatearFecha(t.ultimaEdicion)}\n`);

    const acc = (prompt("Si deseas editarla, presiona E, o presiona 0 para volver: ") || "").trim().toUpperCase();
    if (acc === "0") return;
    if (acc === "E") { editarTareaFormulario(t); continue; }
    console.log("🤖 Entrada no válida.");
  }
}

/* ------------ SUBMENÚ: VER LISTA ------------ */
function verListaTareas() {
  while (true) {
    console.log("\n🤖 '¿Qué tareas deseas ver?'");
    console.log("\n [1] Todas");
    console.log(" [2] Pendientes");
    console.log(" [3] En curso");
    console.log(" [4] Terminadas");
    console.log(" [0] Volver\n");

    const opcion = (prompt(" ") || "").trim();
    if (!/^[0-4]$/.test(opcion)) { console.log("\n🤖 Opción no válida."); continue; }

    const o = Number(opcion);
    if (o === 0) return;

    const mapaFiltro = { 1: "todas", 2: "pendientes", 3: "curso", 4: "terminadas" };

    // Submenú de orden
    let orden = "ninguno";
    while (true) {
      console.log("\n📐 ¿En qué orden querés verlas?");
      console.log(" [1] Alfabético ascendente");
      console.log(" [2] Fecha de vencimiento ascendente");
      console.log(" [3] Fecha de creación ascendente");
      console.log(" [0] Sin orden\n");
      const opOrd = (prompt(" ") || "").trim();
      if (!/^[0-3]$/.test(opOrd)) { console.log("\n🤖 Opción no válida."); continue; }
      const n = Number(opOrd);
      const mapaOrden = { 1: "alfabetico", 2: "vence", 3: "creacion", 0: "ninguno" };
      orden = mapaOrden[n];
      break;
    }

    const lista = mostrarTareas(mapaFiltro[o], orden);
    if (lista.length === 0) { pausar(); continue; }

    // Elegir una tarea para ver detalles
    while (true) {
      const sel = (prompt("\n¿Deseas ver los detalles de alguna?\nIntroduce el número o 0 para volver: ") || "").trim();
      if (!/^\d+$/.test(sel)) { console.log("🤖 Entrada inválida."); continue; }
      const n = Number(sel);
      if (n === 0) break;
      if (n < 1 || n > lista.length) { console.log("🤖 Número fuera de rango."); continue; }

      verDetalleTarea(lista[n - 1]);
      // al volver del detalle, se puede elegir otra o volver
    }
  }
}

/* ------------ BUSCAR (opción 2) ------------ */
function buscarTarea() {
  // 1) Ingresar string de búsqueda
  const q = String(prompt("Introduce el título de una Tarea para buscarla:\n> ") || "")
              .trim().toLowerCase();

  if (!q) {
    console.log("🤖 La búsqueda no puede estar vacía.");
    pausar();
    return;
  }

  // 2) Comparar SOLO con títulos
  const resultados = tareas.filter(t => t.titulo.toLowerCase().includes(q));

  // 3) Si no hay resultados, avisar y volver
  if (resultados.length === 0) {
    console.log("\nNo hay tareas relacionadas con la búsqueda.");
    pausar();
    return;
  }

  // 4) Mostrar listado
  console.log("\nEstas son las tareas relacionadas:");
  resultados.forEach((t, i) => console.log(` ${i + 1}. ${t.titulo}`));

  // 5) Ver detalles o volver
  while (true) {
    const sel = (prompt("\n¿Deseas ver los detalles de alguna?\nIntroduce el número para verla o 0 para volver.\n> ") || "").trim();
    if (!/^\d+$/.test(sel)) { console.log("🤖 Entrada inválida."); continue; }
    const n = Number(sel);
    if (n === 0) return;
    if (n < 1 || n > resultados.length) { console.log("🤖 Número fuera de rango."); continue; }

    verDetalleTarea(resultados[n - 1]);
    // al salir del detalle, permitir elegir otra o volver con 0
  }
}

/* ------------ AGREGAR (opción 3) ------------ */
function agregarTarea() {
  console.log("\nEstás creando una nueva tarea.\n");

  // 1) Título (obligatorio)
  let titulo = "";
  while (true) {
    titulo = String(prompt("1. Ingresa el Título: ") || "").trim();
    if (titulo) break;
    console.log("🤖 El título no puede estar vacío.");
  }

  // 2) Descripción (opcional)
  const descripcion = String(prompt("2. Ingresa la descripción (opcional): ") || "").trim() || null;

  // 3) Estado (opciones acotadas)
  let estado;
  while (true) {
    console.log("3. Estado: [1] Pendiente  [2] En curso  [3] Terminada");
    const estIn = (prompt("> ") || "").trim().toUpperCase();
    const mapa = { "1": "Pendiente", "2": "En curso", "3": "Terminada", P: "Pendiente", E: "En curso", T: "Terminada" };
    if (mapa[estIn]) { estado = mapa[estIn]; break; }
    console.log("🤖 Estado inválido. Elegí 1/2/3 o P/E/T.");
  }

  // 4) Dificultad (0–3, opcional)
  let dificultad = null;
  while (true) {
    const dif = (prompt("4. Dificultad (0/1/2/3, Enter para omitir): ") || "").trim();
    if (dif === "") break;                 // omitir
    if (/^[0-3]$/.test(dif)) { dificultad = Number(dif); break; }
    console.log("🤖 Dificultad inválida.");
  }

  // 5) Vencimiento (YYYY-MM-DD, opcional) — BONUS
  let venceEn = null;
  while (true) {
    const ingreso = prompt("5. Vencimiento (YYYY-MM-DD, Enter para omitir): ");
    if (!ingreso) break;                   // omitir
    const parsed = parseFechaInput(ingreso);
    if (parsed === undefined) { console.log("🤖 Fecha inválida. Usa YYYY-MM-DD."); continue; }
    venceEn = parsed; break;
  }

  // Guardado
  const ahora = new Date();
  tareas.push({
    id: tareas.length ? tareas[tareas.length - 1].id + 1 : 1,
    titulo,
    descripcion,
    estado,
    dificultad,
    creadaEn: ahora,
    venceEn,
    ultimaEdicion: ahora, // BONUS: inicia igual a creación
  });

  console.log("\n✅ ¡Datos guardados!");
  pausar();
}

/* ------------ ELIMINAR (opción 4) ------------ */
function eliminarTarea() {
  if (tareas.length === 0) { console.log("🤖 No hay tareas para eliminar."); return; }
  const lista = mostrarTareas("todas", "alfabetico");
  const numero = prompt("\n🗑️  Ingresa el número de la tarea a eliminar (o 0 para cancelar): ");
  if (!/^\d+$/.test(numero)) { console.log("🤖 Entrada inválida."); return; }
  if (numero === "0") return;
  const idx = Number(numero) - 1;
  if (idx < 0 || idx >= lista.length) { console.log("🤖 Número inválido."); return; }
  const eliminada = lista[idx];
  tareas.splice(tareas.indexOf(eliminada), 1);
  console.log(`✅ ¡Tarea eliminada: "${eliminada.titulo}"!`);
}

/* ------------ MENÚ PRINCIPAL ------------ */
function mostrarMenu() {
  while (true) {
    console.log("\n🤖 ¡Hola, Olivia! ¿Qué te gustaría hacer?");
    console.log("\n [1] Ver lista de tareas");
    console.log(" [2] Buscar tarea");
    console.log(" [3] Agregar tarea");
    console.log(" [4] Eliminar tarea");
    console.log(" [0] Salir\n");

    const o = parseInt(prompt("Ingrese una opción: "), 10);

    switch (o) {
      case 1: verListaTareas(); break;
      case 2: buscarTarea(); break;
      case 3: agregarTarea(); break;           // pausa dentro de agregar
      case 4: eliminarTarea(); pausar(); break;
      case 0: console.log("\n🤖 ¡Hasta luego, Olivia!"); return;
      default: console.log("\n🤖 Opción no válida. Intente nuevamente."); pausar(); break;
    }
  }
}

// --- Ejecutar ---
mostrarMenu();
