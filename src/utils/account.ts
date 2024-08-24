import { AptosAccount, AptosClient, BCS, HexString, TokenClient, TxnBuilderTypes, Types } from 'aptos'
import { RPC_URL } from '../config'

const APTOS_COIN = '0x1::aptos_coin::AptosCoin'

export class AccountAptos {
  readonly account: AptosAccount
  readonly client: AptosClient
  readonly tokenClient: TokenClient
  readonly address: string

  constructor(privateKey: string) {
    this.client = new AptosClient(RPC_URL)
    this.account = new AptosAccount(new HexString(privateKey).toUint8Array())
    const { address } = this.account.toPrivateKeyObject()
    this.address = address as string
    this.tokenClient = new TokenClient(this.client)
  }

  async getBalance(): Promise<number> {
    const resources = await this.client.getAccountResources(this.address)
    const accountResource = resources.find((r) => r.type === '0x1::coin::CoinStore<0x1::aptos_coin::AptosCoin>')
    const balance = parseInt((accountResource?.data as any).coin.value)
    return balance / 10 ** 8
  }

  async estimateGasUnits(payload: TxnBuilderTypes.TransactionPayload): Promise<bigint> {
    const account = await this.client.getAccount(this.account.address())
    const gasEstimate = await this.client.estimateGasPrice()

    const simpleTransfer = new TxnBuilderTypes.RawTransaction(
      TxnBuilderTypes.AccountAddress.fromHex(this.account.address()),
      BigInt(account.sequence_number),
      payload,
      BigInt(2000), // Увеличиваем max_gas_amount
      BigInt(gasEstimate.gas_estimate), // Используем приоритетную оценку газа
      BigInt(Math.floor(Date.now() / 1000) + 600),
      new TxnBuilderTypes.ChainId(await this.client.getChainId())
    )

    const simulationResult = await this.client.simulateTransaction(this.account, simpleTransfer)
    const estimatedGas = (BigInt(simulationResult[0].gas_used) * BigInt(12)) / BigInt(10) // Add 20% buffer

    const minGas = BigInt(100)
    return estimatedGas > minGas ? estimatedGas : minGas
  }

  async transfer(recipient: string, amount: number): Promise<string> {
    const balance = await this.getBalance()
    const balanceRaw = BigInt(Math.floor(balance * 1e8))
    let amountRaw = BigInt(Math.floor(amount * 1e8))

    const gasEstimate = await this.client.estimateGasPrice()

    const entryFunctionPayload = new TxnBuilderTypes.TransactionPayloadEntryFunction(
      TxnBuilderTypes.EntryFunction.natural(
        '0x1::coin',
        'transfer',
        [new TxnBuilderTypes.TypeTagStruct(TxnBuilderTypes.StructTag.fromString(APTOS_COIN))],
        [BCS.bcsToBytes(TxnBuilderTypes.AccountAddress.fromHex(recipient)), BCS.bcsSerializeUint64(amountRaw)]
      )
    )

    const estimatedGasUnits = await this.estimateGasUnits(entryFunctionPayload)

    const estimatedGasFee = estimatedGasUnits * BigInt(gasEstimate.gas_estimate)

    if (balanceRaw < amountRaw + estimatedGasFee) {
      amountRaw = balanceRaw - estimatedGasFee
      if (amountRaw <= 0) {
        throw new Error(`Insufficient balance to cover gas fees. Available: ${balance}`)
      }
    }

    const rawTxn = await this.client.generateRawTransaction(this.account.address(), entryFunctionPayload, {
      gasUnitPrice: BigInt(gasEstimate.gas_estimate),
      maxGasAmount: estimatedGasUnits,
    })

    const bcsTxn = AptosClient.generateBCSTransaction(this.account, rawTxn)
    const pendingTxn = await this.client.submitSignedBCSTransaction(bcsTxn)

    const executedTxn = (await this.client.waitForTransactionWithResult(pendingTxn.hash)) as Types.UserTransaction

    if (executedTxn.success) {
      return executedTxn.hash
    } else {
      throw new Error(`Transaction failed: ${executedTxn.vm_status}`)
    }
  }
}
