import WalletConnect from "@walletconnect/client"
import BaseService from "../base"
import { ServiceCreatorFunction, ServiceLifecycleEvents } from "../types"
import ChainService from "../chain"
import KeyringService from "../keyring"
import LedgerService from "../ledger"
import logger from "../../lib/logger"
import {EIP1559TransactionRequest, EVMNetwork, SignedEVMTransaction} from "../../networks"
import {ETH, ETHEREUM} from "../../constants"
import { EIP191Data, HexString } from "../../types"

type Events = ServiceLifecycleEvents & {
  initialisedWalletConnect: string
  connected: { address: string; network: EVMNetwork }
  disconnected: { address: string }
}

/**
 * The WalletConnectSerivce is responsible for maintaining the connection
 * with a via wallet connect https://docs.walletconnect.com/tech-spec.
 *
 */
export default class WallectConnectService extends BaseService<Events> {
  private connector: WalletConnect

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

  async personalSign({
    signingData,
    account,
  }: {
    signingData: EIP191Data
    account: HexString
  }): Promise<string> {
    const msgParams = [
      signingData, // message
      account,
    ]

    // Sign personal message
    return this.connector
      .signPersonalMessage(msgParams)
      .then((result) => {
        return result
      })
      .catch((error) => {
        // Error returned when rejected
        throw new Error(`Failed to sign ${error}`)
      })
  }

  async signTransaction(
    network: EVMNetwork,
    transactionRequest: EIP1559TransactionRequest & { nonce: number },
  ): Promise<SignedEVMTransaction> {
    return this.runSerialized(async () => {
      try {
        if (!this.connector.connected) {
          throw new Error("WalletConnect not connected!")
        }

        // TODO: identify how to send EIP-1559 tx via WalletConnect
        const unsignedTx = {
          to: transactionRequest.to,
          data: transactionRequest.input ?? undefined,
          from: transactionRequest.from,
          type: transactionRequest.type.toString(),
          nonce: transactionRequest.nonce,
          // value: transactionRequest.value,
          chainId: parseInt(transactionRequest.chainID, 10),
          // gas: transactionRequest.gasLimit,
          // maxFeePerGas: transactionRequest.maxFeePerGas,
          // maxPriorityFeePerGas: transactionRequest.maxPriorityFeePerGas,
        }

        const tx = await this.connector.signTransaction(unsignedTx)

        console.log("Signed", tx)
        if (
          typeof tx.maxPriorityFeePerGas === "undefined" ||
          typeof tx.maxFeePerGas === "undefined" ||
          tx.type !== 2
        ) {
          throw new Error("Can only sign EIP-1559 conforming transactions")
        }

        const signedTx: SignedEVMTransaction = {
          hash: tx.hash,
          from: tx.from,
          to: tx.to,
          nonce: tx.nonce,
          input: tx.data,
          value: tx.value.toBigInt(),
          type: tx.type,
          gasPrice: null,
          maxFeePerGas: tx.maxFeePerGas.toBigInt(),
          maxPriorityFeePerGas: tx.maxPriorityFeePerGas.toBigInt(),
          gasLimit: tx.gasLimit.toBigInt(),
          r: tx.r,
          s: tx.s,
          v: tx.v,

          blockHash: null,
          blockHeight: null,
          asset: ETH,
          network,
        }

        return signedTx
      } catch (err) {
        logger.error(`Error encountered! transactionRequest: error: ${err}`)

        throw err
      }
    })
  }

  async onConnection(accounts: string[], _chainID: number): Promise<void> {
    this.emitter.emit("connected", {
      address: accounts[0],
      // TODO switch network on incoming chainID
      network: ETHEREUM,
    })
  }

  async onSessionUpdate(accounts: string[], _chainID: number): Promise<void> {
    this.emitter.emit("connected", {
      address: accounts[0],
      // TODO change this so its dynamic on chainID
      network: ETHEREUM,
    })
  }

  async onDisconnect(accounts: string[]): Promise<void> {
    // handle cleanup of internals
    // TODO loop through connected addresses and disconnect them
    this.emitter.emit("disconnected", {
      address: accounts[0],
    })
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
      const { accounts } = payload.params[0]
      this.onDisconnect(accounts)
    })
  }

  protected async internalStopService(): Promise<void> {
    await super.internalStartService() // Not needed, but better to stick to the patterns
  }
}
