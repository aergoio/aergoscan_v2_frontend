<template>
  <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
    <template slot="error" v-if="error">
      <div class="error holders show">
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
        <div>{{ row.rank }}</div>
      </td>
      <td>
        <account-link :css="accountLinkCss"
                      :to-link="`/account/${row.account}/`" :address="row.account.toString()"/>
      </td>
      <td><div>{{ row.balance }}</div></td>
      <td><div>{{ row.percentage }}%</div></td>
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
import BigNumber from "bignumber.js";


export default {
  name: 'NftHolderTable',
  props: {
    hash: String,
    active: {
      type: Boolean,
      default: false,
    },
    totalSupply: String,
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
        pagination: "pagination holders-table",
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
        {text: 'RANK', value: 'rank'},
        {text: 'ADDRESS', value: 'adrress'},
        {text: 'AMOUNT', value: 'amount_float'},
        {text: 'PERCENTAGE', value: 'percentage'},
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content holders' + (this.active ? ' active' : ''),
        table: "holders-table" + (this.isLoading ? ' is-loading' : ''),
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
    loadHolderTableData: async function ({id, sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/nftHolder`, {
        q: `address:${id} AND type:ARC2`,
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
          rank: (response.from ) + (index + 1),
          percentage: this.totalSupply ==='0' ? 0 : new BigNumber(item.meta.balance + "00").div(new BigNumber(this.totalSupply)).toFixed(),
        }));
        this.totalItems = response.total;
      }
      this.$emit('onUpdateTotalCount', this.totalItems);
    },
    reload: async function () {
      this.isLoading = true;
      await this.loadHolderTableData({
        id: this.hash,
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
    BigNumber
  },
  components: {
    AccountLink,
  }
};
</script>

<style lang="scss" scoped>
table.holders-table {
  th {
    &:first-child {
      min-width: 100px;
    }

    &:last-child {
      text-align: right;

      > div {
        justify-content: end;
      }
    }
  }

  td {
    &:first-child {
      font-weight: bold;
    }

    &:last-child {
      text-align: right;

      > div {
        justify-content: end;
      }
    }

    .block {
      font-weight: bold;
    }
  }
}
.tab-content.holders {
  .total {
    padding: 5px 0 10px 0;
    font-size: 13px;
    color: #5d5960;
  }
}
</style>
