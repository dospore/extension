import { createSelector } from "@reduxjs/toolkit"
import { RootState } from ".."

// For consistency with similar modules:
// eslint-disable-next-line import/prefer-default-export
export const selectWalletConnectSigningAddresses = createSelector(
  // TODO actually store an array of connected accounts
  (state: RootState) => state.walletConnect.account,
  (account) => [account]
)
