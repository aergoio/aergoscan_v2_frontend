<template>
  <table :class="[css.table, !events || !events.length ? 'not-found' : '']">
    <thead>
      <tr>
        <th v-if="columns.indexOf('blockno') >= 0">Block</th>
        <th v-if="columns.indexOf('tx') >= 0">Tx</th>
        <th>Event Name</th>
        <th>Arguments</th>
      </tr>
    </thead>
    <tbody>
      <tr v-for="row in events" :key="`${row.tx_id}${row.event_idx}`">
        <td v-if="columns.indexOf('blockno') >= 0">
          <router-link :to="`/block/${row.blockno}/`">{{
            row.blockno
          }}</router-link>
        </td>
        <td v-if="columns.indexOf('tx') >= 0">
          <router-link :to="`/transaction/${row.tx_id}/`">{{
            row.tx_id
          }}</router-link>
        </td>
        <td>
          {{ row.event_name }}
          <div v-if="`${row.contract}` !== `${address}`">
            @
            <router-link :to="`/account/${row.contract}/`"
              >{{ `${row.contract}`.substr(0, 5) }}...</router-link
            >
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
            { props: { to: `/account/${encodeURIComponent(this.arg)}/` } },
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
      type: Object,
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
}
</script>

<style lang="scss">
.event-args {
  word-break: break-all;
  pre {
    margin: 0;
    font-size: 0.95em;
  }
}
</style>
