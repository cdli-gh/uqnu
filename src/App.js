import React, { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";
import { ATFUploader } from "./features/loader/uploader";
import { fetchATF } from "./services/API";

const ENV = "CDLI"; //change to 'CDLI' to run within CDLI's framework.

async function getATFData() {
  // Preload atf from p-numbers in URL
  const lastindex = window.location.pathname.split("/").pop();
  let preloadedATF = "";
  if (lastindex) {
    const pNumbers = lastindex.split("&").filter((p) => /[p|P]?\d{6}/.test(p));
    // alert(pNumbers);
    preloadedATF =
      ENV === "CDLI"
        ? // API call- CDLI Framework
          await PnumbersToATF(pNumbers)
        : // Otherwise, generic jtf-lib API CDLI import
          await axios.post("http://localhost:3003/api/getCDLIATF", {
            pNumbers: pNumbers,
          });
    preloadedATF = preloadedATF.data ? preloadedATF.data : preloadedATF;
  }
  return preloadedATF;
}

async function PnumbersToATF(pNumbers) {
  if (pNumbers) {
    let atf_arr = [];
    for (let index = 0; index < pNumbers.length; index++) {
      let atf = await fetchATF(pNumbers[index]);
      if (atf) {
        atf += "\n";
        atf_arr.push(atf);
      }
    }
    atf_arr = atf_arr.join("\n");
    return atf_arr;
  }
}
function makeBlob(string) {
  return new Blob([string], { type: "text/html" });
}

function App() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [preloaded, setPreloaded] = useState(null);
  useEffect(async () => {
    // will fetch the ATF data from given ID's in URL
    let preloadedATF = await getATFData();
    console.log(preloadedATF);
    setPreloaded(makeBlob(preloadedATF));
  }, []);
  return (
    <div className="App">
      <ATFUploader preloaded={preloaded} />
    </div>
  );
}

export default App;
