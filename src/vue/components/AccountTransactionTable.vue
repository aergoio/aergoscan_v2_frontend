<template>
  <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
    <template slot="error" v-if="error">
      <div class="error transactions show">
        {{ error }}
      </div>
    </template>
    <template slot="header" v-for="header in headers">
      <th v-if="header.value === 'fromto'">
        <div>
          FROM
          <img src="~@assets/img/ic-arrow-pink@3x.png" class="arrow">
          TO
        </div>
      </th>
      <th class="menu-th" v-else-if="header.value === 'category'">
        <div>
          <div class="menu-th" @click="openTableHeaderMenu($event)">
            {{ header.text }}<span class="icon arrow-down"><img
              src="~@assets/img/arrow-down-s-box@3x.png"></span>
          </div>
          <div class="menu-th-list">
            <div class="item" @click="dtUpdateCategory($event, category)" v-for="category in categories"
                 :key="category">{{ category.toUpperCase() }}
            </div>
          </div>
        </div>
      </th>
      <th v-else>
        <div>{{ header.text }}</div>
      </th>
    </template>
    <template slot="list" slot-scope="{row}">
      <td class="txt-ellipsis">
        <div>
          <router-link :to="`/transaction/${row.hash}/`" class="address txt-ellipsis">
            {{ row.hash }}
          </router-link>
        </div>
      </td>
      <td>
        <div class="tooltipped tooltipped-se tooltipped-align-left-2"
             :aria-label="moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')">
          {{ moment(row.ts).fromNow() }}
        </div>
      </td>
      <td class="txt-ellipsis">
        <div v-if="row.from !== row.to">
          <template v-if="addressMatches(row.to)">
            <span class="boxicon blue">FROM</span>
            <Identicon :text="row.from" size="18" class="mini-identicon"/>
            <router-link :to="`/account/${row.from}/`" class="address txt-ellipsis">
              {{ $options.filters.formatEllipsisText(row.from, 45) }}
            </router-link>
          </template>
          <template v-else>
            <span class="boxicon red">TO</span>
            <template v-if="row.to && row.to.toString().length">
              <Identicon :text="row.to" size="18" class="mini-identicon"/>
              <router-link :to="`/account/${row.to}/`" class="address txt-ellipsis">
                {{ $options.filters.formatEllipsisText(row.to, 45) }}
              </router-link>
            </template>
            <template v-else>
              <div v-if="row.category === 'multicall'"> <Identicon size="19" class="identicon-multi"/> </div>
              <div v-else> <Identicon size="19" class="identicon-new"/> </div>
              <span class="address">{{row.category === 'multicall' ? 'N/A' : 'Contract Creation'}}</span>
            </template>
          </template>
        </div>
        <div v-else><span class="boxicon gray">self transfer</span></div>
      </td>
      <td>
        <div>{{ row.category.toUpperCase() }}</div>
      </td>
      <td>
        <div>{{ row.method.toUpperCase() }}</div>
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

import {openTableHeaderMenu} from '@/src/vue/utils/filter-table-header';
import Identicon from '@/src/vue/components/Identicon';
import cfg from '@/src/config';
import moment from 'moment';
import BigNumber from 'bignumber.js';

export default {
  name: 'AccountTransactionTable',
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
      default: 'blockno'
    },
    sort: {
      type: String,
      default: 'desc'
    },
    category: {
      type: String,
      default: 'all'
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
      selectedCategory: this.category,
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
        {text: 'TX HASH', value: 'hash'},
        {text: 'TIME', value: 'ts'},
        {text: 'FROMTO', value: 'fromto'},
        {text: 'CATEGORY', value: 'category'},
        {text: 'METHOD', value: 'method'},
        {text: 'AMOUNT(AERGO)', value: 'amount_float'},
      ]
    },
    categories() {
      return [
        "all",
        "payload",
        "call",
        "transfer",
        "governance",
        "system",
        "staking",
        "voting",
        "name",
        "namecreate",
        "nameupdate",
        "enterprise",
        "conf",
        "cluster",
        "deploy",
        "redeploy"
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content transactions' + (this.active ? ' active' : ''),
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
    addressMatches(addr) {
      return addr === this.address;
    },
    loadTransactionTableData: async function ({id, category, sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/transactions`,
          category !== 'all' ? {
            q: `category:${category} AND (from:${id} OR to:${id})`,
            size: itemsPerPage,
            from: start,
            sort: `${sortField}:${sort}`,
          } : {
            q: `(from:${id} OR to:${id})`,
            size: itemsPerPage,
            from: start,
            sort: `${sortField}:${sort}`,
          }
      )).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map((item, index) => ({
          ...item.meta,
          hash: item.hash,
          rank: (response.from) + (index + 1),
          percentage: this.totalSupply === '0' ? 0 : new BigNumber(item.meta.balance + "00").div(new BigNumber(this.totalSupply)).toFixed(),
        }));
        this.totalItems = response.total;
        this.limitPageTotalCount = response.limitPageCount;
      } else {
        this.data = [];
        this.totalItems = 0;
        this.limitPageTotalCount = 0;
      }
      this.$emit('onUpdateTotalCount', this.totalItems);
    },
    reload: async function (address) {
      this.isLoading = true;
      await this.loadTransactionTableData({
        id: address ? address : this.address,
        category: this.selectedCategory,
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
    dtUpdateCategory: function (event, category) {
      event.target.closest('th.menu-th').classList.remove('show');

      this.selectedCategory = category;
      this.currentPage = this.initialPage;

      this.reload();
    },
    moment,
    BigNumber,
    openTableHeaderMenu
  },
  components: {
    Identicon
  }
};
</script>

<style lang="scss" scoped>
table.transactions-table {
  th {
    &:nth-child(3) {
      img {
        margin: 0 7px;
      }
    }

    &:nth-child(4) {
      padding-left: 10px;
    }

    &:nth-child(5) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }

    &:last-child {
      text-align: right;

      > div {
        justify-content: end;
      }
    }
  }

  td {
    &:nth-child(4) {
      padding-left: 10px;
    }

    &:nth-child(5) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }

    &:last-child {
      text-align: right;

      > div {
        justify-content: end;
      }
    }
  }
}

</style>
