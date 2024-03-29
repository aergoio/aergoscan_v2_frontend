<template>
  <data-table
    :trans-data="data || []"
    :is-loading="isLoading"
    :css="dataTableCss"
  >
    <template slot="search">
      <div class="search-bar-wrap">
        <!--        <div class="search-result">-->
        <!--          Search result of Token ID  76775-->
        <!--        </div>-->
        <form v-on:submit.prevent.capture="performSearch">
          <div class="search-bar reset">
            <input
              type="text"
              id="searchInput"
              placeholder="Search for Token ID / Holder Address"
              v-model="searchedField"
              v-on:keyup="onKeyUpSearch"
            />
            <!--            <div class="btn-remove" v-on:click="removeSearchKeyword"></div>-->
            <div class="btn-reset" v-on:click="deleteKeyword">
              Reset <span class="icon reset"></span>
            </div>
            <div class="btn-search">
              <span class="icon search"></span>
            </div>
            <div class="search-prediction">
              Do you mean <span class="type">account address</span>
              <span class="value">xxx</span>?
            </div>
          </div>
        </form>
      </div>
    </template>
    <template slot="error" v-if="error">
      <div class="error inventory show">
        {{ error }}
      </div>
    </template>
    <template slot="header" v-for="header in headers">
      <th v-if="header.value === 'arrow'">
        <!-- <div><img src="~@assets/img/ic-arrow-pink@3x.png" class="arrow"></div> -->
      </th>
      <th v-else>
        <div>{{ header.text }}</div>
      </th>
    </template>
    <template slot="list" slot-scope="{ row }">
      <td>
        <div v-html="row.token_id"></div>
      </td>
      <td>
        <template
          v-if="
            ![
              '1111111111111111111111111111111111111111111111111111',
              'MINT',
              'BURN',
            ].includes(`${row.account}`.toUpperCase())
          "
        >
          <div v-if="row.replacedAccount">
            <Identicon
              :text="row.account"
              :size="18"
              :class="accountLinkCss.icon"
            />
            <router-link
              :class="accountLinkCss.address"
              :to="`/account/${row.account}/`"
              v-html="row.replacedAccount"
            >
            </router-link>
          </div>
          <account-link
            :css="accountLinkCss"
            :to-link="`/account/${row.account}/`"
            :address="row.account.toString()"
            v-else
          />
        </template>
        <div
          v-else
          v-html="row.replacedAccount ? row.replacedAccount : row.account"
        ></div>
      </td>
      <td>
        <div>
          <a :href="row.image_url" target="_blank"> {{ row.image_url }}</a>
        </div>
      </td>
      <td>
        <div>
          <a :href="row.token_uri" target="_blank"> {{ row.token_uri }}</a>
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
import cfg from '@/src/config'
import moment from 'moment'
import AccountLink from '@/src/vue/components/AccountLink'
import Identicon from '@/src/vue/components/Identicon'

