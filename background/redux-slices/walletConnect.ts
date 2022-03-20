import { createSelector, createSlice } from "@reduxjs/toolkit"
import { HexString } from "../types"
// import Emittery from "emittery"
// import { HexString } from "../types"
// import { createBackgroundAsyncThunk } from "./utils"

// can add more types to this in the future

// export type Events = {
// requestConnect: {
// account: HexString
// }
// requestDisconnect: {
// account: HexString
// }
// }

// export const signingSliceEmitter = new Emittery<Events>()

export type WalletConnectState = {
  connectionURI: string | undefined
  account: string | undefined
  connected: boolean
}

export const initialState: WalletConnectState = {
  connectionURI: undefined,
  account: undefined,
  connected: false,
}

// export interface SignOperation<T> {
// request: T
// signingMethod: SigningMethod
// }

// export const signTypedData = createBackgroundAsyncThunk(
// "signing/signTypedData",
// async (data: SignOperation<SignTypedDataRequest>) => {
// const {
// request: { account, typedData },
// signingMethod,
// } = data

// await signingSliceEmitter.emit("requestSignTypedData", {
// typedData,
// account,
// signingMethod,
// })
// }
// )

// export const signData = createBackgroundAsyncThunk(
// "signing/signData",
// async (data: SignOperation<SignDataRequest>) => {
// const {
// request: { account, signingData, rawSigningData, messageType },
// signingMethod,
// } = data
// await signingSliceEmitter.emit("requestSignData", {
// rawSigningData,
// signingData,
// account,
// messageType,
// signingMethod,
// })
// }
// )
// export const rejectDataSignature = createBackgroundAsyncThunk(
// "signing/reject",
// async (_, { dispatch }) => {
// await signingSliceEmitter.emit("signatureRejected")
// Provide a clean slate for future transactions.
// dispatch(signingSlice.actions.clearSigningState())
// }
// )

const walletConnectSlice = createSlice({
  name: "walletConnect",
  initialState,
  reducers: {
    setConnectionURI: (
      state,
      {
        payload,
      }: {
        payload: {
          uri: string
        }
      }
    ) => {
      console.log("payload", payload)
      return {
        ...state,
        connectionURI: payload.uri,
      }
    },
    setWalletConnected: (
      state,
      {
        payload,
      }: {
        payload: {
          connected: boolean
          account: HexString
        }
      }
    ) => {
      return {
        ...state,
        connected: payload.connected,
        account: payload.account,
      }
    },
    clearWalletConnectState: (state) => ({
      ...state,
      connectionURI: undefined,
      account: undefined,
    }),
  },
})

export const { clearWalletConnectState, setConnectionURI, setWalletConnected } =
  walletConnectSlice.actions

export default walletConnectSlice.reducer

export const selectConnectionURI = createSelector(
  (state: { walletConnect: WalletConnectState }) =>
    state.walletConnect.connectionURI,
  (walletConnectTypes) => walletConnectTypes
)

export const selectWallectConnection = createSelector(
  (state: { walletConnect: WalletConnectState }) =>
    state.walletConnect.connected,
  (walletConnectTypes) => walletConnectTypes
)
