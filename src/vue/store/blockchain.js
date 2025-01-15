import aergo from '../../controller'
import { Amount, Contract } from '@herajs/client'
import { waitOrLoad } from 'timed-async'
import cfg from '@/src/config.js'

const TokenABI = {
  language: 'lua',
  version: '0.2',
  functions: [
    {
      name: 'balanceOf',
      arguments: [
        {
          name: 'owner',
        },
      ],
      view: true,
      payable: false,
      feeDelegation: false,
    },
  ],
}
const HISTORY_MAX_BLOCKS = 60

const state = {
  streamState: 'initial',
  streamConnected: false,
  recentBlocks: [],
  ws: null,
  recentTransactions: [],
  blocksByHash: {},
  accountsByAddress: {},
  txByHash: {},
  provider: aergo.client,
  chainInfo: {},
  activeAccount: {},
}

const getters = {
  getActiveAccount: (state) => {
    return state.activeAccount
  },
}

let blockHeaderStream = null
let previousBlockNumber = 0

const actions = {
  streamBlocks({ commit, dispatch, state }) {
    if (state.ws) {
      console.log('[WebSocket] Closing existing connection')
      state.ws.close()
      commit('setWebSocket', null)
    }

    console.log('[WebSocket] Starting new WebSocket connection')

    // 스트림 상태를 'starting'으로 설정
    if (state.streamState !== 'starting-slow') {
      commit('setStreamState', 'starting')
    }

    // 일정 시간 후 'starting-slow'로 변경
    const loadingFinished = waitOrLoad(() => {
      commit('setStreamState', 'starting-slow')
      console.log('[WebSocket] Stream state updated to: starting-slow')
    }, 3500)

    // WebSocket 초기화
    const hostApi = cfg.API_URL || 'http://localhost:3000'
    const wsProtocol = hostApi.startsWith('https') ? 'wss' : 'ws'
    const wsUrl = hostApi.replace(/^https?/, wsProtocol)
    const ws = new WebSocket(`${wsUrl}/streamBlocks`)

    ws.onopen = () => {
      console.log('[WebSocket] Connected to server')
      commit('setStreamState', 'started')
      commit('setConnected', true)

      // 스트림이 시작되었으면 loadingFinished 실행 취소
      loadingFinished()
    }

    ws.onmessage = (event) => {
      try {
        const blockHeader = JSON.parse(event.data)
        commit('addBlock', blockHeader) // 새 블록 추가
      } catch (error) {
        console.error('[WebSocket] Error parsing message:', error)
      }
    }
    let retryDelay = 5000
    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
      commit('setStreamState', 'error') // 에러 상태 설정
      commit('setConnected', false)

      setTimeout(() => {
        console.log(
          `[WebSocket] Restarting streamBlocks in ${retryDelay / 1000} seconds`
        )
        dispatch('restartStreamBlocks')
        retryDelay = Math.min(retryDelay * 2, 60000) // 최대 1분까지 증가
      }, retryDelay)
    }

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected')
      commit('setStreamState', 'ended') // 스트림 종료 상태 설정
      commit('setConnected', false)
    }

    // WebSocket 객체를 상태에 저장
    commit('setWebSocket', ws)
  },
  restartStreamBlocks({ dispatch, state }) {
    if (state.ws && state.ws.readyState === WebSocket.OPEN) {
      console.log('[WebSocket] Restarting streamBlocks...')
      state.ws.close() // 기존 연결 닫기
    }
    commit('setStreamState', 'initial') // 상태 초기화
    commit('setConnected', false)

    // 새로운 스트림 시작
    dispatch('streamBlocks')
  },

  async updateChainInfo({ commit }) {
    try {
      const response = await fetch(`${cfg.API_URL}/node/chainInfo`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const chainInfo = Object.freeze(await response.json())

      commit('setChainInfo', chainInfo)
    } catch (error) {
      console.error('[REST] Error fetching chain info:', error)
    }
  },

  async getBestBlock() {
    try {
      const response = await fetch(`${cfg.API_URL}/node/bestBlock`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const bestBlock = Object.freeze(await response.json())

      return bestBlock
    } catch (error) {
      console.error('[REST] Error fetching chain info:', error)
    }
  },

  async getConsensusInfo() {
    try {
      const response = await fetch(`${cfg.API_URL}/consensusInfo`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const consensusInfo = Object.freeze(await response.json())

      return consensusInfo
    } catch (error) {
      console.error('[REST] Error fetching chain info:', error)
    }
  },
  getBlock({ dispatch, state }, { blockNoOrHash }) {
    if (state.blocksByHash[blockNoOrHash]) {
      return new Promise((resolve) => {
        resolve(state.blocksByHash[blockNoOrHash])
      })
    }
    return dispatch('fetchBlock', { blockNoOrHash })
  },
  async fetchBlock({ commit }, { blockNoOrHash }) {
    try {
      const response = await fetch(
        `${cfg.API_URL}/block?blockNoOrHash=${blockNoOrHash}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const block = await response.json()
      commit('setBlockDetail', { block })

      return block
    } catch (error) {
      console.error('[REST] Error fetching block:', error)
    }
  },
  async fetchBlockMetadata({}, { blockNo }) {
    try {
      const response = await fetch(
        `${cfg.API_URL}/blockMetadata?blockNo=${blockNo}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const blockMetaData = await response.json()

      return blockMetaData
    } catch (error) {
      console.error('[REST] Error fetching block metadata:', error)
    }
  },
  async fetchBlockTransactions({}, { hash, offset, size }) {
    return await aergo.getBlockBody(hash, offset, size)
  },
  getTransaction({ dispatch, state }, { hash }) {
    if (state.txByHash[hash]) {
      return new Promise((resolve) => {
        resolve(state.txByHash[hash])
      })
    }
    return dispatch('fetchTransaction', { hash })
  },
  async fetchTransaction({ commit }, { hash }) {
    const tx = Object.freeze(await aergo.getTransaction(hash))
    commit('setTxDetail', { tx })
    return tx
  },
  getTransactionReceipt({ dispatch, state }, { hash }) {
    return dispatch('fetchTransactionReceipt', { hash })
  },
  async fetchTransactionReceipt({}, { hash }) {
    try {
      const response = await fetch(
        `${cfg.API_URL}/transactionReceipt?hash=${hash}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const transactionReceipt = await response.json()

      return transactionReceipt
    } catch (error) {
      console.error('[REST] Error fetching transaction receipt:', error)
    }
  },
  getAccountVotes({ dispatch }, { address }) {
    return dispatch('fetchGetAccountVotes', { address })
  },
  async fetchGetAccountVotes({}, { address }) {
    try {
      const response = await fetch(
        `${cfg.API_URL}/accountVotes?address=${address}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const accountVotes = await response.json()

      return accountVotes
    } catch (error) {
      console.error('[REST] Error fetching account votes:', error)
    }
  },
  async getAccount({ dispatch, state }, { address }) {
    if (state.accountsByAddress[address]) {
      return state.accountsByAddress[address]
    }
    return await dispatch('fetchAccount', { address })
  },
  async fetchAccount({ commit }, { address }) {
    try {
      const response = await fetch(
        `${cfg.API_URL}/accountState?address=${address}`
      )
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const json = await response.json()
      const [value, unit] = json.balance.split(' ')
      const balance = new Amount(value, unit)
      const account = { ...json, balance }
      commit('setAccountDetail', { address, account })

      return account
    } catch (error) {
      console.error('[REST] Error fetching account state:', error)
    }
  },
  async getTopVotes({}, { count }) {
    try {
      const response = await fetch(`${cfg.API_URL}/topVotes?count=${count}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const json = await response.json()
      const topVotes = json.map((vote) => ({
        ...vote,
        amount: new Amount(
          vote.amount.split(' ')[0],
          vote.amount.split(' ')[1]
        ),
      }))

      return topVotes
    } catch (error) {
      console.error('[REST] Error fetching top votes:', error)
    }
  },
  async getStaking({ dispatch }, { address }) {
    return await dispatch('fetchStaking', { address })
  },
  async fetchStaking({}, { address }) {
    try {
      const response = await fetch(`${cfg.API_URL}/staking?address=${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const json = await response.json()
      const [value, unit] = json.amount.split(' ')
      const amount = new Amount(value, unit)
      const staking = { ...json, amount }

      return staking
    } catch (error) {
      console.error('[REST] Error fetching staking:', error)
    }
  },
  async getNodeState({}, component) {
    return aergo.getNodeState(component)
  },
  async getServerInfo() {
    try {
      const response = await fetch(`${cfg.API_URL}/serverInfo`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const data = await response.json()

      const serverInfo = {
        configMap: new Map(data.configMap),
        statusMap: new Map(data.statusMap),
      }

      return serverInfo
    } catch (error) {
      console.error('[REST] Error fetching server info:', error)
    }
  },
  getNameInfo({ dispatch }, { name }) {
    return dispatch('fetchNameInfo', { name })
  },
  async fetchNameInfo({}, { name }) {
    try {
      const response = await fetch(`${cfg.API_URL}/nameInfo?name=${name}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const nameInfo = await response.json()

      return nameInfo
    } catch (error) {
      console.error('[REST] Error fetching abi:', error)
    }
  },
  getABI({ dispatch }, { address }) {
    return dispatch('fetchABI', { address })
  },
  async fetchABI({ commit }, { address }) {
    try {
      const response = await fetch(`${cfg.API_URL}/abi?address=${address}`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const abi = await response.json()

      return abi
    } catch (error) {
      console.error('[REST] Error fetching abi:', error)
    }
  },
  async fetchPeers() {
    try {
      const response = await fetch(`${cfg.API_URL}/peers`)
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const peers = await response.json()

      return peers
    } catch (error) {
      console.error('[REST] Error fetching peers:', error)
    }
  },
  async queryContract({}, { abi, address, name, args }) {
    try {
      const response = await fetch(`${cfg.API_URL}/queryContract`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ abi, address, name, args }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const queryContract = await response.json()

      return queryContract
    } catch (error) {
      console.error('[REST] Error fetching query contract:', error)
    }
  },
  async queryContractState({}, { abi, address, stateNames }) {
    try {
      const response = await fetch(`${cfg.API_URL}/queryContractState`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ abi, address, stateNames }),
      })
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }
      const queryContractState = await response.json()

      return queryContractState
    } catch (error) {
      console.error('[REST] Error fetching query contract state:', error)
    }
  },
  // async getEvents({}, filter) {
  //   return await aergo.getEvents(filter)
  // },
  // async getTokenBalance({}, { token, address }) {
  //   const contract = Contract.fromAbi(TokenABI).setAddress(token)
  //   const result = await aergo.queryContract(contract['balanceOf'](address))
  //   return result._bignum
  // },
  getActiveAccount({ commit, state }) {
    if (state.activeAccount) {
      return new Promise((resolve) => {
        resolve(state.activeAccount)
      })
    }
    return new Promise((resolve, reject) => {
      window.addEventListener(
        'AERGO_ACTIVE_ACCOUNT',
        function (event) {
          const detail = event.detail
          if (state?.chainInfo?.chainid?.magic !== detail?.account?.chainId) {
            if (detail.error) {
              commit('setActiveAccount', detail)
              return resolve(detail)
            } else {
              delete detail.account
              detail.error = 'Network does not match with Aergo Connect 3.0'
              commit('setActiveAccount', detail)
              return resolve(detail)
            }
          } else {
            commit('setActiveAccount', detail.account)
            resolve(detail.account)
          }
        },
        { once: true }
      )
      window.postMessage(
        {
          type: 'AERGO_REQUEST',
          action: 'ACTIVE_ACCOUNT',
        },
        '*'
      )
    })
  },
  refreshActiveAccount({ commit }) {
    commit('setActiveAccount', null)
    return this.dispatch('blockchain/getActiveAccount')
  },
  disconnectAccount({ commit }) {
    commit('setActiveAccount', null)
  },
  disconnectStream({ commit, state }) {
    if (state.ws) {
      console.log('[WebSocket] Closing connection')
      state.ws.close()
      commit('setWebSocket', null)
      commit('setStreamState', 'ended')
      commit('setConnected', false)
    }
  },
}

const mutations = {
  setWebSocket(state, ws) {
    state.ws = ws // WebSocket 객체 저장
  },
  setStreamState(state, streamState) {
    state.streamState = streamState // 스트림 상태 업데이트
  },
  setConnected(state, isConnected) {
    state.streamConnected = isConnected // WebSocket 연결 상태 업데이트
  },
  addBlock(state, block) {
    if (state.recentBlocks.some((b) => b.hash === block.hash)) {
      console.log('Duplicate block skipped:', block.hash)
      return
    }

    if (block.header.blockno <= previousBlockNumber) {
      block.detectedReorg = true
    }

    state.recentBlocks.push(block)
    previousBlockNumber = block.header.blockno

    // Add block txs
    /*
      if (block.body.txsList.length) {
            block.body.txsList.forEach(tx => tx.block = block);
            state.recentTransactions.push(...block.body.txsList);
            while (state.recentTransactions.length > HISTORY_MAX_TRANSACTIONS) state.recentTransactions.shift();
      }
    */

    // Limit memory usage
    while (state.recentBlocks.length > HISTORY_MAX_BLOCKS) {
      state.recentBlocks.shift()
    }
  },
  setBlockDetail(state, { block }) {
    state.blocksByHash[block.hash] = block
  },
  setTxDetail(state, { tx }) {
    state.txByHash[tx.hash] = tx
  },
  setAccountDetail(state, { address, account }) {
    state.accountsByAddress[address] = account
  },
  setChainInfo(state, chainInfo) {
    state.chainInfo = chainInfo
  },
  setActiveAccount(state, account) {
    state.activeAccount = account
  },
}

export default {
  namespaced: true,
  state,
  getters,
  actions,
  mutations,
}
