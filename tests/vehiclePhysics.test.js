import { test } from 'node:test';
import assert from 'node:assert/strict';
import { stepVehicle, VEHICLE_TUNING } from '../src/game/vehiclePhysics.js';

const NEUTRO = {
  up: false,
  down: false,
  left: false,
  right: false,
  space: false,
};

function avancar(estado, input, frames, mode = 'normal') {
  let atual = estado;
  for (let i = 0; i < frames; i += 1) {
    atual = stepVehicle({
      ...atual,
      input,
      dt: 1 / 60,
      mode,
      tuning: VEHICLE_TUNING,
    });
  }
  return atual;
}

test('acelera para frente, preserva y e respeita V_MAX', () => {
  const inicial = {
    velocity: { x: 0, y: -0.4, z: 0 },
    heading: 0,
  };
  const final = avancar(inicial, { ...NEUTRO, up: true }, 180);

  assert.ok(final.velocity.z > 0);
  assert.ok(final.velocity.z <= VEHICLE_TUNING.V_MAX + 1e-9);
  assert.equal(final.velocity.x, 0);
  assert.equal(final.velocity.y, -0.4);
});

test('ré é limitada à metade da velocidade máxima frontal', () => {
  const final = avancar(
    { velocity: { x: 0, y: 0, z: 0 }, heading: 0 },
    { ...NEUTRO, down: true },
    180
  );

  assert.ok(final.velocity.z < 0);
  assert.ok(Math.abs(final.velocity.z) <= VEHICLE_TUNING.V_MAX * 0.5 + 1e-9);
});

test('sem aceleração, o atrito reduz a velocidade longitudinal', () => {
  const final = stepVehicle({
    velocity: { x: 0, y: 0, z: 10 },
    heading: 0,
    input: NEUTRO,
    dt: 1 / 60,
  });

  assert.ok(final.velocity.z < 10);
  assert.ok(final.velocity.z > 0);
});

test('direção altera o heading apenas quando existe movimento', () => {
  const parado = stepVehicle({
    velocity: { x: 0, y: 0, z: 0 },
    heading: 0,
    input: { ...NEUTRO, left: true },
    dt: 1 / 60,
  });
  const andando = stepVehicle({
    velocity: { x: 0, y: 0, z: 8 },
    heading: 0,
    input: { ...NEUTRO, left: true },
    dt: 1 / 60,
  });

  assert.equal(parado.heading, 0);
  assert.ok(andando.heading > 0);
});

test('freio de mão preserva mais velocidade lateral que o grip normal', () => {
  const normal = stepVehicle({
    velocity: { x: 10, y: 0, z: 0 },
    heading: 0,
    input: NEUTRO,
    dt: 1 / 60,
  });
  const drift = stepVehicle({
    velocity: { x: 10, y: 0, z: 0 },
    heading: 0,
    input: { ...NEUTRO, space: true },
    dt: 1 / 60,
  });

  assert.ok(Math.abs(drift.velocity.x) > Math.abs(normal.velocity.x));
});

test('dt alto é limitado ao mesmo passo máximo usado para evitar explosões', () => {
  const comFreeze = stepVehicle({
    velocity: { x: 0, y: 0, z: 0 },
    heading: 0,
    input: { ...NEUTRO, up: true },
    dt: 1,
  });
  const passoMaximo = stepVehicle({
    velocity: { x: 0, y: 0, z: 0 },
    heading: 0,
    input: { ...NEUTRO, up: true },
    dt: 1 / 30,
  });

  assert.deepEqual(comFreeze, passoMaximo);
});

test('modo reserva converge para velocidade baixa e depois para sem input', () => {
  const inicial = {
    velocity: { x: 0, y: 0, z: 14 },
    heading: 0,
  };
  const reserva = avancar(inicial, { ...NEUTRO, up: true }, 240, 'reserve');
  const parado = avancar(reserva, NEUTRO, 240, 'reserve');

  assert.ok(reserva.velocity.z > 0);
  assert.ok(Math.abs(reserva.velocity.z - VEHICLE_TUNING.V_LIMP) < 0.1);
  assert.ok(Math.abs(parado.velocity.z) < 0.1);
});

test('mesmo estado e mesmo input produzem resultado determinístico', () => {
  const args = {
    velocity: { x: 1.25, y: -0.2, z: 5.5 },
    heading: 0.4,
    input: { ...NEUTRO, up: true, left: true, space: true },
    dt: 1 / 60,
  };

  assert.deepEqual(stepVehicle(args), stepVehicle(args));
});
