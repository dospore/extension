import React, { ReactElement } from "react"
import { AccountType } from "@tallyho/tally-background/redux-slices/accounts"
import {
  getAccountTotal,
} from "@tallyho/tally-background/redux-slices/selectors"
import {
  rejectDataSignature,
  signData,
  selectSigningData,
  SignDataMessageType,
  SignDataRequest,
  EIP4361Data,
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

const CONFIGURABLE_INFO: Record<SignDataMessageType, {
  title: string,
}> = {
  [SignDataMessageType.EIP4361]: {
    title: 'Sign in with Ethereum',
  },
  [SignDataMessageType.EIP191]: {
    title: 'Sign Message',
  }
}

export default function PersonalSignData({
  location,
}: {
  location: { state?: SignDataLocationState }
}): ReactElement {
  const dispatch = useBackgroundDispatch()

  const signingDataRequest = useBackgroundSelector(selectSigningData)

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
      <h1 className="serif_header title">{CONFIGURABLE_INFO[signingDataRequest.messageType].title}</h1>
      <div className="primary_info_card standard_width">
        <div className="sign_block">
          <div className="container">
            {
              (() => {
                switch (signingDataRequest.messageType) {
                  case SignDataMessageType.EIP4361:
                    return <EIP4361Info {...signingDataRequest} signingData={signingDataRequest.signingData as EIP4361Data} internal={internal} />
                  case SignDataMessageType.EIP191:
                  default:
                    return <EIP191Info {...signingDataRequest} internal={internal} />
                }
              })()
            }
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
          .sign_block {
            display: flex;
            width: 100%;
            flex-direction: column;
            justify-content: space-between;
          }
          .container {
            display: flex;
            margin: 20px 16px;
            flex-direction: column;
            align-items: center;
            font-size: 16px;
            line-height: 24px;
          }
        `}
      </style>
    </section>
  )
}

const Divider: React.FC<{ spacing?: boolean }> = ({ spacing }) => (
  <>
    <div className={`divider ${spacing ? 'spacing' : ''}`}/>
  <style jsx>{`
    .divider {
      width: 80%;
      height: 2px;
      opacity: 60%;
      background-color: var(--green-120);
    }
    .spacing {
      margin: 16px 0;
    }
  `}</style>
  </>
)


const EIP191Info: React.FC<SignDataRequest & { internal: boolean }> = ({
  signingData,
  account,
  internal 
}) => {
  return (
    <>
      <div className="label header">
        {internal
          ? "Your signature is required"
          : "A dapp is requesting your signature"}
      </div>
      <Divider />
      <Divider />
      <div className="message">
        <div className="message-title">Message</div>
        <div className="light">{`${signingData}`}</div>
      </div>
      <div className="message">
        <div className="signed">Signed,</div>
        <div>{account ?? "Unknown"}</div>
      </div>
      <style jsx>{`
        .message {
          margin: 16px;
          font-size: 14px;
          width: 100%;
          line-break: anywhere;
        }
        .message-title {
          color: var(--green-40);
          margin-bottom: 6px;
        }
        .light {
          color: #ccd3d3;
        }
        .label {
          color: var(--green-40);
        }
        .header {
          padding: 16px 0;
        }
        .signed {
          margin-bottom: 6px;
        }
      `}</style>
    </>
  )
}

const LabelWithContent: React.FC<{
  label: string,
  content:string,
}> = ({ label, content }) => {
  return (
    <>
      <div className="wrapper">
        <div className="label">{label}:</div>
        <div className="content">{content}</div>
      </div>
      <style jsx>{`
        .wrapper {
          display: flex;
          justify-content: space-between;
          width: 100%;
          font-size: 16px;
          line-height: 24px;
        }
        .content {
          color: var(--green-20);
        }
      `}</style>
    </>
  )

}

// can add more probably needs to come from a config var though
const CHAIN_NAMES: (chain: number) => string = (chain) => {
  switch (chain) {
    case 1:
      return 'Ethereum'
    default:
      return 'Unknown'
  }
}

// this overides the type to expect EIP4361Data
const EIP4361Info: React.FC<SignDataRequest & { internal: boolean, signingData: EIP4361Data }> = ({
  signingData,
}) => {
  return (
    <>
      <div className="domain">{signingData.domain}</div>
      <Divider spacing={true} />
      <div className="subtext">Wants you to sign in with your<br/>Ethereum account:</div>
      <div className="address">{signingData.address}</div>
      <Divider spacing={true} />
      {
        signingData?.statement
          ? <LabelWithContent label={'Statement'} content={signingData.statement}/>
          : null
      }
      <LabelWithContent label={'Nonce'} content={signingData.nonce}/>
      <LabelWithContent label={'Version'} content={signingData.version}/>
      <LabelWithContent label={'Chain ID'} content={`${signingData.chainId.toString()} (${CHAIN_NAMES(signingData.chainId)})`}/>
      {
        signingData?.expiration
          ? <LabelWithContent label={'Expiration'} content={signingData.expiration}/>
          : null
      }
      <style jsx>{`
        .subtext {
          color: var(--green-40);
          line-height: 24px;
          font-size: 16px;
          margin-bottom: 4px;
        }
        .domain, .address, .subtext {
          text-align: center;
        }
        .address {
          line-break: anywhere;
          max-width: 80%;
          font-size: 16px;
        }
      `}</style>
    </>
  )
}
