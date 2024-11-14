<template>
  <div class="wrap">
    <div id="category" class="transaction-details">
      <Header />
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search />
            <div class="title">
              Transaction Details
              <div class="address" v-if="txMeta">
                {{ $route.params.hash }}
              </div>
              <copy-link-button :message="$route.params.hash" />
            </div>
            <div class="detail-box transaction" v-if="txMeta">
              <!-- <div class="h-scroll"> -->
              <div class="table-wrap">
                <div class="error show" v-if="error">
                  {{ error }}
                </div>
                <table
                  class="transaction-detail"
                  :class="!txMeta && !error && 'loading'"
                >
                  <tbody>
                    <tr class="hidden loading" v-if="!txMeta && !error">
                      <td colspan="100%">Loading...</td>
                    </tr>
                    <!--                  <tr class="hidden not-found">-->
                    <!--                    <td colspan="100%">No items found</td>-->
                    <!--                  </tr>-->
                    <template v-if="txMeta">
                      <tr>
                        <th>
                          <div>
                            From
                            <img
                              src="~@assets/img/ic-arrow-black@3x.png"
                              class="arrow"
                            />
                            To
                          </div>
                        </th>
                        <td>
                          <div>
                            <div class="from-to">
                              <router-link
                                class="address tooltipped tooltipped-s"
                                :to="`/account/${txMeta.from}/`"
                                :aria-label="txMeta.from"
                              >
                                {{
                                  $options.filters.formatEllipsisText(
                                    txMeta.from.toString(),
                                    30
                                  )
                                }}
                              </router-link>
                              <img
                                src="~@assets/img/ic-arrow-black@3x.png"
                                class="arrow"
                              />
                              <router-link
                                class="address tooltipped tooltipped-s"
                                :aria-label="txMeta.to"
                                v-if="txMeta.to && txMeta.to.toString().length"
                                :to="`/account/${txMeta.to}/`"
                              >
                                {{
                                  $options.filters.formatEllipsisText(
                                    txMeta.to.toString(),
                                    28
                                  )
                                }}
                              </router-link>
                              <a
                                href="javascript:;"
                                class="address"
                                v-if="
                                  !txMeta.to || !txMeta.to.toString().length
                                "
                                >{{
                                  txMeta.type === 7
                                    ? 'MULTICALL'
                                    : 'Contract Creation'
                                }}</a
                              >
                            </div>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Amount</div>
                        </th>
                        <td>
                          <div
                            v-html="
                              $options.filters.formatToken(
                                txMeta.amount,
                                'aergo'
                              )
                            "
                          ></div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Token transfers</div>
                        </th>
                        <td>
                          <div>{{ tokenTxTotalItems }}</div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>NFT transfers</div>
                        </th>
                        <td>
                          <div>{{ nftTxTotalItems }}</div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Fee</div>
                        </th>
                        <td>
                          <div>
                            <span
                              class="tpm"
                              v-html="
                                $options.filters.formatToken(txMeta.fee_used)
                              "
                              >{{ txMeta.gas_limit }}</span
                            >
                            <span
                              class="ml-5 tpm tooltipped tooltipped-n help"
                              aria-label="Fee was paid by contract"
                              v-if="txMeta.fee_delegation"
                              >[delegated]</span
                            >
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Gas used</div>
                        </th>
                        <td>
                          <div>
                            {{ txMeta ? txMeta.gas_used : '...' }} of
                            <span class="ml-5 tpm" v-if="txMeta.gas_limit">{{
                              txMeta.gas_limit
                            }}</span>
                            <span
                              class="ml-5 tpm tooltipped tooltipped-n help"
                              aria-label="Limit was set to 0, allowing unlimited gas use"
                              v-if="!txMeta.gas_limit"
                              >∞</span
                            >
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
                <div class="error transaction-detail show" v-if="error">
                  {{ error }}
                </div>
                <table
                  class="transaction-detail"
                  :class="!txMeta && !error && 'loading'"
                >
                  <tbody>
                    <tr class="hidden loading" v-if="!txMeta && !error">
                      <td colspan="100%">Loading...</td>
                    </tr>
                    <!--                  <tr class="hidden not-found">-->
                    <!--                    <td colspan="100%">No items found</td>-->
                    <!--                  </tr>-->
                    <template v-if="txMeta">
                      <tr>
                        <th>
                          <div>Nonce</div>
                        </th>
                        <td>
                          <div>{{ txMeta.nonce }}</div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Type</div>
                        </th>
                        <td>
                          <div>
                            {{ typeLabel }}
                          </div>
                        </td>
                      </tr>
                      <tr v-if="txMeta.payload">
                        <th>
                          <div>Payload</div>
                        </th>
                        <td>
                          <div>{{ txMeta.payload.length }} bytes</div>
                        </td>
                      </tr>
                      <tr v-if="!txMeta.block_id">
                        <th>
                          <div>Status</div>
                        </th>
                        <td>
                          <div>Pending</div>
                        </td>
                      </tr>
                      <tr v-if="txMeta.block_id">
                        <th>
                          <div>Status</div>
                        </th>
                        <td>
                          <div>Confirmed</div>
                        </td>
                      </tr>
                      <tr v-if="txMeta.block_id">
                        <th>
                          <div>Included in block</div>
                        </th>
                        <td>
                          <div
                            class="includedBlock"
                            :style="{ textWrap: 'wrap' }"
                          >
                            <router-link :to="`/block/${txMeta.block_id}/`">{{
                              txMeta.block_id
                            }}</router-link>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="txMeta.ts">
                        <th>
                          <div>Time stamp</div>
                        </th>
                        <td>
                          <div :style="{ textWrap: 'wrap' }">
                            {{
                              moment(txMeta.ts).format(
                                'dddd, MMMM Do YYYY, HH:mm:ss'
                              )
                            }}
                            ({{ moment(txMeta.ts).fromNow() }})
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
              <!-- </div> -->
            </div>
            <div class="table-wrap">
              <div class="table-tab">
                <div class="table-tab-header">
                  <div class="h-scroll">
                    <div class="tab-header">
                      <router-link
                        class="title token-transfers router-link-exact-active"
                        :to="{ query: { ...$route.query, tx: 'token' } }"
                        replace
                        v-if="!$route.query.tx"
                      >
                        <span class="main">Token Transfers</span
                        ><span class="sub">{{ tokenTxTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title token-transfers"
                        :to="{ query: { ...$route.query, tx: 'token' } }"
                        replace
                        v-else
                      >
                        <span class="main">Token Transfers</span
                        ><span class="sub">{{ tokenTxTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title nft-transfers"
                        :to="{ query: { ...$route.query, tx: 'nft' } }"
                        replace
                      >
                        <span class="main">NFT Transfers</span
                        ><span class="sub">{{ nftTxTotalItems }}</span>
                      </router-link>
                      <router-link
                        class="title internal-transactions"
                        :to="{
                          query: {
                            ...$route.query,
                            tx: 'internalTransactions',
                          },
                        }"
                        replace
                      >
                        <span class="main">Internal Transactions</span
                        ><span class="sub">{{
                          internalTransactionsTotalItems
                        }}</span>
                      </router-link>
                    </div>
                  </div>
                </div>
                <div class="table-tab-content" v-if="txMeta">
                  <transaction-token-table
                    ref="transactionTokenTable"
                    :hash="$route.params.hash"
                    :active="!$route.query.tx || $route.query.tx === 'token'"
                    @onUpdateTotalCount="updateTokenTxTotalCount"
                  />
                  <transaction-nft-table
                    ref="transactionNftTable"
                    :hash="$route.params.hash"
                    :active="$route.query.tx === 'nft'"
                    @onUpdateTotalCount="updateNftTxTotalCount"
                  />
                  <internal-transactions-table
                    ref="internalTransactionsTable"
                    :hash="$route.params.hash"
                    :active="$route.query.tx === 'internalTransactions'"
                    @onUpdateTotalCount="updateInternalTransactionsTotalCount"
                  />
                  <span
                    v-if="
                      internalData.length > 0 &&
                      $route.query.tx === 'internalTransactions'
                    "
                    :style="{
                      color: '#3c3b3e',
                      fontSize: '12px',
                      fontWeight: '600',
                    }"
                    >Internal Operations Tree View</span
                  >
                  <vue-json-pretty
                    v-if="
                      internalData.length > 0 &&
                      $route.query.tx === 'internalTransactions'
                    "
                    :theme="`dark`"
                    :data="internalData"
                    showIcon
                    showLine
                    :showDoubleQuotes="false"
                    showKeyValueSpace
                    collapsedOnClickBrackets
                    :deep="2"
                  />
                </div>
              </div>
            </div>
            <div class="detail-box execution" v-if="txMeta">
              <div class="title">Execution Details</div>
              <div class="address" v-if="isContract">
                <div class="title">Contract</div>
                <div class="item">
                  <span class="item-inner">
                    <router-link :to="`/account/${contract.hash}/`">
                      <Identicon
                        :text="contract.hash"
                        size="20"
                        class="tiny-identicon"
                      />
                      {{ contract.hash }}
                    </router-link>
                  </span>
                </div>
              </div>
              <div class="tabs-wrap">
                <Tabs
                  :value="selectedPayloadTab"
                  :routeReplace="true"
                  title="Payload"
                >
                  <Tab
                    title="Formatted"
                    :route="{ query: query({ payload: 'formatted' }) }"
                    :id="'formatted'"
                  >
                    <div class="title" v-if="txMeta.payload?.length">
                      {{ formattedTitle }}
                    </div>
                    <div class="content">
                      <div class="h-scroll dark">
                        <div
                          class="empty-result"
                          v-if="!txMeta.payload?.length"
                        >
                          (No payload)
                        </div>
                        <div
                          v-if="
                            txMeta.blockno > hardforkBlockV4 &&
                            txMeta.type === 6
                          "
                          class="h-scroll dark"
                        >
                          <div
                            class="empty-result"
                            v-if="!contract.meta.source_code"
                          >
                            (No sourceCode)
                          </div>
                          <codemirror
                            v-if="contract.meta.source_code"
                            v-model="contract.meta.source_code"
                            :options="cmOption2"
                          />

                          <div
                            class="title"
                            v-if="contract.meta.deploy_args.length"
                          >
                            Deploy Arguments
                          </div>

                          <div
                            class="empty-result"
                            v-if="!contract.meta.deploy_args"
                          >
                            (No deployArgs)
                          </div>
                          <codemirror
                            v-if="contract.meta.deploy_args"
                            v-model="contract.meta.deploy_args"
                            :options="cmOption2"
                          />
                        </div>
                        <payload-formatter
                          v-else
                          :payload="txMeta.payload"
                          :txType="txMeta.type"
                          :recipient="txMeta.to"
                        />
                      </div>
                    </div>
                  </Tab>
                  <Tab
                    title="JSON"
                    :route="{ query: query({ payload: 'json' }) }"
                    :id="'json'"
                  >
                    <div class="content">
                      <div class="h-scroll dark">
                        <codemirror v-model="payloadJson" :options="cmOption" />
                      </div>
                    </div>
                  </Tab>
                  <Tab
                    title="Hex"
                    :route="{ query: query({ payload: 'hex' }) }"
                    :id="'hex'"
                  >
                    <div class="content">
                      <p>{{ payloadHex }}</p>
                    </div>
                  </Tab>
                </Tabs>
                <Tabs
                  :value="selectedReceiptTab"
                  :routeReplace="true"
                  title="Result"
                >
                  <Tab
                    title="Status"
                    :route="{ query: query({ receipt: 'status' }) }"
                    :id="'status'"
                    :css="{
                      extend: txMeta.status !== 'ERROR' ? 'success' : 'error',
                    }"
                  >
                    <div
                      class="title"
                      v-if="
                        txMeta.status === 'SUCCESS' ||
                        txMeta.status === 'CREATED'
                      "
                    >
                      <img src="~@assets/img/ic-success.png" />{{
                        statusFormatted
                      }}
                    </div>
                    <div class="title" v-if="txMeta.status === 'ERROR'">
                      <img src="~@assets/img/ic-fail.png" />{{
                        statusFormatted
                      }}
                    </div>
                    <div class="content">
                      <div class="empty-result" v-if="!txMeta.result">
                        (Empty result)
                      </div>
                      <span class="monospace" v-else>{{ txMeta.result }}</span>
                    </div>
                  </Tab>

                  <Tab
                    title="JSON"
                    :route="{ query: query({ receipt: 'json' }) }"
                    :id="'json'"
                  >
                    <div class="content">
                      <codemirror
                        v-if="receiptJson !== 'Loading...'"
                        v-model="receiptJson"
                        :options="cmOption"
                      />
                      <div v-else>Loading...</div>
                    </div>
                  </Tab>

                  <Tab
                    :title="`Events (${totalEvents})`"
                    :route="{ query: query({ receipt: 'events' }) }"
                    :id="'events'"
                  >
                    <div class="content">
                      <div class="table-wrap">
                        <div class="h-scroll dark">
                          <events-list
                            :events="events"
                            :columns="[]"
                            :address="txMeta.to"
                            :css="tabTableCss"
                          />
                          <pagination
                            slot="pagination"
                            :css="paginationCss"
                            :page="currentPage"
                            :total-items="limitPageTotalCount"
                            :itemsPerPage="itemsPerPage"
                            @onUpdate="changePage"
                            @updateCurrentPage="updateCurrentPage"
                          />
                        </div>
                      </div>
                    </div>
                  </Tab>
                </Tabs>
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
import moment from 'moment'
import Search from '@/src/vue/components/Search'
import Identicon from '@/src/vue/components/Identicon'
import PayloadFormatter from '@/src/vue/components/PayloadFormatter'
import EventsList from '@/src/vue/components/EventsList'
import TransactionTokenTable from '@/src/vue/components/TransactionTokenTable'
import TransactionNftTable from '@/src/vue/components/TransactionNftTable'
import InternalTransactionsTable from '@/src/vue/components/InternalTransactionsTable'
import { TxTypes } from '@herajs/common'
import cfg from '@/src/config'

import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material-ocean.css'
import 'codemirror/mode/javascript/javascript.js'

// foldGutter
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/markdown-fold.js'
import 'codemirror/addon/fold/xml-fold.js'

const payloadTabs = ['formatted', 'json', 'hex']
const receiptTabs = ['status', 'json', 'events']

export default {
  data() {
    return {
      txDetail: null,
      txReceipt: null,
      txMeta: {},
      events: [],
      totalEvents: 0,
      error: null,
      selectedPayloadTab: 0,
      selectedReceiptTab: 0,
      tokenTxTotalItems: 0,
      nftTxTotalItems: 0,
      internalTransactionsTotalItems: 0,
      tabTableCss: {
        table: 'result-events',
      },
      paginationCss: {
        pagination: 'pagination events',
        paginationInner: 'pagination-events',
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      currentPage: 1,
      itemsPerPage: 20,
      limitPageTotalCount: 0,
      cmOption: {
        tabSize: 4,
        styleActiveLine: true,
        mode: 'application/json',
        theme: 'material-ocean',
        readOnly: true,
      },
      cmOption2: {
        tabSize: 4,
        styleActiveLine: true,
        readOnly: true,
        lineNumbers: true,
        line: true,
        lineWrapping: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        theme: 'material-ocean',
        mode: 'text/x-lua',
      },
      payloadJson: '',
      isContract: false,
      contract: {},
      internalData: [],
    }
  },
  created() {},
  beforeDestroy() {},
  watch: {
    $route(to, from) {
      this.load()
      if (to.query.payload === 'json') {
        this.payloadJson = this.calculatePayloadJson()
      }
      if (to.query.receipt === 'json') {
        this.getReceipt()
      }
    },
    selectedReceiptTab() {
      if (this.selectedReceiptTab === 1) {
        this.getReceipt()
      }
    },
    realToken() {
      this.reloadAllTable(this.realToken)
        .then(() => this.load())
        .catch((e) => {
          console.log(e)
        })
    },
    txMeta() {
      ;(async () => {
        const response = await this.$fetch.get(`${cfg.API_URL}/contractTx`, {
          q: `_id:${this.txMeta.contract}`,
        })
        const responseJson = await response.json()

        if (responseJson.hits.length > 0) {
          this.isContract = true
          this.contract = responseJson.hits[0]
        }
      })()
      if (this.selectedPayloadTab === 1) {
        this.payloadJson = this.calculatePayloadJson()
      }
    },
  },

  mounted() {
    if (this.$route.query.payload) {
      this.selectedPayloadTab =
        payloadTabs.indexOf(this.$route.query.payload) || 0
    }
    if (this.$route.query.receipt) {
      this.selectedReceiptTab =
        receiptTabs.indexOf(this.$route.query.receipt) || 0
    }
    this.load()
    this.changePage(this.currentPage)
  },
  computed: {
    hardforkBlockV4() {
      return cfg.HARDFORK_BLOCK_V4 || 0
    },
    realToken() {
      return this.$route.params.hash
    },
    formattedTitle() {
      if (this.txMeta.type === 1) return 'Function Call'
      else if (this.txMeta.type === 2) return 'Contract Redeploy'
      else if (this.txMeta.type === 5) return 'Function Call'
      else if (this.txMeta.type === 6) return 'Contract Creation'
      else if (this.txMeta.type === 7) return 'MultiCall'
      else return 'Text'
    },
    statusFormatted() {
      const status = this.txMeta.status.toLowerCase()
      return status.charAt(0).toUpperCase() + status.slice(1)
    },
    payloadHex() {
      if (!this.txMeta.payload) return 'No Payload calculate to Hex'
      let payloadBuffer = Buffer.from(this.txMeta.payload, 'base64')
      return payloadBuffer.toString('hex')
    },
    receiptJson() {
      if (!this.txReceipt) {
        return 'Loading...'
      } else {
        return JSON.stringify(this.txReceipt, null, 2)
      }
    },
    typeLabel() {
      return this.txMeta && TxTypes[this.txMeta.type]
    },
  },
  methods: {
    query(newQuery) {
      return { ...this.$route.query, ...newQuery }
    },
    reload: async function () {
      this.isLoading = true
      await this.load()
      this.isLoading = false
    },
    async load() {
      this.error = null
      let hash = this.$route.params.hash
      ;(async () => {
        const response = await this.$fetch.get(`${cfg.API_URL}/transactions`, {
          q: `_id:${hash}`,
        })
        const responseJson = await response.json()
        if (responseJson.hits.length) {
          this.txMeta = responseJson.hits[0].meta
        }
      })()
      ;(async () => {
        const start = (this.currentPage - 1) * this.itemsPerPage
        const response = await this.$fetch.get(`${cfg.API_URL}/event`, {
          q: `tx_id:${hash}`,
          from: start,
          size: this.itemsPerPage,
        })
        const responseJson = await response.json()
        if (responseJson.error) {
          this.error = responseJson.error.msg
        } else if (responseJson.hits.length) {
          this.totalEvents = responseJson.total
          this.events = responseJson.hits
          this.limitPageTotalCount = responseJson.total
        } else {
          this.events = []
          this.limitPageTotalCount = 0
        }
      })()

      await this.loadInternalOperationsData()

      await this.$nextTick()
    },

    loadInternalOperationsData: async function () {
      let hash = this.$route.params.hash
      const response = await (
        await this.$fetch.get(`${cfg.API_URL}/internalOperations`, {
          q: `tx_id:${hash}`,
        })
      ).json()
      if (response.hits.length) {
        this.internalData = response.hits.map((item, index) => ({
          ...item.meta,
          operations: JSON.parse(item.meta.operations),
        }))
      } else {
        this.internalData = []
      }
    },

    async getReceipt() {
      let hash = this.$route.params.hash
      this.txReceipt = await this.$store.dispatch(
        'blockchain/getTransactionReceipt',
        {
          hash,
        }
      )
    },

    async reloadAllTable(token) {
      if (this.$refs.transactionTokenTable) {
        await this.$refs.transactionTokenTable.reload(token)
      }
      if (this.$refs.transactionNftTable) {
        await this.$refs.transactionNftTable.reload(token)
      }
    },
    updateTokenTxTotalCount(count) {
      this.tokenTxTotalItems = count
    },
    updateNftTxTotalCount(count) {
      this.nftTxTotalItems = count
    },
    updateInternalTransactionsTotalCount(count) {
      this.internalTransactionsTotalItems = count
    },
    moment,
    changePage: function (currentPage) {
      this.currentPage = currentPage
      this.reload()
    },
    updateCurrentPage: function (currentPage) {
      this.currentPage = currentPage
    },
    calculatePayloadJson() {
      if (!this.txMeta.payload) return 'No Payload calculate to JSON'
      try {
        let payloadBuffer = Buffer.from(this.txMeta.payload, 'base64')
        let parsedData = JSON.parse(payloadBuffer.toString('utf-8'))
        return JSON.stringify(parsedData, null, 2)
      } catch (e) {
        return 'Cannot parse payload as JSON'
      }
    },
    //
  },
  components: {
    TransactionTokenTable,
    TransactionNftTable,
    InternalTransactionsTable,
    PayloadFormatter,
    Search,
    EventsList,
    Identicon,
    codemirror,
  },
}
</script>

<style lang="scss" scoped>
.vjs-value-string {
  color: #279ecc !important;
}

.category-inner {
  > .page-wrap {
    padding-bottom: 30px;

    @media screen and (max-width: 1000px) {
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

  &.transaction {
    .table-wrap {
      display: flex;
      align-items: start;
      gap: 0 16px;
      margin: 0;

      @media screen and (max-width: 1000px) {
        flex-wrap: wrap;
      }

      @media screen and (max-width: 480px) {
        padding: 0 20px;
      }

      table td {
        .address {
          padding: 5px 10.5px;
        }

        .help {
          border-bottom: 1px dashed #aaa;
          cursor: help;
        }
      }
    }
  }

  &.execution {
    @media screen and (max-width: 480px) {
      margin: 0 -20px;
    }

    .address {
      border-bottom: none;
    }

    .tabs-wrap {
      display: flex;
      align-items: start;
      padding: 10px 20px 50px;

      @media screen and (max-width: 1200px) {
        flex-wrap: wrap;
      }

      .tabs {
        margin-right: 56px;
        width: 50%;

        @media screen and (max-width: 1200px) {
          margin-right: 0;
          margin-bottom: 50px;
          width: 100%;

          &:last-child {
            margin-bottom: 0;
          }
        }

        &:last-child {
          margin-right: 0;
        }
      }
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
        /* text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden; */

        padding: 10px 15px;
        border-radius: 5px;
        font-size: 14px;
        color: #3c3b3e;
        word-break: break-all;
        background-color: #f1f1f2;

        a {
          &:hover {
            font-weight: 500;
            text-shadow: 0px 0px 0px #3c3b3e;
            color: #3c3b3e;
          }
        }

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
  }

  table.transaction-detail {
    table-layout: fixed;
    border-collapse: separate;
    border-spacing: 0 20px;
    line-height: 20px;

    @media screen and (max-width: 900px) {
      margin-top: -20px;

      &:nth-child(2) {
        margin-top: -5px;
      }
    }

    @media screen and (max-width: 480px) {
      margin-top: -25px;
      border-spacing: 0 25px;
    }

    th {
      width: 150px;
      height: auto;
      font-size: 14px;
      color: #a391aa;
      border-bottom: none;
      vertical-align: top;

      @media screen and (max-width: 480px) {
        font-size: 15px;
      }

      img.arrow {
        margin: 0 5px;
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

      div {
        white-space: initial;
      }
      img.arrow {
        margin: 0 6px;
      }

      .from-to {
        display: flex;
        align-items: center;
        width: 100%;

        @media screen and (max-width: 1425px) {
          display: block;
          text-align: center;
        }
        @media screen and (max-width: 1000px) {
          display: flex;
          align-items: center;
          width: 100%;
        }
        @media screen and (max-width: 690px) {
          display: block;
          text-align: center;
        }

        .address {
          font-size: 11px;
          line-height: 1.2;

          @media screen and (max-width: 1425px) {
            display: block;
          }
          @media screen and (max-width: 1000px) {
            font-size: 11px;
            line-height: 1.2;
          }

          &:hover {
            text-decoration: none;
          }
        }

        img.arrow {
          margin: 0 5px;

          @media screen and (max-width: 1425px) {
            display: block;
            margin: 6px auto;
            transform: rotate(90deg);
          }
          @media screen and (max-width: 1000px) {
            transform: none;
            margin: 0 5px;
          }

          @media screen and (max-width: 690px) {
            display: block;
            margin: 6px auto;
            transform: rotate(90deg);
          }
        }

        /* .txt-ellipsis {
          white-space: nowrap;
          text-overflow: ellipsis;
          overflow: hidden;
        } */
      }

      .includedBlock {
        &:hover {
          font-weight: 500;
          text-shadow: 0px 0px 0px #3c3b3e;
          color: #3c3b3e;
        }
      }
    }
  }
}
</style>
