// Funciones básicas
function sumar(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    console.log("Ambos argumentos deben ser números");
    return null;
  }
  return a + b;
}

function restar(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    console.log("Ambos argumentos deben ser números");
    return null;
  }
  return a - b;
}

function multiplicar(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    console.log("Ambos argumentos deben ser números");
    return null;
  }
  return a * b;
}

function dividir(a, b) {
  if (typeof a !== "number" || typeof b !== "number") {
    console.log("Ambos argumentos deben ser números");
    return null;
  }
  if (b === 0) {
    console.log("No se puede dividir por 0");
    return null;
  }
  return a / b;
}

// --- Uso de prompt-sync ---
const prompt = require("prompt-sync")({ sigint: true });

// Mostrar menú
function mostrarMenu() {
  console.log("\n  [1] Sumar ➕");
  console.log("  [2] Restar ➖");
  console.log("  [3] Multiplicar ✖️");
  console.log("  [4] Dividir ➗");
}

// Saludo inicial
function saludo() {
  console.log("🤖 ¡Bienvenido a la calculadora!");
  const nombre = prompt("🤖 ¿Cuál es tu nombre?: ");
  console.log(`🤖 ¡Hola, ${nombre}!`);
  pedirDatos();
}

// Pedir datos y operar
function pedirDatos() {
  const a = parseFloat(prompt("🤖 Ingresá el primer número: "));

  mostrarMenu();
  const opcion = prompt("🤖 ¿Qué deseas hacer? ");

  if (!["1", "2", "3", "4"].includes(opcion)) {
    console.log("🤖 Opción no válida");
    return;
  }

  const b = parseFloat(prompt("🤖 Ingresá el segundo número: "));

  let resultado = null;
  switch (parseInt(opcion)) {
    case 1:
      resultado = sumar(a, b);
      break;
    case 2:
      resultado = restar(a, b);
      break;
    case 3:
      resultado = multiplicar(a, b);
      break;
    case 4:
      resultado = dividir(a, b);
      break;
  }

  if (resultado !== null) {
    console.log(`🤖 El resultado es: ${resultado}`);
  }
}

// --- Inicia el programa ---
saludo();
