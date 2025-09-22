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

const readline = require("readline");

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

function mostrarMenu() {
  console.log("  [1] Sumar ➕");
  console.log("  [2] Restar ➖");
  console.log("  [3] Multiplicar ✖️");
  console.log("  [4] Dividir ➗");
}

function saludo() {
  console.log("🤖 ¡Bienvenido a la calculadora!");
  rl.question("🤖 ¿Cuál es tu nombre?: ", (nombre) => {
    console.log(`🤖 ¡Hola, ${nombre}!`);
    pedirDatos();
  });
}

function pedirDatos() {
  rl.question("🤖 Ingresá el primer número: ", (a) => {
    a = parseFloat(a);
    mostrarMenu();
    rl.question("🤖 ¿Qué deseas hacer? ", (opcion) => {
      if (
        opcion !== "1" &&
        opcion !== "2" &&
        opcion !== "3" &&
        opcion !== "4"
      ) {
        console.log("🤖 Opción no válida");
        rl.close();
        return;
      }
      rl.question("🤖 Ingresá el segundo número: ", (b) => {
        b = parseFloat(b);
        opcion = parseInt(opcion);
        let resultado = null;
        switch (opcion) {
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
        rl.close();
      });
    });
  });
}

saludo();
