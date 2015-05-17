/**
 * Created by Shaun on 2/5/15
 * 
 */
export default class ImageRenderer {
  constructor (canvas) {
    this.canvas = canvas;
    this.context2d = canvas.getContext('2d');
  }

  setImage (image) {
    this.image = image;
    return this;
  }

  draw (viewport) {
    if(!viewport) {
      return;
    }

    this.context2d.clearRect(0, 0, this.canvas.width, this.canvas.height);

    if(this.image) {
      this.context2d.drawImage(
        this.image,
        viewport.x, viewport.y,
        viewport.width, viewport.height,
        0, 0,
        viewport.width, viewport.height
      );
    }

    return this;
  }

  getLayer () {
    return this.canvas;
  }
}
