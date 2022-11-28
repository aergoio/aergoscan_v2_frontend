<template>
  <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
    <template slot="error" v-if="error">
      <div class="error nft-inventory show">
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
          <router-link :to="`/nft/${row.symbolHash}/`" class="address txt-ellipsis">{{ row.name }}</router-link>
        </div>
      </td>
      <td>
        <div>{{ row.symbol }}</div>
      </td>
      <td>
        <div></div>
      </td>
      <td>
        <div>
          <router-link :to="`/nft/${row.address}/?tx=inventory&keyword=${address}`" class="address">
            {{ row.amount }}
          </router-link>
        </div>
      </td>
      <td>
        <div class="tooltipped tooltipped-se tooltipped-align-left-2"
             :aria-label="moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')">
          {{ moment(row.ts).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
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

export default {
  name: 'AccountNftInventoryTable',
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
        pagination: "pagination nft-inventory-table",
        paginationInner: "pagination-inner",
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
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
        {text: 'Since Block', value: 'sinceblock'},
        {text: 'Destination', value: 'destination'},
        {text: '', value: 'current'},
        {text: 'Transaction', value: 'transaction'},
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content nft-inventory' + (this.active ? ' active' : ''),
        table: "nft-inventory-table" + (this.isLoading ? ' is-loading' : ''),
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
    loadInventoryTableData: async function ({id, sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/nftGroupCountInventory`, {
        q: `account:${id}`,
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map((item, index) => ({
          address: item.address,
          amount: item.amount,
          image: item.token.meta.image,
          name: item.token.meta.name,
          symbol: item.token.meta.symbol,
          symbolHash: item.token.hash,
          decimals: item.token.meta.decimals,
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
      // await this.loadInventoryTableData({
      //   id: address ? address : this.address,
      //   sortField: this.sortedField,
      //   sort: this.sortedDir,
      //   currentPage: this.currentPage,
      //   itemsPerPage: this.itemsPerPage,
      // });
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
  components: {}
};
</script>

<style lang="scss" scoped>
table.nft-inventory-table {
  th {
    @media screen and (max-width: 480px) {
      &:last-child {
        text-align: right;

        & > div {
          justify-content: end;
        }
      }
    }

    &:nth-child(3) {
      text-align: center;

      & > div {
        justify-content: center;
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

        & > div {
          justify-content: end;
        }
      }
    }

    &:nth-child(3) {
      text-align: center;

      & > div {
        justify-content: center;
      }
    }

    &:last-child {
      width: 150px;
    }
  }
}
</style>
