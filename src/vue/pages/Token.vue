<template>
  <div class="wrap">
    <div id="category" class="token-details">
      <Header/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search/>
            <div class="title">
              Token
              <span class="sub-2">ARC-1</span>
              <span class="identicon"></span>
              <span class="sub-3" v-if="txMeta">{{ txMeta.name }}</span>
            </div>
            <div class="detail-box">
              <div class="table-wrap">
                <div class="error" v-if="error">
                  {{ error }}
                </div>
                <table class="token-detail" :class="(!txMeta && !error) && 'loading'">
                  <tbody>
                  <tr class="hidden loading" v-if="(!txMeta && !error)">
                    <td colspan="100%">Loading...</td>
                  </tr>
                  <!--                  <tr class="hidden not-found">-->
                  <!--                    <td colspan="100%">No items found</td>-->
                  <!--                  </tr>-->
                  <template v-if="txMeta">
                    <tr>
                      <th>
                        <div>Name</div>
                      </th>
                      <td>
                        <div>{{ txMeta.name }}</div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div>Symbol</div>
                      </th>
                      <td>
                        <div>{{ txMeta.symbol }}</div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div>Created in transaction</div>
                      </th>
                      <td>
                        <div>
                          <router-link class="hash-block" :to="`/transaction/${txMeta.tx_id}/`">
                            {{ txMeta.tx_id }}
                          </router-link>
                          <copy-link-button :message="txMeta.tx_id"/>
                        </div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div>Contract address</div>
                      </th>
                      <td>
                        <div v-if="$route.params.hash">
                          <router-link class="prev-block" :to="`/account/${$route.params.hash}/`">
                            <Identicon :text="$route.params.hash" size="17" class="mini-identicon"/>
                            {{ $route.params.hash }}
                          </router-link>
                          <copy-link-button :message="$route.params.hash"/>
                        </div>
                      </td>
                    </tr>
                  </template>
                  </tbody>
                </table>
              </div>
              <div class="table-wrap">
                <div class="error detail-2" v-if="error">
                  {{ error }}
                </div>
                <table class="token-detail detail-2" :class="(!txMeta && !error) && 'loading'">
                  <tbody>
                  <tr class="hidden loading" v-if="(!txMeta && !error)">
                    <td colspan="100%">Loading...</td>
                  </tr>
                  <!--                  <tr class="hidden not-found">-->
                  <!--                    <td colspan="100%">No items found</td>-->
                  <!--                  </tr>-->
                  <template v-if="txMeta">
                    <tr>
                      <th>
                        <div>Total Supply</div>
                      </th>
                      <td>
                        <div v-html="$options.filters.formatBigNumAmount(txMeta.supply, true, 6, txMeta.decimals)"></div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div>Total Transfers</div>
                      </th>
                      <td>
                        <div>{{ txMeta.total_transfer }} Transfers</div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div>Decimals</div>
                      </th>
                      <td>
                        <div>{{ txMeta.decimals }}</div>
                      </td>
                    </tr>
                    <tr>
                      <th>
                        <div>Official Site</div>
                      </th>
                      <td>
                        <div><a :href="txMeta.url" target="_blank">{{ txMeta.url }}</a></div>
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
                      <router-link class="title token-transfers router-link-exact-active"
                         :to="{ query: { ...$route.query, tx: 'token' } }" replace v-if="!$route.query.tx">
                        <span class="main">Token Transfers</span><span class="sub">{{ tokenTxTotalItems }}</span>
                      </router-link>
                      <router-link class="title token-transfers"
                                   :to="{ query: { ...$route.query, tx: 'token' } }" replace v-else>
                        <span class="main">Token Transfers</span><span class="sub">{{ tokenTxTotalItems }}</span>
                      </router-link>
                      <router-link class="title holders" :to="{ query: { ...$route.query, tx: 'holder' } }" replace>
                        <span class="main">Holders</span><span class="sub">{{ holderTotalItems }}</span>
                      </router-link>
                    </div>
                  </div>
                </div>
                <div class="table-tab-content"  v-if="$route.params.hash">
                  <token-transfer-table :hash="$route.params.hash" :active="!$route.query.tx || $route.query.tx === 'token'"
                                           @onUpdateTotalCount="updateTokenTxTotalCount"/>
                  <token-holder-table :hash="$route.params.hash" :active="$route.query.tx === 'holder'" :total-supply="txMeta.supply" :total-decimals="txMeta.decimals"
                                         @onUpdateTotalCount="updateHolderTotalCount"  v-if="txMeta.supply"/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  </div>
