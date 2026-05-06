import { getFromLocalStorage, putToLocalStorage } from './storage.js';
import { copyToClipboard } from './clipboard.js';
import { track } from './analytics.js';
import { getActiveTheme, toggleTheme, bootstrapBodyClass } from './themes.js';
import { drawStrongholdRings, drawAxis } from './drawing.js';
import { parseTrigInput } from './parser.js';

bootstrapBodyClass();

const $ = (sel) => document.querySelector(sel);

let canvas;
let user_ops = [];

function draw(){
  const theme = getActiveTheme();
  canvas.clear(theme.background);
  drawStrongholdRings(canvas, theme);
  drawAxis(canvas, theme);
  for(const op of user_ops) op.exec(canvas);
}

function numfmt(v, hi_perc){
  let s = '';
  if(v < 0){ v = -v; s = '-'; }
  s += (v | 0);
  if(hi_perc){
    const k = (v * 10) % 10 | 0;
    s += '.' + k;
  }
  return s;
}

function setupSidebarToggle(){
  const sidebar = $('#rightbar');
  const toggle = $('#sidebar_toggle');
  if(!toggle || !sidebar) return;

  // Restore previous state on narrow viewports.
  const isNarrow = () => window.matchMedia('(max-width: 720px)').matches;
  const stored = getFromLocalStorage('sidebar_open');
  if(isNarrow() && stored === true) sidebar.classList.add('open');

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
    putToLocalStorage('sidebar_open', sidebar.classList.contains('open'));
  });
}

function init(){
  // Restore saved triangulation input.
  const savedInput = getFromLocalStorage('trig_input');
  const trigInput = $('#trig_input');
  if(savedInput) trigInput.value = savedInput;

  canvas = ross.drawing.canvas_helpers.initCanvas('#board', draw, {
    default_scale: 0.1,
    flip_y: false,
    zoom_options: {
      scale_factor: 1.05,
      min_scale: 0.001,
      max_scale: 128
    }
  });

  $('#readme_link')?.addEventListener('click', () => track('Feature', 'View Readme'));
  $('#web_color_link')?.addEventListener('click', () => track('Feature', 'View Web Colors'));

  $('#reset_view')?.addEventListener('click', () => {
    canvas.resetTransforms(true);
    track('Map Action', 'Reset View');
  });

  $('#swap_theme')?.addEventListener('click', () => {
    track('Feature', 'Swap Theme');
    toggleTheme();
    draw();
  });

  setupSidebarToggle();

  canvas.scale_changed_event.subscribe({}, (scale) => {
    putToLocalStorage('view_transform', canvas.getTransform());
    let s;
    if(Math.abs(scale * 10 + 0.5 | 0) === 10){
      s = '1:1';
    } else if(scale < 1){
      s = '1 / ' + ((1 / scale * 10 + 0.5 | 0) / 10);
    } else {
      s = ((scale * 10 + 0.5 | 0) / 10) + 'x';
    }
    $('#zoom').textContent = s;
  });

  canvas.mouseup_event.subscribe({}, () => {
    putToLocalStorage('view_transform', canvas.getTransform());
  });

  canvas.mousemove_event.subscribe({}, (p) => {
    const hi_perc = canvas.getScale() > 5;
    $('#overworld_pos').textContent = numfmt(p.x, hi_perc) + ', ' + numfmt(p.y, hi_perc);
    $('#nether_pos').textContent    = numfmt(p.x / 8, hi_perc) + ', ' + numfmt(p.y / 8, hi_perc);
  });

  canvas.mousedblclick_event.subscribe({}, async (p, e) => {
    let world, loc;
    if(e.altKey){
      world = 'Nether';
      loc = (p.x / 8 | 0) + ' ~ ' + (p.y / 8 | 0) + ' N';
    } else {
      world = 'Overworld';
      loc = (p.x | 0) + ' ~ ' + (p.y | 0);
    }
    await copyToClipboard(loc);
    track('Clipboard', 'Copy ' + world + ' Coords');
  });

  // Restore saved transform.
  const savedTransform = getFromLocalStorage('view_transform');
  if(savedTransform) canvas.setTransform(savedTransform);
  draw();
  canvas.scale_changed_event.trigger(canvas.getScale());

  let first = true;
  const onInputChange = () => {
    const lastOps = JSON.stringify(user_ops);
    const text = trigInput.value;
    putToLocalStorage('trig_input', text);
    user_ops = parseTrigInput(text);
    canvas.redraw();
    if(!first){
      const thisOps = JSON.stringify(user_ops);
      if(lastOps !== thisOps) track('User Input', 'Changed', user_ops.length);
    } else {
      first = false;
    }
  };
  trigInput.addEventListener('input', onInputChange);
  onInputChange();
}

if(document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}
