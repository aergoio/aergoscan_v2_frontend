<template>
  <div class="wrap">
    <div id="category" class="blocks">
      <Header />
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search />
            <div class="title">Blocks</div>
            <data-table
              :trans-data="data || []"
              :is-loading="isLoading"
              :css="dataTableCss"
            >
              <template slot="error" v-if="error">
                <div class="error blocks show">
                  {{ error }}
                </div>
              </template>
              <template slot="header" v-for="header in headers">
                <th v-if="header.sortable" :key="header.value">
                  <div>
                    <div
                      class="btn-th"
                      @click="dtUpdateSort($event, header.value)"
                    >
                      {{ header.text
                      }}<span
                        class="icon arrow-down up"
                        v-if="
                          sortedField === header.value && sortedDir === 'asc'
                        "
                        ><img src="~@assets/img/arrow-down-s-fill@3x.png"
                      /></span>
                      <span
                        class="icon arrow-down"
                        v-if="
                          sortedField === header.value && sortedDir === 'desc'
                        "
                        ><img src="~@assets/img/arrow-down-s-fill@3x.png"
                      /></span>
                    </div>
                  </div>
                </th>
                <th v-else>
                  <div>{{ header.text }}</div>
                </th>
              </template>
              <template slot="list" slot-scope="{ row }">
                <td>
                  <div>
                    <router-link :to="`/block/${row.no}/`">{{
                      row.no
                    }}</router-link>
                  </div>
                </td>
                <td>
                  <div
                    class="tooltipped tooltipped-se tooltipped-align-left-2"
                    :aria-label="
                      moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')
                    "
                  >
                    {{ moment(row.ts).format('YYYY-MM-DD HH:mm:ss') }}
                  </div>
                </td>
                <td>
                  <div>{{ row.txs }}</div>
                </td>
                <td>
                  <account-link
                    :css="accountLinkCss"
                    :to-link="`/votes/?highlight=${row.block_producer}`"
                    :address="row.block_producer.toString()"
                  />
                </td>
                <td>
                  <div>{{ row.size }}</div>
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
      <Footer />
    </div>
  </div>
</template>

<script>
import moment from 'moment'
import cfg from '@/src/config.js'
import Search from '@/src/vue/components/Search'
import AccountLink from '@/src/vue/components/AccountLink'

export default {
  props: {
    initialPage: {
      type: Number,
      default: 1,
    },
    itemsPerPage: {
      type: Number,
      default: 20,
    },
    defaultSort: String,
    defaultSortDirection: String,
    sortField: {
      type: String,
      default: 'no',
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
        pagination: 'pagination blocks-table',
        paginationInner: 'pagination-inner',
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      accountLinkCss: {
        wrapper: '',
        address: 'address txt-ellipsis',
        icon: 'mini-identicon',
      },
      sortedField: this.sortField,
      sortedDir: this.sort,
    }
  },
  created() {},
  beforeDestroy() {},
  computed: {
    headers() {
      return [
        { text: 'BLOCK #', value: 'no', sortable: true },
        { text: 'TIME', value: 'ts', sortable: true },
        { text: 'TXs', value: 'txs', sortable: true },
        { text: 'BLOCK PRODUCER', value: 'account', sortable: false },
        { text: 'SIZE(BYTE)', value: 'size', sortable: true },
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'table-wrap',
        table: 'block-table' + (this.isLoading ? ' is-loading' : ''),
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
    loadTableData: async function ({
      sortField,
      sort,
      currentPage,
      itemsPerPage,
    }) {
      this.error = ''
      const start = (currentPage - 1) * itemsPerPage
      const response = await (
        await this.$fetch.get(`${cfg.API_URL}/blocks`, {
          size: itemsPerPage,
          from: start,
          sort: `${sortField}:${sort}`,
        })
      ).json()
      if (response.error) {
        this.error = response.error.msg
      } else if (response.hits.length) {
        this.data = response.hits.map((item) => ({
          ...item.meta,
          hash: item.hash,
        }))
        this.totalItems = response.total
        this.limitPageTotalCount = response.limitPageCount
      } else {
        this.data = []
        this.totalItems = 0
        this.limitPageTotalCount = 0
      }
    },
    reload: async function () {
      this.isLoading = true
      await this.loadTableData({
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
    dtUpdateSort: function (event, sortField) {
      if (this.sortedField === sortField) {
        this.sortedDir = this.sortedDir === 'asc' ? 'desc' : 'asc'
      } else {
        this.sortedDir = 'desc'
        this.sortedField = sortField
      }
      this.reload()
    },
    moment,
  },
  components: {
    Search,
    AccountLink,
  },
}
</script>

<style lang="scss" scoped>
.category-inner {
  > .page-wrap {
    padding-bottom: 30px;

    @media screen and (max-width: 900px) {
      padding-top: 20px;
    }
  }
}

.table-wrap {
  padding: 20px 19px 18px 20px;
  border-radius: 5px;
  box-shadow: 2px 2px 7px 0 #e0e0e0;
  background-color: #fff;

  table {
    th {
      @media screen and (max-width: 480px) {
        &:nth-child(5) > div {
          justify-content: end;
        }
      }
    }

    td {
      @media screen and (max-width: 480px) {
        &:nth-child(5) > div {
          justify-content: end;
        }
      }

      &:nth-child(1),
      &:nth-child(4) {
        font-weight: bold;
      }

      &:nth-child(2) {
        color: #766877;
      }

      a:hover {
        text-decoration: underline;
      }
    }
  }
}
</style>
