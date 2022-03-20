import WalletConnect from "@walletconnect/client"
import BaseService from "../base"
import { ServiceCreatorFunction, ServiceLifecycleEvents } from "../types"
import ChainService from "../chain"
import KeyringService from "../keyring"
import LedgerService from "../ledger"
import logger from "../../lib/logger"
import { EVMNetwork, SignedEVMTransaction } from "../../networks"
import { ETHEREUM } from "../../constants"

type Events = ServiceLifecycleEvents & {
  initialisedWalletConnect: string
  connected: { address: string; network: EVMNetwork }
  disconnected: { id: string }
}

// type Transaction = {
// from: string // Required
// to: string // Required (for non contract deployments)
// data: string // Required
// gasPrice?: string // Optional
// gas?: string // Optional
// value?: string // Optional
// nonce?: string // Optional
// }

/**
 * The WalletConnectSerivce is responsible for maintaining the connection
 * with a via wallet connect https://docs.walletconnect.com/tech-spec.
 *
 */
export default class WallectConnectService extends BaseService<Events> {
  private connector: WalletConnect

  private connected: boolean

  #lastOperationPromise = Promise.resolve()

  static create: ServiceCreatorFunction<
    Events,
    WallectConnectService,
    [Promise<KeyringService>, Promise<LedgerService>, Promise<ChainService>]
  > = async (keyringService, ledgerService, chainService) => {
    return new this(
      await keyringService,
      await ledgerService,
      await chainService,
      new WalletConnect({
        bridge: "https://bridge.walletconnect.org", // Required
      })
    )
  }

  private constructor(
    private keyringService: KeyringService,
    private ledgerService: LedgerService,
    private chainService: ChainService,
    private connector_: WalletConnect
  ) {
    super()
    this.connector = connector_
    this.connected = false
  }

  private runSerialized<T>(operation: () => Promise<T>) {
    const oldOperationPromise = this.#lastOperationPromise
    const newOperationPromise = oldOperationPromise.then(async () =>
      operation()
    )

    this.#lastOperationPromise = newOperationPromise.then(
      () => {},
      () => {}
    )

    return newOperationPromise
  }

  async signTransaction(): // network: EVMNetwork,
  // transactionRequest: EIP1559TransactionRequest & { nonce: number },
  // deviceID: string,
  // path: string
  Promise<SignedEVMTransaction> {
    return this.runSerialized(async () => {
      try {
        // if (!this.transport) {
        // throw new Error("Uninitialized transport!")
        // }
        console.log("Signing transaction with wallet connect!!!")

        if (!this.connected) {
          throw new Error("Uninitialized Ledger ID!")
        }

        // const ethersTx =
        // ethersTransactionRequestFromEIP1559TransactionRequest(
        // transactionRequest
        // )

        // const serializedTx = serialize(
        // ethersTx as UnsignedTransaction
        // ).substring(2) // serialize adds 0x prefix which kills Eth::signTransaction

        // const accountData = await this.db.getAccountByAddress(
        // transactionRequest.from
        // )

        // this.checkCanSign(accountData, path, deviceID)

        // const eth = new Eth(this.transport)
        // const signature = await eth.signTransaction(path, serializedTx, null)

        // const signedTransaction = serialize(ethersTx as UnsignedTransaction, {
        // r: `0x${signature.r}`,
        // s: `0x${signature.s}`,
        // v: parseInt(signature.v, 16),
        // })
        // const tx = parseRawTransaction(signedTransaction)

        // if (
        // !tx.hash ||
        // !tx.from ||
        // !tx.r ||
        // !tx.s ||
        // typeof tx.v === "undefined"
        // ) {
        // throw new Error("Transaction doesn't appear to have been signed.")
        // }

        // if (
        // typeof tx.maxPriorityFeePerGas === "undefined" ||
        // typeof tx.maxFeePerGas === "undefined" ||
        // tx.type !== 2
        // ) {
        // throw new Error("Can only sign EIP-1559 conforming transactions")
        // }

        const signedTx: SignedEVMTransaction =
          undefined as unknown as SignedEVMTransaction
        // hash: tx.hash,
        // from: tx.from,
        // to: tx.to,
        // nonce: tx.nonce,
        // input: tx.data,
        // value: tx.value.toBigInt(),
        // type: tx.type,
        // gasPrice: null,
        // maxFeePerGas: tx.maxFeePerGas.toBigInt(),
        // maxPriorityFeePerGas: tx.maxPriorityFeePerGas.toBigInt(),
        // gasLimit: tx.gasLimit.toBigInt(),
        // r: tx.r,
        // s: tx.s,
        // v: tx.v,

        // blockHash: null,
        // blockHeight: null,
        // asset: ETH,
        // network,
        // }

        return signedTx
      } catch (err) {
        logger.error(`Error encountered! transactionRequest: error: ${err}`)

        throw err
      }
    })
  }

  async onConnection(accounts: string[], chainId: number): Promise<void> {
    // handle connection updates
    // return this.runSerialized(async () => {
    console.log("connected", accounts, chainId)
    this.connected = true
    this.emitter.emit("connected", {
      address: accounts[0],
      // TODO change this so its dynamic on chainID
      network: ETHEREUM,
    })
  }

  async onSessionUpdate(accounts: string[], chainId: number): Promise<void> {
    // handle session updates
  }

  async onDisconnect(): Promise<void> {
    // handle cleanup of internals
    this.connected = false
  }

  async connect(): Promise<void> {}

  async disconnect(): Promise<void> {
    // disconnect account
  }

  protected async internalStartService(): Promise<void> {
    await super.internalStartService() // Not needed, but better to stick to the patterns

    // Check if connection is already established
    if (!this.connector.connected) {
      // create new session
      await this.connector.createSession()
    }
    // emit event
    this.emitter.emit("initialisedWalletConnect", this.connector.uri)

    // Subscribe to connection events
    this.connector.on("connect", (error: any, payload: any) => {
      if (error) {
        throw error
      }
      const { accounts, chainId } = payload.params[0]
      this.onConnection(accounts, chainId)
    })
    this.connector.on("session_update", (error: any, payload: any) => {
      if (error) {
        throw error
      }
      const { accounts, chainId } = payload.params[0]
      this.onSessionUpdate(accounts, chainId)
    })

    this.connector.on("disconnect", (error: any, payload: any) => {
      if (error) {
        throw error
      }

      this.onDisconnect()
    })
  }

  protected async internalStopService(): Promise<void> {
    await super.internalStartService() // Not needed, but better to stick to the patterns
    // Delete connector
  }
}
