// let BACKEND_URL = 'https://api2-testnet.aergoscan.io'
let BACKEND_URL = 'https://api2-alpha.aergoscan.io'

let API_URL = `${BACKEND_URL}/v2`
if (process.env.API_URL) {
  if (process.env.API_URL.startsWith('http')) {
    API_URL = process.env.API_URL
  } else {
    API_URL = `http://${process.env.API_URL}`
  }
}

// let AERGO_URL = `https://testnet-api-http.aergo.io`
let AERGO_URL = `https://alpha-api-http.aergo.io`

if (process.env.AERGO_NODE) {
  if (process.env.AERGO_NODE.startsWith('http')) {
    AERGO_URL = process.env.AERGO_NODE
  } else {
    const aergo_node_clean = process.env.AERGO_NODE.replace(/https?:\/\//, '')
    AERGO_URL = `http://${aergo_node_clean}`
  }
}

if (process.env.AERGO_URL) {
  if (process.env.AERGO_URL.startsWith('http')) {
    AERGO_URL = process.env.AERGO_URL
  } else {
    const aergo_node_clean = process.env.AERGO_URL.replace(/https?:\/\//, '')
    AERGO_URL = `http://${aergo_node_clean}`
  }
}

// let HARDFORK_BLOCK_V4 = 140020000
let HARDFORK_BLOCK_V4 = 22555555

module.exports = {
  DEPLOYMENT: JSON.stringify('local'),
  NODE_ENV: JSON.stringify('development'),
  API_URL: JSON.stringify(API_URL),
  AERGO_URL: JSON.stringify(AERGO_URL),
  HARDFORK_BLOCK_V4: JSON.stringify(`${HARDFORK_BLOCK_V4}`),
}