export default {
  name: 'NftInventoryTable',
  props: {
    hash: String,
    active: {
      type: Boolean,
      default: false,
    },
    initialPage: {
      type: Number,
      default: 1,
    },
    searchField: {
      type: String,
      default: '',
    },
    itemsPerPage: {
      type: Number,
      default: 10,
    },
    defaultSort: String,
    defaultSortDirection: String,
    sortField: {
      type: String,
      default: 'blockno',
    },
    sort: {
      type: String,
      default: 'desc',
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
        pagination: 'pagination inventory-table',
        paginationInner: 'pagination-inner',
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      accountLinkCss: {
        wrapper: 'tooltipped tooltipped-se tooltipped-align-left-2',
        address: 'address',
        icon: 'mini-identicon',
      },
      sortedField: this.sortField,
      sortedDir: this.sort,
      searchedField: this.searchField,
    }
  },
  watch: {
    $route(to, from) {
      if (to.query.keyword) {
        this.searchedField = to.query.keyword
        this.reload()
      } else {
        this.searchedField = ''
        this.reload()
      }
    },
  },
  created() {},
  beforeDestroy() {},
  computed: {
    headers() {
      return [
        { text: 'NFT ID', value: 'nftid' },
        { text: 'HOLDER', value: 'holder' },
        { text: 'IMAGE URL', value: 'imageurl' },
        { text: 'NFT URI', value: 'nfturi' },
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content inventory' + (this.active ? ' active' : ''),
        table: 'inventory-table' + (this.isLoading ? ' is-loading' : ''),
      }
    },
    isHidePage() {
      return this.itemsPerPage >= this.limitPageTotalCount
    },
  },
  mounted() {
    this.changePage(this.currentPage)
  },
  methods: {
    loadInventoryTableData: async function ({
      id,
      searchField,
      sortField,
      sort,
      currentPage,
      itemsPerPage,
    }) {
      this.error = ''
      const start = (currentPage - 1) * itemsPerPage
      const response = await (
        await this.$fetch.get(
          `${cfg.API_URL}/nftInventory`,
          searchField.length > 0
            ? {
                q: `address:${id} AND (token_id:*${searchField}* OR account:*${searchField}*)`,
                size: itemsPerPage,
                from: start,
                sort: `${sortField}:${sort}`,
              }
            : {
                q: `address:${id}`,
                size: itemsPerPage,
                from: start,
                sort: `${sortField}:${sort}`,
              }
        )
      ).json()
      if (response.error) {
        this.error = response.error.msg
      } else if (response.hits.length) {
        this.data = response.hits.map((item) => ({
          ...item.meta,
          hash: item.hash,
          replacedAccount: this.$options.filters.changeStringByKeyword(
            item.meta.account,
            searchField,
            `<span class="selection">${searchField}</span>`
          ),
          token_id: this.$options.filters.changeStringByKeyword(
            item.meta.token_id,
            searchField,
            `<span class="selection">${searchField}</span>`
          ),
        }))
        this.totalItems = response.total
        this.limitPageTotalCount = response.limitPageCount
      } else {
        this.data = []
        this.totalItems = 0
        this.limitPageTotalCount = 0
      }
      this.$emit('onUpdateTotalCount', this.totalItems)
    },
    reload: async function () {
      this.isLoading = true
      await this.loadInventoryTableData({
        id: this.hash,
        searchField: this.searchedField,
        sortField: this.sortedField,
        sort: this.sortedDir,
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      })
      this.isLoading = false
    },
    changePage: function (currentPage) {
      this.currentPage = currentPage
      this.reload()
    },
    updateCurrentPage: function (currentPage) {
      this.currentPage = currentPage
    },
    deleteKeyword: function () {
      this.searchedField = ''
      this.reload()
    },
    async performSearch() {
      await this.reload()
    },
    async onKeyUpSearch() {
      if (this.searchedField.length === 0) {
        await this.reload()
      }
    },
    moment,
  },
  components: {
    AccountLink,
    Identicon,
  },
}
</script>

<style lang="scss" scoped>
table.inventory-table {
  td {
    .block {
      font-weight: bold;
    }

    //.icon.copy {
    //  margin-left: 5px;
    //
    //  @media screen and (max-width: 480px) {
    //    svg {
    //      width: 24px;
    //      height: 24px;
    //    }
    //  }
    //}
  }
}

.tab-content.inventory {
  .search-bar-wrap {
    display: flex;
    align-items: center;
    margin-bottom: 10px;

    @media screen and (max-width: 900px) {
      flex-wrap: wrap;
    }

    form {
      width: 100%;
      max-width: 560px;
      margin-left: auto;
    }

    .search-bar {
      width: 100%;
      margin-top: 0;
      border-radius: 33px;
      border: solid 1px #ddc5d4;
      background-color: transparent;

      @media screen and (max-width: 900px) {
        order: 1;
        max-width: inherit;
      }

      @media screen and (max-width: 480px) {
        height: 32px;
      }

      &:hover {
        box-shadow: none;
      }

      &.reset {
        .btn-reset {
          display: flex;
        }
      }

      input {
        font-size: 14px;

        &::placeholder {
          color: #ada6b4;
        }
      }

      .btn-remove {
        margin: 0 7px;
      }

      .btn-reset {
        display: none;
        align-items: center;
        margin: 4px 0;
        padding: 0 7px;
        font-size: 11px;
        color: #2c2938;
        border-radius: 11px;
        background-color: #fecfec;
        cursor: pointer;

        .icon.reset {
          width: 14px;
          height: 14px;
          margin-left: 2px;
          background-image: url('~@assets/img//ic-reset@3x.png');
          background-position: center;
          background-size: cover;
          background-repeat: no-repeat;
        }
      }
    }

    .search-result {
      height: auto;
      padding-right: 20px;
      font-size: 13px;
      color: #b635a9;

      @media screen and (max-width: 900px) {
        order: 2;
        margin-top: 12px;
        /* padding-right: 0; */
      }
    }
  }
}
</style>
