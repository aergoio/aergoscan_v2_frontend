<template>
  <form v-on:submit.prevent.capture="performSearch">
    <div :class="['search-bar', css.page]">
      <input type="text" v-model="query" placeholder="Search for Address / Tx ID / Block / Token / NFT / Symbol"
             v-on:keyup.enter.stop="performSearch"
             ref="inputKeyword">
      <div class="btn-remove" v-on:click="deleteKeyword"></div>
      <div class="btn-search" v-on:click="performSearch">
        <template v-if="css.page === 'main'">
          <span class="text">SEARCH</span>
        </template>
        <span class="icon search"></span>
      </div>
    </div>
  </form>
</template>

<script>
import "./../../assets/style/components/search-bar.scss";
import cfg from '@/src/config';
import {timedAsync} from 'timed-async';
import {Address} from '@herajs/client';

export default {
  name: 'Search',
  props: {
    searchField: {
      type: String,
      default: ''
    },
    css: {
      type: Object,
      default: () => ({
        page: '',
      })
    },
  },
  data() {
    return {
      query: this.searchField,
      predictedType: null,
      predictedString: '',
      debounceSearch: null,
      blockDetail: null,
      error: null
    }
  },
  created() {
  },
  beforeDestroy() {
  },
  computed: {},
  methods: {
    async querySearch(query) {
      try {
        const response = await this.$fetch.get(`${cfg.API_URL}/search`, {q: query});
        const result = await response.json();
        this.predictedType = '';
        if (result.blocks.length) {
          this.predictedType = 'blockhash';
          this.predictedString = result.blocks[0].hash;
        } else if (result.transactions.length) {
          this.predictedType = 'txhash';
          this.predictedString = result.transactions[0].hash;
        } else {
          this.predictedType = 'searchNotFound';
          this.predictedString = this.query;
        }
      } catch (e) {
        console.error('Failed to connect to search API: ' + e);
      }
    },
    async queryBlockDetails(blockNo) {
      this.blockDetail = null;
      this.error = '';
      try {
        this.blockDetail = await timedAsync(this.$store.dispatch('blockchain/fetchBlockMetadata', {blockNoOrHash: blockNo}));
      } catch (error) {
        this.error = '' + error;
        // console.error(error);
      }
      if (this.blockDetail && this.blockDetail.header.blockno) {
        this.predictedType = 'blockno';
        this.predictedString = '' + parseInt(this.blockDetail.header.blockno);
      } else {
        this.predictedType = 'searchNotFound';
        this.predictedString = this.query;
      }
    },
    gotoBlock(numberOrHash) {
      this.$router.push({path: `/block/${numberOrHash}`, query: {keyword: numberOrHash}}).catch(() => {
      });
      this.predictedType = '';
      this.query = '';
    },
    gotoAccount(address) {
      this.$router.push({path: `/account/${address}`, query: {keyword: address}}).catch(() => {
      });
      this.predictedType = '';
      this.query = '';
    },
    gotoTransaction(hash) {
      this.$router.push({path: `/transaction/${hash}`, query: {keyword: hash}}).catch(() => {
      });
      this.predictedType = '';
      this.query = '';
    },
    gotoSearch(keyword) {
      this.$router.push({path: `/search/`, query: {keyword: keyword, found: 'yes'}}).catch(() => {
      });
      this.predictedType = '';
      this.query = '';
    },
    gotoNotFoundResult(keyword) {
      this.$router.push({path: `/search/`, query: {keyword: keyword, found: 'no'}}).catch(() => {
      });
      this.predictedType = '';
      this.query = '';
    },

    async performSearch() {
      this.predictedType = '';
      if ('' + parseInt(this.query) === this.query) {
        await this.queryBlockDetails(parseInt(this.query))
      } else if (this.query.length <= 15 && this.query.length >= 3) {
        this.predictedType = 'searchResult';
        this.predictedString = this.query;
      } else if (this.query.length <= 2) {
        this.predictedType = 'searchNotFound';
        this.predictedString = this.query;
      } else if (this.query.length > 15) {
        try {
          // Try as address
          new Address(this.query);
          this.predictedType = 'address';
          this.predictedString = this.query;
        } catch (e) {
          // 주소 형식이 아닌경우 api검사
          this.debounceSearch = setTimeout(async () => {
            await this.querySearch(this.query)
                .then(() => {
                  this.gotoNextPage(this.predictedType, this.predictedString);
                })
                .finally(() => {
                      if (this.debounceSearch) {
                        clearTimeout(this.debounceSearch);
                      }
                    }
                );
          }, 250);
        }
      }

      if (!this.predictedType) {
        return;
      }

      this.gotoNextPage(this.predictedType, this.predictedString);

      if (this.$refs.inputKeyword) {
        this.$refs.inputKeyword.blur();
      }
    },
    deleteKeyword() {
      this.predictedType = '';
      this.query = '';
    },
    gotoNextPage(type, predictedString) {
      if (type === 'blockno' || type === 'blockhash') {
        this.gotoBlock(predictedString);
      }
      if (type === 'address') {
        this.gotoAccount(predictedString);
      }
      if (type === 'txhash') {
        this.gotoTransaction(predictedString);
      }
      if (type === 'searchNotFound') {
        this.gotoNotFoundResult(predictedString);
      }
      if (type === 'searchResult') {
        this.gotoSearch(predictedString);
      }
    },
  },
  components: {}
};
</script>

<style lang="scss" scoped>
</style>
