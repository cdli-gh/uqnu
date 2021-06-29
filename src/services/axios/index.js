import  axios  from "axios";

const instance = axios.create({
    baseURL: process.env.REACT_APP_BACKEND,
    headers: {
        'Accept': 'text/x-c-atf'
    }
})

export default instance;