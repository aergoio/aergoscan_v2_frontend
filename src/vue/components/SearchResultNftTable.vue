<template>
  <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
    <template slot="desc">
      <div class="search-result">
        Showing result for : "{{ keyword }}" {{ totalItems }} Result(s)
      </div>
    </template>
    <template slot="error" v-if="error">
      <div class="error nfts show">
        {{ error }}
      </div>
    </template>
    <template slot="header" v-for="header in headers">
      <th>
        <div>{{ header.text }}</div>
      </th>
    </template>
    <template slot="list" slot-scope="{row}">
      <td>
        <div>
          <span class="identicon default" v-if="!row.image"></span>
          <span class="identicon" v-else><img :src="row.image"></span>
          <router-link class="block" v-html="row.selectedName" :to="`/nft/${row.hash}/`"></router-link>
        </div>
      </td>
      <td>
        <div v-html="row.selectedSymbol"></div>
      </td>
      <td>
        <div>
            <Identicon :text="row.hash" size="18" class="mini-identicon"/>
            <router-link :to="`/account/${row.hash}/`" class="address txt-ellipsis">
              {{ row.hash }}
            </router-link>
        </div>
      </td>
      <td>
        <div v-html="$options.filters.formatBigNumAmount(row.supply, 6, row.decimals)"></div>
      </td>
      <td>
        <div>{{ row.total_transfer }}</div>
      </td>
    </template>
    <template slot="more">
      <div class="btn-wrap">
        <button v-on:click="viewAllNfts($route.query.keyword)">More Nfts</button>
      </div>
    </template>
  </data-table>
</template>
<script>

import cfg from '@/src/config';
import moment from 'moment';
import AccountLink from '@/src/vue/components/AccountLink';
import Identicon from '@/src/vue/components/Identicon';

export default {
  name: 'SearchResultNftTable',
  props: {
    keyword: String,
    active: {
      type: Boolean,
      default: false,
    },
    initialPage: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 5
    },
    defaultSort: String,
    defaultSortDirection: String,
    sortField: {
      type: String,
      default: 'blockno'
    },
    sort: {
      type: String,
      default: 'desc'
    },
  },
  data() {
    return {
      error: '',
      data: [],
      totalItems: 0,
      isLoading: false,
      currentPage: this.initialPage,
      accountLinkCss: {
        wrapper: 'tooltipped tooltipped-se tooltipped-align-left-2',
        address: 'address txt-ellipsis',
        icon: 'mini-identicon'
      },
      sortedField: this.sortField,
      sortedDir: this.sort,
    }
  },
  created() {
  },
  beforeDestroy() {
  },
  computed: {
    headers() {
      return [
        {text: 'NAME', value: 'name'},
        {text: 'SYMBOL', value: 'symbol'},
        {text: 'CONTRACT ADDRESS', value: 'contractaddress'},
        {text: 'TOTAL SUPPLY', value: 'totalsupply'},
        {text: 'TOTAL TRANSFERS', value: 'totaltransfers'},
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'table-wrap' + (this.active ? ' active' : ''),
        table: "nfts-table" + (this.isLoading ? ' is-loading' : ''),
      };
    },
  },
  mounted() {
    if(this.keyword) {
      this.changePage(this.currentPage);
    }
  },
  methods: {
    loadNftTableData: async function ({keyword, sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/nft`,
          keyword.length > 0 ? {
            q: `(name:*${keyword}* OR symbol:*${keyword}*) AND type:ARC2`,
            search:keyword,
            range:'ALL',
            size: itemsPerPage,
            from: start,
            sort: `${sortField}:${sort}`,
          } : {
            q:`type:ARC2`,
            range:'ALL',
            size: itemsPerPage,
            from: start,
            sort: `${sortField}:${sort}`,
          }
      )).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map(item => ({
          ...item.meta,
          hash: item.hash,
          selectedName:this.$options.filters.changeStringByKeyword(item.meta.name, keyword, `<span class="selection">${keyword}</span>`),
          selectedSymbol:this.$options.filters.changeStringByKeyword(item.meta.symbol, keyword, `<span class="selection">${keyword}</span>`),
        }));
        this.totalItems = response.total;
      } else {
        this.data = [];
        this.totalItems = 0;
      }
      this.$emit('onUpdateTotalCount', this.totalItems);
    },
    reload: async function (keyword) {
      this.isLoading = true;
      await this.loadNftTableData({
        keyword: keyword ? keyword : this.keyword,
        sortField: this.sortedField,
        sort: this.sortedDir,
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      });
      this.isLoading = false;
    },
    changePage: function (currentPage) {
      this.currentPage = currentPage;
      this.reload();
    },
    updateCurrentPage: function (currentPage) {
      this.currentPage = currentPage;
    },
    viewAllNfts(keyword) {
      keyword && keyword.length > 0 ? this.$router.push({path:'/nfts', query: {keyword: keyword}}) : this.$router.push('/nfts');
    },
    moment,
  },
  components: {
    AccountLink,
    Identicon
  }
};
</script>

<style lang="scss" scoped>
table.nfts-table {
  th {
    &:last-child {
      text-align: right;

      >div {
        justify-content: end;
      }
    }
  }

  td {
    &:last-child {
      text-align: right;

      > div {
        justify-content: end;
      }
    }

    > div .aergo:last-child {
      margin-left: 5px;
    }
  }

  tbody tr.hidden td {
    height: 84px;
    text-align: center !important;

    @media screen and (max-width: 780px) {
      height: 69px;
      text-align: left !important;
    }
  }
}
</style>
