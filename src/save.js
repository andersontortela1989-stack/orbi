/**
 * SAVE — fronteira única de persistência do progresso (P0-06 + P1-07).
 *
 * Tudo que conhece a STRING gravada em localStorage mora aqui: a versão, as
 * chaves, o storage anti-reset do persist e a plumbing do export/import da
 * Área dos pais. useGame.js segue dono do SHAPE do estado (partialize/migrate);
 * AreaPais.jsx segue dona da UI. JS puro, sem React/zustand — roda em Node,
 * então os casos de teste (tests/save.test.js) exercitam exatamente este código.
 *
 * GUARD-RAIL (anti-reset-silencioso): save corrompido NUNCA é descartado em
 * silêncio. O bruto vai pra CHAVE_BACKUP_CORROMPIDO ANTES de qualquer escrita
 * do persist, e o jogo abre num estado seguro jogável. Chave AUSENTE (primeiro
 * acesso) não é corrupção: fluxo normal, sem backup.
 */

// Versão atual do save — a MESMA passada ao persist (useGame.js) e o teto que
// o import aceita (versão do futuro é recusada: não sabemos migrar dela).
// Bump aqui a cada chave nova aninhada em habilidades/descobertas (ver o
// histórico v2→v7 no comentário do persist).
export const SAVE_VERSION = 7;

export const CHAVE_SAVE = 'cidade-turbo-3d';
// Cópia do save atual, feita ANTES do import sobrescrever (escrita destrutiva).
export const CHAVE_BACKUP_IMPORT = 'orbi-save-bkp';
// Cópia BRUTA de um save que não parseou/validou — matéria-prima de recuperação.
export const CHAVE_BACKUP_CORROMPIDO = 'cidade-turbo-3d-corrompido-bkp';

/**
 * Migração pura do shape persistido. Recebe os defaults da store para manter
 * save.js desacoplado do Zustand e continuar testável diretamente no Node.
 */
export function migrarEstadoPersistido(persisted, defaults) {
  if (!persisted) return persisted;
  const recompensas = Array.isArray(persisted.recompensas)
    ? [...new Set(persisted.recompensas.filter((item) => typeof item === 'string'))]
    : [...(defaults.recompensas ?? [])];
  const flagsPersistidas =
    persisted.worldFlags &&
    typeof persisted.worldFlags === 'object' &&
    !Array.isArray(persisted.worldFlags)
      ? persisted.worldFlags
      : {};
  return {
    ...persisted,
    habilidades: {
      ...defaults.habilidades,
      ...(persisted.habilidades ?? {}),
    },
    descobertas: {
      ...defaults.descobertas,
      ...(persisted.descobertas ?? {}),
    },
    worldFlags: {
      ...(defaults.worldFlags ?? {}),
      ...flagsPersistidas,
    },
    recompensas,
  };
}

function temStorage() {
  return typeof localStorage !== 'undefined';
}

/**
 * Storage do zustand/persist (formato PersistStorage: objetos, não strings).
 * Igual ao createJSONStorage default em TUDO, menos no caminho de erro:
 * conteúdo presente mas corrompido/shape inválido → preserva o bruto em
 * CHAVE_BACKUP_CORROMPIDO e retorna null (persist hidrata o estado inicial,
 * jogável). Sem isso, o estado inicial sobrescreveria a string corrompida na
 * primeira escrita — reset silencioso, exatamente o que o P0-06 proíbe.
 */
