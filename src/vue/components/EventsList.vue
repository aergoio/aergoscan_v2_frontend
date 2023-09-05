<template>
  <table :class="[css.table, !events || !events.length ? 'not-found' : '']">
    <thead>
      <tr
        :class="
          columns.indexOf('blockno') >= 0 && columns.indexOf('tx') >= 0
            ? 'events contract'
            : 'events transaction'
        "
      >
        <th v-if="columns.indexOf('blockno') >= 0">Block</th>
        <th v-if="columns.indexOf('tx') >= 0">Tx</th>
        <th>Event Name</th>
        <th>Contract Address</th>
        <th>Arguments</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in events" :key="`${row.tx_id}${row.event_idx}`">
        <td v-if="columns.indexOf('blockno') >= 0">
          <router-link class="block" :to="`/block/${row.blockno}/`">{{
            row.blockno
          }}</router-link>
        </td>
        <td v-if="columns.indexOf('tx') >= 0">
          <router-link class="block" :to="`/transaction/${row.tx_id}/`">{{
            $window.innerWidth < 1200 ? resizeFormater(row.tx_id) : row.tx_id
          }}</router-link>
        </td>
        <td>
          {{ row.event_name }}
        </td>
        <td>
          <div v-if="`${row.contract}` !== `${address}`">
            <router-link :to="`/account/${row.contract}/`" class="block">{{
              `@${$options.filters.formatEllipsisText(row.contract, 14)}`
            }}</router-link>
          </div>
          <div v-else>
            <router-link :to="`/account/${row.contract}/`" class="block">{{
              `${$options.filters.formatEllipsisText(row.contract, 15)}`
            }}</router-link>
          </div>
        </td>
        <td width="100%">
          <span class="event-args">
            <span class="args-payload" v-if="JSON.parse(row.event_args).length">
              <pre><ArgFormatter v-for="arg of JSON.parse(row.event_args)" :key="`${arg}`" :arg="arg" class="monospace"/></pre>
            </span>
          </span>
        </td>
      </tr>
      <tr class="hidden not-found" v-if="!events || !events.length">
        <td colspan="100%">No events found.</td>
      </tr>
    </tbody>
  </table>
</template>

<script>
import { Address } from '@herajs/client'
import { resizeFormater } from '../filters/resizeFormater'

const ArgFormatter = {
  name: 'ArgFormatter',
  props: ['arg'],
  render(h) {
    if (this.arg._bignum) {
      return h('span', this.arg._bignum)
    }
    let content = [JSON.stringify(this.arg, null, 2)]
    try {
      const addr = new Address(this.arg)
      if (!addr.isName) {
        // names could be other values, too, so only format true addresses
        content = [
          h(
            'router-link',
            {
              class: 'block',
              props: {
                to: `/account/${encodeURIComponent(this.arg)}/`,
              },
            },
            [this.arg]
          ),
        ]
      }
    } catch (e) {
      // Keep basic JSON formatting
    }
    return h('span', content)
  },
}

export default {
  props: {
    events: {
      type: Array,
      default: [],
    },
    columns: {
      type: Array,
      default: [],
    },
    address: {
      type: Object | String,
      default: null,
    },
    css: {
      type: Object,
      default: () => ({
        extend: '',
      }),
    },
  },
  data() {
    return {}
  },
  components: {
    ArgFormatter,
  },
  methods: {
    resizeFormater,
  },
}
</script>

<style lang="scss">
.event-args {
  word-break: break-all;
  pre {
    margin: 0;
    font-size: 0.95em;
    white-space: pre;
  }
}

.events {
  &.contract {
    th {
      &:nth-child(1) {
        width: 10%;
      }
      &:nth-child(2) {
        width: 30%;
      }
      &:nth-child(3) {
        min-width: 80px;
        width: 13%;
      }
      &:nth-child(4) {
        width: 16%;
      }
      &:nth-child(5) {
        width: 60%;
      }
    }
  }
  &.transaction {
    th {
      &:nth-child(1) {
        min-width: 100px;
        width: 15%;
      }
      &:nth-child(2) {
        min-width: 120px;
        width: 25%;
      }
      &:nth-child(3) {
        width: 55%;
      }
    }
  }
}
</style>
