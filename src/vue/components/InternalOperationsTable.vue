<template>
  <data-table
    :trans-data="data || []"
    :is-loading="isLoading"
    :css="dataTableCss"
  >
    <template slot="error" v-if="error">
      <div class="error internal-operations show">
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
      <td class="txt-ellipsis" v-if="isContract">
        <router-link class="block" :to="`/block/${row.blockno}/`">
          {{ row.blockno }}
        </router-link>
      </td>
      <td v-if="isContract">
        <div>
          {{ moment(row.ts).fromNow() }}
        </div>
      </td>
      <td v-if="isContract">
        <router-link
          :to="`/transaction/${row.tx_hash}?tx=internalOperations`"
          class="address tooltipped tooltipped-se tooltipped-align-left-2"
          :aria-label="row.tx_hash"
        >
          {{ $options.filters.formatEllipsisText(row.tx_hash, 30) }}
        </router-link>
      </td>

      <td>
        <router-link
          :to="`/account/${row.caller}/${
            row.codeHash ? `?tx=internalOperations` : ``
          }`"
          class="address tooltipped tooltipped-se tooltipped-align-left-2"
          :aria-label="row.caller"
        >
          {{ $options.filters.formatEllipsisText(row.caller, 30) }}
        </router-link>
      </td>
      <td v-if="!isContract">
        <router-link
          :to="`/account/${row.contract}?tx=internalOperations`"
          class="address tooltipped tooltipped-se tooltipped-align-left-2"
          :aria-label="row.contract"
        >
          {{ $options.filters.formatEllipsisText(row.contract, 30) }}
        </router-link>
      </td>

      <td>
        {{ row.function.toUpperCase() }}
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
  name: 'InternalOperationsTable',
  props: {
    address: { type: String, default: '' },
    isContract: { type: Boolean, default: false },
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
      default: 'amount_float',
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
  components: {
    Identicon,
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
        pagination: 'pagination internal-operations-table',
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
      return this.isContract
        ? [
            { text: 'BLOCK #', value: 'blockno' },
            { text: 'TIME', value: 'ts' },
            { text: 'TX HASH', value: 'tx_hash' },
            { text: 'CALLER', value: 'caller' },
            { text: 'FUNCTION', value: 'function' },
            { text: 'AMOUNT(AERGO)', value: 'amount' },
          ]
        : [
            { text: 'FROM', value: 'caller' },
            { text: 'TO', value: 'contract' },
            { text: 'FUNCTION', value: 'function' },
            { text: 'AMOUNT(AERGO)', value: 'amount' },
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
          'tab-content internal-operations' + (this.active ? ' active' : ''),
        table:
          'internal-operations-table' + (this.isLoading ? ' is-loading' : ''),
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
      hash,
      currentPage,
      itemsPerPage,
    }) {
      this.error = ''
      const start = (currentPage - 1) * itemsPerPage
      const query = this.address
        ? `(caller:${this.address} OR contract:${this.address})`
        : `tx_hash:${hash}`
      const response = await (
        await this.$fetch.get(`${cfg.API_URL}/contractCall`, {
          q: `${query}`,
          size: itemsPerPage,
          from: start,
          sort: '_id:asc',
        })
      ).json()
      if (response.error) {
        this.error = response.error.msg
      } else if (response.hits.length) {
        const accounts = await Promise.all(
          response.hits.map(async (item) => {
            const account = await this.$store.dispatch(
              'blockchain/getAccount',
              {
                address: item.meta.caller,
              }
            )
            return {
              ...item.meta,
              hash: item.hash,
              rank: response.from + (response.hits.indexOf(item) + 1),
              codeHash: account?.codehash || null,
            }
          })
        )

        this.data = accounts
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
      await this.loadTransactionTableData({
        hash: this.hash,
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
}
</script>

<style lang="scss" scoped>
table.internal-operations-table {
  tr:hover {
    background: #f8f9fa;
  }
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
    white-space: nowrap;
    &:nth-child(1) {
      width: 120px;
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
