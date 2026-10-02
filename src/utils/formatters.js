/**
 * Converte uma data ISO de calendário (YYYY-MM-DD) para DD/MM/AAAA.
 * Não usa `Date`, evitando deslocamento de fuso horário.
 *
 * @param {string | null | undefined} dataIso - Data no formato YYYY-MM-DD.
 * @returns {string} Data em DD/MM/AAAA, "-" quando vazia, ou o valor original se o formato for inesperado.
 */
export function formatarDataBR(dataIso) {
  if (!dataIso) return '-';
  const partes = dataIso.split('-');
  if (partes.length !== 3) return dataIso;
  return `${partes[2]}/${partes[1]}/${partes[0]}`;
}

/**
 * Formata um timestamp ISO completo (ex.: `created_at`) usando a localidade pt-BR.
 *
 * @param {string | null | undefined} timestampIso - Timestamp ISO 8601.
 * @returns {string} Data localizada ou "-" quando vazia.
 */
export function formatarTimestampBR(timestampIso) {
  return timestampIso ? new Date(timestampIso).toLocaleDateString('pt-BR') : '-';
}
