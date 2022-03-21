import { createSelector, createSlice } from "@reduxjs/toolkit"
import { HexString } from "../types"

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
