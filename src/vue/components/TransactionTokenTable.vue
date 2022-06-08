<template>
    <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
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
        <td>
          <div><router-link class="block" :to="`/block/${row.blockno}/`">{{ row.blockno }}</router-link></div>
        </td>
        <td>
          <div class="tooltipped tooltipped-se tooltipped-align-left-2" :aria-label="moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')">{{ moment(row.ts).fromNow() }}
          </div>
        </td>
        <td class="txt-ellipsis">
          <account-link :css="accountLinkCss"
                        :to-link="`/account/${row.from}/`" :address="row.from.toString()" v-if="!['1111111111111111111111111111111111111111111111111111', 'MINT'].includes(`${row.from}`.toUpperCase())"/>
          <div class="txt-center" v-else><span class="txt-ellipsis">MINT</span></div>
        </td>
        <td>
          <div><img src="~@assets/img/ic-arrow-black@3x.png" class="arrow"></div>
        </td>
        <td class="txt-ellipsis">
          <account-link :css="accountLinkCss"
                        :to-link="`/account/${row.to}/`" :address="row.to.toString()" v-if="!['1111111111111111111111111111111111111111111111111111', 'BURN'].includes(`${row.to}`.toUpperCase())"/>
          <div class="txt-center" v-else><span class="txt-ellipsis">BURN</span></div>
        </td>
        <td>
          <div>
            <span class="identicon default" v-if="!row.image"></span>
            <span class="identicon" v-else><img :src="row.image"></span>
            {{ `${row.name} (${row.symbol})` }}
          </div>
        </td>
        <td>
          <div v-html="$options.filters.formatBigNumAmount(row.amount, false, 6, row.decimals)"></div>
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
import AccountLink from '@/src/vue/components/AccountLink';

export default {
  name: 'TransactionTokenTable',
  props: {
    hash: String,
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
      default: 'ts'
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
        {text: 'BLOCK #', value: 'blockno'},
        {text: 'TIME', value: 'ts'},
        {text: 'FROM', value: 'from'},
        {text: '', value: 'arrow'},
        {text: 'TO', value: 'to'},
        {text: 'TOKEN', value: 'token'},
        {text: 'AMOUNT', value: 'amount_float'},
      ]
    },
    dataTableCss() {
      return {
        wrapper : 'tab-content token-transfers' + (this.active ? ' active' : ''),
        table: "transactions-table token" + (this.isLoading ? ' is-loading' : ''),
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
    loadTokenTableData: async function ({id, sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/tokenTransfers`, {
        q: `tx_id:${id} AND token_id:<0`,
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map(item => ({
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
    reload: async function (token) {
      this.isLoading = true;
      await this.loadTokenTableData({
        id: token ? token :  this.hash,
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
table.transactions-table {
  th {
    &:nth-child(4) {
      width: 25px;
      min-width: 25px;
      box-sizing: content-box;
    }

    &:nth-child(3), &:nth-child(4), &:nth-child(5) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }

    @media screen and (max-width: 480px) {
      &:last-child {
        text-align: right;

        > div {
          justify-content: end;
        }
      }
    }
  }

  td {
    &:nth-child(3), &:nth-child(5) {
      text-align: left;

      > div {
        justify-content: start;
      }
    }

    &:nth-child(4) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }

    @media screen and (max-width: 480px) {
      &:last-child {
        text-align: right;

        > div {
          justify-content: end;
        }
      }
    }
  }
}
</style>
