<template>
  <data-table :trans-data="data || []" :is-loading="isLoading" :css="dataTableCss">
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
    <template slot="list" slot-scope="{row}">
      <td>
        <div>
          <router-link :to="`/block/${row.blockno}/`" class="address txt-ellipsis">{{ row.blockno }}</router-link>
        </div>
      </td>
      <td>
        <div>
          <Identicon :text="row.address" size="18" class="mini-identicon"/>
          <router-link :to="`/account/${row.address}/`" class="address txt-ellipsis">{{ row.address }}</router-link>
          <span class="boxicon blue" v-if="row.address === address">Current</span>
        </div>
      </td>
      <td>
        <div>
          <router-link :to="`/transaction/${row.tx}`" class="address">
            {{ row.tx }}
          </router-link>
        </div>
      </td>
    </template>
  </data-table>
</template>
<script>

import Identicon from '@/src/vue/components/Identicon';

export default {
  name: 'AccountNameHistoryTable',
  props: {
    address: String,
    active: {
      type: Boolean,
      default: false,
    },
    nameHistory: {
      type: Array,
      default:[]
    }
  },
  data() {
    return {
      error: '',
      data: this.nameHistory,
      isLoading: false,
    }
  },
  created() {
  },
  beforeDestroy() {
  },
  computed: {
    headers() {
      return [
        {text: 'Since Block', value: 'sinceblock'},
        {text: 'Destination', value: 'destination'},
        {text: 'Transaction', value: 'transaction'},
      ]
    },
    dataTableCss() {
      return {
        wrapper: 'tab-content nft-inventory' + (this.active ? ' active' : ''),
        table: "nft-inventory-table" + (this.isLoading ? ' is-loading' : ''),
      };
    },
  },
  mounted() {
  },
  methods: {
  },
  components: {Identicon}
};
</script>

<style lang="scss" scoped>
table.nft-inventory-table {
  th {
    @media screen and (max-width: 480px) {
      &:last-child {
        text-align: right;

        &>div {
          justify-content: end;
        }
      }
    }

    &:last-child {
      width: 150px;
    }
  }

  td {
    @media screen and (max-width: 480px) {
      &:last-child {
        text-align: right;

        &>div {
          justify-content: end;
        }
      }
    }

    &:last-child {
      width: 150px;
    }
  }
}
</style>
