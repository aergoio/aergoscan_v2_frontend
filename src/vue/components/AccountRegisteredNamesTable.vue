<template>
  <data-table
    :trans-data="data || []"
    :is-loading="isLoading"
    :css="dataTableCss"
    :style="{ overflow: 'auto' }"
  >
    <template slot="error" v-if="error">
      <div class="error nft-inventory show">
        {{ error }}
      </div>
    </template>
    <template slot="header" v-for="header in headers">
      <th>
        <div>{{ header.text }}</div>
      </th>
    </template>
    <template slot="list" slot-scope="{ row }">
      <td>
        <div>
          <router-link
            :to="`/account/${row.name}/`"
            class="address txt-ellipsis"
            >{{ row.name }}</router-link
          >
        </div>
      </td>
      <td>
        <div>
          <router-link
            :to="`/block/${row.blockno}/`"
            class="address txt-ellipsis"
            >{{ row.blockno }}</router-link
          >
        </div>
      </td>
      <td>
        <div>
          <Identicon :text="row.address" size="18" class="mini-identicon" />
          <router-link
            :to="`/account/${row.address}/`"
            class="address txt-ellipsis"
            >{{ row.address }}</router-link
          >
        </div>
      </td>
      <td>
        <div>
          <router-link
            :to="`/transaction/${row.tx}/`"
            class="address txt-ellipsis"
            >{{ row.tx }}</router-link
          >
        </div>
      </td>
    </template>
  </data-table>
</template>
<script>
import Identicon from '@/src/vue/components/Identicon'

export default {
  name: 'AccountRegisteredNamesTable',
  props: {
    address: String,
    active: {
      type: Boolean,
      default: false,
    },
    nameCurrent: {
      type: Array,
      default: [],
    },
  },
  data() {
    return {
      error: '',
      data: this.nameCurrent,
      isLoading: false,
    }
  },
  created() {},
  beforeDestroy() {},
  computed: {
    headers() {
      return [
        { text: 'NAME', value: 'name' },
        { text: 'SINCE BLOCK', value: 'sinceblock' },
        { text: 'DESTINATION', value: 'destination' },
        { text: 'TRANSACTION', value: 'transaction' },
      ]
    },
    dataTableCss() {
      return {
        wrapper:
          'tab-content registered-names' + (this.active ? ' active' : ''),
        table: 'registered-names-table' + (this.isLoading ? ' is-loading' : ''),
      }
    },
  },
  mounted() {},
  methods: {},
  components: {
    Identicon,
  },
}
</script>

<style lang="scss" scoped>
table.registered-names-table {
  th {
    &:nth-child(4) {
      text-align: center;

      > div {
        justify-content: center;
      }
    }

    &:last-child {
      width: 150px;
    }
  }

  td {
    &:nth-child(4) {
      text-align: right;

      > div {
        justify-content: right;
      }
    }

    &:last-child {
      width: 150px;
    }
  }
}
</style>
