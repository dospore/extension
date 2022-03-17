import { createSelector, createSlice } from "@reduxjs/toolkit"
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
  connectionURI: string | undefined,
  account: string | undefined,
}

export const initialState: WalletConnectState = {
  connectionURI: undefined,
  account: undefined,
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
    setConnectionURI: (state, { payload }: { payload: {
      uri: string
    }}) => {
      console.log('payload', payload)
      return ({
        ...state,
        connectionURI: payload.uri,
      })
    },
    clearWalletConnectState: (state) => ({
      ...state,
      connectionURI: undefined,
      account: undefined,
    }),
  },
})

export const {
  clearWalletConnectState,
  setConnectionURI
} = walletConnectSlice.actions

export default walletConnectSlice.reducer

export const selectConnectionURI = createSelector(
  (state: { walletConnect: WalletConnectState}) => state.walletConnect.connectionURI,
  (walletConnectTypes) => walletConnectTypes 
)

