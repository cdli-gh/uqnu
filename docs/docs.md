### uqnu Documentation

A web application to work with digital cuneiform transliterations in the JTF and ATF formats. Depends on jtf-lib.

UQNU can also stand for Unstrained Cuneiform Notation Utility; the bound Q is used as a syllabic token.

### Installation 

##### install uqnu 
`npm install`

##### with yarn 
`yarn install`

##### to run the web app
`npm start` and for yarn `yarn start`

### To fetch ATF using PID
in order to fetch ATF using PID we have REST API in framework and for that just pass PID in url.

Example: `http://localhost:3002/uqnu/PID` where PID is a Inscription number `http://localhost:3002/uqnu/1`

You can also pass multiple PID's in URL using &

Example : `http://localhost:3002/uqnu/1&2&3&4&5`


