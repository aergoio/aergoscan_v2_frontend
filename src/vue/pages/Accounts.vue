<template>
  <div class="wrap">
    <div id="category" class="accounts">
      <Header/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search/>
            <div class="title">
              Top Accounts
              <span class="sub">{{ totalItems }}</span>
              <div
                  class="btn-refresh"
              >
                <reload-button :action="reload" :style="'margin-left: 8px;'"/>
              </div>
            </div>
            <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
              <template slot="desc">
                <div class="desc">
                  Total aergo supply : 500,000,000
                </div>
              </template>
              <template slot="error" v-if="error">
                <div class="error transactions show">
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
                  <div>{{ row.rank }}</div>
                </td>
                <td>
                  <div>
                    <account-link :css="accountLinkCss"
                                  :to-link="`/account/${row.hash}/`" :address="row.hash.toString()"/>
                  </div>
                </td>
                <td>
                  <div v-html="$options.filters.formatBigNumAmount(row.balance, false, 6, 18, true)"></div>
                </td>
                <td>
                  <div>{{ row.percentage }}%</div>
                </td>
<!--                <td>-->
<!--                  <div>-->
<!--                    <router-link :to="`/block/${row.blockno}/`" class="address txt-ellipsis">{{ row.blockno === 0 ? 'genesis' : row.blockno}}</router-link>-->
<!--                  </div>-->
<!--                </td>-->
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
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  </div>
</template>

<script>
import moment from "moment";
import cfg from '@/src/config.js';
import Search from '@/src/vue/components/Search';
import ReloadButton from '@/src/vue/components/ReloadButton';
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
      limitPageTotalCount: 0,
      isLoading: false,
      currentPage: this.initialPage,
      accountLinkCss: {
        wrapper: '',
        address: 'address txt-ellipsis',
        icon: 'mini-identicon'
      },
      paginationCss: {
        pagination: "pagination accounts-table",
        paginationInner: "pagination-inner",
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      sortedField: this.sortField,
      sortedDir: this.sort,
    };
  },
  created() {
  },
  beforeDestroy() {
  },
  computed: {
    headers() {
      return [
        {text: 'RANK', value: 'rank'},
        {text: 'ACCOUNT', value: 'account'},
        {text: 'BALANCE(AERGO)', value: 'balance'},
        {text: 'PERCENTAGE', value: 'percentage'},
        {text: 'UPDATE TIME', value: 'update_time'},
      ]
    },
    dataTableCss() {
      return {
        wrapper: "table-wrap",
        table: "accounts-table" + (this.isLoading ? ' is-loading' : ''),
      };
    },
  },
  mounted() {
    this.changePage(this.currentPage);
  },
  methods: {
    loadTableData: async function ({sortField, sort, currentPage, itemsPerPage}) {
      this.error = "";
      const start = (currentPage - 1) * itemsPerPage;
      const response = await (await this.$fetch.get(`${cfg.API_URL}/accountsBalance`, {
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map((item, index) => (
            {
              ...item.meta,
              hash: item.hash,
              rank: (response.from) + (index + 1),
              percentage: this.$options.filters.formatPercentageText(item.meta.balance, '500000000000000000000000000'),
            }
        ));
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
    Search,
    ReloadButton,
    AccountLink,
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
    position: relative;

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

    .btn-refresh {
      display: flex;
      align-items: center;
      cursor: pointer;
      position: absolute;
      right: 10px;
    }
  }
}

.page-content > .table-wrap {
  padding-bottom: 50px;
}

.table-wrap table td .aergo {
  margin-left: 5px;
}

table.accounts-table {
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
      text-align: center;

      > div {
        justify-content: end;
      }
    }
  }
}
</style>
