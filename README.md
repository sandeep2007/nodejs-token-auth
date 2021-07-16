
# Nodejs Token Auth

This module allows you to manage user tokens and easily integrate them with API. It uses in-memory storage for fast and better performance. The garbage collector continuously cleans expired and unused tokens.

## Installation

Use the package manager [npm](https://www.npmjs.com/package/nodejs-token-auth) to install nodejs-token-auth.

```bash
npm i nodejs-token-auth
```

## Usage

```nodejs
const { 
getTokenId, 
getToken, 
getTokenHeader, 
setToken, 
updateToken,
deleteToken, 
refreshTokenId, 
extendTokenTime
} = require('nodejs-token-auth')

# get token Id
 const tokenId = getTokenId();

# set token value
 setToken(tokenId, { id: '91c6468e-19cf-4741-baa5-24c48b095c5e', name: "user 1" })

# update token value
 updateToken(tokenId, { email: 'user@mail.com' })

# refresh token Id
 const newTokenId = refreshTokenId(tokenId)

# extend the token time
 extendTokenTime(tokenId);

# get token
 const tokenBody = getToken(newTokenId)

# get token header
 const tokenHeader = getTokenHeader(newTokenId)

# delete token
 deleteToken(tokenId)
```

## Contributing
Pull requests are welcome. For major changes, please open an issue first to discuss what you would like to change.

## License
[ISC](https://choosealicense.com/licenses/isc/)
