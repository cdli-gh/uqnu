import React, { useEffect, useState } from "react";
import axios from 'axios';
import "./App.css";
//import logo from './logo.svg';

import { ATFUploader } from './features/loader/uploader';
import { Editor } from './features/editor/Editor';

import { fetchATF } from "./services/API";
import { importCDLI } from 'jtf-lib';

const ENV = ''; //change to 'CDLI' to run within CDLI's framework.

async function getATFData() {
  // Preload atf from p-numbers in URL
  const lastindex = window.location.pathname.split("/").pop();
  let preloadedATF = '';
  if (lastindex) {
    const pNumbers = lastindex.split("&").filter(p => /[p|P]?\d{6}/.test(p));
    preloadedATF = (ENV==='CDLI') 
      // API call- CDLI Framework
      ? await Promise.all(pNumbers.map( pNumber => `${fetchATF(pNumber)}\n`).join('\n'))
      // Otherwise, generic jtf-lib API CDLI import 
      : await axios.post('http://localhost:3003/api/getCDLIATF', {pNumbers: pNumbers})
    preloadedATF = (preloadedATF.data) ? preloadedATF.data : preloadedATF;
  };
  return preloadedATF;
};

function makeBlob(string){
  //
  return new Blob([string], {type: 'text/html'});
};

function App () {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [preloaded, setPreloaded] = useState(null);
  useEffect(async () => {
    // will fetch the ATF data from given ID's in URL
    let preloadedATF = await getATFData();
    setPreloaded(makeBlob(preloadedATF));
  }, []);
  return (
    <div className="App">
      <ATFUploader preloaded={preloaded}/>
    </div>
  );
};

export default App;