import { useCallback, useEffect, useMemo, useState } from "react";
import "./App.css";

const calculatorKeys = [
  { label: "AC", action: "clear", kind: "clear", description: "Clear all" },
  { label: "DEL", action: "backspace", kind: "utility", description: "Delete last character" },
  { label: "%", action: "%", kind: "utility", description: "Percent" },
  { label: "÷", action: "/", kind: "operator", description: "Divide" },
  { label: "7", action: "7" },
  { label: "8", action: "8" },
  { label: "9", action: "9" },
  { label: "×", action: "*", kind: "operator", description: "Multiply" },
  { label: "4", action: "4" },
  { label: "5", action: "5" },
  { label: "6", action: "6" },
  { label: "−", action: "-", kind: "operator", description: "Subtract" },
  { label: "1", action: "1" },
  { label: "2", action: "2" },
  { label: "3", action: "3" },
  { label: "+", action: "+", kind: "operator", description: "Add" },
  { label: "0", action: "0" },
  { label: "±", action: "sign", kind: "utility", description: "Change sign" },
  { label: ".", action: ".", description: "Decimal point" },
  { label: "=", action: "equals", kind: "equals", description: "Calculate result" },
];

const operators = ["+", "-", "*", "/"];
const isDigit = /^\d$/;

function evaluateExpression(source) {
  const expression = source.replace(/\s+/g, "");
  let position = 0;

  function readNumber() {
    const match = expression.slice(position).match(/^(?:\d+\.?\d*|\.\d+)/);
    if (!match) throw new Error("Expected a number");

    position += match[0].length;
    return Number(match[0]);
  }

  function readValue() {
    let sign = 1;
    while (expression[position] === "+" || expression[position] === "-") {
      if (expression[position] === "-") sign *= -1;
      position += 1;
    }

    let value = readNumber() * sign;
    while (expression[position] === "%") {
      value /= 100;
      position += 1;
    }
    return value;
  }

  function readProduct() {
    let value = readValue();

    while (expression[position] === "*" || expression[position] === "/") {
      const operator = expression[position];
      position += 1;
      const nextValue = readValue();

      if (operator === "/" && nextValue === 0) {
        throw new Error("Cannot divide by zero");
      }

      value = operator === "*" ? value * nextValue : value / nextValue;
    }

    return value;
  }

  function readSum() {
    let value = readProduct();

    while (expression[position] === "+" || expression[position] === "-") {
      const operator = expression[position];
      position += 1;
      const nextValue = readProduct();
      value = operator === "+" ? value + nextValue : value - nextValue;
    }

    return value;
  }

  if (!expression) throw new Error("Enter an expression");

  const result = readSum();
  if (position !== expression.length || !Number.isFinite(result)) {
    throw new Error("Invalid expression");
  }

  const roundedResult = Number(result.toPrecision(12));
  return Object.is(roundedResult, -0) ? 0 : roundedResult;
}

function formatExpression(expression) {
  return expression.replaceAll("*", "×").replaceAll("/", "÷").replaceAll("-", "−");
}

function formatNumber(value) {
  return Number(value).toLocaleString("en-US", { maximumSignificantDigits: 12 });
}

function isUnaryMinusAtEnd(expression) {
  if (!expression.endsWith("-")) return false;
  const beforeMinus = expression.slice(0, -1);
  return beforeMinus === "" || /[+\-*/]$/.test(beforeMinus);
}

