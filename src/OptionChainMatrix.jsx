
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
    RELIANCE: {
    label: "RELIANCE",
    defaultATM: 1200,
    strikeDistance: 20,
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

function formatDate(date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

function getExpiryDates(underlying) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const dates = [];

  if (underlying === "NIFTY" || underlying === "SENSEX") {
    const expiryDay = underlying === "NIFTY" ? 2 : 4;
    const date = new Date(today);

    while (dates.length < 6) {
      if (date.getDay() === expiryDay) {
        dates.push(formatDate(date));
      }

      date.setDate(date.getDate() + 1);
    }
  } else {
    // Default expiry: last Tuesday of each month.
    const date = new Date(today.getFullYear(), today.getMonth(), 1);

    while (dates.length < 6) {
      const year = date.getFullYear();
      const month = date.getMonth();
      const lastDay = new Date(year, month + 1, 0);

      lastDay.setDate(
        lastDay.getDate() - ((lastDay.getDay() - 2 + 7) % 7)
      );
      lastDay.setHours(0, 0, 0, 0);

      if (lastDay >= today) {
        dates.push(formatDate(lastDay));
      }

      date.setMonth(date.getMonth() + 1);
    }
  }

  return dates;
}

function OptionChainMatrix({
  atmStrike = 25000,
  strikeCount = 5,
  strikeDistance,
  onAction,
}) {
  const [underlying, setUnderlying] = useState("NIFTY");
  const [currentATM, setCurrentATM] = useState(String(atmStrike));
  const [selectedStrikeCount, setSelectedStrikeCount] = useState(
    Number(strikeCount) || 5
  );
  const [expiry, setExpiry] = useState(() => getExpiryDates("NIFTY")[0]);
  const [showITM, setShowITM] = useState(true);

  const [limitPrices, setLimitPrices] = useState({
    CALL: {},
    PUT: {},
  });

  // Use the configured strike distance for the selected underlying.
  const currentStrikeDistance = UNDERLYINGS[underlying]
    ? UNDERLYINGS[underlying].strikeDistance
    : strikeDistance ?? 50;

  const expiryOptions = getExpiryDates(underlying);

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

    if (UNDERLYINGS[selected]) {
      setCurrentATM(String(UNDERLYINGS[selected].defaultATM));
    }

    setExpiry(getExpiryDates(selected)[0]);

    setLimitPrices({
      CALL: {},
      PUT: {},
    });
  };

  const handleAction = (type, action, strike) => {
    const price = limitPrices[type][strike];

    const payload = {
      underlying,
      expiry,
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

  const handleLimitPriceChange = (type, strike, value) => {
    setLimitPrices((prev) => ({
      ...prev,
      [type]: {
        ...prev[type],
        [strike]: value,
      },
    }));
  };

  return (
    <div className="option-chain">
      {/* Compact toolbar */}
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
          <label htmlFor="expiry-date">Expiry</label>
          <select
            id="expiry-date"
            value={expiry}
            onChange={(event) => setExpiry(event.target.value)}
          >
            {expiryOptions.map((date) => (
              <option key={date} value={date}>
                {date}
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
            onChange={(event) => setCurrentATM(event.target.value)}
            placeholder="Enter ATM"
          />
        </div>

        <div className="control-group">
          <label htmlFor="strike-count">Strikes / Side</label>
          <select
            id="strike-count"
            value={selectedStrikeCount}
            onChange={(event) =>
              setSelectedStrikeCount(Number(event.target.value))
            }
          >
            {STRIKE_COUNT_OPTIONS.map((count) => (
              <option key={count} value={count}>
                {count}
              </option>
            ))}
          </select>
        </div>

        <div className="control-group">
          <label>Distance</label>
          <div className="strike-distance-display">
            {currentStrikeDistance}
          </div>
        </div>

        <div className="itm-toggle">
          <label htmlFor="display-itm">
            <input
              id="display-itm"
              type="checkbox"
              checked={showITM}
              onChange={(event) => setShowITM(event.target.checked)}
            />
            Display ITM
          </label>
        </div>
      </div>

      {/* Matrix header */}
      <div className="option-chain-header">
        <div className="header-section calls-header">CALLS</div>
        <div className="header-section limit-header">CALL LIMIT</div>
        <div className="header-section strike-header">STRIKE</div>
        <div className="header-section limit-header">PUT LIMIT</div>
        <div className="header-section puts-header">PUTS</div>
      </div>

      {/* Matrix rows */}
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
