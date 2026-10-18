
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

const STRIKE_COUNT_OPTIONS = [1, 2, 3, 5, 10, 15, 20, 25, 30];

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
  const [selectedStrikeCount, setSelectedStrikeCount] =
    useState(Number(strikeCount) || 5);
  const [showITM, setShowITM] = useState(true);

  const [limitPrices, setLimitPrices] = useState({
    CALL: {},
    PUT: {},
  });
const currentStrikeDistance = UNDERLYINGS[underlying].strikeDistance;

  const rowCount = Math.max(
    0,
    Math.floor(Number(selectedStrikeCount) || 0)
  );

  const parsedATM = Number(currentATM);

  const validATM =
    currentATM.trim() !== "" &&
    Number.isFinite(parsedATM) &&
    parsedATM > 0;

  const strikes = validATM
    ? Array.from(
        { length: rowCount * 2 + 1 },
        (_, index) =>
          parsedATM + (index - rowCount) * currentStrikeDistance
      )
    : [];

  const handleUnderlyingChange = (event) => {
    const selected = event.target.value;

    setUnderlying(selected);
    setCurrentATM(String(UNDERLYINGS[selected].defaultATM));

    setLimitPrices({
      CALL: {},
      PUT: {},
    });
  };

  const handleATMChange = (event) => {
    setCurrentATM(event.target.value);
  };

  const handleStrikeCountChange = (event) => {
    setSelectedStrikeCount(Number(event.target.value));
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
        price === "" || price == null ? null : Number(price),
    };

    if (typeof onAction === "function") {
      onAction(payload);
    }
  };

  return (
    <div className="option-chain">
      <div className="option-chain-controls">
        <div className="control-group">
          <label htmlFor="underlying">Underlying</label>
          <select
            id="underlying"
            value={underlying}
            onChange={handleUnderlyingChange}
          >
            {Object.entries(UNDERLYINGS).map(([key, config]) => (
              <option key={key} value={key}>
                {config.label}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label htmlFor="atm-strike">ATM Strike</label>
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
          <label htmlFor="strike-count">Strikes Each Side</label>
          <select
            id="strike-count"
            value={selectedStrikeCount}
            onChange={handleStrikeCountChange}
          >
            {STRIKE_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
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
              onChange={(event) => setShowITM(event.target.checked)}
            />
            Display ITM
          </label>
        </div>
      </div>

      <div className="option-chain-header">
        <div className="header-section calls-header">CALLS</div>
        <div className="header-section limit-header">CALL LIMIT</div>
        <div className="header-section strike-header">STRIKE</div>
        <div className="header-section limit-header">PUT LIMIT</div>
        <div className="header-section puts-header">PUTS</div>
      </div>

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
              className={`option-row ${isATM ? "atm-row" : ""}`}
            >
              <div className="actions call-actions">
                {showCallSide &&
                  CALL_ACTIONS.map((item) => (
                    <button
                      key={item.action}
                      type="button"
                      className={`action-button ${item.className}`}
                      title={`CALL ${item.action} ${strike}`}
                      onClick={() =>
                        handleAction("CALL", item.action, strike)
                      }
                    >
                      {item.label}
                    </button>
                  ))}
              </div>

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

              <div className="strike-price">
                {strike.toLocaleString("en-IN")}
              </div>

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

              <div className="actions put-actions">
                {showPutSide &&
                  PUT_ACTIONS.map((item) => (
                    <button
                      key={item.action}
                      type="button"
                      className={`action-button ${item.className}`}
                      title={`PUT ${item.action} ${strike}`}
                      onClick={() =>
                        handleAction("PUT", item.action, strike)
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
