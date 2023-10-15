import "./style.css";

const drawingChanged = new CustomEvent("drawing-changed");
type ClickHandler = () => void;

const app: HTMLDivElement = document.querySelector("#app")!;
const gameName = "Wyatt's Sticker Sketchpad";
const header = document.createElement("h1");
let lines: { x: number; y: number }[][] = [];
let currentLine: { x: number; y: number }[] | null = [];
let redoLines: { x: number; y: number }[][] = [];

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

app.append(document.createElement("br"));
addButton("undo", undoCanvas);
addButton("redo", redoCanvas);
addButton("clear", eraseCanvas);

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
    redoLines = [];

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

function eraseCanvas() {
  redoLines = lines;
  lines = [];

  clearCanvas();
}

function undoCanvas() {
  if (lines.length == 0) {
    return;
  }
  redoLines.push(lines.pop()!);
  canvas.dispatchEvent(drawingChanged);
}

function redoCanvas() {
  if (redoLines.length == 0) {
    return;
  }
  lines.push(redoLines.pop()!);
  canvas.dispatchEvent(drawingChanged);
}

function addButton(name: string, func: ClickHandler) {
  //Add clear button
  const button = document.createElement("button");
  button.innerHTML = name;
  app.append(button);

  //Add click functionality
  button.addEventListener("click", () => {
    func();
  });
}
