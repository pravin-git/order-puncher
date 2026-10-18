
import { useState } from "react";
import "./OptionChainMatrix.css";

const UNDERLYINGS = {
  NIFTY: {
    label: "NIFTY",
    defaultATM: 25000,
    strikeDistance: 50,
  },
  SENSEX: {
    label: "SENSEX",
    defaultATM: 80000,
    strikeDistance: 100,
  },
};

const CALL_ACTIONS = [
  { label: "RD", action: "ROLL_DOWN", className: "roll-down" },
  { label: "RU", action: "ROLL_UP", className: "roll-up" },
  { label: "SELL", action: "SELL", className: "sell" },
  { label: "BUY", action: "BUY", className: "buy" },
];

const PUT_ACTIONS = [
  { label: "BUY", action: "BUY", className: "buy" },
  { label: "SELL", action: "SELL", className: "sell" },
  { label: "RU", action: "ROLL_UP", className: "roll-up" },
  { label: "RD", action: "ROLL_DOWN", className: "roll-down" },
];

function OptionChainMatrix({
  atmStrike = 25000,
  strikeCount = 5,
  strikeDistance,
  onAction,
}) {
  const [underlying, setUnderlying] = useState("NIFTY");
  const [currentATM, setCurrentATM] = useState(String(atmStrike));
  const [showITM, setShowITM] = useState(true);

  const [limitPrices, setLimitPrices] = useState({
    CALL: {},
    PUT: {},
  });

  const currentStrikeDistance =
    strikeDistance ?? UNDERLYINGS[underlying].strikeDistance;

  const rowCount = Math.max(
    0,
    Math.floor(Number(strikeCount) || 0)
  );

  const parsedATM = Number(currentATM);

  const validATM =
    currentATM.trim() !== "" &&
    Number.isFinite(parsedATM) &&
    parsedATM > 0;

  // Generate strikes around the selected ATM.
  const strikes = validATM
    ? Array.from(
        { length: rowCount * 2 + 1 },
        (_, index) =>
          parsedATM +
          (index - rowCount) * currentStrikeDistance
      )
    : [];

  const handleUnderlyingChange = (event) => {
    const selected = event.target.value;

    setUnderlying(selected);
    setCurrentATM(
      String(UNDERLYINGS[selected].defaultATM)
    );

    setLimitPrices({
      CALL: {},
      PUT: {},
    });
  };

  const handleATMChange = (event) => {
    setCurrentATM(event.target.value);
  };

  const handleLimitPriceChange = (type, strike, value) => {
    setLimitPrices((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [strike]: value,
      },
    }));
  };

  const handleAction = (type, action, strike) => {
    const price = limitPrices[type][strike];

    const payload = {
      underlying,
      type,
      action,
      strike,
      limitPrice:
        price === "" || price == null
          ? null
          : Number(price),
    };

    if (typeof onAction === "function") {
      onAction(payload);
    }
  };

  return (
    <div className="option-chain">
      {/* UNDERLYING AND ATM CONTROLS */}
      <div className="option-chain-controls">
        <div className="control-group">
          <label htmlFor="underlying">
            Underlying
          </label>

          <select
            id="underlying"
            value={underlying}
            onChange={handleUnderlyingChange}
          >
            {Object.entries(UNDERLYINGS).map(
              ([key, config]) => (
                <option key={key} value={key}>
                  {config.label}
                </option>
              )
            )}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="atm-strike">
            ATM Strike
          </label>

          <input
            id="atm-strike"
            type="number"
            min="1"
            step="any"
            value={currentATM}
            onChange={handleATMChange}
            placeholder="Enter ATM strike"
          />
        </div>

        <div className="control-group">
          <label>Strike Distance</label>

          <div className="strike-distance-display">
            {currentStrikeDistance}
          </div>
        </div>

        <div className="itm-toggle">
          <label>
            <input
              type="checkbox"
              checked={showITM}
              onChange={(event) =>
                setShowITM(event.target.checked)
              }
            />
            Display ITM
          </label>
        </div>
      </div>

      {/* TABLE HEADER */}
      <div className="option-chain-header">
        <div className="header-section calls-header">
          CALLS
        </div>

        <div className="header-section limit-header">
          CALL LIMIT
        </div>

        <div className="header-section strike-header">
          STRIKE
        </div>

        <div className="header-section limit-header">
          PUT LIMIT
        </div>

        <div className="header-section puts-header">
          PUTS
        </div>
      </div>

      {/* OPTION ROWS */}
      <div className="option-chain-body">
        {strikes.map((strike) => {
          const isATM = strike === parsedATM;
          const isCallITM = strike < parsedATM;
          const isPutITM = strike > parsedATM;

          const showCallSide = showITM || !isCallITM;
          const showPutSide = showITM || !isPutITM;

          return (
            <div
              key={strike}
              className={`option-row ${
                isATM ? "atm-row" : ""
              }`}
            >
              {/* CALL ACTIONS: RD RU SELL BUY */}
              <div className="actions call-actions">
                {showCallSide &&
                  CALL_ACTIONS.map((item) => (
                    <button
                      key={item.action}
                      type="button"
                      className={`action-button ${item.className}`}
                      title={`CALL ${item.action} ${strike}`}
                      onClick={() =>
                        handleAction(
                          "CALL",
                          item.action,
                          strike
                        )
                      }
                    >
                      {item.label}
                    </button>
                  ))}
              </div>

              {/* CALL LIMIT PRICE */}
              <div className="limit-price-cell">
                {showCallSide && (
                  <input
                    type="number"
                    className="limit-price"
                    aria-label={`CALL limit price for ${strike}`}
                    placeholder="Call Price"
                    step="any"
                    value={limitPrices.CALL[strike] ?? ""}
                    onChange={(event) =>
                      handleLimitPriceChange(
                        "CALL",
                        strike,
                        event.target.value
                      )
                    }
                  />
                )}
              </div>

              {/* STRIKE PRICE */}
              <div className="strike-price">
                {strike.toLocaleString("en-IN")}
              </div>

              {/* PUT LIMIT PRICE */}
              <div className="limit-price-cell">
                {showPutSide && (
                  <input
                    type="number"
                    className="limit-price"
                    aria-label={`PUT limit price for ${strike}`}
                    placeholder="Put Price"
                    step="any"
                    value={limitPrices.PUT[strike] ?? ""}
                    onChange={(event) =>
                      handleLimitPriceChange(
                        "PUT",
                        strike,
                        event.target.value
                      )
                    }
                  />
                )}
              </div>

              {/* PUT ACTIONS: BUY SELL RU RD */}
              <div className="actions put-actions">
                {showPutSide &&
                  PUT_ACTIONS.map((item) => (
                    <button
                      key={item.action}
                      type="button"
                      className={`action-button ${item.className}`}
                      title={`PUT ${item.action} ${strike}`}
                      onClick={() =>
                        handleAction(
                          "PUT",
                          item.action,
                          strike
                        )
                      }
                    >
                      {item.label}
                    </button>
                  ))}
              </div>
            </div>
          );
        })}

        {!validATM && (
          <div className="empty-state">
            Enter a valid positive ATM strike to display strikes.
          </div>
        )}
      </div>
    </div>
  );
}

export default OptionChainMatrix;
