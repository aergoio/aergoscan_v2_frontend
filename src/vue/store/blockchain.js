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
    if (blockHeaderStream !== null) {
      return
    }
    console.log('Starting block stream')
    if (state.streamState !== 'starting-slow') {
      commit('setStreamState', 'starting')
    }
    const loadingFinished = waitOrLoad(() => {
      commit('setStreamState', 'starting-slow')
    }, 3500)
    blockHeaderStream = aergo.getBlockMetadataStream()
    blockHeaderStream
      .on('data', (blockHeader) => {
        commit('addBlock', blockHeader)
        if (!state.streamConnected) {
          commit('setConnected', true)
          commit('setStreamState', 'started')
          loadingFinished()
        }
      })
      .on('end', () => {
        console.log('Block stream ended, trying to reconnect in 5 seconds...')
        if (state.streamConnected) {
          commit('setConnected', false)
          commit('setStreamState', 'ended')
        }
        setTimeout(() => {
          dispatch('restartStreamBlocks')
        }, 5000)
      })
  },
  restartStreamBlocks({ dispatch }) {
    blockHeaderStream.cancel()
    blockHeaderStream = null
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
  setProvider({ dispatch, commit }, { provider }) {
    aergo.setProvider(provider)
    dispatch('restartStreamBlocks') // Restart stream with new provider
    commit('setProvider', { provider })
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
}

const mutations = {
  addBlock(state, block) {
    // Ensure no duplicate keys
    if (state.recentBlocks.filter((b) => block.hash === b.hash).length) {
      console.log('Skip adding duplicate block', block.hash)
      return
    }

    if (block.header.blockno <= previousBlockNumber) {
      block.detectedReorg = true
    }

    // Add block
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
    while (state.recentBlocks.length > HISTORY_MAX_BLOCKS)
      state.recentBlocks.shift()
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
  setProvider(state, { provider }) {
    state.provider = provider
  },
  setConnected(state, isConnected) {
    state.streamConnected = isConnected
  },
  setStreamState(state, streamState) {
    state.streamState = streamState
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
