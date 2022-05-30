<template>
  <div class="wrap">
    <div id="category" class="bp-list">
      <Header/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search/>
            <div class="title">Chain Info</div>
            <div class="detail-box">
              <div class="table-wrap">
                <div class="error" v-if="error">
                  {{ error }}
                </div>
                <table class="bp-detail" v-if="!error && chainInfo && chainInfo.chainid">
                  <tbody>
                  <!--                  <tr class="hidden loading">-->
                  <!--                    <td colspan="100%">Loading...</td>-->
                  <!--                  </tr>-->
                  <!--                  <tr class="hidden not-found">-->
                  <!--                    <td colspan="100%">No items found</td>-->
                  <!--                  </tr>-->
                  <tr>
                    <th>
                      <div>Chain ID</div>
                    </th>
                    <td>
                      <div class="chain-id">{{ chainInfo.chainid.magic }} ({{ chainInfo.chainid.public ? 'public' : 'private' }},
                        {{ chainInfo.chainid.mainnet ? 'main' : 'non-main' }})
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <div>Maximum block size</div>
                    </th>
                    <td>
                      <div>{{ chainInfo.maxblocksize }}</div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <div>Total token supply</div>
                    </th>
                    <td>
                      <div v-html="$options.filters.formatToken(chainInfo.maxtokens, 'aergo')"></div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <div>Consensus</div>
                    </th>
                    <td>
                      <div>{{ chainInfo.chainid.consensus }}</div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <div>BP number</div>
                    </th>
                    <td>
                      <div>{{ bpNumber }}</div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <div class="table-wrap">
                <div class="error" v-if="error">
                  {{ error }}
                </div>
                <table class="bp-detail" v-if="!error && chainInfo && chainInfo.chainid">
                  <tbody>
                  <!--                  <tr class="hidden loading">-->
                  <!--                    <td colspan="100%">Loading...</td>-->
                  <!--                  </tr>-->
                  <!--                  <tr class="hidden not-found">-->
                  <!--                    <td colspan="100%">No items found</td>-->
                  <!--                  </tr>-->
                  <tr>
                    <th>
                      <div>Min. staking amount</div>
                    </th>
                    <td>
                      <div v-html="$options.filters.formatToken(chainInfo.stakingminimum, 'aergo')"></div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <div>Total staked amount</div>
                    </th>
                    <td class="txt-ellipsis">
                      <div v-html="$options.filters.formatToken(chainInfo.stakingtotal, 'aergo')"></div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <div>Nameprice</div>
                    </th>
                    <td>
                      <div v-html="$options.filters.formatToken(chainInfo.nameprice, 'aergo')"></div>
                    </td>
                  </tr>
                  <tr>
                    <th>
                      <div>Gasprice</div>
                    </th>
                    <td>
                      <div v-html="$options.filters.formatToken(chainInfo.gasprice, 'aer')"></div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="table-wrap" v-if="chainInfo.chainid && chainInfo.chainid.consensus == 'dpos'">
              <div class="title">BP List
                <div class="btn-refresh">
                  <ReloadButton :action="loadVotes"/>
                </div>
              </div>
              <!--              <div class="error bp-list">-->
              <!--                에러메시지 영역입니다.-->
              <!--              </div>-->
              <div class="h-scroll">
                <table class="bp-list-table main-net" :class="(!votesList || !votesList.length) ? 'loading' : ''">
                  <thead>
                  <tr>
                    <th>
                      <div>POS.</div>
                    </th>
                    <th>
                      <div>PEER ID</div>
                    </th>
                    <th>
                      <div>VOTES</div>
                    </th>
                  </tr>
                  </thead>
                  <tbody v-if="votesList && votesList.length">
                  <!--                  <tr class="hidden loading">-->
                  <!--                    <td colspan="100%">Loading...</td>-->
                  <!--                  </tr>-->
                  <!--                  <tr class="hidden not-found">-->
                  <!--                    <td colspan="100%">No items found</td>-->
                  <!--                  </tr>-->
                  <tr v-for="(item, index) in votesList" :key="item.candidate"
                      :class="{focus: $route.query.highlight === item.candidate, 'last-selected': bpNumber && bpNumber === (index+1)}" :tabindex="$route.query.highlight === item.candidate && index">
                    <td>{{ index + 1 }}</td>
                    <td>
                      <div>
                        <Identicon :text="item.candidate" size="18" class="mini-identicon"/>
                        {{ item.candidate }}
                      </div>
                    </td>
                    <td>
                      <div>
                        {{ item.amount.toUnit('aergo').toString() }}
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <div class="table-wrap" v-if="chainInfo.chainid && chainInfo.chainid.consensus == 'raft'">
              <div class="title">BP List
                <div class="btn-refresh">
                  <ReloadButton :action="loadConsensus"/>
                </div>
              </div>
              <!--              <div class="error bp-list">-->
              <!--                에러메시지 영역입니다.-->
              <!--              </div>-->
              <div class="h-scroll">
                <table class="bp-list-table" :class="!consensusInfo ? 'loading' : ''">
                  <thead>
                  <tr>
                    <th>
                      <div>POS.</div>
                    </th>
                    <th>
                      <div>NAME</div>
                    </th>
                    <th>
                      <div>RAFT ID</div>
                    </th>
                    <th>
                      <div>PEER ID</div>
                    </th>
                    <th>
                      <div>STATUS</div>
                    </th>
                  </tr>
                  </thead>
                  <tbody v-if="consensusInfo && consensusInfo.bpsList.length">
                  <!--                  <tr class="hidden loading">-->
                  <!--                    <td colspan="100%">Loading...</td>-->
                  <!--                  </tr>-->
                  <!--                  <tr class="hidden not-found">-->
                  <!--                    <td colspan="100%">No items found</td>-->
                  <!--                  </tr>-->
                  <tr v-for="(item, index) in consensusInfo.bpsList" :key="item.PeerID"
                      :class="{'focus': $route.query.highlight === item.PeerID, 'last-selected': bpNumber && bpNumber === (index+1)}">
                    <td>
                      <div>{{ index + 1 }}</div>
                    </td>
                    <td>
                      <div>{{ item.Name }}</div>
                    </td>
                    <td>
                      <div>{{ item.RaftID }}</div>
                    </td>
                    <td>
                      <div>
                        <Identicon :text="item.PeerID" size="18" class="mini-identicon"/>
                        {{ item.PeerID }}
                      </div>
                    </td>
                    <td>
                      <div>
                        <span class="boxicon gray" v-if="item.Name == consensusInfo.info.Leader">Leader</span>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
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
import Search from '@/src/vue/components/Search';
import ReloadButton from '@/src/vue/components/ReloadButton';
import moment from 'moment';
import Identicon from '@/src/vue/components/Identicon';
import {mapState} from 'vuex'

