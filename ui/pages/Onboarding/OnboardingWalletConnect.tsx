import React, { ReactElement, useEffect, useState } from "react"
import { useHistory } from "react-router-dom"
import QRCode from "react-qr-code";
import SharedButton from "../../components/Shared/SharedButton"
import SharedBackButton from "../../components/Shared/SharedBackButton"

import {
  useBackgroundDispatch,
  useAreKeyringsUnlocked,
  useBackgroundSelector,
} from "../../hooks"
import {selectConnectionURI} from "@tallyho/tally-background/redux-slices/walletConnect";
import {setSnackbarMessage} from "@tallyho/tally-background/redux-slices/ui";

type Props = {
  nextPage: string
}

export default function OnboardingWalletConnect(props: Props): ReactElement {
  const { nextPage } = props

  const areKeyringsUnlocked = useAreKeyringsUnlocked(true)

  // set true if we are connected to WalletConnect bridge and waiting for a connection
  const [isListening, setIsListening] = useState(false)

  const dispatch = useBackgroundDispatch()

  const connectionURI = useBackgroundSelector(selectConnectionURI)

  const history = useHistory()

  useEffect(() => {
    if (areKeyringsUnlocked && isListening) {
      setIsListening(false)
      history.push(nextPage)
    }
  }, [history, areKeyringsUnlocked, nextPage, isListening])

  const copyData = () => {
    navigator.clipboard.writeText(connectionURI ?? "")
    dispatch(setSnackbarMessage("Raw data copied to clipboard"))
  }

  if (!areKeyringsUnlocked) return <></>

  return (
    <section className="center_horizontal standard_width">
      <div className="content">
        <div className="back_button_wrap">
          <SharedBackButton />
        </div>
        <div className="portion top">
          <div className="metamask_onboarding_image" />
          <h1 className="serif_header">WalletConnect</h1>
          <div className="info">
            Scan this QR code with the mobile wallet<br/>
            you would like to connect with.
          </div>
        </div>
        <div className="portion bottom">
          {connectionURI && <QRCode value={connectionURI} />}
          <SharedButton
            type="tertiary"
            icon="copy"
            size="medium"
            iconSize="secondaryMedium"
            iconPosition="left"
            onClick={copyData}
          >
            Copy to clipboard 
          </SharedButton>
        </div>
      </div>
      <style jsx>{`
        section {
          display: flex;
          align-items: center;
          flex-direction: column;
          justify-content: space-between;
          height: 100%;
          background-color: var(--hunter-green);
        }
        .content {
          animation: fadeIn ease 200ms;
          width: inherit;
        }
        .back_button_wrap {
          position: fixed;
          top: 25px;
        }
        h1 {
          margin: unset;
        }
        .portion {
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .bottom {
          justify-content: space-between;
          flex-direction: column;
          margin-bottom: "24px";
          margin-top: "35px";
        }
        .metamask_onboarding_image {
          background: url("./images/illustration_import_seed@2x.png");
          background-size: cover;
          width: "205.3px";
          height: "193px";
          margin-top: "27px";
          margin-bottom: 15px;
        }
        .serif_header {
          font-size: 36px;
          line-height: 42px;
          margin-bottom: 8px;
        }

        .info {
          height: 43px;
          margin-bottom: 18px;
        }
        .info,
        .help_button {
          width: 320px;
          text-align: center;
          font-size: 16px;
          line-height: 24px;
          color: var(--green-60);
          font-weight: 500;
        }
        .help_button {
          margin-top: 16px;
        }
        .checkbox_wrapper {
          margin-top: 6px;
          margin-bottom: 6px;
        }
        .select_wrapper {
          margin-top: "15px";
          width: 320px;
        }
      `}</style>
    </section>
  )
}
