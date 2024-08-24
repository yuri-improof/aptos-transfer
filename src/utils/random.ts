import { TRANSFER_AMOUNT } from '../config'

export function randomInt(min: number, max: number) {
  min = Math.ceil(min)
  max = Math.floor(max)
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function randomDigital(min: number, max: number) {
  const randomFraction = Math.random()
  const randomValueInRange = min + randomFraction * (max - min)
  return parseFloat(randomValueInRange.toFixed(18))
}

export function randomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)]
}

export function shuffleNumbers(min: number, max: number): number[] {
  if (min > max) {
    throw new Error('Minimum value should not be greater than maximum value.')
  }

  const range = Array.from({ length: max - min + 1 }, (_, i) => min + i)

  for (let i = range.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[range[i], range[j]] = [range[j], range[i]]
  }

  return range
}

export function getRandomAmount(balance: number): number {
  const [min, max] = TRANSFER_AMOUNT
  let amount: number

  if (typeof min === 'string' && typeof max === 'string') {
    const minPercent = parseFloat(min) / 100
    const maxPercent = parseFloat(max) / 100
    const randomPercent = Math.random() * (maxPercent - minPercent) + minPercent
    amount = Number((Number(balance) * randomPercent).toFixed(8))
  } else {
    amount = Number((Math.random() * (Number(max) - Number(min)) + Number(min)).toFixed(8))
  }

  return amount
}
