<template>
  <div class="wrap">
    <div id="category" class="transactions">
      <Header/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search/>
            <div class="title">Transactions</div>
            <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
              <template slot="error" v-if="error">
                <div class="error transactions show">
                  {{ error }}
                </div>
              </template>
              <template slot="header" v-for="header in headers">
                <th v-if="header.sortable" :key="header.value">
                  <div>
                    <div class="btn-th"
                         @click="dtUpdateSort($event, header.value)"
                    >
                      {{ header.text }}<span class="icon arrow-down up"
                                             v-if="(sortedField === header.value && sortedDir === 'asc')">
                      <img src="~@assets/img/arrow-down-s-fill@3x.png"></span>
                      <span class="icon arrow-down" v-if="(sortedField === header.value && sortedDir === 'desc')"><img
                          src="~@assets/img/arrow-down-s-fill@3x.png"></span>
                    </div>
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
                <th v-else-if="header.value === 'arrow'">
                  <div><img src="~@assets/img/ic-arrow-pink@3x.png" class="arrow"></div>
                </th>
                <th v-else>
                  <div>{{ header.text }}</div>
                </th>
              </template>
              <template slot="list" slot-scope="{row}">
                <td class="txt-ellipsis">
                  <div class="tooltipped tooltipped-se tooltipped-align-left-2" :aria-label="row.hash">
                    <router-link class="address txt-ellipsis" :to="`/transaction/${row.hash}/`">{{ row.hash }}
                    </router-link>
                  </div>
                </td>
                <td>
                  <div>
                    <router-link class="block" :to="`/block/${row.blockno}/`">{{ row.blockno }}</router-link>
                  </div>
                </td>
                <td>
                  <div class="tooltipped tooltipped-se tooltipped-align-left-2"
                       :aria-label="moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')">
                    {{ moment(row.ts).fromNow() }}
                  </div>
                </td>
                <td class="txt-ellipsis">
                  <account-link :css="accountLinkCss"
                                :to-link="`/account/${row.from}/`"
                                :address="row.from.toString()"
                                :name="$options.filters.formatEllipsisText(row.from, 20)"/>
                </td>
                <td>
                  <div><img src="~@assets/img/ic-arrow-black@3x.png" class="arrow"></div>
                </td>
                <td class="txt-ellipsis">
                  <account-link :css="accountLinkCss"
                                :to-link="`/account/${row.to}/`"
                                :address="row.to.toString()"
                                :name="$options.filters.formatEllipsisText(row.to, 20)"
                                v-if="row.to && row.to.toString().length"/>
                  <div class="txt-ellipsis" v-if="!row.to || !row.to.toString().length">
                    <Identicon size="19"/>
                    <span class="address">Contract Creation</span></div>
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
                  :total-items="totalItems"
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
import Search from '@/src/vue/components/Search';
import AccountLink from '@/src/vue/components/AccountLink';
import Identicon from '@/src/vue/components/Identicon';
import cfg from '@/src/config';
import {openTableHeaderMenu} from '@/src/vue/utils/filter-table-header';
import moment from 'moment';

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
        {text: 'TX HASH', value: 'hash', sortable: false},
        {text: 'BLOCK #', value: 'blockno', sortable: true},
        {text: 'TIME', value: 'ts', sortable: true},
        {text: 'FROM', value: 'from'},
        {text: '', value: 'arrow'},
        {text: 'TO', value: 'to'},
        {text: 'CATEGORY', value: 'category'},
        {text: 'METHOD', value: 'method', sortable: false},
        {text: 'AMOUNT(AERGO)', value: 'amount_float', sortable: true},
      ]
    },
    categories() {
      return [
        "all",
        "payload",
        "call",
        "token",
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
        wrapper: "table-wrap",
        table: "transactions-table" + (this.isLoading ? ' is-loading' : ''),
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
    loadTableData: async function ({sortField, sort, category, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/transactions`,
          category !== 'all' ? {
            q: `category:${category}`,
            size: itemsPerPage,
            from: start,
            sort: `${sortField}:${sort}`,
          } : {
            size: itemsPerPage,
            from: start,
            sort: `${sortField}:${sort}`,
          }
      )).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map(item => ({...item.meta, hash: item.hash}));
        this.totalItems = response.total;
      } else {
        this.data = [];
        this.totalItems = 0;
      }
    },
    reload: async function () {
      this.isLoading = true;
      await this.loadTableData({
        sortField: this.sortedField,
        sort: this.sortedDir,
        category: this.selectedCategory,
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
    dtUpdateSort: function (event, sortField) {
      if (this.sortedField === sortField) {
        this.sortedDir = this.sortedDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortedDir = 'desc'
        this.sortedField = sortField
      }
      this.reload();
    },
    dtUpdateCategory: function (event, category) {
      event.target.closest('th.menu-th').classList.remove('show');
      this.currentPage = this.initialPage;
      this.selectedCategory = category;

      this.reload();
    },
    moment,
    openTableHeaderMenu
  },
  components: {
    Search,
    AccountLink,
    Identicon
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
}

table.transactions-table {
  th {
    &:nth-child(5) {
      width: 25px;
      min-width: 25px;
      box-sizing: content-box;
    }

    &:nth-child(4), &:nth-child(5), &:nth-child(6), &:nth-child(8) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }

    &:nth-child(7) {
      padding-left: 10px;
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
    &.txt-ellipsis {
      width: 15%;
    }

    &:nth-child(4), &:nth-child(6) {
      text-align: left;

      > div {
        justify-content: start;
      }
    }

    &:nth-child(5), &:nth-child(8) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }

    &:nth-child(7) {
      padding-left: 10px;
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
