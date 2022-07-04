<template>
  <div class="wrap">
    <div id="category" class="nft">
      <Header/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search/>
            <div class="title">
              NFT
              <span class="sub">{{ totalItems }}</span>
              <span class="sub-2">ARC-2</span>
              <span style="flex: 1 1 0%;"></span>
              <form v-on:submit.prevent.capture="performSearch">
                <div class="search-bar">
                  <input type="text" v-model="searchedField" placeholder="Search for NFT Name / Symbol"
                         v-on:keyup="onKeyUpSearch">
                  <div class="btn-remove" v-on:click="deleteKeyword"></div>
                  <div class="btn-search">
                    <span class="icon search"></span>
                  </div>
                </div>
              </form>
            </div>
            <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
              <template slot="desc">
                <div class="desc">
                  AERGO Scan merely displays quantitative data stored on blockchain. User's own discretion is advised in the process of making any judgement.
                </div>
              </template>
              <template slot="error" v-if="error">
                <div class="error transactions show">
                  {{ error }}
                </div>
              </template>
              <template slot="header" v-for="header in headers">
                <th :key="header.value">
                  <div>{{ header.text }}</div>
                </th>
              </template>
              <template slot="list" slot-scope="{row}">
                <td>
                  <div>
                    <span class="identicon default" v-if="!row.image"></span>
                    <span class="identicon" v-else><img :src="row.image"></span>
                    <router-link class="block"
                                 v-html="row.selectedName"
                                 :to="`/nft/${row.hash}/`">
                    </router-link>
                  </div>
                </td>
                <td>
                  <div v-html="row.selectedSymbol"></div>
                </td>
                <td>
                  <div>
                    <account-link :css="accountLinkCss"
                                  :to-link="`/account/${row.hash}/`" :address="row.hash.toString()"/>
                  </div>
                </td>
                <td>
                  <div>{{row.supply}}</div>
                </td>
                <td>
                  <div>{{ row.total_transfer }}</div>
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
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  </div>
</template>

<script>
import cfg from '@/src/config.js';
import Search from '@/src/vue/components/Search';
import AccountLink from "@/src/vue/components/AccountLink";

export default {
  props: {
    initialPage: {
      type: Number,
      default: 1
    },
    itemsPerPage: {
      type: Number,
      default: 20
    },
    searchField: {
      type: String,
      default: ''
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
        pagination: "pagination nfts-table",
        paginationInner: "pagination-inner",
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      accountLinkCss: {
        wrapper: '',
        address: 'address txt-ellipsis',
        icon: 'mini-identicon'
      },
      sortedField: this.sortField,
      sortedDir: this.sort,
      searchedField: this.searchField,
    };
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
    headers() {
      return [
        {text: 'NAME', value: 'name'},
        {text: 'SYMBOL', value: 'symbol'},
        {text: 'CONTRACT ADDRESS', value: 'address'},
        {text: 'TOTAL SUPPLY', value: 'supply'},
        {text: 'TOTAL TRANSFERS', value: 'transfer'},
      ]
    },
    dataTableCss() {
      return {
        wrapper: "table-wrap",
        table: "tokens-table" + (this.isLoading ? ' is-loading' : ''),
      };
    },
    isHidePage() {
      return this.itemsPerPage >= this.limitPageTotalCount
    }
  },
  mounted() {
    if (this.$route.query.keyword) {
      this.searchedField = this.$route.query.keyword || '';
    }
    this.changePage(this.currentPage);
  },
  methods: {
    loadTableData: async function ({searchField, sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/nft`,
          searchField.length > 0 ? {
            q: `(name:*${searchField}* OR symbol:*${searchField}*) AND type:ARC2`,
            search:searchField,
            range:'REG',
            size: itemsPerPage,
            from: start,
            sort: `${sortField}:${sort}`,
          } : {
            q:`type:ARC2`,
            range:'REG',
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
          selectedName:this.$options.filters.changeStringByKeyword(item.meta.name, searchField, `<span class="selection">${searchField}</span>`),
          selectedSymbol:this.$options.filters.changeStringByKeyword(item.meta.symbol, searchField, `<span class="selection">${searchField}</span>`),
        }));
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
        searchField: this.searchedField,
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
    deleteKeyword: function () {
      this.searchedField = '';
      this.reload();
    },
    async performSearch() {
      await this.reload();
    },
    async onKeyUpSearch() {
      if (this.searchedField.length === 0) {
        await this.reload();
      }
    }
  },
  components: {
    Search,
    AccountLink
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

  .page-content > .title {
    display: flex;
    align-items: center;

    .sub {
      margin-left: 10px;
      margin-top: 4px;
      color: #b6b6b6;
      font-size: 20px;
      font-weight: bold;

      @media screen and (max-width: 780px) {
        margin-left: 0;
      }
    }

    .sub-2 {
      padding: 2px 5px;
      margin-left: 5px;
      margin-top: 4px;
      font-size: 8px;
      color: #fff;
      border-radius: 2px;
      background-color: #2c2938;
      white-space: nowrap;

      @media screen and (max-width: 780px) {
        margin-left: 0;
      }
    }

    form {
      width: 100%;
      max-width: 310px;
    }

    .search-bar {
      width: 100%;
      margin-top: 0;
      border-radius: 33px;
      border: solid 1px #ddc5d4;
      background-color: transparent;
      z-index: 20;

      @media screen and (max-width: 480px) {
        height: 32px;
      }

      &:hover {
        box-shadow: none;
      }

      input {
        font-size: 14px;

        &::placeholder {
          color: #ada6b4;
        }
      }
    }
  }
}

.page-content > .table-wrap {
  padding-bottom: 50px;
}

.table-wrap table td .aergo {
  margin-left: 5px;
}

table.tokens-table {
  th {
    &:last-child {
      text-align: right;

      > div {
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
  }
}
</style>
