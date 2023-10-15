import "./style.css";

const app: HTMLDivElement = document.querySelector("#app")!;

const gameName = "Wyatt's Sticker Sketchpad";

document.title = gameName;

const header = document.createElement("h1");
header.innerHTML = gameName;
app.append(header);

const canvas = document.createElement("canvas");
canvas.id = "canvas";
canvas.width = 256;
canvas.height = 256;

const canvasCTX = canvas.getContext("2d");
canvasCTX!.fillStyle = "white";

canvasCTX?.fillRect(0, 0, 256, 256);

app.append(canvas);
