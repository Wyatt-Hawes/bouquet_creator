/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import "./style.css";

import { Line, CursorCommand, Sticker } from "./classes";
import f1 from "../public/src/1.png";
import f2 from "../public/src/2.png";
import f3 from "../public/src/3.png";
import f4 from "../public/src/4.png";
import f5 from "../public/src/5.png";
import f6 from "../public/src/6.png";
import f7 from "../public/src/7.png";
import f8 from "../public/src/8.png";
import f9 from "../public/src/9.png";
import f10 from "../public/src/10.png";
import f11 from "../public/src/11.png";

import b1 from "../public/src/b1.png";
import b2 from "../public/src/b2.png";
import b3 from "../public/src/b3.png";

const drawingChanged = new CustomEvent("drawing-changed");
const cursorChanged = new CustomEvent("cursor-changed");
type ClickHandler = () => void;
type SliderHandler = (val: number | string) => void;

//Header elements
const app: HTMLDivElement = document.querySelector("#app")!;
const gameName = "Soph's Bouquet Creator";
const header = document.createElement("h1");

//Variable setup
let strokes: (Line | Sticker)[] = [];
let currentStroke: (Line | Sticker) | null = null;
let redoStrokes: (Line | Sticker)[] = [];
let currentCursorSymbol = "*";
let cursorCommand: CursorCommand | null = null;
let newColor = "#000000";
let currentRotation = 0;
let currentSize = 1;

//Set page title
document.title = gameName;
header.innerHTML = gameName;
app.append(header);

//Add export button
addButton("Export", exportPicture);
addLineBreak();

//Create canvas
const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;
canvas.style.cursor = "none";
app.append(canvas);

//Get context
const ctx = canvas.getContext("2d")!;
ctx.fillStyle = "white";
ctx.fillRect(0, 0, 256, 256);

//Create cursor object
const cursor = { active: false, x: 0, y: 0 };

//Add mousedown, mousemove, and mouseup events to the canvas
addCanvasEvents();

//add color picker
addLineBreak();
const colorSlider = addSlider(
  "Pen Color",
  "0",
  0xffffff + "",
  0x000000 + "",
  "color",
  changeColor
);

//Add Size Slider
addLineBreak();
addSlider("Size", "1", "11", "1", "range", changeThickness);

//Add rotation slider
addLineBreak();
const rotationSlider = addSlider(
  "Rotation",
  -2 * Math.PI + "",
  2 * Math.PI + "",
  0 + "",
  "range",
  changeRotation
);
rotationSlider.step = 0.1 + "";

//Add buttons
addLineBreak();
addButton("undo", undoCanvas);
addButton("redo", redoCanvas);
addButton("clear", eraseCanvas);
addButton("reset cursor", resetCursor);

//Add Flowers
const flowers = [f1, f8, f9, f2, f4, f6, f7, f3, f5, f10, f11];
addLineBreak();
flowers.forEach((text) => {
  addFlowerButton(text);
});

//Add bases
addLineBreak();
const bases = [b1, b2, b3];
bases.forEach((text) => {
  addFlowerButton(text);
});

//-----------------------
//-----FUNCTIONS-------//
//-----------------------

function addCanvasEvents() {
  //Mouse Events
  canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;

    //Draw line or place flower
    if (currentCursorSymbol == "*") {
      currentStroke = new Line(currentSize + "", newColor);
    } else {
      currentStroke = new Sticker(
        cursor.x,
        cursor.y,
        currentCursorSymbol,
        currentSize + "",
        newColor,
        currentRotation
      );
    }

    //Add strokes to history
    strokes.push(currentStroke);
    redoStrokes.splice(0, redoStrokes.length);
    currentStroke.drag(cursor.x, cursor.y);

    canvas.dispatchEvent(drawingChanged);
  });

  //draw line if the user clicks and drags
  canvas.addEventListener("mousemove", (e) => {
    if (cursor.active) {
      cursor.x = e.offsetX;
      cursor.y = e.offsetY;
      currentStroke!.drag(cursor.x, cursor.y);
      redoStrokes = [];

      canvas.dispatchEvent(drawingChanged);
    }
  });

  canvas.addEventListener("mouseup", () => {
    cursor.active = false;
    currentStroke = null;
  });

  //Drawing events
  canvas.addEventListener("drawing-changed", () => {
    redraw();
  });
  canvas.addEventListener("cursor-changed", () => {
    redraw();
  });

  //Cursor events
  canvas.addEventListener("mouseout", () => {
    cursorCommand = null;
    canvas.dispatchEvent(cursorChanged);
  });

  canvas.addEventListener("mouseenter", (e) => {
    cursorCommand = new CursorCommand(
      e.offsetX,
      e.offsetY,
      currentCursorSymbol,
      newColor,
      currentRotation,
      currentSize
    );
    canvas.dispatchEvent(cursorChanged);
  });

  canvas.addEventListener("mousemove", (e) => {
    cursorCommand = new CursorCommand(
      e.offsetX,
      e.offsetY,
      currentCursorSymbol,
      colorSlider.value,
      currentRotation,
      currentSize
    );
    canvas.dispatchEvent(cursorChanged);
  });

  canvas.addEventListener("wheel", (e) => {
    // Increase or decrease size based on the scroll direction (if shift key pressed)
    if (e.shiftKey) {
      currentSize += e.deltaY > 0 ? -1 : 1;
      changeThickness(currentSize);

      //Ensure no out of bounds values
      if (currentSize > 11) {
        currentSize = 11;
      } else if (currentSize < 1) {
        currentSize = 1;
      }
    } else {
      // Increase or decrease rotation based on the scroll direction
      currentRotation += e.deltaY > 0 ? 0.1 : -0.1;

      //Ensure no out of bounds values
      if (currentRotation > 2 * Math.PI) {
        currentRotation -= 2 * Math.PI;
      } else if (currentRotation < -2 * Math.PI) {
        currentRotation += 2 * Math.PI;
      }

      rotationSlider.value = currentRotation.toString();
      changeRotation(currentRotation);
    }

    //Update the cursor by sending a new cursor command
    cursorCommand = new CursorCommand(
      e.offsetX,
      e.offsetY,
      currentCursorSymbol,
      colorSlider.value,
      currentRotation,
      currentSize
    );
    canvas.dispatchEvent(cursorChanged);
  });
}

