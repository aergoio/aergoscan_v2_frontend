<template>
  <div class="wrap">
    <div id="category" class="account">
      <Header />
      <div class="category-inner">
        <qrcode-modal
          :address="realAddress"
          @onClose="onCloseQrcode"
          v-if="isShowQRcode"
        />
        <div class="page-wrap">
          <div class="page-content">
            <search />
            <div class="title">{{ title }}</div>
            <div class="detail-box account">
              <div class="address">
                <div class="item">
                  <span class="item-inner">
                    <Identicon
                      :text="realAddress"
                      size="17"
                      class="mini-identicon"
                    />
                    {{ $route.params.address }}
                  </span>
                  <copy-link-button :message="realAddress" />
                  <qrcode-button
                    :address="realAddress"
                    @onQrcode="onShowQrcode"
                    v-if="!isName"
                  />
                </div>
              </div>
              <div class="table-wrap">
                <div class="error account show" v-if="error">
                  {{ error }}
                </div>
                <table class="account" v-else>
                  <tbody v-if="accountDetail">
                    <!--                  <tr class="hidden loading">-->
                    <!--                    <td colspan="100%">Loading...</td>-->
                    <!--                  </tr>-->
                    <!--                  <tr class="hidden not-found">-->
                    <!--                    <td colspan="100%">No items found</td>-->
                    <!--                  </tr>-->
                    <tr v-if="destinationAddress">
                      <th>
                        <div>Alias for</div>
                      </th>
                      <td>
                        <div>
                          <router-link
                            :to="`/account/${destinationAddress}/`"
                            class="alias-account"
                          >
                            <Identicon
                              :text="destinationAddress"
                              size="17"
                              class="mini-identicon"
                            />
                            {{ destinationAddress }}
                          </router-link>
                          <CopyLinkButton :message="destinationAddress" />
                        </div>
                      </td>
                    </tr>
                    <tr
                      v-if="ownerAddress && ownerAddress != destinationAddress"
                    >
                      <th>
                        <div>Name owned by</div>
                      </th>
                      <td>
                        <div>
                          <router-link
                            :to="`/account/${ownerAddress}/`"
                            class="owned-account"
                          >
                            <Identicon
                              :text="ownerAddress"
                              size="17"
                              class="mini-identicon"
                            />
                            {{ ownerAddress }}
                          </router-link>
                          <CopyLinkButton :message="ownerAddress" />
                        </div>
                      </td>
                    </tr>

                    <tr>
                      <th>
                        <div>Balance</div>
                      </th>
                      <td>
                        <div>
                          <div
                            v-html="
                              $options.filters.formatToken(fullBalance, 'aergo')
                            "
                          ></div>
                          <span>{{ ` (${getUsdPriceByAergo} $)` }}</span>
                        </div>
                      </td>
                    </tr>
                    <tr v-if="staking">
                      <th>
                        <div>Staked amount</div>
                      </th>
                      <td>
                        <div
                          v-html="
                            $options.filters.formatToken(
                              staking.amount,
                              'aergo'
                            )
                          "
                        ></div>
                      </td>
                    </tr>
                    <tr v-if="staking">
                      <th>
                        <div>Unstaked amount</div>
                      </th>
                      <td>
                        <div
                          v-html="
                            $options.filters.formatToken(
                              unstakedBalance,
                              'aergo'
                            )
                          "
                        ></div>
                      </td>
                    </tr>
                    <!--                  <tr v-if="staking && staking.when">-->
                    <!--                    <th>-->
                    <!--                      <div>- Last action</div>-->
                    <!--                    </th>-->
                    <!--                    <td>-->
                    <!--                      <div>-->
                    <!--                        <router-link style="text-decoration: underline" :to="`/block/${staking.when}/`">-->
                    <!--                          {{ staking.when }}-->
                    <!--                        </router-link>-->
                    <!--                        (since block)-->
                    <!--                      </div>-->
                    <!--                    </td>-->
                    <!--                  </tr>-->
                    <tr v-if="staking && staking.when">
                      <th>
                        <div>Voting power</div>
                      </th>
                      <td>
                        <div>
                          {{ votingPower }}
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div>Nonce</div>
                      </th>
                      <td>
                        <div>{{ accountDetail.nonce }}</div>
                      </td>
                    </tr>
                    <tr
                      v-for="item in getContractTx"
                      v-if="getIsContractAccount"
                    >
                      <th>
                        <div>Contract Creator</div>
                      </th>
                      <td>
                        <!--                      <div v-if="item.creator">-->
                        <!--                        <router-link class="creator-block" :to="`/account/${item.creator}/`">-->
                        <!--                          <Identicon :text="item.creator" size="17" class="mini-identicon"/>-->
                        <!--                          {{ item.creator }}-->
                        <!--                        </router-link>-->
                        <!--                      </div>-->
                        <!--                      at Tx-->
                        <!--                      <div v-if="item.txId">-->
                        <!--                        <router-link class="tx-block" :to="`/transaction/${item.txId}/`">-->
                        <!--                          {{ item.txId }}-->
                        <!--                        </router-link>-->
                        <!--                      </div>-->
                        <div class="from-to">
                          <router-link
                            class="address contract-creator"
                            :to="`/account/${item.creator}/`"
                            v-if="item.creator"
                          >
                            <Identicon
                              :text="item.creator"
                              size="18"
                              class="mini-identicon"
                            />
                            {{ item.creator }}
                          </router-link>
                          <img
                            src="~@assets/img/ic-arrow-black@3x.png"
                            class="arrow"
                          />
                          <router-link
                            class="address contract-creator"
                            v-if="item.txId"
                            :to="`/transaction/${item.txId}/`"
                          >
                            {{ item.txId }}
                          </router-link>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="table-wrap" v-if="!error">
              <div class="table-tab">
                <div class="table-tab-header">
                  <div class="h-scroll">
                    <div class="tab-header">
                      <router-link
                        class="title transactions router-link-exact-active"
                        :to="{ query: { ...$route.query, tx: 'transactions' } }"
                        replace
                        v-if="!$route.query.tx"
                      >
                        <span class="main">Transactions</span
                        ><span class="sub">{{ transactionTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title token-transfers"
                        :to="{ query: { ...$route.query, tx: 'transactions' } }"
                        replace
                        v-else
                      >
                        <span class="main">Transactions</span
                        ><span class="sub">{{ transactionTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title token-transfers"
                        :to="{
                          query: { ...$route.query, tx: 'tokenTransfer' },
                        }"
                        replace
                      >
                        <span class="main">Token Transfers</span
                        ><span class="sub">{{ tokenTransferTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title nft-transfers"
                        :to="{ query: { ...$route.query, tx: 'nftTransfer' } }"
                        replace
                      >
                        <span class="main">NFT Transfers</span
                        ><span class="sub">{{ nftTransferTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title token-balance"
                        :to="{ query: { ...$route.query, tx: 'tokenBalance' } }"
                        replace
                      >
                        <span class="main">Token Balance</span
                        ><span class="sub">{{ tokenBalanceTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title nft-inventory"
                        :to="{ query: { ...$route.query, tx: 'nftInventory' } }"
                        replace
                      >
                        <span class="main">NFT Inventory</span
                        ><span class="sub">{{ nftInventoryTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title registered-names"
                        :to="{
                          query: { ...$route.query, tx: 'registeredNames' },
                        }"
                        replace
                        v-if="namesCurrent.length"
                      >
                        <span class="main">Registered Names</span
                        ><span class="sub">{{ namesCurrent.length }}</span>
                      </router-link>
                      <router-link
                        class="title name-history"
                        :to="{ query: { ...$route.query, tx: 'nameHistory' } }"
                        replace
                        v-if="nameHistory.length"
                      >
                        <span class="main">Name History</span
                        ><span class="sub">{{ nameHistory.length }}</span>
                      </router-link>
                    </div>
                  </div>
                </div>
                <div class="table-tab-content" v-if="realAddress">
                  <account-transaction-table
                    ref="accountTransactionTable"
                    :address="realAddress"
                    :active="
                      !$route.query.tx || $route.query.tx === 'transactions'
                    "
                    @onUpdateTotalCount="updateTransactionTotalCount"
                  />
                  <account-token-transfer-table
                    ref="accountTokenTransferTable"
                    :address="realAddress"
                    :filteredTokens="filteredTokens"
                    :active="$route.query.tx === 'tokenTransfer'"
                    @onUpdateTotalCount="updateTokenTransactionTotalCount"
                  />
                  <account-nft-transfer-table
                    ref="accountNftTransferTable"
                    :address="realAddress"
                    :filteredNfts="filteredNfts"
                    :active="$route.query.tx === 'nftTransfer'"
                    @onUpdateTotalCount="updateNftTransferTotalCount"
                  />
                  <account-token-balance-table
                    ref="accountTokenBalanceTable"
                    :address="realAddress"
                    :active="$route.query.tx === 'tokenBalance'"
                    @onUpdateTotalCount="updateTokenBalanceTotalCount"
                  />
                  <account-nft-inventory-table
                    ref="accountNftInventoryTable"
                    :address="realAddress"
                    :active="$route.query.tx === 'nftInventory'"
                    @onUpdateTotalCount="updateNftInventoryTotalCount"
                  />
                  <account-registered-names-table
                    ref="accountRegisteredNamesTable"
                    :address="realAddress"
                    :active="$route.query.tx === 'registeredNames'"
                    :nameCurrent="namesCurrent"
                    v-if="namesCurrent.length"
                  />
                  <account-name-history-table
                    ref="accountNameHistoryTable"
                    :address="realAddress"
                    :active="$route.query.tx === 'nameHistory'"
                    :nameHistory="nameHistory"
                    v-if="nameHistory.length"
                  />
                </div>
              </div>
            </div>
            <div
              class="detail-box contract"
              v-if="!error && accountDetail && accountDetail.codehash"
            >
              <div class="title">Contract Details</div>
              <div class="tabs-wrap">
                <contract-abi
                  :abi="contractAbi"
                  :codehash="accountDetail.codehash"
                  :address="realAddress"
                  :callContractHash="callContractHash"
                  @onUpdateResultHash="onUpdateResultHash"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

<script>
import { loadAndWait } from '@/src/vue/utils/async'
import { Address } from '@herajs/client'
import JSBI from 'jsbi'
import { Amount } from '@herajs/client'
import Identicon from '@/src/vue/components/Identicon'
import { toFix } from '@/src/utils/utility'
import { formatDistance } from 'date-fns'
import cfg from '@/src/config'
import Search from '@/src/vue/components/Search'
import ContractAbi from '@/src/vue/components/ContractAbi'
import AccountTransactionTable from '@/src/vue/components/AccountTransactionTable'
import AccountTokenTransferTable from '@/src/vue/components/AccountTokenTransferTable'
import AccountNftTransferTable from '@/src/vue/components/AccountNftTransferTable'
import AccountTokenBalanceTable from '@/src/vue/components/AccountTokenBalanceTable'
import AccountNftInventoryTable from '@/src/vue/components/AccountNftInventoryTable'
import AccountRegisteredNamesTable from '@/src/vue/components/AccountRegisteredNamesTable'
import AccountNameHistoryTable from '@/src/vue/components/AccountNameHistoryTable'

export default {
  data() {
    return {
      isLoadingDetail: false,
      error: null,
      contractAbi: null,
      transactions: [],
      accountDetail: null,
      staking: null,
      voteHistory: null,
      ownerAddress: null,
      destinationAddress: null,
      accountNextActionTime: null,
      transactionTotalItems: 0,
      tokenTransferTotalItems: 0,
      nftTransferTotalItems: 0,
      tokenBalanceTotalItems: 0,
      nftInventoryTotalItems: 0,
      tokens: [],
      nfts: [],
      contractTx: [],
      isShowQRcode: false,
      isName: false,
      names: [],
      nameHistory: [],
      tokenPrice: [],
      callContractHash: '',
    }
  },
  created() {},
  beforeDestroy() {},
  watch: {
    $route(to, from) {
      if (to.path !== from.path) {
        this.load()
      }
    },
    realAddress() {
      this.reloadAllTable(this.realAddress)
        .then
        // ()=> this.load(true)
        ()
        .catch((e) => {
          console.log(e)
        })
    },
    async callContractHash() {
      const wait = loadAndWait()
      await wait()
      setTimeout(async () => {
        try {
          await this.reloadAllTable(this.realAddress)
        } catch (e) {
          console.log(e)
        }
      }, 3000)
    },
  },
  mounted() {
    this.load()
  },
  computed: {
    totalVotingPower() {
      try {
        return this.voteHistory
          .getVotingList()
          .map((vote) => new Amount(vote.getAmount(), 'aer'))
          .reduce((a, b) => a.add(b), new Amount(0))
      } catch (e) {
        return new Amount(0)
      }
    },
    maximumVotingPower() {
      // staked balance  * 5
      if (!this.staking) return new Amount(0)

      return this.staking.amount.mul(5).toUnit('aergo')
    },
    nextActionAvailableTime() {
      if (!this.staking) return ''

      if (this.staking && this.staking.when) {
        if (this.nextActionAvailable) {
          return 'now'
        } else {
          return `${this.nextActionRelativeString}`
        }
      }
    },
    votingPower() {
      return `[  ${this.totalVotingPower}  /  ${this.maximumVotingPower}  ] ${this.nextActionAvailableTime}`
    },
    nextActionAvailable() {
      return (
        this.accountNextActionTime && this.accountNextActionTime < new Date()
      )
    },
    nextActionRelativeString() {
      if (!this.accountNextActionTime) {
        return ''
      }
      return `,   ( next voting time in ${formatDistance(
        new Date(),
        this.accountNextActionTime
      )})`
    },
    realAddress() {
      // todo: 추후 해당케이스 시나리오 조건 수정및 고려해야함.
      return this.destinationAddress || this.$route.params.address
    },
    filteredTokens() {
      return this.tokens
    },
    filteredNfts() {
      return this.nfts
    },
    fullBalance() {
      if (!this.staking) {
        return this.accountDetail.balance
      }
      return new Amount(
        JSBI.add(
          this.accountDetail.balance.value,
          this.staking.amount.value
        ).toString(),
        'aer'
      )
    },
    unstakedBalance() {
      return this.accountDetail.balance
    },
    title() {
      if (this.isLoadingDetail) return '...'

      if (this.accountDetail && this.accountDetail.codehash) {
        return 'Contract Account'
      }

      return 'Account'
    },
    getIsContractAccount() {
      return this.accountDetail && this.accountDetail.codehash
    },
    getContractTx() {
      return this.contractTx
    },
    namesCurrent() {
      if (this.realAddress && this.names.length)
        return this.names.filter(
          (name) => name.currentAddress == this.realAddress
        )
      return []
    },
    getTokenPriceByUsd() {
      return this.tokenPrice?.filter((item) => item.name === 'aergo')[0]?.price
        ?.usd
    },
    getUsdPriceByAergo() {
      let balance = this.fullBalance?.toUnit('aergo')?.toString()?.split(' ')[0]
      let usdPrice = this.tokenPrice?.filter((item) => item.name === 'aergo')[0]
        ?.price?.usd
      return toFix(Number(usdPrice) * toFix(balance))
    },
  },
  methods: {
    query(newQuery) {
      return { ...this.$route.query, ...newQuery }
    },
    async load() {
      this.isLoadingDetail = true
      this.error = null
      this.ownerAddress = null
      this.destinationAddress = null
      this.staking = null
      this.voteHistory = null
      this.accountDetail = null
      this.contractAbi = null
      this.names = []
      this.nameHistory = []
      this.token = null
      this.accountTokens = []
      this.tokens = []
      this.nfts = []
      this.contractTx = []
      this.isName = false
      this.showTokenBalances = false
      this.tokenPrice = []
      this.accountNextActionTime = null

      // Check address
      let address
      try {
        address = new Address(this.$route.params.address)
        this.isName = address.isName
      } catch (e) {
        this.error = 'Invalid address'
        console.error(e)
        return
      }

      // Owner
      try {
        if (address.isName && !address.isSystemAddress()) {
          const nameInfo = await this.$store.dispatch(
            'blockchain/getNameInfo',
            { name: address.encoded }
          )
          this.ownerAddress = nameInfo.owner.toString()
          this.destinationAddress = nameInfo.destination.toString()
          address = this.destinationAddress
        }
      } catch (e) {
        this.error = 'Unregistered name'
        console.error(e)
        this.isLoadingDetail = false
        return
      }

      this.address = address

      if (address.length === 0) {
        console.log('Account not found')
        this.isLoadingDetail = false
        return
      }

      // State
      try {
        this.accountDetail = Object.freeze(
          await this.$store.dispatch('blockchain/getAccount', { address })
        )
      } catch (e) {
        this.error = 'Account not found'
        console.error(e)
        this.isLoadingDetail = false
        return
      }

      // Staking
      ;(async () => {
        try {
          const staking = await this.$store.dispatch('blockchain/getStaking', {
            address,
          })
          this.staking = Object.freeze(staking)
          if (this.staking && this.staking.when) {
            await this.$store
              .dispatch('blockchain/getBlock', {
                blockNoOrHash: this.staking.when,
              })
              .then((block) => {
                this.accountNextActionTime = new Date(
                  block.header.timestamp / 1000000 + 60 * 60 * 24 * 1000
                )
              })
          }
        } catch (e) {
          console.error(e)
          this.isLoadingDetail = false
        }
      })()

      // VoteHistory
      ;(async () => {
        try {
          const voteHistory = await this.$store.dispatch(
            'blockchain/getAccountVotes',
            { address }
          )
          this.voteHistory = Object.freeze(voteHistory)
        } catch (e) {
          console.error(e)
          this.isLoadingDetail = false
        }
      })()

      // Assigned tokens, nfts
      ;(async () => {
        try {
          const response = await this.$fetch.get(
            `${cfg.API_URL}/existedTxTokenList`,
            {
              q: `(from:${address} OR to:${address})`,
            }
          )
          const data = await response.json()
          if (data.hits.length > 0) {
            data.hits
              .filter((it) => it.token.meta.type === 'ARC1')
              .map((item) => {
                this.tokens.push({
                  text: `${item.token.meta.name}(${item.token.meta.symbol})`,
                  value: item.token.hash,
                })
              })
            data.hits
              .filter((it) => it.token.meta.type === 'ARC2')
              .map((item) => {
                this.nfts.push({
                  text: `${item.token.meta.name}(${item.token.meta.symbol})`,
                  value: item.token.hash,
                })
              })
          }
        } catch (e) {
          console.error(e)
          this.isLoadingDetail = false
        }
      })()

      // Contract Tx
      ;(async () => {
        try {
          const response = await this.$fetch.get(`${cfg.API_URL}/contractTx`, {
            q: `_id:${address}`,
          })
          const data = await response.json()
          if (data.hits.length > 0) {
            data.hits.map((item) => {
              this.contractTx.push({
                txId: item.meta.tx_id,
                creator: item.meta.creator,
                blockNo: item.meta.blockno,
                ts: item.meta.ts,
              })
            })
          }
        } catch (e) {
          console.error(e)
          this.isLoadingDetail = false
        }
      })()

      // Assigned names
      ;(async () => {
        try {
          if (!address.isName) {
            const response = await this.$fetch.get(`${cfg.API_URL}/names`, {
              q: `address:${address}`,
              size: 10,
            })
            const data = await response.json()
            const names = data.hits
            for (let name of names) {
              const response = await this.$fetch.get(`${cfg.API_URL}/names`, {
                q: `name:${name.name}`,
                size: 1,
              })
              const data = await response.json()
              name.currentAddress = data.hits[0].address
            }
            this.names = names
          }
        } catch (e) {
          console.error(e)
        }
      })()

      // Name history
      if (this.isName) {
        ;(async () => {
          try {
            const response = await this.$fetch.get(`${cfg.API_URL}/names`, {
              q: `name:${this.$route.params.address}`,
              size: 10,
              sort: 'blockno:asc',
            })
            const data = await response.json()
            this.nameHistory = data.hits
          } catch (e) {
            console.error(e)
          }
        })()
      }

      // Account price
      ;(async () => {
        try {
          const response = await this.$fetch.get(`${cfg.API_URL}/tokensPrice`)
          const data = await response.json()
          this.tokenPrice = data
        } catch (e) {
          console.error(e)
        }
      })()

      this.isLoadingDetail = false

      const loadTokenMetadata = async () => {
        try {
          const response = await (
            await this.$fetch.get(`${cfg.API_URL}/tokenVerified`, {
              q: `_id:${this.$route.params.address}`,
            })
          ).json()
          if (response.hits.length) {
            this.token = response.hits[0].meta
          }
        } catch (e) {
          console.error(e)
        }
      }

      // Contract and token info
      try {
        if (this.accountDetail.codehash) {
          Promise.all([
            this.$store
              .dispatch('blockchain/getABI', { address })
              .then((abi) => {
                this.contractAbi = abi
              }),
            loadTokenMetadata(),
          ]).then(async () => {
            // Get updated supply
            if (this.contractAbi && this.token) {
              const supply = await this.$store.dispatch(
                'blockchain/queryContract',
                {
                  abi: this.contractAbi,
                  name: 'totalSupply',
                  address,
                  args: [],
                }
              )
              if (supply && supply._bignum) {
                this.token.supply = supply._bignum
              }
            }
          })
        }
      } catch (e) {
        console.error(e)
      }
    },
    async reloadAllTable(address) {
      if (this.$refs.accountTransactionTable) {
        await this.$refs.accountTransactionTable.reload(address)
      }
      if (this.$refs.accountTokenTransferTable) {
        await this.$refs.accountTokenTransferTable.reload(address)
      }
      if (this.$refs.accountNftTransferTable) {
        await this.$refs.accountNftTransferTable.reload(address)
      }
      if (this.$refs.accountTokenBalanceTable) {
        await this.$refs.accountTokenBalanceTable.reload(address)
      }
      if (this.$refs.accountNftInventoryTable) {
        await this.$refs.accountNftInventoryTable.reload(address)
      }
    },
    updateTransactionTotalCount(count) {
      this.transactionTotalItems = count
    },
    updateTokenTransactionTotalCount(count) {
      this.tokenTransferTotalItems = count
    },
    updateNftTransferTotalCount(count) {
      this.nftTransferTotalItems = count
    },
    updateTokenBalanceTotalCount(count) {
      this.tokenBalanceTotalItems = count
    },
    updateNftInventoryTotalCount(count) {
      this.nftInventoryTotalItems = count
    },
    onShowQrcode() {
      this.isShowQRcode = true
    },
    onCloseQrcode() {
      this.isShowQRcode = false
    },
    onUpdateResultHash(callContractHash) {
      this.callContractHash = callContractHash
    },
  },
  components: {
    Identicon,
    Search,
    ContractAbi,
    AccountTransactionTable,
    AccountTokenTransferTable,
    AccountNftTransferTable,
    AccountTokenBalanceTable,
    AccountNftInventoryTable,
    AccountNameHistoryTable,
    AccountRegisteredNamesTable,
  },
}
</script>

<style lang="scss" scoped>
.category-inner {
  > .page-wrap {
    padding-bottom: 30px;

    @media screen and (max-width: 900px) {
      padding-top: 20px;
    }
  }
}

.page-content > .table-wrap {
  padding-bottom: 50px;
}

.detail-box {
  margin: 15px 0;
  border-radius: 5px;
  box-shadow: 2px 2px 7px 0 rgba(224, 224, 224, 0.5);
  background-color: #fff;

  &.account {
    .table-wrap {
      display: flex;
      align-items: start;
      margin: 0;

      @media screen and (max-width: 1180px) {
        flex-wrap: wrap;
      }

      @media screen and (max-width: 480px) {
        padding: 0 20px;
      }
    }

    .address > .item {
      display: flex;
      align-content: center;
    }
  }

  &.contract {
    @media screen and (max-width: 480px) {
      margin: 20px -20px 0;
    }

    .tabs-wrap {
      padding: 20px;
    }
  }

  > .title {
    padding: 20px;
    font-size: 16px;
    font-weight: bold;
    color: #1a1823;
    border-bottom: 1px solid #f2f2f2;

    @media screen and (max-width: 480px) {
      font-size: 18px;
    }
  }

  .table-wrap {
    padding: 10px 20px;
    box-shadow: none;
  }

  .address {
    padding: 20px;
    border-bottom: 1px solid #f2f2f2;

    &.contract-creator {
      padding: 3px 4px;
    }

    .title {
      margin-bottom: 10px;
      font-size: 14px;
      font-weight: bold;
      color: #1a1823;
    }

    .item {
      display: flex;
      align-items: center;

      .item-inner {
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;

        padding: 15px;
        border-radius: 5px;
        font-size: 14px;
        color: #fff;
        word-break: break-all;
        background-color: #363344;

        .identicon {
          display: inline-block;
          width: 18px;
          height: 18px;
          flex: 18px 0 0;
          margin-right: 6px;
          vertical-align: middle;
        }
      }
    }

    .arrow.down {
      max-width: 435px;
      margin: 7px 0;
      font-size: 0;
      text-align: center;

      @media screen and (max-width: 480px) {
        width: calc(100% - 35px);
      }

      img {
        width: 16px;
      }
    }
  }

  table.account {
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0 20px;

    @media screen and (max-width: 480px) {
      border-spacing: 0 25px;
    }

    /* tr:hover {
      background: initial;
    } */

    th {
      width: 136px;
      height: auto;
      font-size: 14px;
      color: #a391aa;
      border-bottom: none;
      vertical-align: top;

      @media screen and (max-width: 480px) {
        width: 120px;
        font-size: 15px;
      }
    }

    td {
      height: auto;
      font-size: 14px;
      border-bottom: none;
      vertical-align: top;
      word-break: break-all;

      @media screen and (max-width: 480px) {
        font-size: 15px;
      }

      .identicon {
        display: inline-block;
        width: 18px;
        height: 18px;
        flex: 18px 0 0;
        margin-top: -3px;
        margin-right: 5px;
        vertical-align: middle;
      }

      .alias-account,
      .owned-account {
        font-size: 13px;
        word-break: break-all;

        &:hover {
          font-weight: 500;
          text-shadow: 0px 0px 0px #3c3b3e;
          color: #3c3b3e;
        }
      }

      .from-to {
        display: flex;
        align-items: center;
        width: 100%;

        @media screen and (max-width: 1180px) {
          display: block;
          text-align: center;
        }

        .address {
          font-size: 11px;
          line-height: 1.2;

          @media screen and (max-width: 1180px) {
            display: block;
          }

          &:hover {
            text-decoration: none;
          }
        }

        img.arrow {
          margin: 0 5px;

          @media screen and (max-width: 1180px) {
            display: block;
            margin: 6px auto;
            transform: rotate(90deg);
          }
        }

        .txt-ellipsis {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        }
      }
    }
  }
}
</style>
