/* eslint-disable @typescript-eslint/no-magic-numbers */
interface Coordinate {
  x: number;
  y: number;
}

export class Line {
  coords: Coordinate[];
  thickness: string;
  color: string;

  constructor(thickness = "1", color: string) {
    this.coords = [];
    this.thickness = thickness;
    this.color = color;
  }

  drag(x: number, y: number) {
    this.coords.push({ x: x, y: y });
  }

  display(ctx: CanvasRenderingContext2D) {
    if (this.coords.length == 0) {
      return;
    }
    const lineWidthBefore = ctx.lineWidth;
    const colorBefore = ctx.strokeStyle;
    const first = this.coords[0];

    ctx.lineWidth = parseInt(this.thickness);
    ctx.strokeStyle = this.color;
    ctx.beginPath();
    ctx.moveTo(first.x, first.y);

    for (const c of this.coords) {
      ctx.lineTo(c.x, c.y);
    }

    ctx.stroke();

    //Undo style changes so it doesnt carry to other strokes
    ctx.lineWidth = lineWidthBefore;
    ctx.strokeStyle = colorBefore;
  }
}

export class Sticker {
  coord: Coordinate;
  text: string;
  size: number;
  color: string;
  img: HTMLImageElement;
  rotation: number;

  constructor(
    x: number,
    y: number,
    text: string,
    size: string,
    color: string,
    rotation: number
  ) {
    this.coord = { x: x, y: y };
    this.text = text;
    this.color = color;

    //Turning the stroke sizes of 1-11 to correspond to font sizes 16-64
    const newSize: number = getImageSizeRatio(parseFloat(size));
    this.size = newSize;
    this.img = new Image();
    this.img.src = this.text;
    this.rotation = rotation;
  }

  drag(x: number, y: number) {
    this.coord = { x: x, y: y };
  }

  display(ctx: CanvasRenderingContext2D) {
    const fontBefore: string = ctx.font;
    const colorBefore = ctx.fillStyle;
    const xOffset = (-30 / 2) * this.size;
    const yOffset = (-60 / 2) * this.size;

    ctx.font = this.size + "px monospace";
    ctx.fillStyle = this.color;
    ctx.save();

    // Translate to the center of the image
    ctx.translate(this.coord.x, this.coord.y);
    // Rotate the image
    ctx.rotate(this.rotation);
    // Draw the image with adjusted offset
    ctx.drawImage(this.img, xOffset, yOffset, 30 * this.size, 60 * this.size);

    //Undo context changes
    ctx.restore();
    ctx.fillStyle = colorBefore;
    ctx.font = fontBefore;
  }
}

export class CursorCommand {
  x: number;
  y: number;
  text: string;
  color: string;
  rotation: number;
  size: number;

  constructor(
    x: number,
    y: number,
    text: string,
    color: string,
    rotation: number,
    size: number
  ) {
    this.x = x;
    this.y = y;
    this.text = text;
    this.color = color;
    this.rotation = rotation;
    this.size = size;
  }

  display(ctx: CanvasRenderingContext2D) {
    //Turning the stroke sizes of 1-11 to correspond to font sizes 16-64
    const lineWidthBefore = ctx.lineWidth;
    const outMin = 16;
    const outMax = 64;
    const inMin = 1;
    const inMax = 11;
    const newSize: number =
      ((ctx.lineWidth - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    const xOffset = (4 * newSize) / outMin;
    const yOffset = (8 * newSize) / outMin;
    const fontBefore = ctx.font;

    ctx.font = newSize + "px monospace";
    ctx.fillStyle = "black";

    if (this.text == "*") {
      ctx.fillText(this.text, this.x - xOffset, this.y + yOffset);
    } else {
      const img = new Image();
      img.src = this.text;
      ctx.save();

      // Translate to the center of the image
      ctx.translate(this.x, this.y);

      // Rotate the image
      ctx.rotate(this.rotation);

      // Draw the image with adjusted offset

      const r = getImageSizeRatio(this.size);
      const xOffset = (-30 / 2) * r; // Half of the image width
      const yOffset = (-60 / 2) * r; // Half of the image height
      console.log("Cur:", r);
      ctx.drawImage(img, xOffset, yOffset, 30 * r, 60 * r);

      ctx.restore();
    }
    ctx.lineWidth = lineWidthBefore;

    ctx.font = fontBefore;
  }
}

function getImageSizeRatio(size: number) {
  const outMin = 1;
  const outMax = 3;
  const inMin = 1;
  const inMax = 11;
  const newSize: number =
    ((size - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

  return newSize;
}