</template>

<script>
import cfg from '@/src/config.js';
import Search from '@/src/vue/components/Search';
import Identicon from '@/src/vue/components/Identicon';
import TokenTransferTable from '@/src/vue/components/TokenTransferTable';
import TokenHolderTable from '@/src/vue/components/TokenHolderTable';

export default {
  data() {
    return {
      error: null,
      txMeta: {},
      tokenTxTotalItems: 0,
      holderTotalItems: 0,
    }
  },
  created() {
  },
  beforeDestroy() {
  },
  watch: {
    '$route'(to, from) {
      this.load();
    },
  },
  mounted() {
    this.load();
  },
  computed: {
  },
  methods: {
    query(newQuery) {
      return {...this.$route.query, ...newQuery};
    },
    async load() {
      this.error = null;
      let hash = this.$route.params.hash;
      (async () => {
        const response = await (await this.$fetch.get(`${cfg.API_URL}/token`, {q: `_id:${hash}`})).json();
        if (response.hits.length) {
          this.txMeta = response.hits[0].meta;
        }
      })();

    },
    updateTokenTxTotalCount(count) {
      this.tokenTxTotalItems = count
    },
    updateHolderTotalCount(count) {
      this.holderTotalItems = count
    },
  },
  components: {
    Search,
    Identicon,
    TokenHolderTable,
    TokenTransferTable
  }
};
</script>

<style lang="scss" scoped>
.category-inner {
  > .page-wrap {
    padding-bottom: 30px;

    @media screen and (max-width: 780px) {
      padding-top: 20px;
    }
  }

  .page-content > .title {
    display: flex;
    align-items: center;

    .identicon {
      display: inline-block;
      width: 18px;
      height: 18px;
      flex: 18px 0 0;
      margin-left: 20px;

      @media screen and (max-width: 480px) {
        margin-left: 54px;
      }
    }

    .sub-2 {
      padding: 2px 5px;
      margin-left: 10px;
      margin-top: 4px;
      font-size: 8px;
      color: #fff;
      border-radius: 2px;
      background-color: #2c2938;
      white-space: nowrap;
    }

    .sub-3 {
      margin-left: 7px;
      font-size: 20px;
      font-weight: bold;
      color: #959295;
    }
  }
}

.detail-box {
  display: flex;
  margin: 0 -7.5px;
  margin-bottom: 15px;

  @media screen and (max-width: 780px) {
    flex-wrap: wrap;
  }

  .h-scroll {
    height: 100%;
  }

  .table-wrap {
    width: calc(50% - 7.5px);
    padding: 10px 19px 10px 20px;
    margin: 0 7.5px;

    @media screen and (max-width: 780px) {
      width: 100%;

      &:first-child {
        margin-bottom: 15px;
      }
    }
  }
}

table.token-detail {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0 20px;
  line-height: 20px;

  th {
    width: 155px;
    height: auto;
    font-size: 14px;
    color: #a391aa;
    border-bottom: none;
    vertical-align: top;

    @media screen and (max-width: 900px) {
      width: 125px;
    }

    @media screen and (max-width: 780px) {
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
    }

    .identicon {
      display: inline-block;
      width: 18px;
      height: 18px;
      flex: 18px 0 0;
      margin-top: -3px;
      margin-right: 3px;
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

    a {
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
</style>
