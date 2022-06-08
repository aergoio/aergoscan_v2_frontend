<template>
  <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
    <template slot="error" v-if="error">
      <div class="error token-balance show">
        {{ error }}
      </div>
    </template>
    <template slot="header" v-for="header in headers">
      <th>
        <div>{{ header.text }}</div>
      </th>
    </template>
    <template slot="list" slot-scope="{row}">
      <td><div>
        <span class="identicon default" v-if="!row.image"></span>
        <span class="identicon" v-else><img :src="row.image"></span>
        {{ row.name }}
      </div></td>
      <td><div>{{ row.symbol }}</div></td>
      <td><div v-html="$options.filters.formatBigNumAmount(row.balance, false, 6, row.decimals)"></div></td>
      <td>
        <div class="tooltipped tooltipped-se tooltipped-align-left-2" :aria-label="moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')">{{ moment(row.ts).fromNow() }}</div>
      </td>
    </template>
    <pagination
        slot="pagination"
        :css="paginationCss"
        :page="currentPage"
        :total-items="totalItems"
        :itemsPerPage="itemsPerPage"
        @onUpdate="changePage"
        @updateCurrentPage="updateCurrentPage"
    />
  </data-table>
</template>
<script>

import cfg from '@/src/config';
import moment from 'moment';

export default {
  name: 'AccountTokenBalanceTable',
  props: {
    address: String,
    active: {
      type: Boolean,
      default: false,
    },
    totalSupply: String,
    decimals: {
      type: Number,
      default: 0,
    },
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
      default: 'balance_float'
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
      paginationCss: {
        pagination: "pagination token-balance-table",
        paginationInner: "pagination-inner",
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      accountLinkCss: {
        wrapper: 'tooltipped tooltipped-se tooltipped-align-left-2',
        address: 'block',
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
        {text: 'BALANCE', value: 'balance'},
        {text: 'LATEST TRANSACTION', value: 'latesttransaction'},
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content token-balance' + (this.active ? ' active' : ''),
        table: "token-balance-table" + (this.isLoading ? ' is-loading' : ''),
      };
    },
    isHidePage() {
      return this.itemsPerPage >= this.totalItems
    }
  },
  mounted() {
    this.changePage(this.currentPage);
  },
  methods: {
    loaTokenBalanceTableData: async function ({id, sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/tokenBalance`, {
        q: `account:${id} AND type:ARC1`,
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map((item, index) => ({
          ...item.meta,
          hash: item.hash,
          name: item.token.meta.name,
          image: item.token.meta.image,
          symbol: item.token.meta.symbol,
          decimals: item.token.meta.decimals,
        }));
        this.totalItems = response.total;
      } else {
        this.data = [];
        this.totalItems = 0;
      }
      this.$emit('onUpdateTotalCount', this.totalItems);
    },
    reload: async function (address) {
      this.isLoading = true;
      await this.loaTokenBalanceTableData({
        id: address ? address : this.address,
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
    moment
  },
  components: {
  }
};
</script>

<style lang="scss" scoped>
table.token-balance-table {
  th {
    @media screen and (max-width: 480px) {
      &:last-child {
        text-align: right;

        &>div {
          justify-content: end;
        }
      }
    }

    &:last-child {
      width: 150px;
    }
  }

  td {
    @media screen and (max-width: 480px) {
      &:last-child {
        text-align: right;

        &>div {
          justify-content: end;
        }
      }
    }

    &:last-child {
      width: 150px;
    }

    .aergo {
      margin-left: 5px;
    }
  }
}

</style>