export const storageSeguro = {
  getItem: (nome) => {
    if (!temStorage()) return null;
    const cru = localStorage.getItem(nome);
    if (cru === null) return null; // primeiro acesso: não é corrupção
    let dados;
    try {
      dados = JSON.parse(cru);
    } catch (_) {
      dados = null; // JSON quebrado (inclui string vazia)
    }
    // Shape mínimo do persist: { state: objeto }. JSON válido sem isso é um
    // save parcial/estranho — mesmo tratamento de corrompido.
    if (dados && typeof dados === 'object' && dados.state && typeof dados.state === 'object') {
      return dados;
    }
    try {
      // O PRIMEIRO backup vence: se já existe um, ele é o mais próximo do
      // original bom — releituras corrompidas (ex.: 3 reloads seguidos) não
      // podem sobrescrevê-lo com material cada vez pior.
      if (localStorage.getItem(CHAVE_BACKUP_CORROMPIDO) === null) {
        localStorage.setItem(CHAVE_BACKUP_CORROMPIDO, cru);
      }
    } catch (_) {
      /* sem espaço pro backup: ainda assim retorna estado seguro; o bruto
         original segue na chave até a próxima escrita */
    }
    return null;
  },
  setItem: (nome, valor) => {
    if (!temStorage()) return;
    localStorage.setItem(nome, JSON.stringify(valor));
  },
  removeItem: (nome) => {
    if (!temStorage()) return;
    localStorage.removeItem(nome);
  },
};

/**
 * Validação ESTRITA do JSON colado no import (antes de tocar em qualquer
 * coisa): { state: objeto, version: número ∈ [1, SAVE_VERSION] }. Futuro
 * (version > SAVE_VERSION) é recusado — não sabemos migrar do que ainda
 * não existe.
 */
export function validarSaveImportado(dados) {
  return !!(
    dados &&
    typeof dados === 'object' &&
    dados.state &&
    typeof dados.state === 'object' &&
    typeof dados.version === 'number' &&
    dados.version >= 1 &&
    dados.version <= SAVE_VERSION
  );
}

/**
 * Resumo humano de um save JÁ VALIDADO — o que o adulto confere antes de
 * confirmar a substituição: nome, veículo, moedas e o total de descobertas
 * (soma das categorias do caderninho). Defensivo em toda chave: um save
 * antigo (v1) não tem `descobertas`, e o resumo mostra 0 sem quebrar.
 */
export function resumoDoSave(dados) {
  const s = dados?.state ?? {};
  const descobertas = s.descobertas && typeof s.descobertas === 'object' ? s.descobertas : {};
  const totalDescobertas = Object.values(descobertas).reduce(
    (soma, lista) => soma + (Array.isArray(lista) ? lista.length : 0),
    0
  );
  return {
    nome: typeof s.nome === 'string' ? s.nome : '',
    veiculo: typeof s.veiculo === 'string' && s.veiculo ? s.veiculo : 'carro',
    moedas: typeof s.moedas === 'number' ? s.moedas : 0,
    totalDescobertas,
  };
}

/**
 * Backup do save atual em CHAVE_BACKUP_IMPORT — chamado ANTES da escrita
 * destrutiva do import. Retorna true quando é seguro prosseguir: backup
 * gravado, OU não havia save (nada a proteger). false = o backup falhou e
 * a substituição NÃO deve acontecer.
 */
export function backupDoSaveAtual() {
  if (!temStorage()) return false;
  const atual = localStorage.getItem(CHAVE_SAVE);
  if (atual === null) return true; // primeiro aparelho: nada destrutivo
  try {
    localStorage.setItem(CHAVE_BACKUP_IMPORT, atual);
    return true;
  } catch (_) {
    return false;
  }
}

// Base64 UTF-8-seguro (o nome da criança pode ter acento): encodeURIComponent
// vira bytes antes do btoa, e o caminho inverso desfaz. Sem escape/unescape.
// (Ex-AreaPais.jsx — movidos pra cá pra ida-e-volta ser testável em Node.)
export function paraBase64(str) {
  const bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16))
  );
  return btoa(bytes);
}

export function deBase64(b64) {
  const bytes = atob(b64); // lança em Base64 inválido
  const pct = Array.from(bytes, (c) =>
    '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
  ).join('');
  return decodeURIComponent(pct); // lança em UTF-8 inválido
}
