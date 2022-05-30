<template>
  <div class="wrap">
    <div id="category" class="main">
      <Header :css="mainCss"/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search :css="mainCss" :search-field="$route.query.keyword"/>
            <div class="summary">
              <div class="latest-block">
                <div class="title">Latest Block</div>
                <div class="content">
                  <span class="icon"><img src="~@assets/img/ic-latest-block@3x.png"></span>
                  <span class="text">
                    <router-link :to="`/block/${reverseBlocks[0].hash}/`" v-if="reverseBlocks.length">{{reverseBlocks[0].header.blockno | formatNumber('&#8239;')}}</router-link>
                    <a href="javascript:;" v-else>.</a>
                  </span>
                </div>
              </div>
              <div class="group">
                <!-- total tx -->
                <div class="total-tx">
                  <div class="title">Total TX</div>
                  <div class="content">
                    <span class="text" v-if="txTotal">{{ txTotal | formatNumber('&#8239;') }}</span>
                    <span class="text" v-else>.</span>
                  </div>
                </div>
                <!-- tpm -->
                <div class="tpm tooltipped tooltipped-se tooltipped-align-left-2"
                     aria-label="Transactions in the last minute">
                  <div class="title">TPM (Now)</div>
                  <div class="content">
                    <span class="text" v-if="maxTpm">{{ maxTpm.meta.txs | formatNumber('&#8239;') }}</span>
                    <span class="text" v-else>.</span>
                  </div>
                </div>
                <!-- tps -->
                <router-link class="tps tooltipped tooltipped-se tooltipped-align-left-2" :to="`/block/${maxTps.hash}/`"
                   aria-label="Peak transaction number. Click to go to block" v-if="maxTps">
                  <div class="title">TPS (Peak)</div>
                  <div class="content">
                    <span class="text">{{ maxTps.meta.txs | formatNumber('&#8239;') }}</span>
                  </div>
                </router-link>
                <a class="tps tooltipped tooltipped-se tooltipped-align-left-2"
                             aria-label="Peak transaction number. Click to go to block" href="javascript:;" v-else>
                  <div class="title">TPS (Peak)</div>
                  <div class="content">
                    <span class="text">.</span>
                  </div>
                </a>
                <!-- bp list -->
                <router-link class="bpn tooltipped tooltipped-se tooltipped-align-left-2" :to="`/consensus/`" v-if="consensusInfo"
                   aria-label="Number of block producers. Click to go to list">
                  <div class="title">BP Number</div>
                  <div class="content">
                    <span class="text">{{bpNumber}}</span>
                  </div>
                </router-link>
                <a class="bpn tooltipped tooltipped-se tooltipped-align-left-2"
                             aria-label="Number of block producers. Click to go to list" href="javascript:;" v-else>
                  <div class="title">BP Number</div>
                  <div class="content">
                    <span class="text">.</span>
                  </div>
                </a>
              </div>
              <!-- tx chart -->
              <tx-chart :data="txData" :unit="'day'"/>
            </div>
            <div class="table-group">
              <recent-blocks/>
              <recent-transactions/>
            </div>
          </div>
        </div>
      </div>
      <Footer :css="mainCss"/>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import {mapState, mapActions} from 'vuex'
import cfg from '@/src/config.js';
import RecentBlocks from '@/src/vue/components/RecentBlocks';
import RecentTransactions from '@/src/vue/components/RecentTransactions';
import TxChart from '@/src/vue/components/TxChart';
import Search from '@/src/vue/components/Search';

export default {
  data() {
    return {
      blockInfo: {},
      txStats: {},
      initialTxStats: {},
      initialStatsLoaded: false,
      realTimeStats: [],
      blockInfoTimeout: null,
      consensusInfo: null,
    }
  },
  created() {
  },
  mounted() {
    this.$store.dispatch('blockchain/streamBlocks');
    this.updateMainBlocks();
    this.updateStats();
  },
  beforeDestroy() {
    if (this.blockInfoTimeout) {
      clearTimeout(this.blockInfoTimeout);
    }
  },
  computed: {
    mainCss() {
      return {
        page: "main",
      };
    },
    ...mapState({
      blocks: state => state.blockchain.recentBlocks,
      chainInfo: state => state.blockchain.chainInfo
    }),
    reverseBlocks() {
      return this.blocks.slice().reverse();
    },
    maxTps() {
      return this.blockInfo.maxTps;
    },
    txTotal() {
      return typeof this.blockInfo.txTotal !== 'undefined' ? this.blockInfo.txTotal : false;
    },
    maxTpm() {
      return this.blockInfo.maxTpm;
    },
    bpNumber() {
      if (this.consensusInfo && this.consensusInfo.info && this.consensusInfo.info.Total) {
        return Number(this.consensusInfo.info.Total);
      }
      if (this.chainInfo && this.chainInfo.bpnumber) {
        return this.chainInfo.bpnumber;
      }
      return 0;
    },
    txData() {
      let source;
      const stats = this.txStats;
      let dbData = [];
      source = stats.txPerDay;
      if (source) {
        dbData = source.map(item => ({
          x: item.key,
          y: item.sum_txs.value
        }));
      }
      return dbData;
    }
  },
  methods: {
    viewBlock(blockNo) {
      this.$router.push(`/block/${blockNo}`);
    },
    async loadConsensus() {
      this.consensusInfo = Object.freeze(await this.$store.dispatch('blockchain/getConsensusInfo'));
    },
    async updateMainBlocks() {
      if (!this.consensusInfo) {
        this.loadConsensus();
      }
      try {
        const response = await this.$fetch.get(`${cfg.API_URL}/mainBlockInfo`);
        this.blockInfo = await response.json();
      } catch (e) {
        console.error('Failed to connect to stats API: ' + e);
      }
      this.blockInfoTimeout = setTimeout(() => {
        this.updateMainBlocks();
      }, 3000);
    },

    async updateStats() {
      try {
        const response = await this.$fetch.get(`${cfg.API_URL}/txHistory`);
        this.txStats = await response.json();
      } catch (e) {
        console.error('Failed to connect to stats API: ' + e);
      }
    },
    moment
  },
  components: {
    Search,
    RecentBlocks,
    RecentTransactions,
    TxChart,
  }
};
</script>

