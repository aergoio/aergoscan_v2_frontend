<template>
  <div class="table-wrap latest-block-table">
    <div class="title">Latest Blocks</div>
    <!--    <div class="error latest-block show" v-if="error">-->
    <!--      {{ error }}-->
    <!--    </div>-->
    <div class="h-scroll-main">
      <div class="h-scroll-main-inner">
        <table
          class="latest-block-table lastest-top"
          :class="!isConnected && 'loading'"
        >
          <thead>
            <tr>
              <th>
                <div>Block #</div>
              </th>
              <th>
                <div>Time</div>
              </th>
              <th>
                <div>TXs</div>
              </th>
              <th>
                <div>Block Producer</div>
              </th>
              <th>
                <div>Reward (Aergo)</div>
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
            <tr
              v-for="(block, index) in reverseBlocks"
              :key="block.hash"
              :class="{ expand: index === 0 }"
              v-else
            >
              <td>
                <div>
                  <router-link :to="`/block/${block.header.blockno}`">{{
                    block.header.blockno
                  }}</router-link>
                </div>
              </td>
              <td>
                <div>
                  {{
                    moment(block.header.timestamp / 1000000).format('HH:mm:ss')
                  }}
                </div>
              </td>
              <td>
                <div>{{ block.txcount }}&nbsp;tx</div>
              </td>
              <td>
                <div
                  class="tooltipped tooltipped-sw tooltipped-align-right-2"
                  :aria-label="block.header.pubkey"
                >
                  <Identicon
                    :text="block.header.pubkey"
                    size="18"
                    class="tiny-identicon"
                  />
                  <span>{{
                    $options.filters.formatEllipsisText(block.header.pubkey, 17)
                  }}</span>
                </div>
              </td>
              <td>
                <div>{{ block.voteReward.formatNumber() }}</div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    <div class="btn-wrap">
      <button v-on:click="viewAllBlocks()">view all</button>
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import { mapState, mapActions } from 'vuex'
import Identicon from '@/src/vue/components/Identicon'

const CONNECTING_MSG = 'Connecting...'
const CONNECTING_SLOW_MSG =
  "Connecting...It's taking longer than usual, please wait or try again later."

export default {
  name: 'RecentBlocks',
  data() {
    return {}
  },
  created() {},
  mounted() {
    this.$store.dispatch('blockchain/streamBlocks')
  },
  beforeDestroy() {},
  computed: {
    ...mapState({
      blocks: (state) => state.blockchain.recentBlocks,
      isConnected: (state) => state.blockchain.streamConnected,
      connectionStatusMessage: (state) =>
        state.blockchain.streamState === 'starting-slow'
          ? CONNECTING_SLOW_MSG
          : CONNECTING_MSG,
    }),
    reverseBlocks() {
      return this.blocks.slice().reverse()
    },
  },
  components: {
    Identicon,
  },
  methods: {
    viewAllBlocks() {
      this.$router.push(`/blocks`)
    },
    moment,
  },
}
</script>

<style lang="scss" scoped>
.table-wrap.latest-block-table {
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
        white-space: nowrap;
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

      &:nth-child(1),
      &:nth-child(2) {
        @media screen and (max-width: 480px) {
          min-width: 55px;
        }
      }

      &:nth-child(4) {
        @media screen and (max-width: 480px) {
          text-align: center;
        }

        > div {
          @media screen and (max-width: 480px) {
            justify-content: center;
          }
        }
      }

      &:nth-child(5) {
        text-align: right;

        > div {
          justify-content: end;
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

      &:nth-child(3) {
        width: 60px;
      }

      &:nth-child(5) {
        text-align: right;

        > div {
          justify-content: end;
        }
      }

      .identicon {
        display: inline-block;
        width: 18px;
        height: 18px;
        flex: 18px 0 0;
        margin-right: 8px;
        vertical-align: middle;
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
            width: 20% !important;

            @media screen and (max-width: 480px) {
              width: 19% !important;
            }
          }

          &:nth-child(2) {
            width: 19% !important;
          }

          &:nth-child(3) {
            width: 10% !important;
          }

          &:nth-child(4) {
            width: 24% !important;
          }

          &:nth-child(5) {
            width: 24% !important;

            @media screen and (max-width: 900px) {
              width: 19% !important;
            }
          }
        }
      }
    }

    tbody {
      display: flex;
      flex-direction: column;
      max-height: 380px;
      overflow-y: scroll;
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

        @media screen and (max-width: 480px) {
          height: 28px;
        }

        &.expand {
          animation: insert-height 0.3s, insert-bg 1s;
          animation-duration: 0.3s;

          @media screen and (max-width: 480px) {
            animation: insert-height-m 0.3s, insert-bg 1s;
          }
        }

        td {
          display: inline-block;
          max-width: inherit !important;
          border-bottom: none;
          white-space: normal;

          &:nth-child(1) {
            width: 20% !important;

            @media screen and (max-width: 480px) {
              width: 19% !important;
            }
          }

          &:nth-child(2) {
            width: 19% !important;
          }

          &:nth-child(3) {
            width: 10% !important;
          }

          &:nth-child(4) {
            width: 24% !important;
          }

          &:nth-child(5) {
            width: 24% !important;

            @media screen and (max-width: 900px) {
              width: 19% !important;
            }
          }

          a:hover {
            text-decoration: underline;
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
