const _cache = {};

export function putToLocalStorage(key, data){
  const s = JSON.stringify(data);
  if(s !== _cache[key]){
    try { localStorage.setItem(key, s); } catch(_){}
    _cache[key] = s;
  }
}

export function getFromLocalStorage(key, defaultValue){
  let s;
  try { s = localStorage.getItem(key); } catch(_){ return defaultValue; }
  if(s == null) return defaultValue;
  try { return JSON.parse(s); } catch(_){ return defaultValue; }
}
