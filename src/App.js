import React, { useEffect } from "react";
import { ATFUploader } from "./features/loader/uploader";
import "./App.css";
import { fetchATF } from "./services/API";

function App() {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(async () => {
    async function getData() {
      let atf_arr = [];
      const lastindex = window.location.pathname.split("/").pop();
      if (lastindex) {
        const id_arr = lastindex.split("&");
        for (let index = 0; index < id_arr.length; index++) {
          const ID = id_arr[index];
          const atf = await fetchATF(ID);
          if (atf) {
            atf_arr.push(atf.data);
          }
        }
        console.log(atf_arr);
      }
    }
    getData();
  }, []);

  return (
    <div className="App">
      <ATFUploader />
    </div>
  );
}

export default App;
