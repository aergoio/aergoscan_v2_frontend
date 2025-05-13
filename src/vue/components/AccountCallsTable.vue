<template>
  <data-table
    :trans-data="data || []"
    :is-loading="isLoading"
    :css="dataTableCss"
  >
    <template slot="error" v-if="error">
      <div class="error token-transfers show">{{ error }}</div>
    </template>

    <template slot="header" v-for="header in headers">
      <th>
        <div>{{ header.text }}</div>
      </th>
    </template>

    <template slot="list" slot-scope="{ row }">
      <td class="txt-ellipsis">
        <div
          class="tooltipped tooltipped-se tooltipped-align-left-2"
          :aria-label="row.tx_id"
        >
          <span class="identicon" v-if="!row.success">
            <img src="~@assets/img/ic-alert-circle-fill.svg" alt="fail" />
          </span>
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
        <div class="caller-cell">
          <Identicon :text="row.caller" size="18" class="mini-identicon" />
          <router-link
            :to="`/account/${row.caller}/`"
            class="address tooltipped tooltipped-s"
            :aria-label="row.caller"
          >
            {{ $options.filters.formatEllipsisText(row.caller, 30) }}
          </router-link>
        </div>
      </td>
      <td>
        <div
          :class="
            row.args
              ? [
                  'tooltipped',
                  'tooltipped-se',
                  'tooltipped-align-left-2',
                  row.args?.length > 30 ? 'tooltipped-multiline' : '',
                ]
              : ''
          "
          :aria-label="row.args"
          style="cursor: default"
        >
          {{ row.function?.toUpperCase() }}
        </div>
      </td>
      <td>
        <div
          v-html="$options.filters.formatBigNumAmount(row.amount || '0')"
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
  name: 'AccountCallsTable',
  props: {
    address: String,
    active: Boolean,
    itemsPerPage: { type: Number, default: 10 },
    sortField: { type: String, default: '_id' },
    sort: { type: String, default: 'desc' },
  },
  data() {
    return {
      error: '',
      data: [],
      totalItems: 0,
      limitPageTotalCount: 0,
      isLoading: false,
      currentPage: 1,
      paginationCss: {
        pagination: 'pagination token-transfers-table',
        paginationInner: 'pagination-inner',
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
    }
  },
  computed: {
    headers() {
      return [
        { text: 'TX HASH', value: 'tx_id' },
        { text: 'TIME', value: 'ts' },
        { text: 'CALLER', value: 'caller' },
        { text: 'FUNCTION', value: 'function' },
        { text: 'AMOUNT', value: 'amount' },
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content calls' + (this.active ? ' active' : ''),
        table: 'calls-table' + (this.isLoading ? ' is-loading' : ''),
      }
    },
  },
  mounted() {
    this.changePage(this.currentPage)
  },
  methods: {
    async loadCallsTableData({
      address,
      sortField,
      sort,
      currentPage,
      itemsPerPage,
    }) {
      this.error = ''
      const start = (currentPage - 1) * itemsPerPage
      const response = await (
        await this.$fetch.get(`${cfg.API_URL}/contractCall`, {
          q: `(contract:${address})`,
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
          tx_id: item.meta.tx_hash,
          caller: item.meta.caller,
          function: item.meta.function,
          args: item.meta.args,
          amount: item.meta.amount,
          success: !item.meta.reverted,
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
    async reload(address) {
      this.isLoading = true
      await this.loadCallsTableData({
        address: address || this.address,
        sortField: this.sortField,
        sort: this.sort,
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      })
      this.isLoading = false
    },
    changePage(page) {
      this.currentPage = page
      this.reload()
    },
    updateCurrentPage(page) {
      this.currentPage = page
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
.caller-cell {
  display: flex;
  align-items: center;
  white-space: nowrap;
}

.caller-cell .mini-identicon {
  margin-right: 6px;
  flex-shrink: 0;
}

table.calls-table {
  td {
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
