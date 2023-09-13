<template>
  <div class="wrap">
    <div id="category" class="block-details">
      <Header />
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search />
            <div class="title block-detail">
              Block Details
              <div class="arrow-box" v-if="blockDetail">
                <router-link
                  :to="`/block/${blockDetail.meta.no - 1}/`"
                  v-if="hasPrevious"
                >
                  <img src="~@assets/img/ic-prev@3x.png" class="arrow" />
                  <span>Prev</span>
                </router-link>
                <div class="block"># {{ blockDetail.meta.no }}</div>
                <router-link :to="`/block/${blockDetail.meta.no + 1}/`">
                  <span>Next</span>
                  <img src="~@assets/img/ic-next@3x.png" class="arrow" />
                </router-link>
              </div>
            </div>
            <div class="detail-box">
              <div class="table-wrap">
                <div class="error show" v-if="error">
                  {{ error }}
                </div>
                <table
                  class="block-detail"
                  :class="!blockDetail && !error && 'loading'"
                >
                  <tbody>
                    <tr class="hidden loading" v-if="!blockDetail && !error">
                      <td colspan="100%">Loading...</td>
                    </tr>
                    <!--                  <tr class="hidden not-found">-->
                    <!--                    <td colspan="100%">No items found</td>-->
                    <!--                  </tr>-->
                    <template v-if="blockDetail">
                      <tr>
                        <th>
                          <div>Time</div>
                        </th>
                        <td>
                          <div>
                            {{
                              moment(blockDetail.meta.ts).format(
                                'dddd, MMMM Do YYYY, HH:mm:ss'
                              )
                            }}
                            ({{ moment(blockDetail.meta.ts).fromNow() }})
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Hash</div>
                        </th>
                        <td>
                          <div>
                            <router-link
                              class="hash-block"
                              :to="`/block/${blockDetail.hash}/`"
                              >{{ blockDetail.hash }}
                            </router-link>
                            <copy-link-button :message="blockDetail.hash" />
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Previous Block</div>
                        </th>
                        <td>
                          <div v-if="blockDetail.meta.previous_block">
                            <router-link
                              class="prev-block"
                              :to="`/block/${blockDetail.meta.previous_block}/`"
                            >
                              {{ blockDetail.meta.previous_block }}
                            </router-link>
                            <copy-link-button
                              :message="blockDetail.meta.previous_block"
                            />
                          </div>
                          <div v-else>
                            <span class="prev-block">(none)</span>
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Total TXs</div>
                        </th>
                        <td>
                          <div>
                            {{ blockDetail.meta.txs | formatNumber('&#8239;') }}
                            TXs
                          </div>
                        </td>
                      </tr>
                      <tr>
                        <th>
                          <div>Block Size</div>
                        </th>
                        <td>
                          <div>
                            {{
                              blockDetail.meta.size | formatNumber('&#8239;')
                            }}
                            bytes
                          </div>
                        </td>
                      </tr>
                    </template>
                  </tbody>
                </table>
              </div>
              <div class="table-wrap">
                <div class="error" v-if="error">
                  {{ error }}
                </div>
                <table
                  class="block-detail"
                  :class="!blockDetail && !error && 'loading'"
                >
                  <tbody>
                    <tr class="hidden loading" v-if="!blockDetail && !error">
                      <td colspan="100%">Loading...</td>
                    </tr>
                    <!--                  <tr class="hidden not-found">-->
                    <!--                    <td colspan="100%">No items found</td>-->
                    <!--                  </tr>-->
                    <template v-if="blockDetail">
                      <tr v-if="blockDetail.meta.no">
                        <th>
                          <div>Block Producer</div>
                        </th>
                        <td>
                          <div v-if="blockDetail.meta.block_producer">
                            <router-link
                              class="hash-block"
                              :to="`/votes/?highlight=${blockDetail.meta.block_producer}`"
                            >
                              <Identicon
                                :text="blockDetail.meta.block_producer"
                                size="17"
                                class="mini-identicon"
                              />
                              {{ blockDetail.meta.block_producer }}
                            </router-link>
                            <copy-link-button
                              :message="blockDetail.meta.block_producer"
                            />
                          </div>
                          <div v-else>
                            <a class="hash-block">
                              <Identicon
                                :text="'Unknown'"
                                size="18"
                                class="mini-identicon"
                              />
                              Unknown
                            </a>
                          </div>
                        </td>
                      </tr>
                      <tr v-if="blockDetail.meta.no">
                        <th>
                          <div>Coinbase Account</div>
                        </th>
                        <td>
                          <div v-if="blockDetail.meta.coinbase.toString()">
                            <router-link
                              class="prev-block"
                              :to="`/account/${blockDetail.meta.coinbase}/`"
                            >
                              <Identicon
                                :text="blockDetail.meta.coinbase"
                                size="17"
                                class="mini-identicon"
                              />
                              {{ blockDetail.meta.coinbase.toString() }}
                            </router-link>
                            <copy-link-button
                              :message="blockDetail.meta.coinbase.toString()"
                            />
                          </div>
                          <div v-else>
                            <Identicon
                              :text="'None'"
                              size="18"
                              class="mini-identicon"
                            />
                            None
                          </div>
                        </td>
                      </tr>
                      <template v-if="blockDetail.meta.reward_account">
                        <tr>
                          <th>
                            <div>Block Reward</div>
                          </th>
                          <td>
                            <div>
                              {{ blockDetail.meta.reward_amount.toString() }}
                            </div>
                          </td>
                        </tr>
                        <tr>
                          <th>
                            <div>Reward Account</div>
                          </th>
                          <td>
                            <div>
                              <router-link
                                class="prev-block txt-ellipsis"
                                :to="`/account/${blockDetail.meta.reward_account}/`"
                              >
                                <Identicon
                                  :text="blockDetail.meta.reward_account"
                                  size="17"
                                  class="mini-identicon"
                                />
                                {{ blockDetail.meta.reward_account.toString() }}
                              </router-link>
                              <CopyLinkButton
                                :message="
                                  blockDetail.meta.reward_account.toString()
                                "
                              />
                            </div>
                          </td>
                        </tr>
                      </template>
                      <template v-else>
                        <tr>
                          <th>
                            <div>Block Reward</div>
                          </th>
                          <td>
                            <div>None</div>
                          </td>
                        </tr>
                      </template>
                    </template>
                  </tbody>
                </table>
              </div>
            </div>
            <block-tx-table :blockno="blockDetail.meta.no" v-if="blockDetail" />
          </div>
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

