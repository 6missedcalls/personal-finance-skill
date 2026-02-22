/**
 * Precise decimal arithmetic for tax calculations.
 * Converts to integer cents internally to avoid floating-point drift.
 * All public functions accept and return dollar amounts (number).
 */

const CENTS_SCALE = 100

function toCents(dollars: number): number {
  return Math.round(dollars * CENTS_SCALE)
}

function toDollars(cents: number): number {
  return cents / CENTS_SCALE
}

export function add(a: number, b: number): number {
  return toDollars(toCents(a) + toCents(b))
}

export function subtract(a: number, b: number): number {
  return toDollars(toCents(a) - toCents(b))
}

export function multiply(a: number, b: number): number {
  return toDollars(Math.round(toCents(a) * b))
}

export function sumAll(values: ReadonlyArray<number>): number {
  const totalCents = values.reduce((acc, v) => acc + toCents(v), 0)
  return toDollars(totalCents)
}

/** Round to nearest whole dollar (IRS rounding rule) */
export function roundToWholeDollar(amount: number): number {
  return Math.round(amount)
}

/** Round to nearest cent */
export function roundToCents(amount: number): number {
  return toDollars(toCents(amount))
}

/** Clamp a value to a minimum (typically 0) */
export function clampMin(value: number, min: number): number {
  return value < min ? min : value
}

/** Safe percentage calculation: value * rate where rate is 0-1 */
export function applyRate(value: number, rate: number): number {
  return toDollars(Math.round(toCents(value) * rate))
}
