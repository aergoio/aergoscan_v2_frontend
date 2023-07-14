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
              <div class="address" v-if="txDetail">{{ txDetail.tx.hash }}</div>
            </div>
            <div class="detail-box transaction" v-if="txDetail">
              <div class="table-wrap">
                <div class="error show" v-if="error">
                  {{ error }}
                </div>
                <table
                  class="transaction-detail"
                  :class="!txDetail && !error && 'loading'"
                >
                  <tbody>
                    <tr class="hidden loading" v-if="!txDetail && !error">
                      <td colspan="100%">Loading...</td>
                    </tr>
                    <!--                  <tr class="hidden not-found">-->
                    <!--                    <td colspan="100%">No items found</td>-->
                    <!--                  </tr>-->
                    <template v-if="txDetail">
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
                                class="address"
                                :to="`/account/${txDetail.tx.from}/`"
                              >
                                {{
                                  $options.filters.formatEllipsisText(
                                    txDetail.tx.from.toString(),
                                    30
                                  )
                                }}
                              </router-link>
                              <img
                                src="~@assets/img/ic-arrow-black@3x.png"
                                class="arrow"
                              />
                              <router-link
                                class="address"
                                v-if="
                                  txDetail.tx.to &&
                                  txDetail.tx.to.toString().length
                                "
                                :to="`/account/${txDetail.tx.to}/`"
                              >
                                {{
                                  $options.filters.formatEllipsisText(
                                    txDetail.tx.to.toString(),
                                    28
                                  )
                                }}
                              </router-link>
                              <a
                                href="javascript:;"
                                class="address"
                                v-if="
                                  !txDetail.tx.to ||
                                  !txDetail.tx.to.toString().length
                                "
                                >{{
                                  txDetail.tx.type === 7
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
                                txDetail.tx.amount,
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
                      <tr v-if="txReceipt">
                        <th>
                          <div>Fee</div>
                        </th>
                        <td>
                          <div>
                            <span
                              class="ml-5 tpm"
                              v-html="
                                $options.filters.formatToken(this.txReceipt.fee)
                              "
                              >{{ txDetail.tx.limit }}</span
                            >
                            <span
                              class="ml-5 tpm tooltipped tooltipped-se tooltipped-align-left-2"
                              aria-label="Fee was paid by contract"
                              v-if="txReceipt.feeDelegation"
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
                            {{ txReceipt ? txReceipt.gasused : '...' }} of
                            <span class="ml-5 tpm" v-if="txDetail.tx.limit">{{
                              txDetail.tx.limit
                            }}</span>
                            <span
                              class="ml-5 tpm tooltipped tooltipped-se tooltipped-align-left-2"
                              aria-label="Limit was set to 0, allowing unlimited gas use"
                              v-if="!txDetail.tx.limit"
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
                  :class="!txDetail && !error && 'loading'"
                >
                  <tbody>
                    <tr class="hidden loading" v-if="!txDetail && !error">
                      <td colspan="100%">Loading...</td>
                    </tr>
                    <!--                  <tr class="hidden not-found">-->
                    <!--                    <td colspan="100%">No items found</td>-->
                    <!--                  </tr>-->
                    <template v-if="txDetail">
                      <tr>
                        <th>
                          <div>Nonce</div>
                        </th>
                        <td>
                          <div>{{ txDetail.tx.nonce }}</div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Type</div>
                        </th>
                        <td>
                          <div>{{ typeLabel }}</div>
                        </td>
                      </tr>
                      <tr v-if="txDetail.tx.payload">
                        <th>
                          <div>Payload</div>
                        </th>
                        <td>
                          <div>{{ txDetail.tx.payload.length }} bytes</div>
                        </td>
                      </tr>
                      <tr v-if="!txDetail.block">
                        <th>
                          <div>Status</div>
                        </th>
                        <td>
                          <div>Pending</div>
                        </td>
                      </tr>
                      <tr v-if="txDetail.block">
                        <th>
                          <div>Status</div>
                        </th>
                        <td>
                          <div>Confirmed</div>
                        </td>
                      </tr>
                      <tr v-if="txDetail.block">
                        <th>
                          <div>Included in block</div>
                        </th>
                        <td>
                          <div>
                            <span class="txt-ellipsis">
                              <router-link
                                :to="`/block/${txDetail.block.hash}/`"
                                >{{ txDetail.block.hash }}</router-link
                              >
                            </span>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="txMeta.ts">
                        <th>
                          <div>Time stamp</div>
                        </th>
                        <td>
                          <div>
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
                    </div>
                  </div>
                </div>
                <div class="table-tab-content" v-if="txDetail">
                  <transaction-token-table
                    ref="transactionTokenTable"
                    :hash="txDetail.tx.hash"
                    :active="!$route.query.tx || $route.query.tx === 'token'"
                    @onUpdateTotalCount="updateTokenTxTotalCount"
                  />
                  <transaction-nft-table
                    ref="transactionNftTable"
                    :hash="txDetail.tx.hash"
                    :active="$route.query.tx === 'nft'"
                    @onUpdateTotalCount="updateNftTxTotalCount"
                  />
                </div>
              </div>
            </div>
            <div class="detail-box execution" v-if="txDetail && txReceipt">
              <div class="title">Execution Details</div>
              <div class="address">
                <div class="title">Contract</div>
                <div class="item">
                  <span class="item-inner" v-if="txReceipt.contractaddress">
                    <router-link :to="`/account/${txReceipt.contractaddress}/`">
                      <Identicon
                        :text="txReceipt.contractaddress"
                        size="20"
                        class="tiny-identicon"
                      />
                      {{ txReceipt.contractaddress }}
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
                    <div class="title" v-if="txDetail.tx.payload.length">
                      {{ formattedTitle }}
                    </div>
                    <div class="content">
                      <div
                        class="empty-result"
                        v-if="!txDetail.tx.payload.length"
                      >
                        (No payload)
                      </div>
                      <payload-formatter
                        :payload="txDetail.tx.payload"
                        :txType="txDetail.tx.type"
                        :recipient="txDetail.tx.to"
                        v-if="txDetail.tx.payload"
                      />
                    </div>
                  </Tab>
                  <Tab
                    title="JSON"
                    :route="{ query: query({ payload: 'json' }) }"
                    :id="'json'"
                  >
                    <div class="content">
                      <pre>{{ payloadJson }}</pre>
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
                    title="Formatted"
                    :route="{ query: query({ receipt: 'formatted' }) }"
                    :id="'formatted'"
                    :css="{
                      extend:
                        txReceipt.status !== 'ERROR' ? 'success' : 'error',
                    }"
                  >
                    <div
                      class="title"
                      v-if="
                        txReceipt.status === 'SUCCESS' ||
                        txReceipt.status === 'CREATED'
                      "
                    >
                      <img src="~@assets/img/ic-success.png" />{{
                        statusFormatted
                      }}
                    </div>
                    <div class="title" v-if="txReceipt.status === 'ERROR'">
                      <img src="~@assets/img/ic-fail.png" />{{
                        statusFormatted
                      }}
                    </div>
                    <div class="content">
                      <div class="empty-result" v-if="!txReceipt.result">
                        (Empty result)
                      </div>
                      <span class="monospace" v-else>{{
                        txReceipt.result
                      }}</span>
                    </div>
                  </Tab>
                  <Tab
                    title="JSON"
                    :route="{ query: query({ receipt: 'json' }) }"
                    :id="'json'"
                  >
                    <div class="content">
                      <pre>{{ receiptJson }}</pre>
                    </div>
                  </Tab>
                  <Tab
                    :title="`Events (${events.length})`"
                    :route="{ query: query({ receipt: 'events' }) }"
                    :id="'events'"
                  >
                    <div class="content">
                      <div class="table-wrap">
                        <events-list
                          :events="events"
                          :columns="[]"
                          :address="txDetail.tx.to"
                          :css="tabTableCss"
                        />
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

import { TxTypes } from '@herajs/common'
import cfg from '@/src/config'

const payloadTabs = ['formatted', 'json', 'hex']
const receiptTabs = ['formatted', 'json', 'events']

export default {
  data() {
    return {
      txDetail: null,
      txReceipt: null,
      txMeta: {},
      events: [],
      error: null,
      selectedPayloadTab: 0,
      selectedReceiptTab: 0,
      tokenTxTotalItems: 0,
      nftTxTotalItems: 0,
      tabTableCss: {
        table: 'result-events',
      },
    }
  },
  created() {},
  beforeDestroy() {},
  watch: {
    $route(to, from) {
      this.load()
    },
    realToken() {
      this.reloadAllTable(this.realToken)
        .then(() => this.load())
        .catch((e) => {
          console.log(e)
        })
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
  },
  computed: {
    realToken() {
      return this.$route.params.hash
    },
    formattedTitle() {
      if (this.txDetail.tx.type === 1) return 'Function Call'
      else if (this.txDetail.tx.type === 2) return 'Contract Redeploy'
      else if (this.txDetail.tx.type === 5) return 'Function Call'
      else if (this.txDetail.tx.type === 6) return 'Contract Creation'
      else if (this.txDetail.tx.type === 7) return 'MultiCall'
      else return 'Text'
    },
    statusFormatted() {
      const status = this.txReceipt.status.toLowerCase()
      return status.charAt(0).toUpperCase() + status.slice(1)
    },
    payloadJson() {
      if (!this.txDetail.tx.payload) return
      try {
        let payloadBuffer = Buffer.from(this.txDetail.tx.payload)
        let parsedData = JSON.parse(payloadBuffer.toString())
        return JSON.stringify(parsedData, null, 2)
      } catch (e) {
        return 'Cannot parse payload as JSON'
      }
    },
    payloadHex() {
      if (!this.txDetail.tx.payload) return
      let payloadBuffer = Buffer.from(this.txDetail.tx.payload)
      return payloadBuffer.toString('hex')
    },
    receiptJson() {
      return JSON.stringify(this.txReceipt, null, 2)
    },
    typeLabel() {
      return this.txDetail && TxTypes[this.txDetail.tx.type]
    },
  },
  methods: {
    query(newQuery) {
      return { ...this.$route.query, ...newQuery }
    },
    async load() {
      this.error = null
      let hash = this.$route.params.hash

      ;(async () => {
        try {
          this.txDetail = await this.$store.dispatch(
            'blockchain/getTransaction',
            { hash }
          )
        } catch (e) {
          this.error = '' + e
          return
        }
      })()
      ;(async () => {
        this.txReceipt = await this.$store.dispatch(
          'blockchain/getTransactionReceipt',
          { hash }
        )
        this.events = this.txReceipt.events
      })()
      ;(async () => {
        const response = await (
          await this.$fetch.get(`${cfg.API_URL}/transactions`, {
            q: `_id:${hash}`,
          })
        ).json()
        if (response.hits.length) {
          this.txMeta = response.hits[0].meta
        }
      })()
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
    moment,
  },
  components: {
    TransactionTokenTable,
    TransactionNftTable,
    PayloadFormatter,
    Search,
    EventsList,
    Identicon,
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

  &.transaction {
    .table-wrap {
      display: flex;
      align-items: start;
      gap: 0 16px;
      margin: 0;

      @media screen and (max-width: 900px) {
        flex-wrap: wrap;
      }

      @media screen and (max-width: 480px) {
        padding: 0 20px;
      }

      table td {
        .address {
          padding: 5px 10.5px;
        }

        .tooltipped {
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
        text-overflow: ellipsis;
        white-space: nowrap;
        overflow: hidden;

        padding: 10px 15px;
        border-radius: 5px;
        font-size: 14px;
        color: #3c3b3e;
        word-break: break-all;
        background-color: #f1f1f2;

        a {
          &:hover {
            text-decoration: underline;
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
      width: 126px;
      height: auto;
      font-size: 14px;
      color: #a391aa;
      border-bottom: none;
      vertical-align: top;

      @media screen and (max-width: 480px) {
        width: 110px;
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

      img.arrow {
        margin: 0 6px;
      }

      .from-to {
        display: flex;
        align-items: center;
        width: 100%;

        @media screen and (max-width: 900px) {
          display: block;
          text-align: center;
        }

        .address {
          font-size: 11px;
          line-height: 1.2;

          @media screen and (max-width: 900px) {
            display: block;
          }

          &:hover {
            text-decoration: none;
          }
        }

        img.arrow {
          margin: 0 5px;

          @media screen and (max-width: 900px) {
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

      a {
        &:hover {
          text-decoration: underline;
        }
      }
    }
  }
}
</style>
