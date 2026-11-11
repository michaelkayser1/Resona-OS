import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import { stripTypeScriptTypes } from 'node:module';

const page = readFileSync(new URL('../app/page.tsx', import.meta.url), 'utf8');
const memory = readFileSync(new URL('../components/MemoryPalace.tsx', import.meta.url), 'utf8');
const classes = page.slice(page.indexOf('class CosmicAudioAnalyzer'), page.indexOf('class CosmicSpiral'));

function audioHarness({ pending = false, reject = false, failSetup = false } = {}) {
  let stopped = 0, closed = 0, resolvePermission;
  const stream = { getTracks: () => [{ stop: () => stopped++ }] };
  const node = () => ({ connect() {}, disconnect() {}, start() {}, stop() {},
    frequency: { value: 0 }, gain: { value: 0, setTargetAtTime() {} } });
  class AudioContext {
    state = 'running'; sampleRate = 44100; destination = {}; currentTime = 0;
    close() { closed++; this.state = 'closed'; return Promise.resolve(); }
    createMediaStreamSource() { if (failSetup) throw new Error('setup failure'); return node(); }
    createAnalyser() { return { ...node(), frequencyBinCount: 2048 }; }
    createOscillator = node; createGain = node; createChannelMerger = node; createBiquadFilter = node;
  }
  const context = vm.createContext({ window: { AudioContext }, navigator: { mediaDevices: {
    getUserMedia: () => reject ? Promise.reject(new Error('denied')) : pending
      ? new Promise(resolve => { resolvePermission = resolve; }) : Promise.resolve(stream),
  } }, console: { error() {} }, Uint8Array });
  vm.runInContext(classes + '\nglobalThis.Analyzer = CosmicAudioAnalyzer; globalThis.Pitch = CosmicPitchDetector;', context);
  return { analyzer: new context.Analyzer(), Pitch: context.Pitch,
    counts: () => ({ stopped, closed }), grant: () => resolvePermission(stream) };
}

test('stop releases microphone tracks and closes context exactly once', async () => {
  const h = audioHarness(); assert.equal(await h.analyzer.initialize(), true);
  h.analyzer.dispose(); h.analyzer.dispose();
  assert.deepEqual(h.counts(), { stopped: 1, closed: 1 });
  assert.equal(h.analyzer.isActive, false);
});
test('late permission after disposal releases tracks without activating', async () => {
  const h = audioHarness({ pending: true }); const starting = h.analyzer.initialize();
  h.analyzer.dispose(); h.grant();
  assert.equal(await starting, false);
  assert.deepEqual(h.counts(), { stopped: 1, closed: 1 });
  assert.equal(h.analyzer.isActive, false);
});
test('permission denial closes the context', async () => {
  const h = audioHarness({ reject: true }); assert.equal(await h.analyzer.initialize(), false);
  assert.deepEqual(h.counts(), { stopped: 0, closed: 1 });
});
test('failure after permission releases the acquired stream', async () => {
  const h = audioHarness({ failSetup: true }); assert.equal(await h.analyzer.initialize(), false);
  assert.deepEqual(h.counts(), { stopped: 1, closed: 1 });
});
test('silence does not repeat a previously detected pitch', () => {
  const h = audioHarness(); const pitch = new h.Pitch();
  const spectrum = new Uint8Array(2048); spectrum[40] = 200;
  assert.ok(pitch.detectAdvancedPitch(spectrum, 44100) > 0);
  assert.equal(pitch.detectAdvancedPitch(new Uint8Array(2048), 44100), 0);
});

const cryptoSource = memory.slice(memory.indexOf('const CryptoUtils'), memory.indexOf('// Clustering utilities'));
const cryptoContext = vm.createContext({ crypto: globalThis.crypto, TextEncoder, TextDecoder,
  Uint8Array, btoa, atob, console: { error() {} } });
vm.runInContext(stripTypeScriptTypes(cryptoSource) + '\nglobalThis.utils = CryptoUtils;', cryptoContext);
test('memory encryption round trip and wrong passphrase rejection', async () => {
  const encoded = await cryptoContext.utils.encryptText('A synthetic memory 🌌', 'test-passphrase');
  assert.notEqual(encoded, 'A synthetic memory 🌌');
  assert.equal(await cryptoContext.utils.decryptText(encoded, 'test-passphrase'), 'A synthetic memory 🌌');
  await assert.rejects(cryptoContext.utils.decryptText(encoded, 'wrong-passphrase'));
});

const addMemorySource = memory.slice(memory.indexOf('  const addMemory = async'), memory.indexOf('  const discoverRooms = async'));
test('encryption failure never stores a plaintext memory', async () => {
  let added = 0, error = '';
  const context = vm.createContext({ newMemoryTitle: 'Synthetic title', newMemoryContent: 'Synthetic content',
    passphrase: 'requested-encryption', crypto: globalThis.crypto,
    CryptoUtils: { encryptText: async () => { throw new Error('crypto unavailable'); } },
    setMemories: () => added++, setMemoryError: value => { error = value; },
    setNewMemoryTitle() {}, setNewMemoryContent() {}, console: { error() {} } });
  vm.runInContext(stripTypeScriptTypes(addMemorySource) + '\nglobalThis.run = addMemory;', context);
  await context.run(); assert.equal(added, 0); assert.match(error, /Encryption failed/);
});
