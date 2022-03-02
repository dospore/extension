import { createSelector, createSlice } from "@reduxjs/toolkit"
import Emittery from "emittery"
import { EIP191Data, EIP712TypedData, HexString } from "../types"
import { createBackgroundAsyncThunk } from "./utils"

export type Events = {
  requestSignTypedData: {
    typedData: EIP712TypedData
    account: HexString
    signingMethod: SigningMethod
  }
  requestSignData: {
    signingData: EIP191Data
    account: HexString
  }
  signatureRejected: never
}

export type SigningMethod =
  | { type: "keyring" }
  | { type: "ledger"; deviceID: string; path: string }

export const signingSliceEmitter = new Emittery<Events>()

export type SigningState = {
  signedTypedData: string | undefined
  typedDataRequest: SignTypedDataRequest | undefined

  signedData: string | undefined
  signDataRequest: SignDataRequest | undefined
}

export const initialState: SigningState = {
  typedDataRequest: undefined,
  signedTypedData: undefined,

  signedData: undefined,
  signDataRequest: undefined,
}

export type EIP712DomainType = {
  name?: string
  version?: string
  chainId?: number
  verifyingContract?: HexString
}

export type SignTypedDataRequest = {
  account: string
  typedData: EIP712TypedData
  signingMethod: SigningMethod
}

export type SignDataRequest = {
  account: string
  signingData: EIP191Data
}

export const signTypedData = createBackgroundAsyncThunk(
  "signing/signTypedData",
  async (data: SignTypedDataRequest) => {
    const { account, typedData, signingMethod } = data

    await signingSliceEmitter.emit("requestSignTypedData", {
      typedData,
      account,
      signingMethod,
    })
  }
)

export const signData = createBackgroundAsyncThunk(
  "signing/signData",
  async (data: SignDataRequest) => {
    const { account, signingData } = data
    await signingSliceEmitter.emit("requestSignData", {
      signingData,
      account,
    })
  }
)

const signingSlice = createSlice({
  name: "signing",
  initialState,
  reducers: {
    signedTypedData: (state, { payload }: { payload: string }) => ({
      ...state,
      signedTypedData: payload,
      typedDataRequest: undefined,
    }),
    typedDataRequest: (
      state,
      { payload }: { payload: SignTypedDataRequest }
    ) => ({
      ...state,
      typedDataRequest: payload,
    }),
    signDataRequest: (state, { payload }: { payload: SignDataRequest }) => {
      return {
        ...state,
        signDataRequest: payload,
      }
    },
    signedData: (state, { payload }: { payload: string }) => ({
      ...state,
      signedData: payload,
      signDataRequest: undefined,
    }),
    clearSigningState: (state) => ({
      ...state,
      typedDataRequest: undefined,
      signDataRequest: undefined,
    }),
  },
})

export const {
  signedTypedData,
  typedDataRequest,
  signedData,
  signDataRequest,
  clearSigningState,
} = signingSlice.actions

export default signingSlice.reducer

export const selectTypedData = createSelector(
  (state: { signing: { typedDataRequest: SignTypedDataRequest } }) =>
    state.signing.typedDataRequest,
  (signTypes) => signTypes
)

export const selectSigningData = createSelector(
  (state: { signing: { signDataRequest: SignDataRequest } }) =>
    state.signing.signDataRequest,
  (signTypes) => signTypes
)

export const rejectDataSignature = createBackgroundAsyncThunk(
  "signing/reject",
  async (_, { dispatch }) => {
    await signingSliceEmitter.emit("signatureRejected")
    // Provide a clean slate for future transactions.
    dispatch(signingSlice.actions.clearSigningState())
  }
)
