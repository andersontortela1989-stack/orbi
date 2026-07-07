import { useEffect, useRef, useState } from 'react';

// Chave do save — a MESMA do persist do zustand (useGame.js). Só leitura/escrita
// da string já existente; nada aqui conhece o shape interno do estado.
const CHAVE_SAVE = 'cidade-turbo-3d';
// Maior version que este app entende (== version do persist em useGame.js).
// Import de version acima disso é recusado — não sabemos migrar do futuro.
const VERSION_MAX = 6;

// Base64 UTF-8-seguro (o nome da criança pode ter acento): encodeURIComponent
// vira bytes antes do btoa, e o caminho inverso desfaz. Sem escape/unescape.
function paraBase64(str) {
  const bytes = encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, h) =>
    String.fromCharCode(parseInt(h, 16))
  );
  return btoa(bytes);
}
function deBase64(b64) {
  const bytes = atob(b64); // lança em Base64 inválido
  const pct = Array.from(bytes, (c) =>
    '%' + c.charCodeAt(0).toString(16).padStart(2, '0')
  ).join('');
  return decodeURIComponent(pct); // lança em UTF-8 inválido
}

// Copia com fallback pra browsers sem Clipboard API (textarea + execCommand).
async function copiarTexto(texto) {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(texto);
      return true;
    }
  } catch (_) {
    /* cai no fallback abaixo */
  }
  try {
    const ta = document.createElement('textarea');
    ta.value = texto;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    document.body.removeChild(ta);
    return ok;
  } catch (_) {
    return false;
  }
}

/**
 * ÁREA DOS PAIS — painel informativo + portabilidade do save.
 *
 * Explica o Órbi para o adulto (o que é, como foi desenhado, nota honesta) e dá
 * o recurso PRO ADULTO de levar o progresso pra outro aparelho: exportar (Base64
 * do save no clipboard) e importar (cola o código, valida ESTRITO, grava e
 * recarrega). Vive só aqui — a criança não vê.
 *
 * FRONTEIRA: mexe APENAS na string do localStorage do save (a mesma do persist),
 * por leitura/escrita — zero store, zero schema, zero lógica de jogo, zero TTS
 * (nada passa por falar()). O import valida ANTES de escrever e, em erro, NUNCA
 * toca o save existente. Depois de importar, um reload deixa o persist hidratar
 * e migrar (v1→6) normalmente.
 *
 * Espelha o padrão visual do Caderninho (card claro, contorno navy, FECHAR
 * grande no topo), com classes próprias `pais-*`. MONTAGEM: filho de
 * `.orbi-start` (NÃO de `.start-screen`, que tem transform: scale() —
 * position:fixed dentro dele seria escalado). FECHAR ou ESC volta à abertura;
 * fade gated em prefers-reduced-motion; scroll interno no overlay.
 */
