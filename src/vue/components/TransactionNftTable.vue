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
          :address="row.from.toString()"
          v-if="
            ![
              '1111111111111111111111111111111111111111111111111111',
              'MINT',
            ].includes(`${row.from}`.toUpperCase())
          "
          :name="$options.filters.formatEllipsisText(row.from, 30)"
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
          :address="row.to.toString()"
          v-if="
            ![
              '1111111111111111111111111111111111111111111111111111',
              'MINT',
            ].includes(`${row.to}`.toUpperCase())
          "
          :name="$options.filters.formatEllipsisText(row.to, 30)"
        />
        <div class="txt-center" v-else>
          <span class="txt-ellipsis">BURN</span>
        </div>
      </td>
      <td>
        <div>
          <!-- <span class="identicon default" v-if="!row.image_url"></span> -->
          <span class="identicon"
            ><img :src="row.image_url" @error="onImageError"
          /></span>
          <router-link :to="`/nft/${row.address}`" class="address">
            {{ `${row.name} (${row.symbol})` }}
          </router-link>
        </div>
      </td>
      <td>
        <div>
          <router-link
            :to="`/nft/${row.address}/?tx=inventory&keyword=${row.token_id}`"
            class="address"
          >
            {{ row.token_id }}
          </router-link>
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
import defaultTokenImage from '@/src/assets/img/btn-aergo@3x.png'

export default {
  name: 'TransactionNftTable',
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
        { text: 'NFT', value: 'nft' },
        { text: 'TOKEN ID', value: 'tokenid' },
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content nft-transfers' + (this.active ? ' active' : ''),
        table: 'transactions-table nft' + (this.isLoading ? ' is-loading' : ''),
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
    loadNftTableData: async function ({
      id,
      sortField,
      sort,
      currentPage,
      itemsPerPage,
    }) {
      this.error = ''
      const start = (currentPage - 1) * itemsPerPage
      const response = await (
        await this.$fetch.get(`${cfg.API_URL}/nftTransfers`, {
          q: `tx_id:${id} AND token_id:>0`,
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
          name: item.token.meta.name,
          image_url: item.token.meta.image_url,
          symbol: item.token.meta.symbol,
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
    reload: async function (token) {
      this.isLoading = true
      await this.loadNftTableData({
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
table.transactions-table {
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
