import fs from 'fs'
import { PRIVATE_KEYS_RANDOM_MOD } from '../config'
import logger from './logger'
import { shuffleNumbers } from './random'

export function processPrivateKeysByMode(allPrivateKeys: string[]): [string[], string[], number[]] {
  let orderedPrivateKeys: string[] = []
  let accountsOrder: number[] = []

  switch (PRIVATE_KEYS_RANDOM_MOD) {
    case 'shuffle':
      let shuffledIndexes = shuffleNumbers(1, allPrivateKeys.length)
      orderedPrivateKeys = shuffledIndexes.map((index) => allPrivateKeys[index - 1])
      accountsOrder = [...shuffledIndexes] // Copying shuffled indexes
      break

    case 'consecutive':
      orderedPrivateKeys = [...allPrivateKeys]
      accountsOrder = Array.from({ length: allPrivateKeys.length }, (_, i) => i + 1)
      break

    default:
      throw new Error('Invalid privateKeysRandomMod value')
  }

  return [orderedPrivateKeys, allPrivateKeys, accountsOrder]
}

export function dataFromFile(path: string) {
  return fs
    .readFileSync(path, 'utf-8')
    .split('\n')
    .map((data) => data.trim())
}

export async function sleep(min: number, max: number): Promise<void> {
  let sleepTime = Math.floor(Math.random() * (max - min + 1) + min) * 1000
  logger.info(`Sleeping for ${sleepTime / 1e3} seconds...`)
  return new Promise((resolve) => setTimeout(resolve, sleepTime))
}
