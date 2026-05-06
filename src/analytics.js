// GA4 wrapper. The gtag snippet in index.html sets up window.gtag.
export function track(category, action, value){
  if(typeof window.gtag !== 'function') return;
  const payload = { event_category: category };
  if(value !== undefined) payload.value = value;
  window.gtag('event', action, payload);
}
