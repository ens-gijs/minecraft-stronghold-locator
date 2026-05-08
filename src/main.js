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

function setupSidebar(){
  const sidebar = $('#rightbar');
  const toggle = $('#sidebar_toggle');
  const handle = $('#sidebar_resize');
  if(!toggle || !sidebar || !handle) return;

  const MIN_W = 240, MIN_H = 120, MAX_RATIO = 0.8;
  // Always leave at least this much room for the canvas on desktop, otherwise
  // the grid overflows (rightbar wins, buttons + textarea slide off-screen).
  const MIN_CANVAS_W = 320;
  const isNarrow = () => window.matchMedia('(max-width: 720px)').matches;
  const root = document.documentElement;

  function clamp(v, lo, hi){ return Math.min(Math.max(v, lo), Math.max(lo, hi)); }
  function maxSidebarW(){
    return Math.min(
      Math.floor(window.innerWidth * MAX_RATIO),
      window.innerWidth - MIN_CANVAS_W
    );
  }

  toggle.addEventListener('click', () => {
    const collapsed = document.body.classList.toggle('sidebar-collapsed');
    putToLocalStorage('sidebar_collapsed', collapsed);
  });

  let drag = null;

  handle.addEventListener('pointerdown', (e) => {
    if(document.body.classList.contains('sidebar-collapsed')) return;
    const rect = sidebar.getBoundingClientRect();
    drag = {
      id: e.pointerId,
      narrow: isNarrow(),
      startX: e.clientX,
      startY: e.clientY,
      startW: rect.width,
      startH: rect.height
    };
    document.body.classList.add('resizing');
    handle.setPointerCapture(e.pointerId);
    e.preventDefault();
  });

  handle.addEventListener('pointermove', (e) => {
    if(!drag || drag.id !== e.pointerId) return;
    if(drag.narrow){
      // Drag UP grows the drawer.
      const dy = drag.startY - e.clientY;
      const maxH = Math.floor(window.innerHeight * MAX_RATIO);
      const h = clamp(drag.startH + dy, MIN_H, maxH);
      root.style.setProperty('--drawer-h', h + 'px');
    } else {
      // Drag LEFT widens the sidebar.
      const dx = drag.startX - e.clientX;
      const w = clamp(drag.startW + dx, MIN_W, maxSidebarW());
      root.style.setProperty('--sidebar-w', w + 'px');
    }
  });

  function endDrag(e){
    if(!drag || drag.id !== e.pointerId) return;
    if(drag.narrow){
      const h = parseFloat(root.style.getPropertyValue('--drawer-h'));
      if(isFinite(h)) putToLocalStorage('drawer_h', h);
    } else {
      const w = parseFloat(root.style.getPropertyValue('--sidebar-w'));
      if(isFinite(w)) putToLocalStorage('sidebar_w', w);
    }
    document.body.classList.remove('resizing');
    try { handle.releasePointerCapture(e.pointerId); } catch(_){}
    drag = null;
  }
  handle.addEventListener('pointerup', endDrag);
  handle.addEventListener('pointercancel', endDrag);

  // On viewport resize, only clamp if the stored size now exceeds the 80%
  // bound (the user explicitly asked for sizes NOT to reflow otherwise).
  window.addEventListener('resize', () => {
    const cs = getComputedStyle(root);
    const w = parseFloat(cs.getPropertyValue('--sidebar-w'));
    const maxW = maxSidebarW();
    if(isFinite(w) && w > maxW){
      const newW = Math.max(MIN_W, maxW);
      root.style.setProperty('--sidebar-w', newW + 'px');
      putToLocalStorage('sidebar_w', newW);
    }
    const h = parseFloat(cs.getPropertyValue('--drawer-h'));
    const maxH = Math.floor(window.innerHeight * MAX_RATIO);
    if(isFinite(h) && h > maxH){
      const newH = Math.max(MIN_H, maxH);
      root.style.setProperty('--drawer-h', newH + 'px');
      putToLocalStorage('drawer_h', newH);
    }
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
    canvas.resetTransforms(false);
    // On narrow viewports the canvas spans the full screen, but the bottom
    // drawer (when open) covers part of it — shift the origin upward so the
    // visible area's center lines up with world (0,0).
    const narrow = window.matchMedia('(max-width: 720px)').matches;
    const drawerOpen = !document.body.classList.contains('sidebar-collapsed');
    if(narrow && drawerOpen){
      const drawerHpx = $('#rightbar').offsetHeight;
      const s = canvas.getScale() || 1;
      canvas.translate(0, -drawerHpx / (2 * s));
      canvas._syncTransforms();
    }
    canvas.redraw();
    track('Map Action', 'Reset View');
  });

  $('#swap_theme')?.addEventListener('click', () => {
    track('Feature', 'Swap Theme');
    toggleTheme();
    draw();
  });

  setupSidebar();

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
