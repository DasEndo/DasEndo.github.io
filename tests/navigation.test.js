import test from 'node:test';
import assert from 'node:assert/strict';
import { nextMenuIndex } from '../src/navigation.js';

test('arrow navigation starts at either end and wraps around the menu', () => {
  assert.equal(nextMenuIndex(-1, 1, 3), 0);
  assert.equal(nextMenuIndex(-1, -1, 3), 2);
  assert.equal(nextMenuIndex(2, 1, 3), 0);
  assert.equal(nextMenuIndex(0, -1, 3), 2);
  assert.equal(nextMenuIndex(1, 1, 3), 2);
  assert.equal(nextMenuIndex(1, -1, 3), 0);
  assert.equal(nextMenuIndex(-1, 1, 0), -1);
});
