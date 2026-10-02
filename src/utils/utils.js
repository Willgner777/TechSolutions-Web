/**
 * Cadastros (funcionários e contratos) só podem ser usados pelo admin da empresa.
 * Aceita `admin_empresa` e `admin_empresas` (mesmo papel, grafias distintas).
 *
 * @param {string | null | undefined} role
 * @returns {boolean}
 */
export function podeUsarCadastros(role) {
  return role === 'admin_empresa' || role === 'admin_empresas';
}

/**
 * Data de hoje no fuso local, no formato YYYY-MM-DD.
 *
 * `toISOString()` usa UTC e, no Brasil, devolve "amanhã" a partir das 21h;
 * por isso a data é montada com os getters locais.
 *
 * @returns {string} Data local no formato YYYY-MM-DD.
 */
export function hojeLocal() {
  const d = new Date();
  const mes = String(d.getMonth() + 1).padStart(2, '0');
  const dia = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${mes}-${dia}`;
}

/**
 * Exporta dados para CSV e faz download no navegador.
 * @param {object[]} data - Array de objetos.
 * @param {string} filename - Nome do arquivo.
 */
export function exportarCSV(data, filename = 'export.csv') {
  if (!Array.isArray(data) || data.length === 0) return;
  const headers = Object.keys(data[0]);
  const csvRows = [
    headers.join(';'),
    ...data.map(row => headers.map(h => {
      const val = row[h] ?? '';
      const str = String(val).replace(/;/g, ',').replace(/"/g, '""');
      return `"${str}"`;
    }).join(';'))
  ].join('\r\n');
  const blob = new Blob([csvRows], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
