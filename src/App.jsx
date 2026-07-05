import { useState } from "react";
import "./App.css";

function App() {
  const [input, setInput] = useState("");

  const manageclick = (value) => {
    setInput((prev) => prev + value);
  };
  const managebackspace = () => {
    setInput((prev) => prev.slice(0, -1));
  };
  const manageclear = () => {
    setInput("");
  };
  const manageresult = () => {
    if (!input) return;
    try {
      const result = Function(`return ${input}`)();
      setInput(String(result));
    } catch (error) {
      setInput("Error" + error);
    }
  };
  const stylebutton =
    "aspect-square bg-neutral-400 text-black text-xl font-medium rounded-full hover:bg-neutral-300";

  return (
    <>
      <div className="max-w-xs p-4 bg-black rounded-2xl shadow-xl">
        <div className="w-full h-20 text-right text-white text-4xl font-mono pr-4 pt-6 bg-stone-900 rounded-xl mb-4">
          {input || 0}
        </div>
        <div className="grid grid-cols-4 gap-3">
          <button onClick={manageclear} className={stylebutton}>
            AC
          </button>
          <button onClick={managebackspace} className={stylebutton}>
            ←
          </button>
          <button onClick={() => manageclick("%")} className={stylebutton}>
            %
          </button>
          <button onClick={() => manageclick("/")} className={stylebutton}>
            /
          </button>

          <button onClick={() => manageclick("7")} className={stylebutton}>
            7
          </button>
          <button onClick={() => manageclick("8")} className={stylebutton}>
            8
          </button>
          <button onClick={() => manageclick("9")} className={stylebutton}>
            9
          </button>
          <button onClick={() => manageclick("*")} className={stylebutton}>
            ×
          </button>

          <button onClick={() => manageclick("4")} className={stylebutton}>
            4
          </button>
          <button onClick={() => manageclick("5")} className={stylebutton}>
            5
          </button>
          <button onClick={() => manageclick("6")} className={stylebutton}>
            6
          </button>
          <button onClick={() => manageclick("-")} className={stylebutton}>
            -
          </button>

          <button onClick={() => manageclick("1")} className={stylebutton}>
            1
          </button>
          <button onClick={() => manageclick("2")} className={stylebutton}>
            2
          </button>
          <button onClick={() => manageclick("3")} className={stylebutton}>
            3
          </button>
          <button onClick={() => manageclick("+")} className={stylebutton}>
            +
          </button>

          <button
            onClick={() => manageclick("0")}
            className={
              "col-span-2 spect-square bg-neutral-400 text-black text-xl font-medium rounded-full hover:bg-neutral-300"
            }
          >
            0
          </button>
          <button onClick={() => manageclick(".")} className={stylebutton}>
            .
          </button>
          <button onClick={manageresult} className={stylebutton}>
            =
          </button>
        </div>
      </div>
    </>
  );
}

export default App;
