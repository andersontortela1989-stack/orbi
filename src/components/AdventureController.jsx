import { useEffect } from 'react';
import {
  enviarEventoAventura,
  iniciarParqueComSede,
} from '../adventure/runtime.js';
import { useAdventure } from '../adventure/useAdventure.js';
import { useActivity } from '../activity/useActivity.js';

function AdventurePanel() {
  const aventura = useAdventure();
  const atividade = useActivity();
  const painel = aventura.painel;
  if (!aventura.ativa || !painel) return null;

  const focoEsperado =
    painel.tipo === 'pergunta'
      ? 'pergunta'
      : painel.tipo === 'resumo'
        ? 'resumo'
        : 'historia';
  if (atividade.foco !== focoEsperado) return null;

  if (painel.tipo === 'mensagem') {
    return (
      <div className="adv-overlay">
        <div className="adv-painel adv-painel--mensagem" role="dialog">
          <div className="adv-selo">NOVA AVENTURA</div>
          <div className="adv-titulo">{aventura.titulo}</div>
          <p className="adv-texto">{painel.texto}</p>
          <button
            type="button"
            className="adv-continuar"
            onClick={(e) => {
              enviarEventoAventura({ tipo: 'toque' });
              e.currentTarget.blur();
            }}
          >
            {painel.botao}
          </button>
        </div>
      </div>
    );
  }

  if (painel.tipo === 'pergunta') {
    const resolvida = !!painel.respostaRevelada;
    return (
      <div className="adv-overlay">
        <div className="adv-painel" role="dialog" aria-label="Pergunta da aventura">
          <div className="adv-titulo">{painel.texto}</div>
          <div className="adv-opcoes">
            {painel.opcoes.map((opcao) => (
              <button
                type="button"
                className={
                  'adv-opcao' +
                  (painel.respostaRevelada === opcao.id ? ' adv-opcao--certa' : '')
                }
                key={opcao.id}
                disabled={resolvida}
                onClick={(e) => {
                  enviarEventoAventura({ tipo: 'respondeu', opcao: opcao.id });
                  e.currentTarget.blur();
                }}
              >
                <span className="adv-emoji" aria-hidden="true">{opcao.emoji}</span>
                <span>{opcao.rotulo}</span>
              </button>
            ))}
          </div>
          {!resolvida && (
            <button
              type="button"
              className="adv-ajuda-painel"
              onClick={(e) => {
                enviarEventoAventura({ tipo: 'pedir_ajuda' });
                e.currentTarget.blur();
              }}
            >
              💡 OUVIR UMA DICA
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="adv-overlay adv-overlay--resumo">
      <div className="adv-painel adv-painel--resumo" role="dialog">
        <div className="adv-selo">AVENTURA CONCLUÍDA</div>
        <div className="adv-titulo">{painel.titulo}</div>
        <ul className="adv-aprendizados">
          {painel.aprendizados.map((item) => <li key={item}>{item}</li>)}
        </ul>
        <div className="adv-recompensas">
          {painel.recompensas.map((item) => <span key={item}>{item}</span>)}
        </div>
        <button
          type="button"
          className="adv-continuar"
          onClick={(e) => {
            enviarEventoAventura({ tipo: 'toque' });
            e.currentTarget.blur();
          }}
        >
          CONTINUAR EXPLORANDO
        </button>
      </div>
    </div>
  );
}

export function AdventureController() {
  const aventura = useAdventure();
  const atividade = useActivity();

  useEffect(() => {
    iniciarParqueComSede();
  }, [atividade.foco]);

  useEffect(() => {
    if (!aventura.ativa) return undefined;
    const id = setInterval(
      () => enviarEventoAventura({ tipo: 'tick', segundos: 1 }),
      1000
    );
    return () => clearInterval(id);
  }, [aventura.ativa]);

  return <AdventurePanel />;
}
