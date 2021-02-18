import { fabric } from 'fabric'

class Rect {
  left: number
  top: number
  width: number
  height: number

  constructor(left, top, width, height) {
    this.left = left
    this.top = top
    this.width = width
    this.height = height
  }
}

class ImageBoardBox {
  url: string
  canvas: fabric.Canvas
  image: fabric.Image
  offsetX: number = 0
  offsetY: number = 0
  initialScale: number = 1.0
  scale: number = 1.0
  zoom: number = 1.0
  brightness: number = 0.01
  maskRect: fabric.Rect
  boardRect: fabric.Rect
  controlBox: fabric.Rect
  controlBoxPoint: fabric.Point
  cropRect: Rect = null
  tag: string
  strokeColor: string = 'rgb(136, 0, 26)'
  strokeWidth: number = 0

  constructor(canvas) {
    this.canvas = canvas
    this.canvas.on('mouse:down', (e) => this.onMouseDown(e))
    this.canvas.on('object:moving', (e) => this.onObjectMoving(e))
    this.canvas.on('object:moved', (e) => this.onObjectMoved(e))
    this.canvas.on('object:scaling', (e) => this.onObjectScaling(e))
  }

  setImageOffset(offsetX, offsetY) {
    this.offsetX = offsetX
    this.offsetY = offsetY
    return this
  }

  setTag(tag) {
    this.tag = tag
    return this
  }

  setScale(scale) {
    this.scale = scale
    return this
  }

  setBoard(width, height) {
    this.boardRect = new fabric.Rect({
      type: this.tag,
      originX: 'left',
      originY: 'top',
      left: this.offsetX,
      top: this.offsetY,
      width: width,
      height: height,
      fill: 'rgba(215,215,215,1)',
      absolutePositioned: true,
      selectable: false,
      stroke: this.strokeColor,
      strokeWidth: this.strokeWidth,
      padding: 0,
    })
    this.canvas.add(this.boardRect)
    return this
  }

  getBoard(): Rect {
    const bw = this.boardRect.width * this.boardRect.scaleX
    const bh = this.boardRect.height * this.boardRect.scaleY
    return new Rect(this.boardRect.left, this.boardRect.top, bw, bh)
  }

  setBorder(borderWidth, borderColor) {
    this.strokeWidth = borderWidth
    this.strokeColor = borderColor
    return this
  }

  getImageInfo() {
    return {
      url: '', //this.url,
      offsetX: this.offsetX,
      offsetY: this.offsetY,
      initialScale: this.initialScale,
      scale: this.scale,
      zoom: this.zoom,
      brightness: this.brightness,
      cropRect: this.cropRect
    }
  }

  getImageUrl() {
    return this.url
  }

  setImageUrl(url) {
    this.url = url
    if (this.url) {
      fabric.Image.fromURL(this.url, (img) => this.onImageLoaded(img), {crossOrigin: 'anonymous'})
    }
    return this
  }

  private onImageLoaded(img) {
    if (this.image) {
      this.deleteImage()
    }
    this.image = img
    this.updateImage()
    this.canvas.add(this.image)

    this.createControlBox()
    this.controlBoxPoint = new fabric.Point(this.controlBox.left, this.controlBox.top)

    this.updateClipPath()
  }

  setBrightness(value) {
    this.brightness = value
    var filter = new fabric.Image.filters.Brightness({
      brightness: value
    });
    this.image.filters = [filter];
    this.image.applyFilters();
    this.canvas.renderAll()
  }

  setZoomScale(zoom) {
    this.zoom = zoom
    this.update()
  }

  containsPoint(px, py) {
    return this.boardRect.containsPoint(new fabric.Point(px, py))
  }

  deleteImage() {
    this.canvas.remove(this.image)
    this.canvas.remove(this.controlBox)
  }

  restoreImage() {
    this.cropRect = null
    this.update()
  }

  onImageChanged(zoom, brightness) {
    console.log('onImageChanged', zoom, brightness)
    this.zoom = zoom
    this.brightness = brightness
    this.update()
  }

  onImageCropped(left, top, width, height) {
    console.log('ImageCropped', left, top, width, height)
    this.cropRect = new Rect(left, top, width, height)
    this.update()
  }

  update() {
    this.updateImage()
    this.updateClipPath()
    this.setBrightness(this.brightness)
    this.canvas.renderAll()
  }

