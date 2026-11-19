import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import './styles.css';
import { instalarRecargaDeVersao } from './recarga-versao.js';

// R1: arquivo do jogo sumiu depois de uma promoção → recarrega uma vez.
instalarRecargaDeVersao(window);

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