<script>
import Search from '@/src/vue/components/Search'
import BlockTxTable from '@/src/vue/components/BlockTxTable'
import Identicon from '@/src/vue/components/Identicon'
import cfg from '@/src/config.js'
import moment from 'moment'

export default {
  data() {
    return {
      isLoading: false,
      blockDetail: null,
      error: null,
    }
  },
  mounted() {
    this.getBlock()
  },
  created() {},
  beforeDestroy() {},
  watch: {
    $route(to, from) {
      this.getBlock()
    },
  },
  computed: {
    hasPrevious() {
      return this.blockDetail.meta.no > 0
    },
  },

  methods: {
    async getBlock() {
      function isNumeric(input) {
        return /^[0-9]+$/.test(input) // 숫자인지 여부를 판별하는 정규표현식
      }
      const blockNoOrHash = this.$route.params.blockNoOrHash
      const isBlockNo = isNumeric(blockNoOrHash)
      const getBlockApiAddress = isBlockNo
        ? `${cfg.API_URL}/blocks?q=no:${blockNoOrHash}`
        : `${cfg.API_URL}/blocks?q=_id:${blockNoOrHash}`
      this.blockDetail = null
      this.error = ''
      try {
        const response = await (
          await this.$fetch.get(getBlockApiAddress)
        ).json()
        console.log(response, 'response')
        this.blockDetail = response.hits[0]
      } catch (error) {
        this.error = '' + error
        console.error(error)
      }
    },
    moment,
  },
  components: {
    BlockTxTable,
    Search,
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

  .title {
    &.block-detail {
      display: flex;
      justify-content: space-between;
    }
  }

  .arrow {
    display: flex;
  }
}

.detail-box {
  display: flex;
  margin: 0 -7.5px;
  margin-bottom: 15px;

  @media screen and (max-width: 900px) {
    flex-wrap: wrap;
  }

  .h-scroll {
    height: 100%;
  }

  .table-wrap {
    width: calc(50% - 7.5px);
    padding: 10px 19px 10px 20px;
    margin: 0 7.5px;

    @media screen and (max-width: 900px) {
      width: 100%;

      &:first-child {
        margin-bottom: 15px;
      }
    }
  }
}

table.block-detail {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0 20px;
  line-height: 20px;

  th {
    width: 126px;
    height: auto;
    font-size: 14px;
    color: #a391aa;
    border-bottom: none;
    vertical-align: top;

    @media screen and (max-width: 900px) {
      padding-right: 20px;
    }

    @media screen and (max-width: 480px) {
      font-size: 15px;
    }

    > div {
      align-items: start;
    }
  }

  td {
    height: auto;
    font-size: 14px;
    border-bottom: none;
    vertical-align: top;

    @media screen and (max-width: 480px) {
      font-size: 15px;
    }

    > div {
      align-items: start;
      white-space: wrap;
      min-width: 160px;
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

    .hash-block,
    .prev-block {
      font-size: 13px;
      word-break: break-all;

      &:hover {
        /*font-weight: bold;*/
        text-shadow: 0px 0px 0px #3c3b3e;
        color: #3c3b3e;
        text-decoration: underline;
      }
    }

    //.icon.copy {
    //  margin-left: 5px;
    //
    //  @media screen and (max-width: 480px) {
    //    svg {
    //      width: 24px;
    //      height: 24px;
    //    }
    //  }
    //}
  }
}
.arrow-box {
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 14px;
  font-weight: bold;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.71;
  letter-spacing: normal;
  color: #5d5960;
  .block {
    text-align: center;
    width: 150px;
    height: 40px;
    margin: 0px 10px;
  }
  a {
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    span {
      margin: 0px 6px;
    }
    img {
      width: 24px;
      height: 24px;
    }
  }
}
</style>
