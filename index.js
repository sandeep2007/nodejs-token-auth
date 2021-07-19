const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

let tokenList = new Map()

let config = {
    tokenSavePath: './tokens',
    tokenDriver: 'memory',
    maxAge: 3600 * 24 * 365,
    garbageCleanInterval: 3600,
    tempTokenCleanAt: 600
}

function _getTokenData(key) {

    if (config.tokenDriver === 'memory') {
        return tokenList.get(key)
    }
    else if (config.tokenDriver === 'file') {
        let token = fs.readFileSync(getTokenSavePath() + '/' + key)
        return JSON.parse(token)
    }
    else if (config.tokenDriver === 'database') {

    }
    else if (config.tokenDriver === 'redis') {

    }
}

function _setTokenData(key, obj) {
    try {
        if (config.tokenDriver === 'memory') {
            tokenList.set(key, obj)
        }
        else if (config.tokenDriver === 'file') {
            fs.writeFileSync(getTokenSavePath() + '/' + key, JSON.stringify(obj, null, 2))
        }
        else if (config.tokenDriver === 'database') {

        }
        else if (config.tokenDriver === 'redis') {

        }
    }
    catch (err) {
        return
    }
}

function _deleteTokenData(key) {
    try {
        if (config.tokenDriver === 'memory') {
            tokenList.delete(key)
        }
        else if (config.tokenDriver === 'file') {
            fs.unlinkSync(getTokenSavePath() + '/' + key)
        }
        else if (config.tokenDriver === 'database') {

        }
        else if (config.tokenDriver === 'redis') {

        }
        return true
    }
    catch (err) {
        return false
    }
}

function _getAllTokenList() {
    try {
        if (config.tokenDriver === 'memory') {
            return Array.from(tokenList.keys())
        }
        else if (config.tokenDriver === 'file') {
            return fs.readdirSync(getTokenSavePath() + '/')
        }
        else if (config.tokenDriver === 'database') {

        }
        else if (config.tokenDriver === 'redis') {

        }
    }
    catch (err) {
        return []
    }

}

function tokenDriver(driver) {
    if (driver === 'memory' || driver === 'file' || driver === 'database' || driver === 'redis') {
        config.tokenDriver = driver
        return true
    }
    else {
        return false
    }
}

function setTokenSavePath(path) {
    config.tokenSavePath = path
}

function getTokenSavePath() {
    return config.tokenSavePath
}

function getTokenId() {
    let payload = { header: { maxAge: config.maxAge, createdAt: new Date().getTime() }, body: {} }
    let tokenId = Buffer.from(uuidv4()).toString('base64')
    _setTokenData(tokenId, payload)
    return tokenId
}

function setToken(key, obj) {
    try {
        let token = _getTokenData(key)
        let payload = { header: token.header, body: Object.assign(token.body || {}, obj) }
        _setTokenData(key, payload)
    }
    catch (err) {
        return
    }
}

function getTokenHeader(key) {
    try {
        return _getTokenData(key).header
    }
    catch (err) {
        return null
    }
}

function getToken(key) {
    try {
        return _getTokenData(key).body
    }
    catch (err) {
        return null
    }
}

function updateToken(key, obj) {
    try {
        let token = _getTokenData(key)
        let payload = { header: token.header, body: Object.assign(token.body || {}, obj) }
        _setTokenData(key, payload)
    }
    catch (err) {
        return null
    }
}

function deleteToken(key) {
    try {
        _deleteTokenData(key)
        return true
    }
    catch (err) {
        return false
    }
}

function refreshTokenId(key) {
    try {
        let prevToken = _getTokenData(key)
        let newTokenId = getTokenId()
        deleteToken(key)
        _setTokenData(newTokenId, prevToken)
        extendTokenTime(newTokenId)
        return newTokenId;
    }
    catch (err) {
        return null;
    }
}

function extendTokenTime(key) {
    try {
        let token = _getTokenData(key)
        let payload = { header: Object.assign(token.header, { createdAt: new Date().getTime() }), body: token.body }
        _setTokenData(key, payload)
    }
    catch (err) {
        return null
    }
}

function cleanGarbageToken() {
    _getAllTokenList().forEach((key) => {
        let token = _getTokenData(key)
        let tokenCreationTime = token.header.createdAt
        let currentTime = new Date().getTime()

        if (JSON.stringify(token.body) === JSON.stringify({}) && currentTime > tokenCreationTime + config.tempTokenCleanAt * 1000) {
            deleteToken(key)
        }
        else if (currentTime > tokenCreationTime + token.header.maxAge * 1000) {
            deleteToken(key)
        }
    })
}

setInterval(() => {
    cleanGarbageToken()
}, config.garbageCleanInterval)

module.exports = {
    getTokenId,
    setToken,
    getToken,
    updateToken,
    deleteToken,
    refreshTokenId,
    getTokenHeader,
    extendTokenTime,
    setTokenSavePath,
    getTokenSavePath,
    tokenDriver
}
