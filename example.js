const express = require('express');

const app = express();
const http = require('http');
const redis = require("redis");
const redisClient = redis.createClient({
    password: 'foobared'
});

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
    tokenDriver,
    test
} = require('nodejs-token-auth');

app.get('/', async (req, res) => {
    tokenDriver('redis', { redisClient: redisClient })

    const tokenId = await getTokenId();
    await setToken(tokenId, { id: 123, name: "user1" })
    await updateToken(tokenId, { email: 'user5@mail.com' })

    let newTokenId = await refreshTokenId(tokenId)
    extendTokenTime(tokenId);
    const tokenBody = await getToken(newTokenId)
    const tokenHeader = await getTokenHeader(newTokenId)
    // const deleteT = await deleteToken(newTokenId)

    // setTokenSavePath('/temp-token')
    // const path = getTokenSavePath()
    // const tokenId = getTokenId();
    // console.log(path)
    res.json([tokenId, newTokenId, tokenBody, tokenHeader]);
})

const httpServer = http.createServer(app);
httpServer.listen(4000);
console.log(`http server listening at port ${4000}`);
