<template>
  <div class="table-wrap latest-transactions-table">
    <div class="title">Latest Transactions</div>
    <div class="error transactions show" v-if="error">
      {{ error }}
    </div>
    <div class="h-scroll-main dark">
      <div class="h-scroll-main-inner">
        <table
          class="latest-transactions-table lastest-top"
          :class="!isConnected && 'loading'"
        >
          <thead>
            <tr>
              <th>
                <div>TX Hash</div>
              </th>
              <th :style="{ minWidth: '120px' }">
                <div>Time</div>
              </th>
              <th>
                <div>From</div>
              </th>
              <th>
                <div>
                  <!-- <img src="~@assets/img/tooltipped@3x.png" class="arrow" /> -->
                </div>
              </th>
              <th>
                <div>To</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <tr class="hidden loading" v-if="!isConnected">
              <td colspan="100%" v-html="connectionStatusMessage"></td>
            </tr>
            <!--      <tr class="hidden not-found">-->
            <!--        <td colspan="100%">No items found</td>-->
            <!--      </tr>-->
            <tr v-for="(tx, index) in syncedTransactions" :key="tx.hash" v-else>
              <td>
                <div
                  class="tooltipped tooltipped-se tooltipped-align-left-2"
                  :aria-label="tx.hash"
                >
                  <router-link
                    class="address txt-ellipsis"
                    :to="`/transaction/${tx.hash}`"
                    >{{ tx.hash }}</router-link
                  >
                </div>
              </td>
              <td>
                <div
                  class="tooltipped tooltipped-s"
                  :aria-label="
                    moment(tx.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')
                  "
                >
                  {{
                    moment(tx.ts || tx.block.header.timestamp / 1000000).format(
                      'YYYY-MM-DD HH:mm:ss'
                    )
                  }}
                </div>
              </td>
              <td>
                <div class="tooltipped tooltipped-s" :aria-label="tx.from">
                  <router-link class="address" :to="`/account/${tx.from}`">
                    {{ resizeFormater(tx.from) }}
                  </router-link>
                </div>
              </td>
              <td>
                <div>
                  <img src="~@assets/img/ic-arrow@3x.png" class="arrow" />
                </div>
              </td>
              <td>
                <div
                  class="tooltipped tooltipped-sw tooltipped-align-right-2"
                  :aria-label="tx.to"
                  v-if="tx.to.length !== 0"
                >
                  <router-link class="address" :to="`/account/${tx.to}`">
                    {{ resizeFormater(tx.to) }}
                  </router-link>
                </div>
                <div v-else>
                  <span class="address">{{
                    tx.category === 'multicall'
                      ? 'MultiCall'
                      : 'Contract Creation'
                  }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="btn-wrap">
      <button v-on:click="viewAllTransactions()">view all</button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapState, mapActions } from 'vuex'
import cfg from '@/src/config.js'
import { resizeFormater } from '../filters/resizeFormater'

const CONNECTING_MSG = 'Connecting...'
const CONNECTING_SLOW_MSG =
  "Connecting...It's taking longer than usual, please wait or try again later."

export default {
  name: 'RecentTransactions',
  data() {
    return {
      error: '',
      initialTransactions: [],
      syncedTransactions: [],
      syncInterval: null,
    }
  },
  created() {
    window.addEventListener('resize', this.handleResize)
  },
  async mounted() {
    this.$store.dispatch('blockchain/streamBlocks')
    this.syncTxList()
    this.syncInterval = setInterval(() => {
      this.syncTxList()
    }, 5000)
  },
  beforeDestroy() {
    clearInterval(this.syncInterval)
    window.removeEventListener('resize', this.handleResize)
  },

  computed: {
    ...mapState({
      transactions: (state) => state.blockchain.recentTransactions,
      isConnected: (state) => state.blockchain.streamConnected,
      connectionStatusMessage: (state) =>
        state.blockchain.streamState === 'starting-slow'
          ? CONNECTING_SLOW_MSG
          : CONNECTING_MSG,
    }),
  },
  methods: {
    viewAllTransactions() {
      this.$router.push(`/transactions`)
    },
    async syncTxList() {
      this.error = ''
      const response = await this.$fetch.get(
        `${cfg.API_URL}/recentTransactions`
      )
      const result = await response.json()
      if (result.error) {
        this.error = response.error.msg
        console.error(result.error)
      } else {
        this.syncedTransactions = result.txList.map((tx) => ({
          ...tx,
          ...tx.meta,
        }))
      }
    },
    moment,
    resizeFormater,
  },
}
</script>

<style lang="scss" scoped>
.table-wrap.latest-transactions-table {
  width: 50%;
  margin: 0 7.5px;
  padding: 26px 20px 20px;
  box-shadow: none;
  background-color: rgba(88, 86, 102, 0.2);

  @media screen and (max-width: 1200px) {
    width: 100%;
    margin-bottom: 15px;
  }

  @media screen and (max-width: 480px) {
    /* overflow-x: auto; */
    width: calc(100% - 15px);
    padding: 15px 10px;
    margin-bottom: 12px;
  }

  .title {
    font-size: 14px;
    color: #fff;
    border-bottom: none;
    padding: 0 20px 0 20px;

    @media screen and (max-width: 480px) {
      padding: 0 10px 0 10px;
      margin: 0 -10px 15px;
      font-size: 12px;
    }
  }

  table {
    display: block;
    height: 450px;
    margin-top: 17px;

    @media screen and (max-width: 480px) {
      height: 310px;
      margin-top: 14px;
    }

    &.loading {
      tbody {
        tr {
          &.loading {
            display: block !important;

            td {
              display: flex;
              align-items: center;
              width: 100% !important;
            }
          }
        }
      }
    }

    &.not-found {
      tbody {
        tr {
          &.not-found {
            display: block !important;

            td {
              display: flex;
              align-items: center;
              width: 100% !important;
            }
          }
        }
      }
    }

    &.lastest-top {
      thead {
        white-space: nowrap;
      }
      tbody {
        flex-direction: column;
      }
    }

    &.lastest-bottom {
      tbody {
        flex-direction: column-reverse;
      }
    }

    th {
      font-weight: normal;
      border-bottom: 1px solid rgba(76, 68, 82, 0.8);

      @media screen and (max-width: 480px) {
        height: 28px;
        font-size: 10px;
      }

      /* &:first-child {
        padding-left: 8px;
      } */

      &:nth-child(2) {
        /* min-width: max-content; */
        /* padding-left: 8px; */
        /* @media screen and (max-width: 480px) {
          min-width: 55px;
        } */
      }

      &:nth-child(4) {
        width: 25px;
        min-width: 25px;
        box-sizing: content-box;
      }

      /* &:nth-child(2), */
      &:nth-child(3),
      &:nth-child(4),
      &:nth-child(5) {
        text-align: center;

        > div {
          justify-content: center;
        }
      }

      > div {
        justify-content: start;
      }
    }

    td {
      color: #e3dee7;
      border-bottom: 1px solid rgba(76, 68, 82, 0.8);

      @media screen and (max-width: 480px) {
        height: 28px;
        font-size: 10px;
      }

      &.txt-ellipsis {
        @media screen and (max-width: 900px) {
          max-width: 15vw;
        }

        @media screen and (max-width: 480px) {
          max-width: 15vw;
        }
      }

      &:nth-child(2) {
        color: #908091;
      }

      &:nth-child(3),
      &:nth-child(4),
      &:nth-child(5) {
        text-align: center;

        > div {
          justify-content: center;
        }
      }

      .address {
        color: #e3dee7;

        padding: 5px 10.5px;
        font-size: 8px;
        background-color: rgba(88, 86, 102, 0.5);

        &:hover {
          color: #130f16;
          background-color: #585666;
        }
      }
    }

    thead {
      display: block;

      tr {
        display: block;
        border-bottom: 1px solid rgba(76, 68, 82, 0.8);

        th {
          /* min-width: 80px; */
          display: inline-block;
          border-bottom: none;
          white-space: normal;
          &:nth-child(1) {
            width: 24.5% !important;

            @media screen and (max-width: 480px) {
              width: 23% !important;
            }
          }

          &:nth-child(2) {
            width: 18% !important;
          }

          &:nth-child(3) {
            width: 24.3% !important;

            @media screen and (max-width: 480px) {
              width: 22.5% !important;
            }
          }

          &:nth-child(4) {
            width: 5% !important;

            @media screen and (max-width: 480px) {
              width: 7.5% !important;
            }
          }

          &:nth-child(5) {
            width: 23% !important;

            @media screen and (max-width: 480px) {
              width: 22% !important;
            }
            @media screen and (max-width: 360px) {
              width: 5% !important;
            }
          }
        }
      }
    }

    tbody {
      display: flex;
      flex-direction: column;
      max-height: 380px;
      /* overflow-y: scroll; */
      /* overflow-y: hidden; */
      margin-right: -8px;

      @media screen and (max-width: 480px) {
        max-height: 280px;
      }

      &:hover {
        &::-webkit-scrollbar {
          background-color: transparent;
          width: 8px;
        }

        &::-webkit-scrollbar-thumb {
          background-color: rgba(167, 167, 167, 0.2);
        }
      }

      &::-webkit-scrollbar {
        width: 8px;
      }

      tr {
        flex: 1 0 auto;
        display: block;
        height: 38px;
        border-bottom: 1px solid rgba(76, 68, 82, 0.8);
        white-space: nowrap;
        @media screen and (max-width: 480px) {
          height: 28px;
        }

        &.expand {
          animation: insert-height 0.3s, insert-bg 1s;

          @media screen and (max-width: 480px) {
            animation: insert-height-m 0.3s, insert-bg 1s;
          }
        }

        td {
          display: inline-block;
          max-width: inherit !important;
          border-bottom: none;
          white-space: normal;

          .address {
            /* padding: auto; */
            background-color: rgba(88, 86, 102, 0.5);
            @media screen and (max-width: 700px) {
              font-size: 9px;
            }
            @media screen and (max-width: 480px) {
              font-size: 8px;
              padding: 0;
            }
          }

          &:nth-child(1) {
            width: 24.5% !important;

            @media screen and (max-width: 480px) {
              width: 23% !important;
            }
          }

          &:nth-child(2) {
            min-width: 120px;
            width: 19% !important;

            @media screen and (max-width: 700px) {
              width: auto !important;
            }
          }

          &:nth-child(3) {
            width: 24.5% !important;

            @media screen and (max-width: 480px) {
              width: 23.4% !important;
            }
          }

          &:nth-child(4) {
            width: 5% !important;

            @media screen and (max-width: 480px) {
              width: 7.5% !important;
            }
          }

          &:nth-child(5) {
            width: 22.5% !important;

            @media screen and (max-width: 480px) {
              width: 24% !important;
            }
          }
        }
      }
    }
  }

  .btn-wrap {
    margin-top: 20px;
    text-align: center;

    @media screen and (max-width: 480px) {
      margin-top: 15px;
    }

    button {
      width: 200px;
      height: 44px;
      border-radius: 25px;
      border: none;
      font-size: 13px;
      color: #e3dee7;
      background-color: rgba(88, 86, 102, 0.5);

      @media screen and (max-width: 480px) {
        width: 120px;
        height: 30px;
        font-size: 11px;
      }

      &:hover {
        background-color: #585666;
      }
    }
  }
}
</style>
