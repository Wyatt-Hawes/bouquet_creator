import "./style.css";

const drawingChanged = new CustomEvent("drawing-changed");

const app: HTMLDivElement = document.querySelector("#app")!;
const gameName = "Wyatt's Sticker Sketchpad";
const header = document.createElement("h1");
let lines: { x: number; y: number }[][] = [];
let currentLine: { x: number; y: number }[] | null = [];

document.title = gameName;
header.innerHTML = gameName;
app.append(header);

//Create canvas
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
app.append(canvas);

//Get context
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 256);

const cursor = { active: false, x: 0, y: 0 };
addCanvasEvents();

addClearButton();

//-----------------------
//-----FUNCTIONS-------//
//-----------------------

function addCanvasEvents() {
  canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    currentLine = [];
    lines.push(currentLine);
    //redoLines.splice(0, redoLines.length);
    currentLine.push({ x: cursor.x, y: cursor.y });

    canvas.dispatchEvent(drawingChanged);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!cursor.active) {
      return;
    }
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine!.push({ x: cursor.x, y: cursor.y });

    canvas.dispatchEvent(drawingChanged);
  });

  canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    currentLine = null;
  });

  canvas.addEventListener("drawing-changed", () => {
    redraw();
  });
}

function redraw() {
  clearCanvas();
  for (const line of lines) {
    if (line.length > 1) {
      ctx.beginPath();
      const { x, y } = line[0];
      ctx.moveTo(x, y);
      for (const { x, y } of line) {
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
  }
}

function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";

  ctx.fillRect(0, 0, 256, 256);
}

function addClearButton() {
  //Add clear button
  const clearButton = document.createElement("button");
  clearButton.innerHTML = "clear";
  app.append(document.createElement("br"));
  app.append(clearButton);

  //Add click functionality
  clearButton.addEventListener("click", () => {
    clearCanvas();
    lines = [];
  });
}
