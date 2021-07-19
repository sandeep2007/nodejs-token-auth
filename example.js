const express = require('express');

const app = express();
const http = require('http');

const {
    getTokenId,
    getToken,
    getTokenHeader,
    setToken,
    updateToken,
    deleteToken,
    refreshTokenId,
    extendTokenTime,
    setTokenSavePath,
    getTokenSavePath,
    tokenDriver
} = require('nodejs-token-auth');

app.get('/', (req, res) => {
    tokenDriver('memory')
    const tokenId = getTokenId();
    setToken(tokenId, { id: 123, name: "user1" })
    updateToken(tokenId, { email: 'user5@mail.com' })

    // let newTokenId = refreshTokenId(tokenId)
    extendTokenTime(tokenId);
    const tokenBody = getToken(tokenId)
    const tokenHeader = getTokenHeader(tokenId)
    // const deleteT = deleteToken(newTokenId)

    // setTokenSavePath('/temp-token')
    // const path = getTokenSavePath()
    // const tokenId = getTokenId();
    // console.log(path)
    res.json([tokenId, tokenBody, tokenHeader]);
})

const httpServer = http.createServer(app);
httpServer.listen(4000);
console.log(`http server listening at port ${4000}`);
