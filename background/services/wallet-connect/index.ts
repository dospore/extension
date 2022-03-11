import BaseService from "../base"
import { ServiceCreatorFunction, ServiceLifecycleEvents } from "../types"
// import { getOrCreateDB } from "./db"

type Events = ServiceLifecycleEvents & {
  connected: { id: string; }
  disconnected: { id: string; }
}

/**
 * The WalletConnectSerivce is responsible for maintaining the connection
 * with a via wallet connect https://docs.walletconnect.com/tech-spec.
 *
 */
export default class WallectConnectService extends BaseService<Events> {

  #lastOperationPromise = Promise.resolve()

  static create: ServiceCreatorFunction<Events, WallectConnectService, []> =
    async () => {
      return new this();
      // return new this(await getOrCreateDB())
    }

  private constructor() {
    super()
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

  async onConnection(): Promise<void> {
    return this.runSerialized(async () => {
      return
    })
  }

  async connect(): Promise<void> {

  }

  async disconnect(): Promise<void> {

  }

  protected async internalStartService(): Promise<void> {
    await super.internalStartService() // Not needed, but better to stick to the patterns

    // this.refreshConnectedLedger()

    // navigator.usb.addEventListener("connect", this.#handleUSBConnect)
    // navigator.usb.addEventListener("disconnect", this.#handleUSBDisconnect)
  }

  protected async internalStopService(): Promise<void> {
    await super.internalStartService() // Not needed, but better to stick to the patterns

    // navigator.usb.removeEventListener("disconnect", this.#handleUSBDisconnect)
    // navigator.usb.removeEventListener("connect", this.#handleUSBConnect)
  }
}
