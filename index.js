const { v4: uuidv4 } = require('uuid');

let tokenList = new Map();

function getTokenId() {
    let token = Buffer.from(uuidv4()).toString('base64')
    tokenList.set(token, { header: { maxAge: 3600, createdAt: new Date().getTime() }, body: null })
    return token
}

function setToken(key, obj) {
    let token = tokenList.get(key)
    tokenList.set(key, { header: token.header, body: Object.assign(token.body || {}, obj) })
}

function getTokenHeader(key) {
    try {
        return tokenList.get(key).header
    }
    catch (err) {
        return null
    }

}

function getToken(key) {
    try {
        return tokenList.get(key).body
    }
    catch (err) {
        return null
    }
}

function updateToken(key, obj) {
    try {
        let token = tokenList.get(key)
        tokenList.set(key, { header: token.header, body: Object.assign(token.body || {}, obj) })
    }
    catch (err) {
        return null
    }
}

function deleteToken(key) {
    try {
        tokenList.delete(key)
        return true
    }
    catch (err) {
        return false
    }
}

function deleteAllToken() {
    tokenList = new Map()
}

function refreshTokenId(key) {
    try {
        let prevToken = tokenList.get(key)
        let newTokenId = getTokenId()
        deleteToken(key)
        tokenList.set(newTokenId, prevToken)
        extendTokenTime(newTokenId)
        return newTokenId;
    }
    catch (err) {
        return null;
    }
}

function extendTokenTime(key) {
    try {
        let token = tokenList.get(key)
        tokenList.set(key, { header: Object.assign(token.header, { createdAt: new Date().getTime() }), body: token.body })
    }
    catch (err) {
        return null
    }
}

function cleanGarbageToken() {
    console.log('garbage called')
    tokenList.forEach((value, key) => {
        let token = tokenList.get(key)
        let tokenCreationTime = token.header.createdAt
        let currentTime = new Date().getTime()

        if (token.body === null && currentTime > tokenCreationTime + 600 * 1000) {
            deleteToken(key)
        }
        else if (currentTime > tokenCreationTime + token.header.maxAge * 1000) {
            deleteToken(key)
        }
    })
}

setInterval(() => {
    cleanGarbageToken()
}, 1000 * 3600 * 1)

module.exports = {
    getTokenId,
    setToken,
    getToken,
    updateToken,
    deleteToken,
    deleteAllToken,
    refreshTokenId,
    getTokenHeader,
    extendTokenTime
}