export function AreaPais({ onFechar }) {
  // ESC fecha (mesmo padrão do Caderninho). Na abertura não há teclado de
  // jogo competindo, mas ESC é o gesto universal de "voltar".
  useEffect(() => {
    const onKey = (e) => {
      if (e.code === 'Escape') onFechar();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onFechar]);

  // Portabilidade do save (recurso do adulto). Estado local só de UI —
  // nenhum toca a store nem o schema.
  const [codigo, setCodigo] = useState('');
  const [copiado, setCopiado] = useState(false);
  const [erroExport, setErroExport] = useState('');
  const [msgImport, setMsgImport] = useState('');
  const timeoutCopia = useRef(null);

  // Limpa o timer do "copiado!" se o painel fechar no meio.
  useEffect(() => () => clearTimeout(timeoutCopia.current), []);

  const exportar = async () => {
    const cru = localStorage.getItem(CHAVE_SAVE);
    if (!cru) {
      setErroExport('ainda não há progresso pra copiar — jogue um pouco antes.');
      return;
    }
    setErroExport('');
    const ok = await copiarTexto(paraBase64(cru));
    if (!ok) {
      setErroExport('não consegui copiar aqui; tente de novo.');
      return;
    }
    setCopiado(true);
    clearTimeout(timeoutCopia.current);
    timeoutCopia.current = setTimeout(() => setCopiado(false), 2000);
  };

  const importar = () => {
    const txt = codigo.trim();
    if (!txt) {
      setMsgImport('cole o código no campo acima primeiro.');
      return;
    }
    let json;
    let dados;
    try {
      json = deBase64(txt);
      dados = JSON.parse(json);
    } catch (_) {
      setMsgImport('esse código não funcionou, confere se copiou inteiro.');
      return;
    }
    // Validação ESTRITA, ANTES de tocar em qualquer coisa: { state:objeto,
    // version:número ∈ [1, VERSION_MAX] }. Futuro (version > atual) é recusado
    // (não sabemos migrar do que ainda não existe).
    const valido =
      dados &&
      typeof dados === 'object' &&
      dados.state &&
      typeof dados.state === 'object' &&
      typeof dados.version === 'number' &&
      dados.version >= 1 &&
      dados.version <= VERSION_MAX;
    if (!valido) {
      setMsgImport('esse código não funcionou, confere se copiou inteiro.');
      return;
    }
    // Só agora escreve — o save atual ficou intacto em todo caminho de erro.
    try {
      localStorage.setItem(CHAVE_SAVE, json);
    } catch (_) {
      setMsgImport('não consegui salvar aqui; tente de novo.');
      return;
    }
    window.location.reload();
  };

  return (
    <div className="pais-overlay">
      <div className="pais-painel" role="dialog" aria-label="Área dos pais">
        <div className="pais-topo">
          <div className="pais-titulo">ÁREA DOS PAIS</div>
          {/* tabIndex=-1 + blur(): mesma higiene dos outros painéis — o botão
              clicado não fica focado (aqui não há ESPAÇO/freio, mas mantém o
              padrão e evita re-clique por teclado). */}
          <button
            type="button"
            className="pais-fechar"
            tabIndex={-1}
            onClick={(e) => {
              onFechar();
              e.currentTarget.blur();
            }}
          >
            FECHAR
          </button>
        </div>

        <section className="pais-secao">
          <h3 className="pais-secao-titulo">O que é o Órbi</h3>
          <p className="pais-texto">
            O Órbi é um jogo educativo gratuito, feito por um pai para o filho
            autista com TDAH. A criança dirige por uma cidade calma e ensina o
            Órbi — um alienzinho que acabou de chegar e não conhece nada da
            Terra. Aqui, a criança não é testada: ela é quem sabe.
          </p>
        </section>

        <section className="pais-secao">
          <h3 className="pais-secao-titulo">Como o jogo foi desenhado</h3>
          <ul className="pais-lista">
            <li>Errar nunca é punido — sem vermelho, sem som de erro, sem "você perdeu"</li>
            <li>Sem cronômetro e sem pressão — cada criança no seu ritmo</li>
            <li>Uma coisa de cada vez — nada aparece de surpresa</li>
            <li>Sem anúncios, sem compras, sem cadastro</li>
            <li>O progresso fica salvo somente neste aparelho</li>
          </ul>
        </section>

        <section className="pais-secao">
          <h3 className="pais-secao-titulo">Nota honesta</h3>
          <p className="pais-texto">
            O Órbi é um jogo educativo. Ele não trata, não cura e não substitui
            terapias, diagnóstico ou acompanhamento profissional.
          </p>
        </section>

        <section className="pais-secao">
          <h3 className="pais-secao-titulo">Salvar o progresso</h3>
          <p className="pais-texto">
            Use este código pra levar o progresso do seu filho pra outro celular
            ou computador.
          </p>

          <button
            type="button"
            className="pais-btn"
            tabIndex={-1}
            onClick={exportar}
          >
            {copiado ? 'copiado!' : 'COPIAR CÓDIGO DO PROGRESSO'}
          </button>
          {erroExport && <p className="pais-aviso">{erroExport}</p>}

          <label className="pais-campo-label" htmlFor="pais-codigo">
            trazer de outro aparelho
          </label>
          <textarea
            id="pais-codigo"
            className="pais-campo"
            rows={3}
            spellCheck={false}
            placeholder="cole aqui o código do outro aparelho"
            value={codigo}
            onChange={(e) => {
              setCodigo(e.target.value);
              setMsgImport('');
            }}
          />
          <button
            type="button"
            className="pais-btn pais-btn--secundario"
            tabIndex={-1}
            onClick={importar}
          >
            TRAZER PROGRESSO DE OUTRO APARELHO
          </button>
          <p className="pais-nota">
            isto substitui o progresso salvo neste aparelho pelo do código.
          </p>
          {msgImport && <p className="pais-aviso">{msgImport}</p>}
        </section>

        <p className="pais-rodape">
          Feito com carinho por Anderson Tortela — para o Heitor
        </p>
      </div>
    </div>
  );
}
