import { createSelector } from "@reduxjs/toolkit"
import { RootState } from ".."

export const selectWalletConnectSigningAddresses = createSelector(
  // TODO actually store an array of connected accounts
  (state: RootState) => state.walletConnect.account,
  (account) => [account]
)
