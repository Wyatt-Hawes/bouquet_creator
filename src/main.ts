import "./style.css";
import { PaintCanvas } from "./classes";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Wyatt's Sticker Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const paintCanvas = createCanvas();
const cursor = { active: false, x: 0, y: 0 };
addCanvasEvents(paintCanvas);

//Add clear button
const clearButton = document.createElement("button");
clearButton.innerHTML = "clear";
app.append(document.createElement("br"));
app.append(clearButton);

//Add click functionality
clearButton.addEventListener("click", () => {
  clearCanvas(paintCanvas);
});

//-----FUNCTIONS-------//

function createCanvas(): PaintCanvas {
  const canv = document.createElement("canvas");
  canv.id = "canvas";
  canv.width = 256;
  canv.height = 256;

  const canvasCTX = canv.getContext("2d");
  clearCanvas({ canvas: canv, context: canvasCTX! });

  app.append(canv);
  return { canvas: canv, context: canvasCTX! };
}

function addCanvasEvents(pC: PaintCanvas) {
  pC.canvas.addEventListener("mousedown", (e) => {
    cursor.active = true;
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  });

  pC.canvas.addEventListener("mousemove", (e) => {
    if (!cursor.active) {
      return;
    }
    pC.context.beginPath();
    pC.context.moveTo(cursor.x, cursor.y);
    pC.context.lineTo(e.offsetX, e.offsetY);
    pC.context.stroke();
    cursor.x = e.offsetX;
    cursor.y = e.offsetY;
  });

  pC.canvas.addEventListener("mouseup", () => {
    cursor.active = false;
  });
}

function clearCanvas(pC: PaintCanvas) {
  pC.context.clearRect(0, 0, pC.canvas.width, pC.canvas.height);
  pC.context.fillStyle = "white";

  pC.context.fillRect(0, 0, 256, 256);
}
