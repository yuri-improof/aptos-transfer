type privateKeysRandom = 'shuffle' | 'consecutive'

export const THREADS_COUNT = 1
export const SLEEP_BETWEEN_THREADS: [number, number] = [10, 20] // in seconds

// "shuffle", "consecutive",
export const PRIVATE_KEYS_RANDOM_MOD: privateKeysRandom = 'consecutive'

// Applies to APT transfers.
// Amount in APT - [0.01, 0.02]
// Amount as a percentage of the total balance - ["10", "20"] ⚠️ Values are in quotes.
export const TRANSFER_AMOUNT: [number | string, number | string] = ['99', '99']

export const RPC_URL = 'https://rpc.ankr.com/http/aptos/v1'
