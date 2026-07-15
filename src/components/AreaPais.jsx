import { useEffect, useRef, useState } from 'react';
import {
  CHAVE_SAVE,
  validarSaveImportado,
  resumoDoSave,
  backupDoSaveAtual,
  paraBase64,
  deBase64,
} from '../save.js';

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
 * por leitura/escrita — zero store, zero lógica de jogo, zero TTS (nada passa
 * por falar()). Validação, resumo e backup vêm PRONTOS de save.js (a fronteira
 * que conhece o shape); aqui é só UI. O import valida ANTES de escrever, mostra
 * um RESUMO do que vai entrar (nome, veículo, moedas, descobertas) e só
 * substitui após confirmação — com o save atual copiado pra 'orbi-save-bkp'
 * antes da escrita destrutiva. Em erro, NUNCA toca o save existente. Depois de
 * importar, um reload deixa o persist hidratar e migrar (v1→6) normalmente.
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
  // Import pendente de confirmação: { json, resumo }. Enquanto existe, o botão
  // TRAZER dá lugar ao resumo + CONFIRMAR/CANCELAR. Nada foi escrito ainda.
  const [pendente, setPendente] = useState(null);
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

  // Passo 1: decodifica + valida (estrito, em save.js) e monta o RESUMO.
  // Nenhuma escrita acontece aqui — o save atual fica intacto em todo
  // caminho de erro E enquanto o adulto decide.
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
    if (!validarSaveImportado(dados)) {
      setMsgImport('esse código não funcionou, confere se copiou inteiro.');
      return;
    }
    setMsgImport('');
    setPendente({ json, resumo: resumoDoSave(dados) });
  };

  // Passo 2 (após confirmação): backup do save atual em 'orbi-save-bkp' e SÓ
  // ENTÃO a escrita destrutiva. Backup falhou → não substitui (regra P0-06).
  const confirmarImport = () => {
    if (!pendente) return;
    if (!backupDoSaveAtual()) {
      setMsgImport('não consegui guardar o backup; nada foi alterado.');
      setPendente(null);
      return;
    }
    try {
      localStorage.setItem(CHAVE_SAVE, pendente.json);
    } catch (_) {
      setMsgImport('não consegui salvar aqui; tente de novo.');
      setPendente(null);
      return;
    }
    window.location.reload();
  };

  const cancelarImport = () => setPendente(null);

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
              setPendente(null); // código mudou: o resumo anterior não vale mais
            }}
          />
          {!pendente && (
            <>
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
            </>
          )}
          {pendente && (
            <>
              <p className="pais-texto">encontrei este progresso no código:</p>
              <ul className="pais-lista">
                <li>nome: {pendente.resumo.nome || '(sem nome ainda)'}</li>
                <li>veículo: {pendente.resumo.veiculo}</li>
                <li>moedas: {pendente.resumo.moedas}</li>
                <li>descobertas no caderninho: {pendente.resumo.totalDescobertas}</li>
              </ul>
              <p className="pais-nota">
                confirmar substitui o progresso deste aparelho — o atual fica
                guardado num backup interno.
              </p>
              <button
                type="button"
                className="pais-btn"
                tabIndex={-1}
                onClick={confirmarImport}
              >
                SIM, TRAZER ESTE PROGRESSO
              </button>
              <button
                type="button"
                className="pais-btn pais-btn--secundario"
                tabIndex={-1}
                onClick={cancelarImport}
              >
                CANCELAR
              </button>
            </>
          )}
          {msgImport && <p className="pais-aviso">{msgImport}</p>}
        </section>

        <p className="pais-rodape">
          Feito com carinho por Anderson Tortela — para o Heitor
        </p>
      </div>
    </div>
  );
}
