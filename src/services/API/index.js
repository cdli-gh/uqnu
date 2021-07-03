import axios from "../axios/index.js";

const id = 1;
export const fetchATF = async (PID) => {
   if(PID){ 
        try {
            const data = await axios.get(`artifacts/${PID}/inscription`);
            return data;
        } catch (error) {
            console.log(error);
        }
    }
} 