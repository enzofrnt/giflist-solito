import { test } from 'node:test'
import assert from 'node:assert/strict'
import { USERNAME_ERROR, USERNAME_HINT, isValidUsername, sanitizeUsernameInput } from 'app/lib/usernameValidation'

test('the shared rule accepts uppercase and lowercase letters', () => {
  assert.equal(isValidUsername('Joris88'), true)
  assert.equal(isValidUsername('Joris_88'), true)
  assert.equal(isValidUsername('joris_88'), true)
  assert.equal(isValidUsername('JORIS_88'), true)
  assert.equal(isValidUsername('  Joris88  '), true)

  assert.equal(isValidUsername('ab'), false)
  assert.equal(isValidUsername('Joris-88'), false)
  assert.equal(isValidUsername('Joris 88'), false)
  assert.equal(isValidUsername('a'.repeat(31)), false)

  assert.equal(sanitizeUsernameInput('Joris 88!'), 'Joris88')
  assert.equal(sanitizeUsernameInput('Joris_88').length, 8)
  assert.match(USERNAME_HINT, /lettres/)
  assert.match(USERNAME_ERROR, /lettres/)
})
