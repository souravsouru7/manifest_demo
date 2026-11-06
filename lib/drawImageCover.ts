/**
 * Draws an image onto a canvas the way CSS `object-fit: cover` would: the aspect
 * ratio is kept and any overflow is cropped by falling outside the canvas.
 *
 * @param canvasWidth  Backing-store width in device pixels (`canvas.width`).
 * @param canvasHeight Backing-store height in device pixels (`canvas.height`).
 * @param focusX       Which part of the image stays in view when the sides are
 *                     cropped: 0 = left edge, 0.5 = centre, 1 = right edge.
 */
export function drawImageCover(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement | ImageBitmap,
  canvasWidth: number,
  canvasHeight: number,
  focusX = 0.5,
): void {
  const imgWidth = img instanceof HTMLImageElement ? img.naturalWidth : img.width;
  const imgHeight = img instanceof HTMLImageElement ? img.naturalHeight : img.height;
  if (!imgWidth || !imgHeight) return;

  const scale = Math.max(canvasWidth / imgWidth, canvasHeight / imgHeight);
  const drawWidth = imgWidth * scale;
  const drawHeight = imgHeight * scale;

  ctx.drawImage(
    img,
    (canvasWidth - drawWidth) * focusX,
    (canvasHeight - drawHeight) / 2,
    drawWidth,
    drawHeight,
  );
}
