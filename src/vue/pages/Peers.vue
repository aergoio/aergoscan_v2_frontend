<template>
  <div class="wrap">
    <div id="category" class="bp-list">
      <Header/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search/>
            <div class="peers title">
              Peers
              <div
                  class="btn-refresh"
              >
                <ReloadButton :action="reload" :style="'margin-left: 8px;'"/>
              </div>
            </div>
            <data-table :trans-data="peersSorted || []" :css="dataTableCss">
              <template slot="error" v-if="error">
                <div class="error blocks show">
                  {{ error }}
                </div>
              </template>
              <template slot="header" v-for="header in headers">
                <th v-if="header.sortable" :key="header.value">
                  <div>
                    <div class="btn-th"
                         @click="sortBy(header.value)"
                    >
                      {{ header.text }}<span class="icon arrow-down up"
                                             v-if="(sorting === header.value && sortingAsc)"><img
                        src="~@assets/img/arrow-down-s-fill@3x.png"></span>
                      <span class="icon arrow-down" v-if="(sorting === header.value && !sortingAsc)"><img
                          src="~@assets/img/arrow-down-s-fill@3x.png"></span>
                    </div>
                  </div>
                </th>
                <th v-else>
                  <div>{{ header.text }}</div>
                </th>
              </template>
              <template slot="list" slot-scope="{row}">
                <td class="peers-table peer-id">
                  <div>
                    <Identicon :text="row.address.peerid" size="18" class="mini-identicon"/>
                    <span v-if="bpsList.indexOf(row.address.peerid) === -1">{{ row.address.peerid }}</span>
                    <router-link class="address txt-ellipsis" :to="`/consensus/?highlight=${row.address.peerid}`"
                                 v-if="bpsList.indexOf(row.address.peerid) !== -1">{{ row.address.peerid }}
                    </router-link>

                    <span class="peers text-box"
                          v-if="bpsList.indexOf(row.address.peerid) !== -1 && row.acceptedroleLabel !== 'PRODUCER'">Producer</span>
                    <span class="peers text-box" v-if="raftLeaderID === row.address.peerid">Leader</span>
                    <span class="peers text-box">{{ row.acceptedroleLabel }}</span>
                    <span class="peers text-box" v-if="row.selfpeer">self</span>
                  </div>
                </td>

                <td>
                  <div>{{ row.version }}</div>
                </td>
                <td>
                  <div>{{ row.bestblock.blockno }}</div>
                </td>
                <td class="txt-ellipsis">
                  <div>
                    <router-link class="address txt-ellipsis" :to="`/block/${row.bestblock.blockhash}/`">
                      {{ row.bestblock.blockhash }}
                    </router-link>
                  </div>
                </td>
                <td>
                  <div v-if="row.bestblock.time">
                    {{ moment(row.bestblock.time / 1000000).format('MMM Do YYYY, HH:mm:ss') }}
                  </div>
                  <div v-if="!row.bestblock.time">
                    not synced
                  </div>
                </td>
              </template>
            </data-table>
            <div class="table-wrap second-table" v-if="serverInfo">
              <div class="error" v-if="error">{{ error }}</div>
              <table class="peers">
                <tbody>
                <div class="title">Server Info</div>
                <tr v-for="[key, value] in serverInfoItems" :key="key">
                  <th>
                    <div>{{ key.toUpperCase() }}</div>
                  </th>
                  <td>
                    <div class="chain-id">
                      {{ value }}
                    </div>
                  </td>
                </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  </div>
</template>

<script>
import ReloadButton from '@/src/vue/components/ReloadButton';
import Search from '@/src/vue/components/Search';
import Identicon from '@/src/vue/components/Identicon';
import moment from 'moment';

function getKey(obj, keyPath) {
  const parts = keyPath.split('.');
  let result = obj;
  let part;
  while (part = parts.shift()) {
    result = result[part];
  }
  return result;
}

// cache getBlock request Promises to not request the same block multiple times
const requests = {};

function requestBlock($store, hash) {
  if (!requests.hasOwnProperty(hash)) {
    requests[hash] = $store.dispatch('blockchain/getBlock', {blockNoOrHash: hash});
  }
  return requests[hash];
}

const PeerRoleSort = [0, 2, 3, 1];

