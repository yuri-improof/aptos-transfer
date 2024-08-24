import { Account, Ed25519PrivateKey } from '@aptos-labs/ts-sdk'
import semaphore from 'semaphore'
import { SLEEP_BETWEEN_THREADS, THREADS_COUNT } from './config'

import { AccountAptos, dataFromFile, getRandomAmount, logger, processPrivateKeysByMode, sleep } from './utils'

interface PrivateKeyToAddressMap {
  [senderPrivateKey: string]: string
}

class Main {
  private accountsData: PrivateKeyToAddressMap = {}
  private privateKeys: string[]
  private notShuffledKeys: string[]
  private accountsOrder: number[]

  constructor() {}

  public async execMain() {
    const allPrivateKeys = dataFromFile('./data/private_keys.txt')
    const allCexAddresses = dataFromFile('./data/cex_addresses.txt')

    if (allPrivateKeys.length !== allCexAddresses.length) {
      throw new Error('Private keys and CEX addresses count mismatch')
    }
    this.isValidPrivateKeys(allPrivateKeys)

    allPrivateKeys.forEach((key, index) => {
      this.accountsData[key] = allCexAddresses[index]
    })
    ;[this.privateKeys, this.notShuffledKeys, this.accountsOrder] = processPrivateKeysByMode(allPrivateKeys)

    const threadSemaphore = semaphore(THREADS_COUNT)
    const promises: Promise<void>[] = []

    try {
      for (const privateKey of this.privateKeys) {
        const promise = new Promise<void>((resolve) =>
          threadSemaphore.take(() => {
            this.handleExecAccount(privateKey).finally(() => {
              threadSemaphore.leave()
              resolve()
            })
          })
        )

        promises.push(promise)
        await sleep(SLEEP_BETWEEN_THREADS[0], SLEEP_BETWEEN_THREADS[1])
      }

      await Promise.all(promises)
    } catch (error) {
      throw new Error(`${error.message}`)
    }
  }

  private async handleExecAccount(privateKey: string) {
    const walletIndex = this.notShuffledKeys.indexOf(privateKey)
    const walletNumber = walletIndex + 1

    const account = new AccountAptos(privateKey)
    logger.info(`| ${walletNumber} | ${account.address} | Running thread `)

    try {
      const balance = await account.getBalance()
      logger.info(`| ${walletNumber} | ${account.address} | Current balance: ${balance}`)

      const amountToSend = getRandomAmount(balance)
      logger.info(`| ${walletNumber} | ${account.address} | Amount to send: ${amountToSend}`)

      const txHash = await account.transfer(this.accountsData[privateKey], amountToSend)
      logger.success(
        `| ${walletNumber} | ${account.address} | Transaction hash: https://explorer.aptoslabs.com/txn/${txHash}?network=mainnet`
      )
    } catch (error) {
      logger.error('Error while transferring APT', error.message)
    }
  }

  private isValidPrivateKeys(privateKey: string[]) {
    privateKey.forEach((key, index) => {
      try {
        const Ed25519key = new Ed25519PrivateKey(key)
        const account = Account.fromPrivateKey({ privateKey: Ed25519key })
      } catch (error) {
        throw new Error(`Wrong Aptos private key #${index + 1}: ${error.message}`)
      }
    })
  }
}

;(async () => {
  const asciiArt = `
                                                                                                                  
  88                            88                                                                            ad88  
  88                            ""                                                                           d8"    
  88                                                                                                         88     
  88,dPPYba,   8b       d8      88  88,dPYba,,adPYba,   8b,dPPYba,   8b,dPPYba,   ,adPPYba,    ,adPPYba,   MM88MMM  
  88P'    "8a  \`8b     d8'      88  88P'   "88"    "8a  88P'    "8a  88P'   "Y8  a8"     "8a  a8"     "8a    88     
  88       d8   \`8b   d8'       88  88      88      88  88       d8  88          8b       d8  8b       d8    88     
  88b,   ,a8"    \`8b,d8'        88  88      88      88  88b,   ,a8"  88          "8a,   ,a8"  "8a,   ,a8"    88     
  8Y"Ybbd8"'       Y88'         88  88      88      88  88\`YbbdP"'   88           \`"YbbdP"'    \`"YbbdP"'     88     
                   d8'                                  88                                                          
                  d8'                                   88                                                          
  `
  console.log(asciiArt)

  try {
    const mainClass = new Main()
    await mainClass.execMain()

    logger.info('The work is done')
  } catch (error) {
    logger.error(`${error.message}`)
  }
})()
