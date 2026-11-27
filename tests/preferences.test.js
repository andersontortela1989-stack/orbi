import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  PREFERENCIAS_PADRAO,
  PRESET_TRANQUILO,
  normalizarPreferencias,
  personalizarPreferencia,
} from '../src/preferences.js';

test('preferências ausentes ou inválidas voltam ao perfil seguro', () => {
  assert.deepEqual(normalizarPreferencias(null), PREFERENCIAS_PADRAO);
  assert.deepEqual(
    normalizarPreferencias({ voz: false, sons: 'não', animacoes: 0 }),
    { ...PREFERENCIAS_PADRAO, voz: false }
  );
});

test('Modo Tranquilo preserva a voz e reduz sons, movimento e detalhes', () => {
  assert.equal(PRESET_TRANQUILO.modoTranquilo, true);
  assert.equal(PRESET_TRANQUILO.voz, true);
  assert.equal(PRESET_TRANQUILO.sons, false);
  assert.equal(PRESET_TRANQUILO.animacoes, false);
  assert.equal(PRESET_TRANQUILO.detalhesVisuais, false);
});

test('ajuste individual cria perfil personalizado sem perder outras escolhas', () => {
  const personalizado = personalizarPreferencia(PRESET_TRANQUILO, 'sons', true);
  assert.deepEqual(personalizado, {
    ...PRESET_TRANQUILO,
    modoTranquilo: false,
    sons: true,
  });
});

test('chave desconhecida não contamina as preferências', () => {
  const resultado = personalizarPreferencia(
    { ...PREFERENCIAS_PADRAO, intrusa: true },
    'intrusa',
    false
  );
  assert.deepEqual(resultado, PREFERENCIAS_PADRAO);
});
