import { getFromLocalStorage, putToLocalStorage } from './storage.js';

export const themes = {
  dark: {
    name: 'dark',
    background: '#282828',
    stronghold_rings: '#cffccb20',
    axis_color: '#faebd733',
    tick_a_color: '#6663',
    tick_b_color: '#8883'
  },
  light: {
    name: 'light',
    background: '#fcfcfc',
    stronghold_rings: '#8fbc8b20',
    axis_color: '#80000022',
    tick_a_color: '#00000008',
    tick_b_color: '#00008010'
  }
};

function detectInitialTheme(){
  const saved = getFromLocalStorage('theme');
  if(saved === 'light' || saved === 'dark') return saved;
  if(window.matchMedia?.('(prefers-color-scheme: light)').matches) return 'light';
  return 'dark';
}

let active = themes[detectInitialTheme()];

export function getActiveTheme(){ return active; }

export function applyTheme(name){
  active = themes[name] || themes.dark;
  document.body.classList.remove('light', 'dark');
  document.body.classList.add(active.name);
  putToLocalStorage('theme', active.name);
  return active;
}

export function toggleTheme(){
  return applyTheme(active.name === 'light' ? 'dark' : 'light');
}

// Pre-paint body class so the page matches the chosen theme without flicker.
// Called from index.html before the rest of the module graph runs.
export function bootstrapBodyClass(){
  document.body.classList.add(active.name);
}
