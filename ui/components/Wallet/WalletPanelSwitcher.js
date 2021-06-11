import React from 'react';
import PropTypes from 'prop-types';

export default function WalletPanelSwitcher(props) {
  const { setPanelNum, panelNum } = props;

  return (
    <nav>
      <ul>
        <li>
          <button
            type="button"
            onClick={() => {
              setPanelNum(0);
            }}
            className={`option${panelNum === 0 ? ' selected' : ''}`}
          >
            Assets
          </button>
        </li>
        <li>
          <button
            type="button"
            onClick={() => {
              setPanelNum(1);
            }}
            className={`option${panelNum === 1 ? ' selected' : ''}`}
          >
            Activity
          </button>
        </li>
      </ul>
      <style jsx>
        {`
          nav {
            width: 100%;
            border-bottom: 1px solid var(--green-120);
          }
          ul {
            display: flex;
            padding-left: 24px;
            padding-bottom: 12px;
          }
          .option {
            margin-right: 16px;
            cursor: pointer;
          }
          .selected {
            font-weight: 500;
            color: var(--trophy-gold);
            text-align: center;
            display: flex;
            justify-content: center;
          }
          .selected::after {
            content: '';
            width: 18px;
            height: 2px;
            background-color: var(--trophy-gold);
            border-radius: 10px;
            position: absolute;
            display: block;
            margin-top: 29px;
          }
        `}
      </style>
    </nav>
  );
}

WalletPanelSwitcher.propTypes = {
  setPanelNum: PropTypes.func.isRequired,
  panelNum: PropTypes.number.isRequired,
};