function App() {
  const [expression, setExpression] = useState("");
  const [previousExpression, setPreviousExpression] = useState("");
  const [error, setError] = useState("");
  const [justEvaluated, setJustEvaluated] = useState(false);

  const preview = useMemo(() => {
    if (!expression) return null;

    try {
      return evaluateExpression(expression);
    } catch {
      return null;
    }
  }, [expression]);

  const handleAction = useCallback(
    (action) => {
      if (action === "clear") {
        setExpression("");
        setPreviousExpression("");
        setError("");
        setJustEvaluated(false);
        return;
      }

      if (action === "backspace") {
        setExpression((current) => current.slice(0, -1));
        setPreviousExpression("");
        setError("");
        setJustEvaluated(false);
        return;
      }

      if (action === "equals") {
        if (!expression) return;

        try {
          const result = evaluateExpression(expression);
          setPreviousExpression(`${formatExpression(expression)} =`);
          setExpression(String(result));
          setError("");
          setJustEvaluated(true);
        } catch {
          setError("Check your calculation");
          setJustEvaluated(false);
        }
        return;
      }

      if (action === "sign") {
        let nextExpression = expression;

        if (!nextExpression) {
          nextExpression = "-";
        } else if (/[+\-*/]$/.test(nextExpression)) {
          nextExpression = isUnaryMinusAtEnd(nextExpression)
            ? nextExpression.slice(0, -1)
            : `${nextExpression}-`;
        } else {
          const currentNumber = nextExpression.match(/(-?(?:\d+\.?\d*|\.\d+)%?)$/)?.[0];
          if (!currentNumber) return;

          const unsignedNumber = currentNumber.startsWith("-")
            ? currentNumber.slice(1)
            : currentNumber;
          nextExpression = `${nextExpression.slice(0, -currentNumber.length)}${
            currentNumber.startsWith("-") ? "" : "-"
          }${unsignedNumber}`;
        }

        setExpression(nextExpression);
        setPreviousExpression("");
        setError("");
        setJustEvaluated(false);
        return;
      }

      let nextExpression = expression;
      if (justEvaluated && isDigit.test(action)) nextExpression = "";

      if (operators.includes(action)) {
        if (!nextExpression) {
          if (action !== "-") return;
          nextExpression = "-";
        } else if (/[+\-*/]$/.test(nextExpression)) {
          if (action === "-" && !isUnaryMinusAtEnd(nextExpression)) {
            nextExpression += "-";
          } else if (isUnaryMinusAtEnd(nextExpression)) {
            const beforeUnaryMinus = nextExpression.slice(0, -1);
            if (!beforeUnaryMinus) return;
            nextExpression = /[+\-*/]$/.test(beforeUnaryMinus)
              ? `${beforeUnaryMinus.slice(0, -1)}${action}`
              : `${beforeUnaryMinus}${action}`;
          } else {
            nextExpression = `${nextExpression.slice(0, -1)}${action}`;
          }
        } else {
          nextExpression += action;
        }
      } else if (action === "%") {
        if (!/\d$/.test(nextExpression) || nextExpression.endsWith("%")) return;
        nextExpression += "%";
      } else if (action === ".") {
        if (!nextExpression || /[+\-*/]$/.test(nextExpression)) {
          nextExpression += "0.";
        } else if (nextExpression.endsWith("%")) {
          nextExpression += "*0.";
        } else {
          const currentNumber = nextExpression.match(
            /(?:^|[+\-*/])(-?(?:\d+\.?\d*|\.\d+))$/,
          )?.[1];
          if (currentNumber?.includes(".")) return;
          nextExpression += ".";
        }
      } else if (isDigit.test(action)) {
        if (nextExpression.endsWith("%")) nextExpression += "*";
        nextExpression += action;
      } else {
        return;
      }

      setExpression(nextExpression);
      setPreviousExpression("");
      setError("");
      setJustEvaluated(false);
    },
    [expression, justEvaluated],
  );

  useEffect(() => {
    function handleKeyboard(event) {
      const keyboardActions = {
        Enter: "equals",
        "=": "equals",
        Backspace: "backspace",
        Escape: "clear",
        x: "*",
        X: "*",
        "×": "*",
        "÷": "/",
        "−": "-",
      };
      const action = keyboardActions[event.key] ?? event.key;

      if (
        event.target instanceof HTMLButtonElement &&
        (event.key === "Enter" || event.key === " ")
      ) {
        return;
      }

      if (
        !isDigit.test(action) &&
        ![".", "%", "+", "-", "*", "/", "equals", "backspace", "clear"].includes(action)
      ) {
        return;
      }

      event.preventDefault();
      handleAction(action);
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [handleAction]);

  const status = error ? "CHECK INPUT" : justEvaluated ? "SOLVED" : expression ? "IN PROGRESS" : "READY";

  return (
    <main className="page-shell">
      <div className="page-glow" aria-hidden="true" />
      <div className="site-frame">
        <header className="site-header">
          <a className="brand" href="#top" aria-label="Tally calculator home">
            <span className="brand-mark" aria-hidden="true">
              <svg viewBox="0 0 28 28" fill="none">
                <rect x="3" y="3" width="22" height="22" rx="7" fill="currentColor" />
                <path d="M9 10h10M14 7v6M9 18h3m4 0h3" stroke="#18221D" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
            </span>
            <span className="brand-wordmark">tally<span>.</span></span>
          </a>
          <p className="header-note"><span aria-hidden="true" /> A LITTLE TOOL FOR EVERYDAY MATH</p>
        </header>

        <section className="hero-layout" id="top">
          <div className="intro-panel">
            <p className="eyebrow"><span>01</span> MADE FOR THE EVERYDAY</p>
            <h1>Make room<br /><span>for clarity.</span></h1>
            <p className="hero-description">
              A calm, capable calculator for quick sums, clear thinking, and getting on with your day.
            </p>

            <div className="feature-list" aria-label="Calculator features">
              <div className="feature-item"><span>01</span><p>Keyboard<br />friendly</p></div>
              <div className="feature-item"><span>02</span><p>Instant answer<br />preview</p></div>
              <div className="feature-item"><span>03</span><p>Works on<br />any screen</p></div>
            </div>
          </div>

          <section className="calculator-card" aria-label="Calculator">
            <div className="card-heading">
              <div>
                <p className="card-overline">YOUR EVERYDAY TOOL</p>
                <h2>Calculator</h2>
              </div>
              <span className="mode-pill"><span aria-hidden="true" /> STANDARD</span>
            </div>

            <div className="display-panel">
              <div className="display-topline">
                <span className="display-caption">{previousExpression || "CURRENT EXPRESSION"}</span>
                <span className={`display-status${error ? " display-status--error" : ""}`}>
                  <span aria-hidden="true" /> {status}
                </span>
              </div>
              <output
                className={`display-value${error ? " display-value--error" : ""}`}
                aria-label="Calculator display"
                aria-live="polite"
                aria-atomic="true"
              >
                {error || formatExpression(expression || "0")}
              </output>
              <div className="display-footer">
                <span>{justEvaluated ? "ANSWER" : "LIVE PREVIEW"}</span>
                <strong>{preview === null ? "—" : formatNumber(preview)}</strong>
              </div>
            </div>

            <div className="keypad" role="group" aria-label="Calculator keys">
              {calculatorKeys.map((key) => (
                <button
                  className={`key${key.kind ? ` key--${key.kind}` : ""}`}
                  key={key.action}
                  type="button"
                  onClick={() => handleAction(key.action)}
                  aria-label={key.description || key.label}
                >
                  {key.label}
                </button>
              ))}
            </div>

            <div className="calculator-note">
              <span aria-hidden="true">↵</span>
              <span>Tip: press <kbd>ENTER</kbd> to calculate</span>
              <span className="note-separator" aria-hidden="true">·</span>
              <span><kbd>ESC</kbd> clears</span>
            </div>
          </section>
        </section>

        <footer className="site-footer">
          <span>Thoughtfully simple, by design.</span>
          <span>Built with React <span className="footer-dot">·</span> No sign-up, no distractions.</span>
        </footer>
      </div>
    </main>
  );
}

export default App;