export default {
  data() {
    return {
      votesList: [],
      consensusInfo: null,
      error: null,
    }
  },
  created() {
  },
  watch: {
    '$route'(to, from) {
      this.load();
    }
  },
  mounted() {
    this.load();
  },
  beforeDestroy() {
  },
  computed: {
    ...mapState({
      chainInfo: state => state.blockchain.chainInfo
    }),
    bpNumber() {
      if (this.consensusInfo && this.consensusInfo.info && this.consensusInfo.info.Total) {
        return Number(this.consensusInfo.info.Total);
      }
      if (this.chainInfo && this.chainInfo.bpnumber) {
        return this.chainInfo.bpnumber;
      }
      return 0;
    }
  },
  methods: {
    async loadConsensus() {
      this.consensusInfo = null;
      this.consensusInfo = await this.$store.dispatch('blockchain/getConsensusInfo');
    },
    async loadVotes() {
      try {
        this.votesList = [];
        const votesList = await this.$store.dispatch('blockchain/getTopVotes', {count: 50});
        for (let vote of votesList) {
          vote.amount = vote.amount;
        }
        this.votesList = votesList;
      } catch (e) {
        console.error(e);
      }
    },
    async load() {
      await this.loadVotes();
      await this.loadConsensus();
    },
    moment,
  },
  components: {
    Search,
    ReloadButton,
    Identicon,
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
}

.table-wrap {
  padding: 20px 19px 50px 20px;

  > .title {
    display: flex;
    align-items: center;

    .btn-refresh {
      display: flex;
      align-items: center;
      margin-left: 8px;
      cursor: pointer;
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

table.bp-detail {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0 20px;

  th {
    width: 150px;
    height: auto;
    font-size: 14px;
    color: #a391aa;
    border-bottom: none;
    vertical-align: top;

    @media screen and (max-width: 780px) {
      padding-right: 20px;
    }

    @media screen and (max-width: 480px) {
      font-size: 15px;
    }

    > div {
      align-items: start;

      &.chain-id {
        word-break: break-all;
      }
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
      margin-right: 8px;
      vertical-align: middle;
    }

    .hash-block,
    .prev-block {
      font-size: 13px;
      word-break: break-all;

      &:hover {
        font-weight: bold;
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
table.bp-list-table {
  &.main-net {
    th {
      &:last-child {
        padding-right: 30px;
        text-align: right;

        > div {
          justify-content: end;
        }
      }
    }

    td {
      &:last-child {
        padding-right: 30px;
        text-align: right;

        > div {
          justify-content: end;
        }
      }
    }
  }

  tbody tr {
    &.focus {
      background-color: #f1ecf8;
    }
  }

  th {
    &:first-child {
      padding-left: 10px;
    }
  }

  td {
    &:first-child {
      padding-left: 10px;
    }

    &:nth-child(4) {
      .block {
        font-weight: bold;
      }
    }

    .boxicon {
      &.gray {
        padding: 0 7px;
        font-size: 11px;
        font-weight: normal;
        line-height: 22px;
        border-radius: 11px;
        background-color: #d0c9d6;
      }
    }
  }
}
</style>
