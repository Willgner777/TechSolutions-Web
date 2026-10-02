/**
 * Estados brasileiros usados nos selects de UF.
 * @type {ReadonlyArray<{ sigla: string, nome: string }>}
 */
export const ESTADOS_BRASIL = [
  { sigla: 'AC', nome: 'AC - Acre' },
  { sigla: 'AL', nome: 'AL - Alagoas' },
  { sigla: 'AP', nome: 'AP - Amapá' },
  { sigla: 'AM', nome: 'AM - Amazonas' },
  { sigla: 'BA', nome: 'BA - Bahia' },
  { sigla: 'CE', nome: 'CE - Ceará' },
  { sigla: 'DF', nome: 'DF - Distrito Federal' },
  { sigla: 'ES', nome: 'ES - Espírito Santo' },
  { sigla: 'GO', nome: 'GO - Goiás' },
  { sigla: 'MA', nome: 'MA - Maranhão' },
  { sigla: 'MT', nome: 'MT - Mato Grosso' },
  { sigla: 'MS', nome: 'MS - Mato Grosso do Sul' },
  { sigla: 'MG', nome: 'MG - Minas Gerais' },
  { sigla: 'PA', nome: 'PA - Pará' },
  { sigla: 'PB', nome: 'PB - Paraíba' },
  { sigla: 'PR', nome: 'PR - Paraná' },
  { sigla: 'PE', nome: 'PE - Pernambuco' },
  { sigla: 'PI', nome: 'PI - Piauí' },
  { sigla: 'RJ', nome: 'RJ - Rio de Janeiro' },
  { sigla: 'RN', nome: 'RN - Rio Grande do Norte' },
  { sigla: 'RS', nome: 'RS - Rio Grande do Sul' },
  { sigla: 'RO', nome: 'RO - Rondônia' },
  { sigla: 'RR', nome: 'RR - Roraima' },
  { sigla: 'SC', nome: 'SC - Santa Catarina' },
  { sigla: 'SP', nome: 'SP - São Paulo' },
  { sigla: 'SE', nome: 'SE - Sergipe' },
  { sigla: 'TO', nome: 'TO - Tocantins' },
];

/**
 * Apenas as siglas das UFs, na mesma ordem de ESTADOS_BRASIL.
 * @type {ReadonlyArray<string>}
 */
export const UFS = ESTADOS_BRASIL.map((estado) => estado.sigla);
