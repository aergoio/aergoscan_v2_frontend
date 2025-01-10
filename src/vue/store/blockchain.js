import aergo from '../../controller'
import { Contract } from '@herajs/client'
import { waitOrLoad } from 'timed-async'

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
  streamBlocks({ commit, state }) {
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
    const ws = new WebSocket('ws://localhost:3000/v3/streamBlock')

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

    ws.onerror = (error) => {
      console.error('[WebSocket] Error:', error)
      commit('setStreamState', 'error') // 에러 상태 설정
      commit('setConnected', false)

      // 일정 시간 후 연결 재시작
      setTimeout(() => {
        console.log('[WebSocket] Restarting streamBlocks due to error')
        dispatch('streamBlocks')
      }, 5000) // 5초 후 재시작
    }

    ws.onclose = () => {
      console.log('[WebSocket] Disconnected')
      commit('setStreamState', 'ended') // 스트림 종료 상태 설정
      commit('setConnected', false)

      // 일정 시간 후 연결 재시작
      setTimeout(() => {
        console.log('[WebSocket] Restarting streamBlocks due to disconnection')
        dispatch('streamBlocks')
      }, 5000) // 5초 후 재시작
    }

    // WebSocket 객체를 상태에 저장
    commit('setWebSocket', ws)
  },
  restartStreamBlocks({ dispatch, state }) {
    if (state.ws) {
      console.log('[WebSocket] Restarting streamBlocks...')
      state.ws.close() // 기존 연결 닫기
    }

    // 새로운 스트림 시작
    dispatch('streamBlocks')
  },
  async updateChainInfo({ commit }) {
    const info = Object.freeze(await aergo.getChainInfo())
    commit('setChainInfo', info)
  },
  async getBestBlock() {
    return await aergo.blockchain()
  },
  async getConsensusInfo() {
    return await aergo.getConsensusInfo()
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
    const block = Object.freeze(await aergo.getBlock(blockNoOrHash))
    commit('setBlockDetail', { block })
    return block
  },
  async fetchBlockMetadata({}, { blockNoOrHash }) {
    return Object.freeze(await aergo.getBlockMetadata(blockNoOrHash))
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
      return await aergo.getTransactionReceipt(hash)
    } catch (e) {
      return null
    }
  },
  getAccountVotes({ dispatch }, { address }) {
    return dispatch('fetchGetAccountVotes', { address })
  },
  async fetchGetAccountVotes({}, { address }) {
    try {
      return await aergo.getAccountVotes(address)
    } catch (e) {
      return null
    }
  },
  async getAccount({ dispatch, state }, { address }) {
    if (state.accountsByAddress[address]) {
      return state.accountsByAddress[address]
    }
    return await dispatch('fetchAccount', { address })
  },
  async fetchAccount({ commit }, { address }) {
    const account = await aergo.getState(address)
    commit('setAccountDetail', { address, account })
    return account
  },
  async getTopVotes({}, { count }) {
    return await aergo.getTopVotes(count)
  },
  async getStaking({ dispatch }, { address }) {
    return await dispatch('fetchStaking', { address })
  },
  async fetchStaking({}, { address }) {
    const staking = await aergo.getStaking(address)
    return staking
  },
  async getNodeState({}, component) {
    return aergo.getNodeState(component)
  },
  async getServerInfo() {
    return aergo.getServerInfo()
  },
  getNameInfo({ dispatch }, { name }) {
    return dispatch('fetchNameInfo', { name })
  },
  async fetchNameInfo({}, { name }) {
    return await aergo.getNameInfo(name)
  },
  getABI({ dispatch }, { address }) {
    return dispatch('fetchABI', { address })
  },
  async fetchABI({ commit }, { address }) {
    const abi = await aergo.getABI(address)
    return abi
  },
  async fetchPeers() {
    const peers = await aergo.getPeers()
    return peers
  },
  async queryContract({}, { abi, address, name, args }) {
    const contract = Contract.fromAbi(abi).setAddress(address)
    return await aergo.queryContract(contract[name](...args))
  },
  async queryContractState({}, { abi, address, stateNames }) {
    const contract = Contract.fromAbi(abi).setAddress(address)
    return await aergo.queryContractState(contract.queryState(...stateNames))
  },
  async getEvents({}, filter) {
    return await aergo.getEvents(filter)
  },
  async getTokenBalance({}, { token, address }) {
    const contract = Contract.fromAbi(TokenABI).setAddress(token)
    const result = await aergo.queryContract(contract['balanceOf'](address))
    return result._bignum
  },
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

    state.recentBlocks.push(block)

    // 블록 개수 제한
    while (state.recentBlocks.length > HISTORY_MAX_BLOCKS) {
      state.recentBlocks.shift()
    }
  },
  // addBlock(state, block) {
  //   // Ensure no duplicate keys
  //   if (state.recentBlocks.filter((b) => block.hash === b.hash).length) {
  //     console.log('Skip adding duplicate block', block.hash)
  //     return
  //   }

  //   if (block.header.blockno <= previousBlockNumber) {
  //     block.detectedReorg = true
  //   }

  //   // Add block
  //   state.recentBlocks.push(block)
  //   previousBlockNumber = block.header.blockno

  //   // Add block txs
  //   /*
  //       if (block.body.txsList.length) {
  //           block.body.txsList.forEach(tx => tx.block = block);
  //           state.recentTransactions.push(...block.body.txsList);
  //           while (state.recentTransactions.length > HISTORY_MAX_TRANSACTIONS) state.recentTransactions.shift();
  //       }
  //       */

  //   // Limit memory usage
  //   while (state.recentBlocks.length > HISTORY_MAX_BLOCKS)
  //     state.recentBlocks.shift()
  // },
  setBlockDetail(state, { block }) {
    state.blocksByHash[block.hash] = block
  },
  setTxDetail(state, { tx }) {
    state.txByHash[tx.hash] = tx
  },
  setAccountDetail(state, { address, account }) {
    state.accountsByAddress[address] = account
  },
  // setProvider(state, { provider }) {
  //   state.provider = provider
  // },
  // setConnected(state, isConnected) {
  //   state.streamConnected = isConnected
  // },
  // setStreamState(state, streamState) {
  //   state.streamState = streamState
  // },
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
