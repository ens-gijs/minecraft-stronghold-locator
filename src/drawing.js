// Pure rendering helpers. All callers pass the canvas context explicitly.

export const stronghold_rings = [
  // start, end, count
  [1408, 2688, 3],
  [4480, 5760, 6],
  [7552, 8832, 10],
  [10624, 11904, 15],
  [13696, 14976, 21],
  [16768, 18048, 28],
  [19840, 21120, 36],
  [22912, 24192, 9]
];

export function drawStrongholdRings(canvas, theme){
  canvas.save();
  canvas.fillStyle = theme.stronghold_rings;
  canvas.beginPath();
  for(const ring of stronghold_rings){
    canvas.arc(0, 0, ring[1], 0, Math.PI * 2, false);
    canvas.arc(0, 0, ring[0], 0, Math.PI * 2, true);
  }
  canvas.fill();
  canvas.restore();
}

export function drawAxis(canvas, theme){
  const axis_reach = 50000;
  const tick_a_step = 100;
  const tick_b_step = tick_a_step * 10;
  const tick_a_weight = 0.5;
  const tick_b_weight = 1;

  const x_axis = new ross.drawing.LineSegment(-axis_reach,0,axis_reach,0);
  const y_axis = new ross.drawing.LineSegment(0,-axis_reach,0,axis_reach);
  canvas.save();
  canvas.lineWidth = 2;
  x_axis.draw(canvas, theme.axis_color);
  y_axis.draw(canvas, theme.axis_color);

  if(canvas.getScale() > 1/90){
    let pxa, pxb, pya, pyb, col;
    const tick_step = canvas.getScale() > 0.02 ? tick_a_step : tick_b_step;
    for(let i = tick_step; i <= axis_reach; i += tick_step){
      col = i % tick_b_step === 0 ? theme.tick_b_color : theme.tick_a_color;
      canvas.lineWidth = i % tick_b_step === 0 ? tick_b_weight : tick_a_weight;
      pxa = new ross.drawing.LineSegment(i, -axis_reach, i, axis_reach);
      pxb = new ross.drawing.LineSegment(-i, -axis_reach, -i, axis_reach);
      pya = new ross.drawing.LineSegment(-axis_reach, i, axis_reach, i);
      pyb = new ross.drawing.LineSegment(-axis_reach, -i, axis_reach, -i);
      pxa.draw(canvas, col);
      pxb.draw(canvas, col);
      pya.draw(canvas, col);
      pyb.draw(canvas, col);
    }
  }
  canvas.restore();
}

export function getBlockCoord(p){
  let x = p.x | 0, z = p.y | 0;
  if(x !== p.x && p.x < 0) x--;
  if(z !== p.y && p.y < 0) z--;
  return new ross.drawing.Point(x, z);
}

export function drawSingleBlock(canvas, p, color){
  p = getBlockCoord(p);
  canvas.save();
  canvas.beginPath();
  canvas.rect(p.x, p.y, 1, 1);
  canvas.strokeStyle = color;
  canvas.stroke();
  canvas.restore();
}

export function drawBlockGridCircle(canvas, center_p, radius, color){
  const min_p = getBlockCoord({ x: center_p.x - radius,     y: center_p.y - radius });
  const max_p = getBlockCoord({ x: center_p.x + radius + 1, y: center_p.y + radius + 1 });
  const xmin = min_p.x, xmax = max_p.x, zmin = min_p.y, zmax = max_p.y;

  canvas.save();
  canvas.strokeStyle = color;
  canvas.beginPath();
  const lw = canvas.lineWidth;
  canvas.lineWidth = 0.25;
  canvas.arc(center_p.x, center_p.y, radius, 0, Math.PI * 2);
  canvas.stroke();
  canvas.lineWidth = lw;
  canvas.clip();

  if(canvas.getScale() >= 1.0){
    const line = new ross.drawing.LineSegment(0, zmin, 0, zmax);
    for(let x = xmin; x <= xmax; ++x){
      line.p1.x = line.p2.x = x;
      line.draw(canvas, color);
    }
    line.p1.x = xmin;
    line.p2.x = xmax;
    for(let z = zmin; z <= zmax; ++z){
      line.p1.y = line.p2.y = z;
      line.draw(canvas, color);
    }
  } else {
    canvas.fillStyle = color;
    canvas.globalAlpha = 0.5;
    canvas.fill();
  }
  canvas.restore();
}
