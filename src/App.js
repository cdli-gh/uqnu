import React, { useEffect } from "react";
import "./App.css";
//import logo from './logo.svg';
import { ATFUploader } from './features/loader/uploader';
//import { fetchATF } from "./services/API";
import { Editor } from './features/editor/Editor';

/* function App () {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    async function getData() {
      let atf_arr = []; // array of atf data
      const lastindex = window.location.pathname.split("/").pop();
      if (lastindex) {
        const id_arr = lastindex.split("&");
        for (let index = 0; index < id_arr.length; index++) {
          const ID = id_arr[index];
          // API call- Framework
          const atf = await fetchATF(ID);
          if (atf) {
            atf_arr.push(atf.data);
          }
        }
        console.log(atf_arr);
      }
    }
    // will fetch the ATF data from given ID's in URL
    getData();
  }, []);
}; */

function App() {
    
    return (
    <div className="App">
    <ATFUploader/>
    </div>
    )
};

export default App;

/* function App() {
    
    return (
    <div className="App">
    <ATFUploader/>
    </div>
    )
};
    
   //older:
   return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <Editor />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <span>
          <span>Learn </span>
          <a
            className="App-link"
            href="https://reactjs.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux
          </a>
          <span>, </span>
          <a
            className="App-link"
            href="https://redux-toolkit.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Redux Toolkit
          </a>
          ,<span> and </span>
          <a
            className="App-link"
            href="https://react-redux.js.org/"
            target="_blank"
            rel="noopener noreferrer"
          >
            React Redux
          </a>
        </span>
      </header>
    </div>
  );
} */