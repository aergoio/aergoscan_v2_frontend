<template>
  <div class="wrap">
    <div id="category" class="accounts">
      <Header/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search/>
            <div class="title">
              Accounts
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
                  This page shows the last 20 recently active accounts only(based on transaction data).
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
                  <div>
                    <account-link :css="accountLinkCss"
                                  :to-link="`/account/${row.key}/`" :address="row.key.toString()"/>
                  </div>
                </td>
                <td>
                  <div class="tooltipped tooltipped-se tooltipped-align-left-2"
                       :aria-label="moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')">
                    {{ moment(row.ts).format('YYYY-MM-DD HH:mm:ss') }}
                  </div>
                </td>
                <td class="txt-ellipsis">
                  <div>
                    <router-link class="address txt-ellipsis" :to="`/transaction/${row.hash}/`">{{
                        row.hash
                      }}
                    </router-link>
                  </div>
                </td>
                <td>
                  <div>
                    <router-link :to="`/block/${row.max_blockno}/`">{{ row.max_blockno }}</router-link>
                  </div>
                </td>
              </template>
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
import TokenTransferTable from '@/src/vue/components/TokenTransferTable';
import TokenHolderTable from '@/src/vue/components/TokenHolderTable';

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
      default: 'max_blockno'
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
        wrapper: '',
        address: 'address txt-ellipsis',
        icon: 'mini-identicon'
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
        {text: 'ADDRESS', value: 'address'},
        {text: 'LAST TX', value: 'last_tx'},
        {text: 'TX HASH', value: 'tx_hash'},
        {text: 'BLOCK #', value: 'max_blockno'},
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
      const response = await (await this.$fetch.get(`${cfg.API_URL}/accounts`, {
        size: itemsPerPage,
        from: start,
        sort: `${sortField}:${sort}`,
      })).json();
      if (response.error) {
        this.error = response.error.msg;
      } else if (response.hits.length) {
        this.data = response.hits.map(item => (
            {
              ...item.tx,
              key: item.key,
              max_blockno: item.max_blockno
            }
        ));
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
    TokenHolderTable,
    TokenTransferTable
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
      text-align: right;

      > div {
        justify-content: end;
      }
    }
  }
}
</style>
