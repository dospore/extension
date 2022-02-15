import React, { ReactElement } from "react"
import { AccountType } from "@tallyho/tally-background/redux-slices/accounts"
import {
  getAccountTotal,
  selectCurrentAccount,
} from "@tallyho/tally-background/redux-slices/selectors"
import {
  rejectDataSignature,
  signData,
  selectSigningData,
} from "@tallyho/tally-background/redux-slices/signing"
import { useHistory } from "react-router-dom"
import SharedButton from "../components/Shared/SharedButton"
import SignTransactionNetworkAccountInfoTopBar from "../components/SignTransaction/SignTransactionNetworkAccountInfoTopBar"
import {
  useAreKeyringsUnlocked,
  useBackgroundDispatch,
  useBackgroundSelector,
} from "../hooks"

interface SignDataLocationState {
  internal: boolean
}

export default function PersonalSignData({
  location,
}: {
  location: { state?: SignDataLocationState }
}): ReactElement {
  const dispatch = useBackgroundDispatch()

  const signingDataRequest = useBackgroundSelector(selectSigningData)

  const account = useBackgroundSelector(selectCurrentAccount)

  console.log("data", signingDataRequest)

  const history = useHistory()

  const { internal } = location.state ?? {
    internal: false,
  }

  const areKeyringsUnlocked = useAreKeyringsUnlocked(true)

  const signerAccountTotal = useBackgroundSelector((state) => {
    if (typeof signingDataRequest !== "undefined") {
      return getAccountTotal(state, signingDataRequest.account)
    }
    return undefined
  })

  if (
    !areKeyringsUnlocked ||
    typeof signingDataRequest === "undefined" ||
    typeof signerAccountTotal === "undefined"
  ) {
    return <></>
  }

  const message = signingDataRequest?.signingData

  const handleConfirm = () => {
    if (signingDataRequest !== undefined) {
      dispatch(signData(signingDataRequest))
    }
  }

  const handleReject = async () => {
    dispatch(rejectDataSignature())
    history.goBack()
  }
  return (
    <section>
      <SignTransactionNetworkAccountInfoTopBar
        accountTotal={signerAccountTotal}
      />
      <h1 className="serif_header title">Sign Message</h1>
      <div className="primary_info_card standard_width">
        <div className="sign_block">
          <div className="container">
            <div className="label header">
              {internal
                ? "Your signature is required"
                : "A dapp is requesting your signature"}
            </div>
            <div className="divider" />
            <div className="divider" />
            <div className="message">
              <div className="message-title">Message</div>
              <div className="light">{`${message}`}</div>
            </div>
            <div className="message">
              <div className="signed">Signed,</div>
              <div className="name">{account?.address ?? "Unknown"}</div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer_actions">
        <SharedButton
          iconSize="large"
          size="large"
          type="secondary"
          onClick={handleReject}
        >
          Reject
        </SharedButton>
        {signerAccountTotal?.accountType === AccountType.Imported ? (
          <SharedButton
            type="primary"
            iconSize="large"
            size="large"
            onClick={handleConfirm}
            showLoadingOnClick
          >
            Sign
          </SharedButton>
        ) : (
          <span className="no-signing">Read-only accounts cannot sign</span>
        )}
      </div>
      <style jsx>
        {`
          section {
            width: 100%;
            height: 100%;
            display: flex;
            flex-direction: column;
            align-items: center;
            background-color: var(--green-95);
            z-index: 5;
          }
          .title {
            color: var(--trophy-gold);
            font-size: 36px;
            font-weight: 500;
            line-height: 42px;
            text-align: center;
          }
          .primary_info_card {
            display: block;
            height: fit-content;
            border-radius: 16px;
            background-color: var(--hunter-green);
            margin: 16px 0px;
            display: flex;
            flex-direction: column;
            align-items: center;
          }
          .footer_actions {
            position: fixed;
            bottom: 0px;
            display: flex;
            width: 100%;
            padding: 0px 16px;
            box-sizing: border-box;
            align-items: center;
            height: 80px;
            justify-content: space-between;
            box-shadow: 0 0 5px rgba(0, 20, 19, 0.5);
            background-color: var(--green-95);
          }
          .signed {
            margin-bottom: 6px;
          }
          .sign_block {
            display: flex;
            width: 100%;
            flex-direction: column;
            justify-content: space-between;
          }
          .label {
            color: var(--green-40);
          }
          .header {
            padding: 16px 0;
          }
          .messages {
            display: flex;
            flex-flow: column;
            width: 100%;
            padding-top: 16px;
          }
          .message {
            margin: 16px;
            font-size: 14px;
            line-break: anywhere;
          }
          .message-title {
            color: var(--green-40);
            margin-bottom: 6px;
          }
          .value {
            overflow-wrap: anywhere;
            max-width: 220px;
            text-align: right;
          }
          .light {
            color: #ccd3d3;
          }
          .key {
            color: var(--green-40);
          }
          .divider {
            width: 80%;
            height: 2px;
            opacity: 60%;
            background-color: var(--green-120);
          }
          .container {
            display: flex;
            margin: 20px 0;
            flex-direction: column;
            align-items: center;
          }
        `}
      </style>
    </section>
  )
}
