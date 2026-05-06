import { OpDrawPoint, OpDrawRay } from './ops.js';

const FLOAT_RE = /^[-+]?(?:\d+(?:[.](?:\d*)?)?|[.]\d+)$/;

export function parseTrigInput(input_text){
  const ops = [];
  const lines = input_text.split(/$/m);
  let active_color = 'gray';
  let handle = null;

  for(const raw of lines){
    const line = raw.trim();
    let tokens = line.split(/\s+/);
    let dimension = 'overworld';
    let dimension_scale = 1;

    // /execute in <dim> run tp @s ...
    if(tokens[0] === '/execute' && tokens[3] === 'run'){
      dimension = tokens[2];
      tokens = tokens.slice(4);
      tokens[0] = '/' + tokens[0];
    }
    // Trim minecraft: prefix.
    dimension = dimension.substr(dimension.lastIndexOf(':') + 1);
    if(dimension === 'the_nether') dimension_scale = 8;

    const isNumeric = i => !!FLOAT_RE.exec(tokens[i]);

    if(!line){
      handle = null;
      continue;
    }
    if(line.startsWith('--')) continue;
    if(line.startsWith('!-')){
      handle = line.substr(2).trim();
      continue;
    }
    if(line[0] === '#'){
      active_color = line.substr(1).trim() || 'gray';
      continue;
    }

    if(tokens[0] === '/tp'){
      if(tokens.length === 7){
        const w = {
          x: parseFloat(tokens[2]) * dimension_scale,
          y: parseFloat(tokens[3]),
          z: parseFloat(tokens[4]) * dimension_scale,
          f: parseFloat(tokens[5]),
          t: parseFloat(tokens[6]),
        };
        if(w.t >= 89){
          ops.push(new OpDrawPoint(w.x, w.z, active_color, handle));
        } else {
          ops.push(new OpDrawRay(w.x, w.z, w.f, active_color, handle));
        }
      } else if(tokens.length >= 4){
        const kk = isNumeric(1) ? 0 : 1;
        const w = {
          x: parseFloat(tokens[1 + kk]) * dimension_scale,
          z: parseFloat(tokens[3 + kk]) * dimension_scale,
        };
        ops.push(new OpDrawPoint(w.x, w.z, active_color, handle));
      }
      continue;
    }

    if(tokens.length === 2){
      if(isNumeric(0) && isNumeric(1)){
        ops.push(new OpDrawPoint(
          parseFloat(tokens[0]),
          parseFloat(tokens[1]),
          active_color, handle
        ));
      }
    } else if(tokens.length === 3 || tokens.length === 4){
      if(tokens[3] === 'N' || tokens[3] === 'n'){
        dimension = 'the_nether';
        dimension_scale = 8;
      }
      if(tokens[1] === '~' && isNumeric(0) && isNumeric(2)){
        ops.push(new OpDrawPoint(
          parseFloat(tokens[0]) * dimension_scale,
          parseFloat(tokens[2]) * dimension_scale,
          active_color, handle
        ));
      } else if(isNumeric(0) && isNumeric(1) && isNumeric(2)){
        ops.push(new OpDrawRay(
          parseFloat(tokens[0]) * dimension_scale,
          parseFloat(tokens[1]) * dimension_scale,
          parseFloat(tokens[2]),
          active_color, handle
        ));
      }
    }
  }

  return ops;
}
