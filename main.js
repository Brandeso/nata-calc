class Complex {
    constructor(real, imaginary) {
        this.real = real;
        this.imaginary = imaginary;
    }

    // Add two complex numbers
    add(other) {
        return new Complex(this.real + other.real, this.imaginary + other.imaginary);
    } // a.add(b) 

    // Subtract two complex numbers
    subtract(other) {
        return new Complex(this.real - other.real, this.imaginary - other.imaginary);
    }

    // Multiply two complex numbers: (a + bi)(c + di) = (ac - bd) + (ad + bc)i
    multiply(other) {
        const realPart = this.real * other.real - this.imaginary * other.imaginary;
        const imaginaryPart = this.real * other.imaginary + this.imaginary * other.real;
        return new Complex(realPart, imaginaryPart);
    }

    // Divide two complex numbers: (a + bi) / (c + di) = [(ac + bd) + (bc - ad)i] / (c^2 + d^2)
    divide(other) {
        const denominator = other.real * other.real + other.imaginary * other.imaginary;
        if (denominator === 0) {
            // Handle division by zero error
            throw new Error("Division by zero (complex number denominator is zero).");
        }
        const realPart = (this.real * other.real + this.imaginary * other.imaginary) / denominator;
        const imaginaryPart = (this.imaginary * other.real - this.real * other.imaginary) / denominator;
        return new Complex(realPart, imaginaryPart);
    }

    // Convert the complex number to a string for display
    toString() {
        if (isNaN(this.real) || isNaN(this.imaginary)) {
            return "Error"; // Handle cases where calculation results in NaN
        }
        if (this.imaginary === 0) {
            return this.real.toString();
        }
        if (this.real === 0) {
            if (this.imaginary === 1) return "i";
            if (this.imaginary === -1) return "-i";
            return `${this.imaginary}i`;
        }
        const sign = this.imaginary >= 0 ? "+" : "-";
        const imagValue = Math.abs(this.imaginary);
        if (imagValue === 1) {
            return `${this.real}${sign}i`; // 8 + i
        }
        return `${this.real}${sign}${imagValue}i`; // 8 + 4i
    }
}

// Function to parse a string into a Complex number
// Handles formats like "5", "3i", "-i", "2+3i", "1-2.5i"
function parseComplexString(str) {
    str = str.trim();
    if (!str) return new Complex(0, 0);

    const regex = /^(-?\d*\.?\d*)([+\-]\d*\.?\d*)?(i)?$/;
    const match = str.match(regex);

    if (!match) {
        console.error("Invalid complex string format during parsing:", str);
        return new Complex(NaN, NaN); // Return NaN to indicate an error
    }

    let real = 0;
    let imag = 0;

    const realPartStr = match[1];
    const imagPartWithSignStr = match[2];
    const hasI = match[3] === 'i';

    if (str === 'i') return new Complex(0, 1);
    if (str === '-i') return new Complex(0, -1);

    if (hasI) { // Validamos numero imaginario
        if (imagPartWithSignStr) { // - 35i  // 4i
            real = parseFloat(realPartStr);
            const sign = imagPartWithSignStr[0];
            const value = imagPartWithSignStr.substring(1); // -35i -> 35i
            imag = parseFloat(sign + (value === '' ? '1' : value)); // 35 ? '' -> 35
        } else if (realPartStr !== '') { // 0 + 3i
            real = 0;
            imag = parseFloat(realPartStr);
        } else { // i
            imag = 1;
        }
    } else { // Solo contiene parte real
        real = parseFloat(realPartStr);
        imag = 0;
    }

    return new Complex(real, imag);
}

let currentInputString = ""; // Resultado
let firstOperand = null; // Primer numero 24 + 3i
let operator = null; // + - * /
let waitingForSecondOperand = false; // Cuando se selecciona un operador
let lastInputWasEquals = false; // Cuando se clickea el igual

const display = document.querySelector('.display');

const buttons = document.querySelectorAll('.button');

function updateDisplay() {
    display.textContent = currentInputString === "" ? "0" : currentInputString;
}

function calculate(op1, op, op2) { // op1 = a op2 = b op = '/*-+'
    // NaN = Not a number
    if (isNaN(op1.real) || isNaN(op1.imaginary) || isNaN(op2.real) || isNaN(op2.imaginary)) { 
        return new Complex(NaN, NaN); 
    }

    switch (op) {
        case '+':
            return op1.add(op2);
        case '-':
            return op1.subtract(op2);
        case '*':
            return op1.multiply(op2);
        case '/':
            // Permite detectar errores
            try {
                return op1.divide(op2);
            } catch (e) {
                display.textContent = "Error: Div by zero";
                return new Complex(NaN, NaN); 
            }
        // No hay caso cuando se manda a llamar '='
        case '=':
            return true;
        default:
            return new Complex(NaN, NaN);
    }
}

buttons.forEach(button => {
    // EventListener -> click
    button.addEventListener('click', () => {
        const buttonValue = button.dataset.value;
        const buttonAction = button.dataset.action;

        if (buttonAction === 'clear') {
            currentInputString = "";
            firstOperand = null;
            operator = null;
            waitingForSecondOperand = false;
            lastInputWasEquals = false;
            updateDisplay();
            return;
        }

        if (buttonAction === 'operator') { // /*-+
            if (currentInputString === "" && firstOperand === null) {
                return;
            }

            if (firstOperand === null) {
                firstOperand = parseComplexString(currentInputString); // regresa 0
            } else if (!waitingForSecondOperand) {
                const secondOperand = parseComplexString(currentInputString);
                const result = calculate(firstOperand, operator, secondOperand);
                firstOperand = result;
                display.textContent = result.toString(); 
            }

            operator = buttonValue; 
            waitingForSecondOperand = true; 
            lastInputWasEquals = false; 
            return;
        }

        if (buttonAction === 'equals') {
            if (firstOperand === null || operator === null || currentInputString === "") {
                return;
            }

            const secondOperand = parseComplexString(currentInputString);
            const result = calculate(firstOperand, operator, secondOperand);
        
            display.textContent = result.toString(); 
            currentInputString = result.toString(); 
            firstOperand = result; 
            operator = null; 
            waitingForSecondOperand = false; 
            lastInputWasEquals = true; 
            return;
        }

        if (waitingForSecondOperand) {
            currentInputString = "";
            waitingForSecondOperand = false;
        }

        if (lastInputWasEquals) {
            currentInputString = "";
            firstOperand = null;
            operator = null;
            lastInputWasEquals = false;
        }

        if (buttonValue === 'i') {
            if (currentInputString.includes('i')) {
                return;
            }
            currentInputString += 'i';
        } else if (buttonValue === '.') {
            if (currentInputString.includes('.')) {
                const parts = currentInputString.split(/[\+\-]/);
                const lastPart = parts[parts.length - 1];
                if (lastPart.includes('.')) {
                    return;
                }
            }
            currentInputString += buttonValue;
        } else if (buttonValue === '(' || buttonValue === ')') {
            currentInputString += buttonValue;
        }
        else { // Agregamos el numero
            currentInputString += buttonValue;
        }

        updateDisplay();
    });
});

updateDisplay();