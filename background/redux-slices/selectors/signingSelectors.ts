import { createSelector } from "@reduxjs/toolkit"
import { RootState } from ".."
import { SigningMethod } from "../signing"
import { selectKeyringSigningAddresses } from "./keyringsSelectors"
import { selectLedgerSigningMethodEntries } from "./ledgerSelectors"
import { selectCurrentAccount } from "./uiSelectors"
import { selectWalletConnectSigningAddresses } from "./walletConnectSelectors"

export const selectAddressSigningMethods = createSelector(
  selectKeyringSigningAddresses,
  selectLedgerSigningMethodEntries,
  selectWalletConnectSigningAddresses,
  (signingAddresses, ledgerSigningMethodEntries, walletConnectAddresses) =>
    Object.fromEntries([
      ...ledgerSigningMethodEntries,
      // Give priority to keyring over Ledger, if an address is signable by both.
      // TODO: check this is the intended behavior
      ...signingAddresses.map((address): [string, SigningMethod] => [
        address,
        { type: "keyring" },
      ]),
      ...walletConnectAddresses.map((address): [string, SigningMethod] => [
        // TODO this bad, should handle empty account state
        address ?? "",
        { type: "walletConnect" },
      ]),
    ])
)

export const selectCurrentAccountSigningMethod = createSelector(
  selectAddressSigningMethods,
  (state: RootState) => selectCurrentAccount(state),
  (signingAccounts, selectedAccount): SigningMethod | null =>
    signingAccounts[selectedAccount.address] ?? null
)
