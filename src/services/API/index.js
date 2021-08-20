import axios from "../axios/index.js";


export const fetchATF = async (PID) => {
   if(PID){ 
        try {
            const data = await axios.get(`artifacts/${PID}/inscription`);
            return data.data; // returns plain ATF string
        } catch (error) {
            console.log(error);
        }
    }
} 