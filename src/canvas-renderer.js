/**
 * Created by shaunwest on 6/29/15.
 */

export function clearContext(context2d, width, height) {
  context2d.clearRect(0, 0, width, height);
}

export function render(context2d, point, image, viewport) {
  if(!image) {
    return;
  }
  context2d.drawImage(
    image,
    point.x - viewport.x || 0,
    point.y - viewport.y || 0
  );
}

export function renderRects(context2d, rects, viewport, color) {
  color = color || '#000000';
  rects.forEach(function (rect) {
    context2d.strokeStyle = color;
    context2d.strokeRect(rect.x - viewport.x, rect.y - viewport.y, rect.width, rect.height);
  });
}
