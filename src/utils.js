// Data de hoje no fuso local (YYYY-MM-DD).
// toISOString() usa UTC e, no Brasil, devolve "amanhã" a partir das 21h.
export function hojeLocal() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}
