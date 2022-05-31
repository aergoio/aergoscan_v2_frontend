## Local frontend development

You can build the frontend locally without re-building the docker image.

```shell
# install dependencies
yarn

# serve with hot reload at localhost:8081
yarn dev
```

### Build for production

```shell
# localhost
CONFIG_NAME=local yarn build

# alpha net
CONFIG_NAME=alphanet yarn build

# main net
CONFIG_NAME=mainnet yarn build

# test net
CONFIG_NAME=testnet yarn build


```

Development build with different AERGO node:

```shell
# localhost
AERGO_NODE=https://testnet-api-http.aergo.io yarn dev

# main net
AERGO_NODE=https://mainnet-api-http.aergo.io API_URL=https://api2-mainnet.aergoscan.io/mainnet/v2 yarn dev

# test net
AERGO_NODE=https://testnet-api-http.aergo.io API_URL=https://api2-testnet.aergoscan.io/testnet/v2 yarn dev

# alpha net
AERGO_NODE=https://alpha-api-http.aergo.io API_URL=https://api2-alpha.aergoscan.io/alpha/v2 yarn dev
```
