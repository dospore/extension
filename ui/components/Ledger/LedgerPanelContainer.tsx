import React, { ReactElement } from "react"

export default function LedgerPanelContainer({
  indicatorImageSrc,
  heading,
  subHeading,
  children,
  reloadTimeMs,
}: {
  indicatorImageSrc: string
  heading?: React.ReactNode
  subHeading?: React.ReactNode
  children?: React.ReactNode
  reloadTimeMs?: string
}): ReactElement {
  if (reloadTimeMs) {
    window.setTimeout(
      () => window.location.reload(),
      parseInt(reloadTimeMs, 10)
    )
  }

  return (
    <div className="panel">
      <img
        width="318"
        height="84"
        className="indicator"
        src={indicatorImageSrc}
        alt=""
      />
      {heading && <h1 className="heading">{heading}</h1>}
      {subHeading && <p className="subheading">{subHeading}</p>}
      {children}
      <style jsx>{`
        .panel {
          display: flex;
          flex-flow: column;
          max-width: 24rem;
          margin: 0 auto;
          padding: 1rem;
        }

        .indicator {
          align-self: center;
          margin: 1rem 1rem 0;
        }

        .heading {
          margin: 0.25rem;
          font-family: "Quincy CF";
          font-size: 36px;
          font-weight: 500;
          line-height: 42px;
          text-align: center;
          color: var(--green-5);
        }

        .subheading {
          margin: 0.25rem;
          font-size: 16px;
          line-height: 24px;
          text-align: center;
          color: var(--green-40);
        }
      `}</style>
    </div>
  )
}
