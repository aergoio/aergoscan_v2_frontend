<template>
  <data-table
    :trans-data="data || []"
    :is-loading="isLoading"
    :css="dataTableCss"
  >
    <template slot="error" v-if="error">
      <div class="error token-transfers show">
        {{ error }}
      </div>
    </template>
    <template slot="header" v-for="header in headers">
      <th v-if="header.value === 'fromto'">
        <div>
          FROM
          <img src="~@assets/img/ic-arrow-pink@3x.png" class="arrow" />
          TO
        </div>
      </th>
      <th class="menu-th" v-else-if="header.value === 'token'">
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
              @click="dtUpdateToken($event, token)"
              v-for="token in tokenHeaders"
              :key="token.value"
            >
              {{ token.text.toUpperCase() }}
            </div>
          </div>
        </div>
      </th>
      <th v-else>
        <div>{{ header.text }}</div>
      </th>
    </template>
    <template slot="list" slot-scope="{ row }">
      <td class="txt-ellipsis">
        <div>
          <router-link
            :to="`/transaction/${row.tx_id}/`"
            class="address txt-ellipsis"
          >
            {{ row.tx_id }}
          </router-link>
        </div>
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
        <div>
          <span
            class="boxicon gray"
            v-if="['BURN'].includes(`${row.to}`.toUpperCase())"
            >BURN</span
          >
          <span
            class="boxicon gray"
            v-else-if="['MINT'].includes(`${row.from}`.toUpperCase())"
            >MINT</span
          >
          <span class="boxicon red" v-else-if="row.from === address">TO</span>
          <span class="boxicon blue" v-else-if="row.from !== address"
            >FROM</span
          >

          <template v-if="!['BURN'].includes(`${row.to}`.toUpperCase())">
            <Identicon :text="row.to" size="18" class="mini-identicon" />
            <router-link :to="`/account/${row.to}/`" class="address">
              {{ $options.filters.formatEllipsisText(row.to, 30) }}
            </router-link>
          </template>
        </div>
      </td>
      <td class="txt-ellipsis">
        <div>
          <span class="identicon default" v-if="!row.image_url"></span>
          <span class="identicon" v-else><img :src="row.image_url" /></span>
          <router-link
            :to="`/token/${row.symbolHash}/`"
            class="address txt-ellipsis"
          >
            {{ row.name }} ({{ row.symbol }})</router-link
          >
        </div>
      </td>
      <td>
        <div
          v-html="
            $options.filters.formatBigNumAmount(
              row.amount,
              false,
              6,
              row.decimals
            )
          "
        ></div>
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

export default {
  name: 'AccountTokenTransferTable',
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
      default: 'ts',
    },
    sort: {
      type: String,
      default: 'desc',
    },
    filteredTokens: {
      type: Array,
      default: () => {
        return []
      },
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
        pagination: 'pagination token-transfers-table',
        paginationInner: 'pagination-inner',
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      sortedField: this.sortField,
      sortedDir: this.sort,
      selectedFilterToken: 'all',
    }
  },
  created() {},
  beforeDestroy() {},
  computed: {
    headers() {
      return [
        { text: 'TX HASH', value: 'hash' },
        { text: 'TIME', value: 'ts' },
        { text: 'FROMTO', value: 'fromto' },
        { text: 'TOKEN', value: 'token' },
        { text: 'AMOUNT', value: 'amount_float' },
      ]
    },
    tokenHeaders() {
      return [{ text: 'ALL', value: 'all' }].concat(this.filteredTokens)
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content token-transfers' + (this.active ? ' active' : ''),
        table: 'token-transfers-table' + (this.isLoading ? ' is-loading' : ''),
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
    loadTokenTransferTableData: async function ({
      address,
      filteredToken,
      sortField,
      sort,
      currentPage,
      itemsPerPage,
    }) {
      this.error = ''
      const start = (currentPage - 1) * itemsPerPage
      const response = await (
        await this.$fetch.get(`${cfg.API_URL}/tokenTransfers`, {
          q:
            filteredToken === 'all'
              ? `(from:${address} OR to:${address}) AND token_id:<0`
              : `(from:${address} OR to:${address}) AND address:${filteredToken} AND token_id:<0`,
          size: itemsPerPage,
          from: start,
          sort: `${sortField}:${sort}`,
        })
      ).json()
      console.log(response, 'responseresponse!! here')
      if (response.error) {
        this.error = response.error.msg
      } else if (response.hits.length) {
        this.data = response.hits.map((item) => ({
          ...item.meta,
          hash: item.hash,
          symbolHash: item.token.hash,
          name: item.token.meta.name,
          image_url: item.token.meta.image_url,
          symbol: item.token.meta.symbol,
          decimals: item.token.meta.decimals,
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
      await this.loadTokenTransferTableData({
        address: address ? address : this.address,
        filteredToken: this.selectedFilterToken,
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
    dtUpdateToken: function (event, token) {
      event.target.closest('th.menu-th').classList.remove('show')

      this.selectedFilterToken = token.value
      this.currentPage = this.initialPage

      this.reload()
    },
    moment,
    openTableHeaderMenu,
  },
  components: {
    Identicon,
  },
}
</script>

<style lang="scss" scoped>
table.token-transfers-table {
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

    .aergo {
      margin-right: 5px;
    }
  }
}
</style>
