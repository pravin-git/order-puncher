import "./OptionChainMatrix.css";

const ACTIONS = [
  { label: "BUY", action: "BUY", className: "buy" },
  { label: "SELL", action: "SELL", className: "sell" },
  { label: "RU", action: "ROLL_UP", className: "roll-up" },
  { label: "RD", action: "ROLL_DOWN", className: "roll-down" },
];

function OptionChainMatrix({
  atmStrike,
  strikeCount,
  strikeDistance,
  onAction,
}) {
  /*
   * Generate strikes around ATM.
   *
   * Example:
   * atmStrike = 18000
   * strikeCount = 2
   * strikeDistance = 50
   *
   * Result:
   * 17900
   * 17950
   * 18000
   * 18050
   * 18100
   */
  const strikes = Array.from(
    { length: strikeCount * 2 + 1 },
    (_, index) => {
      const offset = index - strikeCount;

      return atmStrike + offset * strikeDistance;
    }
  );

  const handleAction = (type, action, strike) => {
    const payload = {
      type,
      action,
      strike,
    };

    onAction(payload);
  };

  return (
    <div className="option-chain">

      {/* Header */}
      <div className="option-chain-header">

        <div className="header-section calls-header">
          CALLS
        </div>

        <div className="header-section strike-header">
          STRIKE
        </div>

        <div className="header-section puts-header">
          PUTS
        </div>

      </div>

      {/* Rows */}
      <div className="option-chain-body">

        {strikes.map((strike) => {
          const isATM = strike === atmStrike;

          return (
            <div
              key={strike}
              className={`option-row ${
                isATM ? "atm-row" : ""
              }`}
            >

              {/* CALL ACTIONS */}
              <div className="actions call-actions">

                {ACTIONS.map((item) => (
                  <button
                    key={item.action}
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

              {/* STRIKE PRICE */}
              <div className="strike-price">
                {strike.toLocaleString()}
              </div>

              {/* PUT ACTIONS */}
              <div className="actions put-actions">

                {ACTIONS.map((item) => (
                  <button
                    key={item.action}
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

      </div>
    </div>
  );
}

export default OptionChainMatrix;

