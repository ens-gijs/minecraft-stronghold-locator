import { stronghold_rings, drawBlockGridCircle, drawSingleBlock } from './drawing.js';

const LONG_RAY_LENGTH = 25000;

export class OpDrawPoint {
  constructor(x, z, color, handle){
    this.point = new ross.drawing.Point(x, z);
    this.color = color;
    this.handle = handle;
  }
  exec(canvas){
    this.point.draw(canvas, this.color, 50);

    if(canvas.getScale() >= 0.1){
      canvas.save();
      canvas.globalAlpha = 0.33;
      drawBlockGridCircle(canvas, this.point, 12, this.color);
      canvas.globalAlpha = 1;
      canvas.lineWidth = 2;
      drawSingleBlock(canvas, this.point, this.color);
      canvas.restore();

      if(this.handle && canvas.getScale() >= 0.2){
        canvas.save();
        canvas.fillStyle = this.color;
        canvas.font = '16px sans-serif';
        canvas.textAlign = 'center';
        canvas.fillText(this.handle, this.point.x, this.point.y - 75);
        canvas.restore();
      }
    }

    const rad = this.point.distanceTo({ x: 0, y: 0 });
    if(rad < stronghold_rings[stronghold_rings.length - 1][1]){
      for(const ring of stronghold_rings){
        if(rad > ring[0] - 20 && rad < ring[1] + 20){
          const start = this.point.vectorFrom({ x: 0, y: 0 }).angleDeg;
          const stride = 360 / ring[2];
          const line = new ross.drawing.LineSegment(ring[0], 0, ring[1], 0);
          for(let j = 0; j < ring[2]; ++j){
            canvas.save();
            canvas.globalAlpha = 0.15;
            canvas.rotate(ross.drawing.radians(start + j * stride));
            line.draw(canvas, this.color);
            canvas.restore();
          }
          break;
        }
      }
    }
  }
}

export class OpDrawRay {
  constructor(x, z, facing, color, handle){
    this.ray  = new ross.drawing.Ray(x, z, ross.drawing.radians(90 + facing));
    this.dot  = new ross.drawing.Arc(x, z, 0.2, 0, Math.PI * 2);
    this.ring = new ross.drawing.Arc(x, z, 4,   0, Math.PI * 2);
    this.color = color;
    this.handle = handle;
  }
  _drawCone(canvas, angle, alpha, cone_dist){
    const na = new ross.drawing.Ray(this.ray);
    const nb = new ross.drawing.Ray(this.ray);
    na.rotate(ross.drawing.radians(-angle / 2));
    nb.rotate(ross.drawing.radians( angle / 2));
    cone_dist = cone_dist || 100000;
    const cone = [na.p1, na.pointAtDistance(cone_dist), nb.pointAtDistance(cone_dist)];

    canvas.save();
    canvas.fillStyle = this.color;
    canvas.globalAlpha = alpha || 0.1;
    canvas.beginPath();
    canvas.moveTo(cone[0].x, cone[0].y);
    canvas.lineTo(cone[1].x, cone[1].y);
    canvas.lineTo(cone[2].x, cone[2].y);
    canvas.closePath();
    canvas.fill();
    canvas.beginPath();
    canvas.restore();
  }
  exec(canvas){
    canvas.save();
    canvas.lineWidth = 2;
    canvas.globalAlpha = 0.2;
    this.ray.draw(canvas, this.color, LONG_RAY_LENGTH);

    canvas.globalAlpha = 0.33;
    drawBlockGridCircle(canvas, this.dot.p1, 4, this.color);
    canvas.globalAlpha = 1.0;
    canvas.beginPath();
    canvas.lineWidth = 0.5;
    canvas.fillStyle = this.color;
    this.dot.drawPath(canvas);
    canvas.fill();

    canvas.lineWidth = 2;
    drawSingleBlock(canvas, this.ray.p1, this.color);
    canvas.restore();

    this._drawCone(canvas, 3,   0.05,  20000);
    this._drawCone(canvas, 2,   0.075, 10000);
    this._drawCone(canvas, 1,   0.10,   5000);
    this._drawCone(canvas, 0.4, 0.25,   1000);
  }
}