function redraw() {
  const lineWidthBefore = ctx.lineWidth;
  clearCanvas();

  strokes.forEach((l) => {
    l.display(ctx);
  });
  ctx.lineWidth = lineWidthBefore;

  if (cursorCommand) {
    cursorCommand.display(ctx);
  }
}

//Empty the canvas
function clearCanvas() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = "white";
  ctx.fillRect(0, 0, 256, 256);
}

//Clear canvas and remove all stored strokes
function eraseCanvas() {
  redoStrokes = strokes.reverse();
  strokes = [];
  clearCanvas();
}

function undoCanvas() {
  if (strokes.length == 0) {
    return;
  }
  redoStrokes.push(strokes.pop()!);
  canvas.dispatchEvent(drawingChanged);
}

function redoCanvas() {
  if (redoStrokes.length == 0) {
    return;
  }
  strokes.push(redoStrokes.pop()!);
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

function resetCursor() {
  currentCursorSymbol = "*";
  canvas.dispatchEvent(cursorChanged);
}

function addFlowerButton(path: string) {
  const button = document.createElement("button");
  const img = document.createElement("img");

  img.src = path;
  img.alt = "Flower";
  img.width = 30;
  img.height = 60;

  button.appendChild(img);
  app.append(button);

  button.addEventListener("click", () => {
    currentCursorSymbol = path;
    canvas.dispatchEvent(cursorChanged);
  });
}

/*
Functionality for adding custom stickers, maybe i want to implement this later
function addCustomEmoji() {
  const customEmoji = prompt("Enter your emoji!", "🥥");
  if (!customEmoji) {
    return;
  }
  addFlowerButton(customEmoji);
}
*/

function addSlider(
  name: string,
  min: string,
  max: string,
  initial: string,
  type: string,
  func: SliderHandler
) {
  const slider = document.createElement("input");
  slider.type = type;
  slider.min = min;
  slider.max = max;
  slider.value = initial;

  slider.addEventListener("input", () => {
    func(parseFloat(slider.value));
  });

  const label = document.createElement("label");
  label.textContent = name + ": ";

  app.append(label);
  app.append(slider);
  return slider;
}

function changeThickness(val: number | string) {
  console.log(val);
  if (typeof val === "string") {
    val = parseFloat(val);
  }
  currentSize = val;
  ctx.lineWidth = val;
  redraw();
}

function changeRotation(_val: number | string) {
  currentRotation = parseFloat(rotationSlider.value);
}

function changeColor(val: string | number) {
  if (typeof val === "number") {
    return;
  }
  newColor = val;
  ctx.fillStyle = newColor;
  redraw();
}

function addLineBreak() {
  app.append(document.createElement("br"));
}

function exportPicture() {
  const hdCanvas = document.createElement("canvas");
  hdCanvas.width = canvas.width * 4;
  hdCanvas.height = canvas.height * 4;

  const hdCtx = hdCanvas.getContext("2d")!;
  hdCtx.fillStyle = "white";

  hdCtx.scale(4, 4);
  hdCtx.fillRect(0, 0, 256, 256);

  strokes.forEach((stroke) => {
    stroke.display(hdCtx);
  });

  const anchor = document.createElement("a");
  anchor.href = hdCanvas.toDataURL("image/png");
  anchor.download = "sketchpad.png";
  anchor.click();
}