  private updateImage() {
    const iw = this.image.width
    const ih = this.image.height
    const bw = this.scale * iw
    const bh = this.scale * ih

    let offsetX, offsetY, scaleX, scaleY;
    if (this.cropRect) {
      const rect = this.cropRect

      scaleX = bw / rect.width
      scaleY = bh / rect.height

      offsetX = this.offsetX - scaleX * rect.left
      offsetY = this.offsetY - scaleY * rect.top
    }
    else {
      const cx = this.offsetX + bw / 2
      const cy = this.offsetY + bh / 2

      scaleX = this.scale * this.zoom
      scaleY = this.scale * this.zoom

      const dw = iw * scaleX
      const dh = ih * scaleY
      offsetX = cx - dw / 2
      offsetY = cy - dh / 2
    }

    console.log('update-image', offsetX, offsetY, scaleX, scaleY)

    this.image.set({
      type: this.tag,
      left: offsetX,
      top:  offsetY,
      scaleX: scaleX,
      scaleY: scaleY,
      selectable: false,
      evented: false
    })

    this.image.setControlsVisibility({
      mtr: false,
    })
  }

  private updateClipPath() {
    let left = this.controlBox.left
    let top = this.controlBox.top
    let width = this.controlBox.width * this.controlBox.scaleX
    let height = this.controlBox.height * this.controlBox.scaleY

    const board = this.getBoard()
    const bx = board.left + this.strokeWidth
    const by = board.top + this.strokeWidth
    if (left < bx) {
      width -= bx - left
      left = bx
    }
    if (top < by) {
      height -= by - top
      top = by
    }

    if ((left + width) > bx + board.width) {
      width = board.left + board.width - left
    }
    if ((top + height) > by + board.height) {
      height = board.top + board.height - top
    }

    if (!this.image.clipPath) {
      let maskRect = new fabric.Rect({
        originX: 'left',
        originY: 'top',
        left: left,
        top: top,
        width: width,
        height: height,
        absolutePositioned: true,
      })
      this.image.clipPath = maskRect
    }
    else {
      this.image.clipPath.set({
        left: left,
        top: top,
        width: width,
        height: height,
      })
    }
  }

  private createControlBox() {
    this.controlBox = new fabric.Rect({
      type: this.tag,
      originX: 'left',
      originY: 'top',
      left: this.offsetX,
      top: this.offsetY,
      width: this.image.width * this.scale,
      height: this.image.height * this.scale,
      opacity: 1.0,
      fill: 'rgba(255,255,255, 0)',
      absolutePositioned: true,
      lockScalingFlip: true,
      selectable: true,
      transparentCorners: false,
      cornerColor: 'white',
      cornerStrokeColor: 'black',
      borderColor: 'black',
      cornerSize: 12,
      padding: 0,
      cornerStyle: 'circle',
      borderDashArray: [5, 5],
      borderScaleFactor: 1.3
    })

    this.controlBox.setControlsVisibility({mb: false, ml: false, mr: false, mt: false, mtr: false})
    this.canvas.add(this.controlBox)
  }

  onMouseDown(e) {
    if (e.target && e.target.type == this.tag) {
      this.canvas.bringToFront(this.image)
      this.canvas.bringToFront(this.controlBox)
      this.canvas.setActiveObject(this.controlBox)
    }
  }

  private updateMovingPosition(e) {
    const board = this.getBoard()
    if (e.target.left > board.left + board.width) {
      e.target.left = board.left + board.width - 2
    }
    if (e.target.top > board.top + board.height) {
      e.target.top = board.top + board.height - 2
    }
    const tw = e.target.width * e.target.scaleX
    const th = e.target.height * e.target.scaleY
    if (e.target.left + tw < board.left) {
      e.target.left = board.left - tw + 2
    }
    if (e.target.top + th < board.top) {
      e.target.top = board.top - th + 2
    }
  }

  onObjectMoving(e) {
    if (e.target.type == this.tag) {
      this.updateMovingPosition(e)

      const dx = e.target.left - this.controlBoxPoint.x
      const dy = e.target.top - this.controlBoxPoint.y
      this.image.left += dx
      this.image.top  += dy
      this.offsetX += dx
      this.offsetY += dy

      this.controlBoxPoint = new fabric.Point(e.target.left, e.target.top)
      this.updateClipPath()
    }
  }

  onObjectMoved(e) {
    if (e.target.type == this.tag) {
      this.updateMovingPosition(e)
      this.onObjectMoving(e)
      this.canvas.renderAll()
    }
  }

  onObjectScaling(e) {
    if (e.target.type == this.tag) {
      this.scale = this.initialScale * e.target.scaleX
      this.offsetX = e.target.left
      this.offsetY = e.target.top
      this.updateImage()

      this.controlBoxPoint = new fabric.Point(e.target.left, e.target.top)
      this.updateClipPath()

      console.log('onObjectScaling', e.target.width, e.target.height, e.target.scaleX, this.scale)
    }
  }

}

export default ImageBoardBox