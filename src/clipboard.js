export async function copyToClipboard(text){
  if(navigator.clipboard?.writeText){
    try { await navigator.clipboard.writeText(text); return true; }
    catch(_){ /* fall through */ }
  }
  // Fallback for non-secure contexts (file://, raw IPs).
  const ta = document.getElementById('clipboard_buffer');
  if(!ta) return false;
  ta.value = text;
  ta.select();
  try { return document.execCommand('copy'); }
  catch(_){ return false; }
}
