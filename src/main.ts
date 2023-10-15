import "./style.css";

import { Line } from "./classes";

const drawingChanged = new CustomEvent("drawing-changed");
type ClickHandler = () => void;

const app: HTMLDivElement = document.querySelector("#app")!;
const gameName = "Wyatt's Sticker Sketchpad";
const header = document.createElement("h1");
let lines: Line[] = [];
let currentLine: Line | null = new Line();
let redoLines: Line[] = [];

//Set page title
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

//Create cursor object
const cursor = { active: false, x: 0, y: 0 };

//Add mousedown, mousemove, and mouseup events to the canvas
addCanvasEvents();

//Add thickness Slider
app.append(document.createElement("br"));
const thickSlider = addThicknessSlider();

//Add buttons
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

    currentLine = new Line(thickSlider.value);
    lines.push(currentLine);
    redoLines.splice(0, redoLines.length);
    currentLine.drag(cursor.x, cursor.y);

    canvas.dispatchEvent(drawingChanged);
  });

  canvas.addEventListener("mousemove", (e) => {
    if (!cursor.active) {
      return;
    }
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
    currentLine!.drag(cursor.x, cursor.y);
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
  for (const l of lines) {
    l.display(ctx);
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

function addButton(text: string, func: ClickHandler) {
  //Add Button to page
  const button = document.createElement("button");
  button.innerHTML = text;
  app.append(button);

  //Add click functionality
  button.addEventListener("click", () => {
    func();
  });
}

function addThicknessSlider() {
  const thickness = document.createElement("input");
  thickness.type = "range";
  thickness.min = "1";
  thickness.max = "11";
  thickness.value = "1";

  thickness.addEventListener("input", () => {
    changeThickness(parseInt(thickness.value));
  });

  const label = document.createElement("label");
  label.textContent = "Thickness: ";

  app.append(label);
  app.append(thickness);
  return thickness;
}

function changeThickness(val: number) {
  ctx.lineWidth = val;
}
