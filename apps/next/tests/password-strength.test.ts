import { test } from 'node:test'
import assert from 'node:assert/strict'
import {
  calculatePasswordStrength,
  countPassedRules,
} from '../../../packages/app/lib/passwordStrength'
import { getPasswordRules } from '../../../packages/app/lib/passwordValidation'

test('empty password is neutral and has no meter progress', () => {
  const strength = calculatePasswordStrength('')
  assert.equal(strength.isEmpty, true)
  assert.equal(strength.level, 0)
  assert.equal(strength.label, '')
  assert.equal(strength.percent, 0)
  assert.equal(strength.rulesPassed, 0)
})

test('non-empty password with no passing rule still has a visible bar', () => {
  const strength = calculatePasswordStrength('aaaa')
  assert.equal(strength.rulesPassed, 1) // length fails, lowercase passes
  assert.equal(strength.level, 0)
  assert.equal(strength.label, 'Très faible')
  assert.equal(strength.percent, 10)
})

test('two rules map to weak, with 25% progress', () => {
  const strength = calculatePasswordStrength('aaaaaaaa')
  assert.equal(strength.rulesPassed, 2)
  assert.equal(strength.level, 1)
  assert.equal(strength.label, 'Faible')
  assert.equal(strength.percent, 25)
})

test('three rules map to medium, with 50% progress', () => {
  const strength = calculatePasswordStrength('Aaaaaaaa')
  assert.equal(strength.rulesPassed, 3)
  assert.equal(strength.level, 2)
  assert.equal(strength.label, 'Moyen')
  assert.equal(strength.percent, 50)
})

test('four rules map to strong, with 75% progress', () => {
  const strength = calculatePasswordStrength('Aaaaaaa1')
  assert.equal(strength.rulesPassed, 4)
  assert.equal(strength.level, 3)
  assert.equal(strength.label, 'Fort')
  assert.equal(strength.percent, 75)
})

test('all five rules map to very strong, with 100% progress', () => {
  const strength = calculatePasswordStrength('Aaaaaa1!')
  assert.equal(strength.rulesPassed, 5)
  assert.equal(strength.level, 4)
  assert.equal(strength.label, 'Très fort')
  assert.equal(strength.percent, 100)
})

test('progress never decreases as rules pass, and stays within 0-100', () => {
  const samples = ['', 'a', 'aa', 'aaaa', 'aaaaaaaa', 'Aaaaaaaa', 'Aaaaaaa1', 'Aaaaaa1!']
  const percents = samples.map((sample) => calculatePasswordStrength(sample).percent)
  for (let index = 1; index < percents.length; index++) {
    assert.ok(percents[index] >= percents[index - 1])
  }
  for (const percent of percents) {
    assert.ok(percent >= 0 && percent <= 100)
  }
})

test('countPassedRules matches the shared validation rules', () => {
  const cases: Array<[string, number]> = [
    ['', 0],
    ['aaaa', 1],
    ['aaaaaaaa', 2],
    ['Aaaaaaaa', 3],
    ['Aaaaaaa1', 4],
    ['Aaaaaa1!', 5],
  ]
  for (const [value, expected] of cases) {
    assert.equal(countPassedRules(getPasswordRules(value)), expected)
  }
})
