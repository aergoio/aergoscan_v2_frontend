<template>
  <data-table
    :trans-data="data || []"
    :is-loading="isLoading"
    :css="dataTableCss"
    :style="{
      minHeight: '400px',
    }"
  >
    <template slot="error" v-if="error">
      <div class="error internal-transactions show">
        {{ error }}
      </div>
    </template>
    <template slot="header" v-for="header in headers">
      <th class="menu-th" v-if="header.value === 'category'" :key="header.text">
        <div>
          <div class="menu-th" @click="openTableHeaderMenu($event)">
            {{ header.text
            }}<span class="icon arrow-down"
              ><img src="~@assets/img/arrow-down-s-box@3x.png"
            /></span>
          </div>
          <div class="menu-th-list">
            <div
              class="item"
              @click="dtUpdateCategory($event, category)"
              v-for="category in categories"
              :key="category"
            >
              {{ category.toUpperCase() }}
            </div>
          </div>
        </div>
      </th>
      <th v-else :key="header.text">
        <div>{{ header.text }}</div>
      </th>
    </template>
    <template slot="list" slot-scope="{ row }">
      <td>
        <router-link
          :to="`/transaction/${row.hash}/`"
          class="address tooltipped tooltipped-s"
          :aria-label="row.hash"
        >
          {{ row.hash }}
        </router-link>
      </td>
      <td class="txt-ellipsis">
        <router-link class="block" :to="`/block/${row.no}/`">
          {{ row.blockno }}
        </router-link>
      </td>

      <td>
        <div
          class="tooltipped tooltipped-se tooltipped-align-left-2"
          :aria-label="moment(row.ts).format('dddd, MMMM Do YYYY, HH:mm:ss')"
        >
          {{ moment(row.ts).format('YYYY-MM-DD HH:mm:ss') }}
        </div>
      </td>
      <td>
        <router-link
          :to="`/account/${row.from}/?tx=internalTransactions`"
          class="address tooltipped tooltipped-s"
          :aria-label="row.from"
        >
          {{ $options.filters.formatEllipsisText(row.from, 30) }}
        </router-link>
      </td>
      <td>
        <div>
          <img src="~@assets/img/ic-arrow-black@3x.png" class="arrow" />
        </div>
      </td>
      <td>
        <router-link
          :to="`/account/${row.to}/?tx=internalTransactions`"
          class="address tooltipped tooltipped-s"
          :aria-label="row.to"
        >
          {{ $options.filters.formatEllipsisText(row.to, 30) }}
        </router-link>
      </td>
      <td>
        <div>
          {{ row.category.toUpperCase() }}
        </div>
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
import { openTableHeaderMenu } from '@/src/vue/utils/filter-table-header'
import Identicon from '@/src/vue/components/Identicon'
import cfg from '@/src/config'
import moment from 'moment'
import BigNumber from 'bignumber.js'

export default {
  name: 'InternalTransactionsTable',
  props: {
    address: { type: String, default: '' },
    hash: { type: String, default: '' },
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
      default: 1,
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
    category: {
      type: String,
      default: 'all',
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
        pagination: 'pagination internal-transactions-table',
        paginationInner: 'pagination-inner',
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
  created() {},
  beforeDestroy() {},
  computed: {
    headers() {
      return [
        { text: 'TX Hash', value: 'hash' },
        { text: 'BLOCK #', value: 'blockno' },
        { text: 'TIME', value: 'ts' },
        { text: 'FROM', value: 'from' },
        { text: '', value: 'Arrow' },
        { text: 'TO', value: 'to' },
        { text: 'Tx Type', value: 'category' },
        { text: 'AMOUNT(AERGO)', value: 'amount_float' },
      ]
    },
    categories() {
      return [
        'all',
        'payload',
        'call',
        'transfer',
        'staking',
        'voting',
        'namecreate',
        'nameupdate',
        'enterprise',
        'cluster',
        'deploy',
        'redeploy',
      ]
    },
    dataTableCss() {
      return {
        wrapper:
          'tab-content internal-transactions' + (this.active ? ' active' : ''),
        table:
          'internal-transactions-table' + (this.isLoading ? ' is-loading' : ''),
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
    addressMatches(addr) {
      return addr === this.address
    },
    loadTransactionTableData: async function ({
      id,
      hash,
      category,
      sortField,
      sort,
      currentPage,
      itemsPerPage,
    }) {
      this.error = ''
      const start = (currentPage - 1) * itemsPerPage
      const response = await (
        await this.$fetch.get(
          `${cfg.API_URL}/internals`,
          category !== 'all'
            ? {
                q: `original_category:${category} AND ${
                  hash
                    ? `(_id:${hash})`
                    : `(original_from:${id} OR from:${id} OR to:${id})`
                }`,
                size: itemsPerPage,
                from: start,
                sort: `${sortField}:${sort}`,
              }
            : {
                q: `${
                  hash
                    ? `(_id:${hash})`
                    : `(original_from:${id} OR from:${id} OR to:${id})`
                }`,
                size: itemsPerPage,
                from: start,
                sort: `${sortField}:${sort}`,
              }
        )
      ).json()
      if (response.error) {
        this.error = response.error.msg
      } else if (response.hits.length) {
        this.data = response.hits.map((item, index) => ({
          ...item.meta,
          hash: item.hash,
          rank: response.from + (index + 1),
          percentage:
            this.totalSupply === '0'
              ? 0
              : new BigNumber(item.meta.balance + '00')
                  .div(new BigNumber(this.totalSupply))
                  .toFixed(),
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
    reload: async function (address) {
      this.isLoading = true
      await this.loadTransactionTableData({
        id: address ? address : this.address,
        hash: this.hash,
        category: this.selectedCategory,
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
    dtUpdateCategory: function (event, category) {
      event.target.closest('th.menu-th').classList.remove('show')

      this.selectedCategory = category
      this.currentPage = this.initialPage

      this.reload()
    },
    moment,
    BigNumber,
    openTableHeaderMenu,
  },
  components: {
    Identicon,
  },
}
</script>

<style lang="scss" scoped>
table.internal-transactions-table {
  th {
    &:nth-child(3) {
      min-width: 90px;
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
    &:nth-child(2) {
      width: 10% !important;
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

    .identicon {
      display: flex;
      justify-content: center;
      align-items: center;
      width: 18px;
      height: 18px;
      flex: 18px 0 0;
      margin-right: 4px;
    }
  }
}
</style>
