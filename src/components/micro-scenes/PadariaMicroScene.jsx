import { useRef, useState } from 'react';
import {
  PAES_DA_PADARIA,
  alternarPaoNaCesta,
  conferirEConcluirPedido,
} from './padaria-model.js';

function Pao({ id, naCesta, desabilitado, onMover }) {
  return (
    <button
      type="button"
      className={`padaria-pao${naCesta ? ' padaria-pao--na-cesta' : ''}`}
      aria-label={naCesta ? `devolver pão ${id} para a bandeja` : `colocar pão ${id} na cesta`}
      disabled={desabilitado}
      onClick={() => onMover(id)}
    >
      <span className="padaria-pao__miolo" aria-hidden="true">
        <i />
        <i />
        <i />
      </span>
    </button>
  );
}

export function PadariaMicroScene({ interacao, onConcluir, onSair }) {
  const alvo = useRef(interacao.alvo).current;
  const [paesNaCesta, setPaesNaCesta] = useState([]);
  const [feedback, setFeedback] = useState('');
  const concluida = interacao.status === 'concluida';
  const paesNaBandeja = PAES_DA_PADARIA.filter((id) => !paesNaCesta.includes(id));

  const moverPao = (id) => {
    if (concluida) return;
    setPaesNaCesta((atuais) => alternarPaoNaCesta(atuais, id));
    setFeedback('');
  };

  const conferir = () => {
    if (concluida) return;
    const resultado = conferirEConcluirPedido(alvo, paesNaCesta, onConcluir);
    if (resultado.concluiu) {
      setFeedback(`PEDIDO PRONTO: ${resultado.quantidade} PÃES NA CESTA!`);
      return;
    }
    if (!resultado.correto) {
      setFeedback(`AGORA TEM ${resultado.quantidade}. O PEDIDO MOSTRA ${resultado.alvo}.`);
    }
  };

  return (
    <div className={`padaria-scene${concluida ? ' padaria-scene--concluida' : ''}`}>
      <header className="padaria-scene__header">
        <div>
          <span className="padaria-scene__eyebrow">PEDIDO DA PADARIA</span>
          <h1>SEPARE <strong>{alvo}</strong> PÃES</h1>
        </div>
        <div className="padaria-alvo" aria-label={`o pedido é de ${alvo} pães`}>
          <span>PEDIDO</span>
          <strong>{alvo}</strong>
        </div>
      </header>

      <div className="padaria-bancada">
        <section className="padaria-estacao padaria-estacao--bandeja" aria-label="bandeja de pães">
          <h2>BANDEJA</h2>
          <div className="padaria-paes" aria-live="polite">
            {paesNaBandeja.map((id) => (
              <Pao key={id} id={id} naCesta={false} desabilitado={concluida} onMover={moverPao} />
            ))}
            {paesNaBandeja.length === 0 && <span className="padaria-vazio">VAZIA</span>}
          </div>
          <p>TOQUE NUM PÃO PARA SEPARAR</p>
        </section>

        <div className="padaria-contador" aria-live="polite" aria-atomic="true">
          <span>NA CESTA</span>
          <strong>{paesNaCesta.length}</strong>
          <small>DE {alvo}</small>
        </div>

        <section className="padaria-estacao padaria-estacao--cesta" aria-label="cesta do pedido">
          <h2>CESTA</h2>
          <div className="padaria-cesta">
            <div className="padaria-paes padaria-paes--cesta" aria-live="polite">
              {paesNaCesta.map((id) => (
                <Pao key={id} id={id} naCesta desabilitado={concluida} onMover={moverPao} />
              ))}
              {paesNaCesta.length === 0 && <span className="padaria-vazio">COLOQUE AQUI</span>}
            </div>
          </div>
          <p>TOQUE PARA DEVOLVER</p>
        </section>
      </div>

      <div
        className={`padaria-feedback${concluida ? ' padaria-feedback--concluida' : ''}`}
        role="status"
        aria-live="polite"
      >
        {feedback || 'VOCÊ PODE MOVER OS PÃES QUANTAS VEZES QUISER.'}
      </div>

      <footer className="padaria-acoes">
        <button type="button" className="padaria-btn padaria-btn--voltar" onClick={onSair}>
          VOLTAR À CIDADE
        </button>
        <button
          type="button"
          className="padaria-btn padaria-btn--mostrar"
          disabled={concluida}
          onClick={conferir}
        >
          {concluida ? 'PEDIDO PRONTO!' : 'MOSTRAR PRO ÓRBI'}
        </button>
      </footer>
    </div>
  );
}
