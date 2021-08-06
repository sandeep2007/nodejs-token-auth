const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

let tokenList = new Map()


// let config = {
//     tokenSavePath: './tokens',
//     tokenDriver: 'memory',
//     maxAge: 3600 * 24 * 365,
//     garbageCleanInterval: 3600,
//     tempTokenCleanAt: 600,
//     redisClient: null
// }

let config = {
    tokenSavePath: './tokens',
    tokenDriver: 'memory',
    maxAge: 10,
    garbageCleanInterval: 5,
    tempTokenCleanAt: 3,
    redisClient: null
}



async function _getTokenData(key) {
    try {
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

            let rg = await new Promise((resolve, reject) => {
                config.redisClient.get('token:' + key, (err, data) => {
                    if (err) {
                        reject(new Error(err))
                    }
                    else {
                        resolve(data)
                    }
                })
            })
            return JSON.parse(rg)
        }
    }
    catch (err) {
        return err
    }

}

async function _setTokenData(key, obj) {
    try {
        if (config.tokenDriver === 'memory') {
            tokenList.set(key, obj)
            return true
        }
        else if (config.tokenDriver === 'file') {
            fs.writeFileSync(getTokenSavePath() + '/' + key, JSON.stringify(obj, null, 2))
            return true
        }
        else if (config.tokenDriver === 'database') {

        }
        else if (config.tokenDriver === 'redis') {
            await new Promise((resolve, reject) => {
                config.redisClient.set('token:' + key, JSON.stringify(obj), (err, data) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(data)
                    }
                })
            })
            return true
        }
        return false
    }
    catch (err) {
        console.log(err.message)
        return false
    }
}

async function _deleteTokenData(key) {
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
            await new Promise((resolve, reject) => {
                config.redisClient.del('token:' + key, (err, data) => {
                    if (err) {
                        reject(err)
                    }
                    else {
                        resolve(data)
                    }
                })
            })
        }
        return true
    }
    catch (err) {
        return false
    }
}

async function _getAllTokenList() {
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
            let rg = await new Promise((resolve, reject) => {
                config.redisClient.keys('token*', (err, data) => {
                    if (err) {
                        reject(new Error(err))
                    }
                    else {
                        resolve(data)
                    }
                })
            })

            return rg === null ? [] : rg
        }
    }
    catch (err) {
        return []
    }

}

function tokenDriver(driver, options) {
    if (driver === 'memory' || driver === 'file' || driver === 'database' || driver === 'redis') {
        config.tokenDriver = driver
        if (driver === 'redis') {
            config.redisClient = options.redisClient
        }
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

async function getTokenId() {
    let payload = { header: { maxAge: config.maxAge, createdAt: new Date().getTime() }, body: {} }
    let tokenId = Buffer.from(uuidv4()).toString('base64')
    let status = await _setTokenData(tokenId, payload)
    return status ? tokenId : status
}

async function setToken(key, obj) {
    try {
        let token = await _getTokenData(key)
        let payload = { header: token.header, body: Object.assign(token.body || {}, obj) }
        await _setTokenData(key, payload)
    }
    catch (err) {
        return
    }
}

async function getTokenHeader(key) {
    try {
        const token = await _getTokenData(key)
        return token.header
    }
    catch (err) {
        return null
    }
}

async function getToken(key) {
    try {
        const token = await _getTokenData(key)
        return token.body
    }
    catch (err) {
        return null
    }
}

async function updateToken(key, obj) {
    try {
        let token = await _getTokenData(key)
        let payload = { header: token.header, body: Object.assign(token.body || {}, obj) }
        await _setTokenData(key, payload)
    }
    catch (err) {
        return null
    }
}

async function deleteToken(key) {
    try {
        await _deleteTokenData(key)
        return true
    }
    catch (err) {
        return false
    }
}

async function refreshTokenId(key) {
    try {
        let prevToken = await _getTokenData(key)
        let newTokenId = await getTokenId()
        await deleteToken(key)
        await _setTokenData(newTokenId, prevToken)
        await extendTokenTime(newTokenId)
        return newTokenId;
    }
    catch (err) {
        return null;
    }
}

async function extendTokenTime(key) {
    try {
        let token = await _getTokenData(key)
        let payload = { header: Object.assign(token.header, { createdAt: new Date().getTime() }), body: token.body }
        await _setTokenData(key, payload)
    }
    catch (err) {
        return null
    }
}

async function cleanGarbageToken() {
    const tokens = await _getAllTokenList()
    tokens.forEach(async (tokenKey) => {

        let key = tokenKey.replace('token:', '')
        let token = await _getTokenData(key)
        let tokenCreationTime = token.header.createdAt
        let currentTime = new Date().getTime()

        if (JSON.stringify(token.body) === JSON.stringify({}) && currentTime > tokenCreationTime + config.tempTokenCleanAt * 1000) {
            await deleteToken(key)
        }
        else if (currentTime > tokenCreationTime + token.header.maxAge * 1000) {
            await deleteToken(key)
        }
    })
}

setInterval(async () => {
    await cleanGarbageToken()
}, config.garbageCleanInterval * 1000)

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
