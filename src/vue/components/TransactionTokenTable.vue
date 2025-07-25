<template>
  <data-table
    :trans-data="data || []"
    :is-loading="isLoading"
    :css="dataTableCss"
  >
    <template slot="error" v-if="error">
      <div class="error transactions show">
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
        <div>
          <router-link class="block" :to="`/block/${row.blockno}/`">{{
            row.blockno
          }}</router-link>
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
        <account-link
          :css="accountLinkCss"
          :to-link="`/account/${row.from}/`"
          :address="$options.filters.formatEllipsisText(row.from, 25)"
          v-if="
            ![
              '1111111111111111111111111111111111111111111111111111',
              'MINT',
            ].includes(`${row.from}`.toUpperCase())
          "
        />
        <div class="txt-center" v-else>
          <span class="txt-ellipsis">MINT</span>
        </div>
      </td>
      <td>
        <div>
          <img src="~@assets/img/ic-arrow-black@3x.png" class="arrow" />
        </div>
      </td>
      <td>
        <account-link
          :css="accountLinkCss"
          :to-link="`/account/${row.to}/`"
          :address="$options.filters.formatEllipsisText(row.to, 25)"
          v-if="
            ![
              '1111111111111111111111111111111111111111111111111111',
              'BURN',
            ].includes(`${row.to}`.toUpperCase())
          "
        />
        <div class="txt-center" v-else>
          <span class="txt-ellipsis">BURN</span>
        </div>
      </td>
      <td>
        <div>
          <img
            v-if="row.address === 'AERGO' || row.token_id === 'AERGO'"
            src="~@assets/img/aergo.svg"
            class="identicon icon-circle"
          />
          <span class="identicon" v-else
            ><img :src="row.image_url" @error="onImageError"
          /></span>
          <span class="address txt-ellipsis">
            <router-link
              v-if="row.symbolHash !== 'AERGO'"
              :to="`/token/${row.symbolHash}/`"
            >
              {{ row.name }} ({{ row.symbol }})
            </router-link>
            <span v-else>
              {{ row.name }}
            </span>
          </span>
        </div>
      </td>
      <td>
        <div
          :class="[
            shouldShowTooltip(row.amount, row.decimals)
              ? 'tooltipped tooltipped-s tooltipped-multiline'
              : '',
          ]"
          :aria-label="
            shouldShowTooltip(row.amount, row.decimals)
              ? $options.filters
                  .formatBigNumAmount(row.amount, false, 18, row.decimals)
                  .replace(/<[^>]*>?/gm, '')
                  .replace(/(\.\d*?[1-9])0+$/, '$1')
                  .replace(/\.0+$/, '') +
                ' ' +
                row.symbol
              : null
          "
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
import cfg from '@/src/config'
import moment from 'moment'
import AccountLink from '@/src/vue/components/AccountLink'
import defaultTokenImage from '@/src/assets/img/btn-aergo@3x.png'

export default {
  name: 'TransactionTokenTable',
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
        pagination: 'pagination transactions-table',
        paginationInner: 'pagination-inner',
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      accountLinkCss: {
        wrapper: 'tooltipped tooltipped-s',
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
        { text: 'BLOCK #', value: 'blockno' },
        { text: 'TIME', value: 'ts' },
        { text: 'FROM', value: 'from' },
        { text: '', value: 'arrow' },
        { text: 'TO', value: 'to' },
        { text: 'TOKEN', value: 'token' },
        { text: 'AMOUNT', value: 'amount_float' },
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content token-transfers' + (this.active ? ' active' : ''),
        table:
          'transactions-token-table token' +
          (this.isLoading ? ' is-loading' : ''),
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
    loadTokenTableData: async function ({
      id,
      sortField,
      sort,
      currentPage,
      itemsPerPage,
    }) {
      this.error = ''
      const start = (currentPage - 1) * itemsPerPage
      const response = await (
        await this.$fetch.get(`${cfg.API_URL}/tokenTransfers`, {
          q: `tx_id:${id} AND (token_id:<0 OR token_id:AERGO)`,
          size: itemsPerPage,
          from: start,
          sort: `${sortField}:${sort}`,
        })
      ).json()
      if (response.error) {
        this.error = response.error.msg
      } else if (response.hits.length) {
        this.data = response.hits.map((item) => {
          const isAergo =
            item.meta.token_id === 'AERGO' || item.meta.address === 'AERGO'

          return {
            ...item.meta,
            hash: item.hash,
            symbolHash: isAergo ? 'AERGO' : item.token?.hash,
            name: isAergo ? 'AERGO' : item.token?.meta.name,
            image_url: item.token?.meta.image_url,
            symbol: isAergo ? 'AERGO' : item.token?.meta.symbol,
            decimals: item.token?.meta.decimals,
          }
        })
        this.totalItems = response.total || 0
        this.limitPageTotalCount = response.limitPageCount || 0
      } else {
        this.data = []
        this.totalItems = 0
        this.limitPageTotalCount = 0
      }
      this.$emit('onUpdateTotalCount', this.totalItems)
    },
    reload: async function (token) {
      this.isLoading = true
      await this.loadTokenTableData({
        id: token ? token : this.hash,
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
    shouldShowTooltip(amount, decimals) {
      if (!amount || !decimals) return false
      const pointPos = decimals
      const padded =
        amount.length <= pointPos ? amount.padStart(pointPos + 1, '0') : amount
      const strInt = padded.slice(0, padded.length - pointPos)
      const strDecimal = padded.slice(-pointPos)
      const strValue = strInt + '.' + strDecimal
      const float = parseFloat(strValue)
      return float > 0 && float <= 1 && strDecimal.replace(/0+$/, '').length > 6
    },
    onImageError(event) {
      event.target.src = defaultTokenImage
    },
    moment,
  },
  components: {
    AccountLink,
  },
}
</script>

<style lang="scss" scoped>
table.transactions-token-table {
  th {
    &:nth-child(4) {
      width: 25px;
      min-width: 25px;
      box-sizing: content-box;
    }

    &:nth-child(3),
    &:nth-child(4),
    &:nth-child(5) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }

    &:last-child {
      padding-right: 30px;
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
    &:nth-child(3),
    &:nth-child(5) {
      text-align: left;

      > div {
        justify-content: start;
      }
    }

    &:nth-child(4) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }
    &:last-child {
      padding-right: 30px;
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
