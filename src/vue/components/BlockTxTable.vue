<template>
  <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
    <template slot="title">
      <div class="title">Transactions<span class="sub">{{ totalItems }}</span></div>
    </template>
    <template slot="error" v-if="error">
      <div class="error transactions show">
        {{ error }}
      </div>
    </template>
    <template slot="header" v-for="header in headers">
      <th v-if="header.value === 'arrow'">
        <div><img src="~@assets/img/ic-arrow-pink@3x.png" class="arrow"></div>
      </th>
      <th v-else>
        <div>{{ header.text }}</div>
      </th>
    </template>
    <template slot="list" slot-scope="{row}">
      <td class="txt-ellipsis">
        <div>
          <router-link class="address txt-ellipsis" :to="`/transaction/${row.hash}/`">{{ row.hash }}</router-link>
        </div>
      </td>
      <td>
        <div>
          <router-link class="block" :to="`/block/${row.blockno}/`">{{ row.blockno }}</router-link>
        </div>
      </td>
      <td>
        <div class="tooltipped tooltipped-se tooltipped-align-left-2"
             :aria-label="moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')">{{ moment(row.ts).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
      </td>
      <td class="txt-ellipsis">
        <account-link
            :css="accountLinkCss"
            :to-link="`/account/${row.from}/`"
            :address="row.from.toString()"/>
      </td>
      <td>
        <div><img src="~@assets/img/ic-arrow-black@3x.png" class="arrow"></div>
      </td>
      <td class="txt-ellipsis">
        <account-link
            :css="accountLinkCss"
            :to-link="`/account/${row.to}/`"
            :address="row.to.toString()"/>
      </td>
      <td>
        <div v-html="$options.filters.formatBigNumAmount(row.amount)"></div>
      </td>
    </template>
    <pagination
        slot="pagination"
        :css="paginationCss"
        :page="currentPage"
        :total-items="limitPageTotalCount"
        :itemsPerPage="itemsPerPage"
        @onUpdate="changePage"
        @updateCurrentPage="updateCurrentPage"
    />
  </data-table>
</template>
<script>

import cfg from '@/src/config';
import moment from 'moment';
import AccountLink from '@/src/vue/components/AccountLink';

export default {
  name: 'BlockTxTable',
  props: {
    blockno: Number,
    initialPage: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 10
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
      limitPageTotalCount: 0,
      isLoading: false,
      currentPage: this.initialPage,
      paginationCss: {
        pagination: "pagination transactions-table",
        paginationInner: "pagination-inner",
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
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
        {text: 'TXHASH', value: 'hash'},
        {text: 'BLOCK #', value: 'blockno'},
        {text: 'TIME', value: 'ts'},
        {text: 'FROM', value: 'from'},
        {text: '', value: 'arrow'},
        {text: 'TO', value: 'to'},
        {text: 'AMOUNT(AERGO)', value: 'amount'},
      ]
    },
    dataTableCss() {
      return {
        wrapper: "table-wrap",
        table: "transactions-table" + (this.isLoading ? ' is-loading' : ''),
      };
    },
    isHidePage() {
      return this.itemsPerPage >= this.limitPageTotalCount
    }
  },
  mounted() {
    this.changePage(this.currentPage);
  },
  methods: {
    loadTableData: async function ({no, sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/transactions`, {
        q: `blockno:${no}`,
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map(item => ({...item.meta, hash: item.hash}));
        this.totalItems = response.total;
        this.limitPageTotalCount = response.limitPageCount;
      } else {
        this.data = [];
        this.totalItems = 0;
        this.limitPageTotalCount = 0;
      }
    },
    reload: async function () {
      this.isLoading = true;
      await this.loadTableData({
        no: this.blockno,
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
    moment,
  },
  components: {
    AccountLink,
  }
};
</script>

<style lang="scss" scoped>
</style>
