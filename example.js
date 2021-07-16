const express = require('express');

const app = express();
const http = require('http');

const { getTokenId, getToken, getTokenHeader, setToken, updateToken, deleteToken, refreshTokenId, extendTokenTime } = require('./index.js');

app.get('/', (req, res) => {
    const tokenId = getTokenId();
    setToken(tokenId, { id: 123, name: "user1" })
    updateToken(tokenId, { email: 'user4@mail.com' })

    let newTokenId = refreshTokenId(tokenId)
    extendTokenTime(tokenId);
    const tokenBody = getToken(newTokenId)
    const tokenHeader = getTokenHeader(newTokenId)
    deleteToken(tokenId)

    res.json([tokenHeader, tokenBody, tokenId]);
})

const httpServer = http.createServer(app);
httpServer.listen(4000);
console.log(`http server listening at port ${4000}`);
