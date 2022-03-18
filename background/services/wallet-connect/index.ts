import BaseService from "../base"
import { ServiceCreatorFunction, ServiceLifecycleEvents } from "../types"
import WalletConnect from "@walletconnect/client";
import ChainService from "../chain"
import KeyringService from "../keyring"
import LedgerService from "../ledger"

// import { getOrCreateDB } from "./db"

type Events = ServiceLifecycleEvents & {
  initialisedWalletConnect: string 
  connected: { id: string; }
  disconnected: { id: string; }
}

type Transaction = {
  from: string // Required
  to: string // Required (for non contract deployments)
  data: string // Required
  gasPrice?: string // Optional
  gas?: string // Optional
  value?: string // Optional
  nonce?: string // Optional
}

/**
 * The WalletConnectSerivce is responsible for maintaining the connection
 * with a via wallet connect https://docs.walletconnect.com/tech-spec.
 *
 */
export default class WallectConnectService extends BaseService<Events> {

  private connector: WalletConnect;
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
    super();
    this.connector = connector_;
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


  async signTransaction(tx: Transaction): Promise<void> {
    // Sign transaction
    this.connector
      .signTransaction(tx)
      .then((result) => {
        // Returns signed transaction
        console.log(result);
      })
      .catch((error) => {
        // Error returned when rejected
        console.error(error);
      });
  }

  async onConnection(accounts: string[], chainId: number): Promise<void> {
    // handle connection updates
    return this.runSerialized(async () => {
      return
    })
  }

  async onSessionUpdate(accounts: string[], chainId: number): Promise<void> {
    // handle session updates
  }

  async onDisconnect(): Promise<void> {
    // handle cleanup of internals 
  }

  async connect(): Promise<void> {

  }

  async disconnect(): Promise<void> {
    // disconnect account
  }


  protected async internalStartService(): Promise<void> {
    await super.internalStartService() // Not needed, but better to stick to the patterns

    // Check if connection is already established
    if (!this.connector.connected) {
      // create new session
      await this.connector.createSession();
    }
    // emit event
    this.emitter.emit("initialisedWalletConnect", this.connector.uri)

    // Subscribe to connection events
    this.connector.on("connect", (error: any, payload: any) => {
      if (error) {
        throw error;
      }
      const { accounts, chainId } = payload.params[0];
      this.onConnection(accounts, chainId);
    });
    this.connector.on("session_update", (error: any, payload: any) => {
      if (error) {
        throw error;
      }
      const { accounts, chainId } = payload.params[0];
      this.onSessionUpdate(accounts, chainId);
    });

    this.connector.on("disconnect", (error: any, payload: any) => {
      if (error) {
        throw error;
      }

      this.onDisconnect()
    });
    
  }

  protected async internalStopService(): Promise<void> {
    await super.internalStartService() // Not needed, but better to stick to the patterns
    // Delete connector
  }
}