export default {
  props: {
    defaultSort: String,
    defaultSortDirection: String,
  },
  data() {
    return {
      peers: null,
      consensusInfo: null,
      error: null,
      sorting: 'acceptedrole',
      sortingAsc: true,
      serverInfo: null,
      loadTime: null,
    }
  },
  created() {
  },
  beforeDestroy() {
  },
  watch: {
    '$route'(to, from) {
      this.reload();
    }
  },
  mounted() {
    this.reload();
  },

  computed: {
    headers() {
      return [
        {text: 'PEER ID', value: 'address.peerid', sortable: true},
        {text: 'VERSION', value: 'version', sortable: true},
        {text: 'HEIGHT', value: 'bestblock.blockno', sortable: true},
        {text: 'BLOCK HASH', value: 'blockhash', sortable: false},
        {text: 'BLOCK TIME', value: 'blocktime', sortable: false},
      ]
    },
    dataTableCss() {
      return {
        wrapper: "table-wrap",
        table: "peers-table" + (this.isLoading ? ' is-loading' : ''),
      };
    },
    serverInfoItems() {
      const items = new Map();
      if (this.serverInfo === null) return items;
      items.set('peerid', this.serverInfo.statusMap.get('id'));
      items.set('version', this.serverInfo.statusMap.get('version'));
      return Array.from(items);
    },
    selfPeerId() {
      if (!this.peers || this.peers.length === 0) return '';
      const [selfPeer] = this.peers.filter(peer => peer.selfpeer);
      return selfPeer.address.peerid;
    },
    peersSorted() {
      if (this.peers === null) return [];
      let peers = [...this.peers];
      // secondary sort by role
      peers.sort((a, b) => -(PeerRoleSort.indexOf(a.acceptedrole) - PeerRoleSort.indexOf(b.acceptedrole)));
      if (this.sorting !== 'acceptedrole') {
        // primary sort by selected field
        peers.sort((a, b) => {
          const A = getKey(a, this.sorting);
          const B = getKey(b, this.sorting);
          if (typeof A === 'string')
            return A.localeCompare(B);
          else
            return A - B;
        });
      }

      if (!this.sortingAsc) {
        peers.reverse();
      }
      return peers;
    },
    bpsList() {
      return this.consensusInfo && this.consensusInfo.bpsList ? this.consensusInfo.bpsList.map(item => item.PeerID) : [];
    },
    raftLeaderID() {
      if (!this.consensusInfo.info || !this.consensusInfo.info.Leader) return '';
      try {
        const peer = this.consensusInfo.bpsList.find(item => item.Name === this.consensusInfo.info.Leader);
        return peer.PeerID;
      } catch (e) {
        console.log(e);
        return '';
      }
    }
  },
  methods: {
    async loadConsensusInfo() {
      this.consensusInfo = Object.freeze(await this.$store.dispatch('blockchain/getConsensusInfo'));
      console.log(this.consensusInfo);
    },
    async loadServerInfo() {
      try {
        const result = await this.$store.dispatch('blockchain/getServerInfo');
        console.log(result);
        this.serverInfo = result;
      } catch (e) {
        console.error(e);
      }
    },
    async reload() {
      try {
        this.loadServerInfo();

        await this.loadConsensusInfo();

        const peers = await this.$store.dispatch('blockchain/fetchPeers');
        for (let peer of peers) {
          if (!peer.bestblock) continue;
          peer.bestblock.time = 0;
          try {
            requestBlock(this.$store, peer.bestblock.blockhash).then(block => {
              peer.bestblock.time = block.header.timestamp;
            });
          } catch (e) {
            console.error(e);
          }
        }
        this.peers = peers;
        this.loadTime = moment();
      } catch (e) {
        this.error = '' + e;
        console.error(e);
      }
    },
    sortBy(key) {
      if (this.sorting === key) {
        this.sortingAsc = !this.sortingAsc;
      } else {
        this.sorting = key;
      }
    },
    moment,
  },
  components: {
    Search,
    ReloadButton,
    Identicon,
  }
};
</script>

<style lang="scss" scoped>
.category-inner {
  > .page-wrap {
    padding-bottom: 30px;

    @media screen and (max-width: 780px) {
      padding-top: 20px;
    }
  }

  .title {
    &.block-detail {
      display: flex;
      justify-content: space-between;
    }
  }
}

table.peers {
  border-collapse: separate;
  border-spacing: 0 20px;

  th {
    width: 150px;
    height: auto;
    font-size: 14px;
    color: #a391aa;
    border-bottom: none;
    vertical-align: top;

    @media screen and (max-width: 780px) {
      padding-right: 20px;
    }

    @media screen and (max-width: 480px) {
      font-size: 15px;
    }

    > div {
      align-items: start;
    }
  }

  td {
    height: auto;
    font-size: 14px;
    border-bottom: none;
    vertical-align: top;

    @media screen and (max-width: 480px) {
      font-size: 15px;
    }

    > div {
      align-items: start;

      &.chain-id {
        word-break: break-all;
      }
    }

    .identicon {
      display: inline-block;
      width: 18px;
      height: 18px;
      flex: 18px 0 0;
      margin-right: 8px;
      vertical-align: middle;
    }
  }
}

.peers {
  &.title {
    display: flex;
    gap: 0px 0px !important;
  }
}

.peers {
  &.text-box {
    height: 16px;
    margin: 11px 6px 10px 6px;
    padding: 3px 4px;
    border-radius: 2px;
    background-color: #e4e4e4;
    text-align: center;
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 9px;
    font-weight: 400;
  }
}

.btn-refresh {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.table-wrap {
  padding: 20px 19px 50px 20px;

  &.second-table {
    font-weight: 700;
    margin-top: 15px;
    padding: 20px 20px 20px 20px;

    .title {
      font-size: 16px;
      font-weight: bold;
      line-height: 1.5;
      padding: 0 20px 23px 20px;
      margin: 0 -20px 15px;
      color: #1A1823;
      border-bottom: 1px solid #F8F8F8;
    }
  }

  .peers-table {
    &.peer-id {
      width: 40%;
      font-size: 12px;
      font-weight: bold;
      font-stretch: normal;
      font-style: normal;
      line-height: 2;
      letter-spacing: normal;
      color: #3c3b3e;
    }
  }

  .peer-block-time {
    text-align: end;
  }
}
</style>