<style lang="scss" scoped>
#category {
  background-color: #1e1c2b;
  background-image: url("~@assets/img/bg-galaxy@3x.png");
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;

  @media screen and (max-width: 780px) {
    background-image: url("~@assets/img/bg-galaxy@3x-tablet.png");
  }

  @media screen and (max-width: 480px) {
    background-image: url("~@assets/img/mobile-main-bg@3x.png");
  }
}

.category-inner {
  > .page-wrap {
    padding-top: 66px;
    padding-bottom: 86px;

    @media screen and (max-width: 780px) {
      padding-top: 40px;
    }

    @media screen and (max-width: 480px) {
      padding-bottom: 52px;
    }
  }
}

::v-deep
.summary {
  display: flex;
  margin: 7.5px -7.5px 7.5px;

  @media screen and (max-width: 1200px) {
    flex-wrap: wrap;
  }

  @media screen and (max-width: 480px) {
    margin: 20px -5px 7px;
  }

  > div {
    padding: 20px;
    margin: 7.5px;
    border-radius: 5px;
    background-color: rgba(88, 86, 102, 0.2);

    @media screen and (max-width: 480px) {
      margin: 5px;
      padding: 10px;
    }

    .title {
      color: #fff;
      font-size: 14px;

      @media screen and (max-width: 480px) {
        font-size: 12px;
      }
    }

    .content {
      .text {
        font-weight: bold;
        color: #9d8ea9;
      }
    }
  }

  .latest-block {
    width: calc(26% - 15px);

    @media screen and (max-width: 1200px) {
      width: calc(50% - 7.5px);
    }

    @media screen and (max-width: 480px) {
      width: calc(50% - 5px);
    }

    @media screen and (max-width: 370px) {
      width: 100%
    }

    .content {
      display: flex;
      align-items: center;
      margin-top: 24px;

      @media screen and (max-width: 480px) {
        margin-top: 18px;
      }

      .icon {
        width: 76px;
        margin-right: 12px;

        @media screen and (max-width: 480px) {
          width: 32px;
          margin-right: 8px;
        }
      }

      .text {
        font-size: 24px;

        @media screen and (max-width: 480px) {
          font-size: 16px;
        }
      }
    }
  }

  .group {
    display: flex;
    flex-wrap: wrap;
    width: 37%;
    padding: 0;
    margin: 0;
    background-color: transparent;

    @media screen and (max-width: 1200px) {
      width: calc(50% - 7.5px);
    }

    @media screen and (max-width: 480px) {
      width: calc(50% - 5px);
    }

    @media screen and (max-width: 370px) {
      width: 100%
    }

    > * {
      width: calc(50% - 15px);
      text-align: center;
      padding: 20px;
      margin: 7.5px;
      border-radius: 5px;
      background-color: rgba(88, 86, 102, 0.2);

      @media screen and (max-width: 480px) {
        width: calc(50% - 10px);
        padding: 8px;
        margin: 5px;
        text-align: left;
      }
    }

    .content {
      margin-top: 5px;
      font-size: 20px;

      @media screen and (max-width: 480px) {
        margin-top: 2px;
        font-size: 12px;
      }
    }
  }
}

.table-group {
  display: flex;
  margin: 0 -7.5px;

  @media screen and (max-width: 1200px) {
    flex-wrap: wrap;
  }

  ::v-deep
  .h-scroll-main {
    @media screen and (max-width: 780px) {
      overflow-x: auto;
    }

    .h-scroll-main-inner {
      @media screen and (max-width: 390px) {
        min-width: 390px;
      }
    }
  }
}

</style>
