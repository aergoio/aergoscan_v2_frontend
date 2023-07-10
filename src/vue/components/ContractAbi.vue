<template>
  <div>
    <Tabs :value="selectedTab" @tab-change="tabChanged" :routeReplace="true">
      <Tab
        title="ABI (JSON)"
        :route="{ query: query({ tab: 'abi' }) }"
        :id="'abi'"
      >
        <div class="content">
          <div
            class="monospace code-highlight code-highlight-pre"
            v-html="formattedAbi"
          ></div>
        </div>
      </Tab>

      <Tab
        title="Interactive"
        :route="{ query: query({ tab: 'interactive' }) }"
        :id="'interactive'"
      >
        <div class="content">
          <div class="monospace interactive-contract code-highlight">
            <div v-if="!abi">Loading...</div>
            <div v-if="abi && abi.functions.length == 0">
              Contract has no public functions.
            </div>

            <QueryFunction
              v-for="func in functions"
              :key="func.name"
              :abi="abi"
              :name="func.name"
              :address="address"
            />
            <QueryStateVariable
              v-for="variable in stateVariables"
              :key="variable.name"
              :abi="abi"
              :name="variable.name"
              :address="address"
            />
          </div>
        </div>
      </Tab>

      <Tab
        title="Events"
        :route="{ query: query({ tab: 'events' }) }"
        :id="'events'"
      >
        <div class="table-wrap">
          <div class="desc-contract">
            <span
              >Showing {{ events.length }} events from block number
              <span class="loadedNumber">{{ eventsFromMin }}</span> to
              <span class="loadedNumber">{{ eventsToMax }}</span
              >.</span
            >
            <button
              class="btn-load-more"
              v-on:click="loadPreviousEvents"
              v-if="canLoadMoreEvents && !isLoadingMoreEvents"
            >
              LOAD MORE
            </button>
            <button class="btn-load-more" v-if="isLoadingMoreEvents">
              LOADING...
            </button>
            <span v-if="!canLoadMoreEvents && !isLoadingMoreEvents"
              >(Loaded all events)</span
            >
            <span style="flex: 1 1 0%"></span>
            <div class="btn-refresh">
              <ReloadButton :action="loadNewEvents" />
            </div>
          </div>
          <div class="h-scroll">
            <events-list
              :events="events"
              :columns="['blockno', 'tx']"
              :css="tabTableCss"
            />
          </div>
        </div>
      </Tab>
    </Tabs>
  </div>
</template>

<script>
import { syntaxHighlight } from '@/src/vue/utils/syntax-highlight'
import { loadAndWait } from '@/src/vue/utils/async'
import ReloadButton from '@/src/vue/components/ReloadButton'
import QueryFunction from '@/src/vue/components/QueryFunction'
import QueryStateVariable from '@/src/vue/components/QueryStateVariable'
import EventsList from '@/src/vue/components/EventsList.vue'

const contractTabs = ['abi', 'interactive', 'events']

const defaultdict = (def) =>
  new Proxy(
    {},
    {
      get: (target, name) => (name in target ? target[name] : def),
    }
  )

const eventPage = 10000

export default {
  props: ['abi', 'codehash', 'address'],
  data() {
    return {
      viewMode: 'abi',
      interactiveResults: [],
      interactiveArguments: defaultdict({}),
      isLoading: [],
      events: [],
      eventsFrom: 0,
      eventsTo: 0,
      eventsToMax: 0,
      eventsFromMin: -1,
      isLoadingMoreEvents: false,
      bestBlock: false,
      selectedTab: 0,
      tabTableCss: {
        table: 'result-events',
      },
    }
  },
  created() {
    if (this.$route.query.tab) {
      this.selectedTab = contractTabs.indexOf(this.$route.query.tab) || 0
    }
  },
  watch: {
    selectedTab(to, from) {
      if (to === 2) {
        this.loadEvents()
      }
    },
  },
  mounted() {},
  beforeDestroy() {},
  components: {
    ReloadButton,
    QueryFunction,
    QueryStateVariable,
    EventsList,
  },
  computed: {
    functions() {
      if (!this.abi) return []
      return this.abi.functions.filter((func) => func.name !== 'constructor')
    },
    stateVariables() {
      if (!this.abi) return []
      return this.abi.state_variables
    },
    formattedAbi() {
      if (!this.$props.abi) return ''
      return syntaxHighlight(this.$props.abi)
    },
    formattedCode() {
      if (!this.codehash) return ''
      const buf = Buffer.from(this.codehash)
      return Array.from(buf)
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(' ')
    },
    canLoadMoreEvents() {
      return this.eventsFromMin > 0
    },
  },
  methods: {
    tabChanged(index) {
      this.selectedTab = index
    },
    query(newQuery) {
      return { ...this.$route.query, ...newQuery }
    },
    setViewMode(mode) {
      this.viewMode = mode
    },
    loadPreviousEvents() {
      this.loadEvents(true)
    },
    loadNewEvents() {
      this.loadEvents(true, true)
    },
    async loadEvents(append = false, loadNew = false) {
      const wait = loadAndWait()
      this.isLoadingMoreEvents = true
      if (loadNew || !this.bestBlock) {
        this.bestBlock = await this.$store.dispatch('blockchain/getBestBlock')
      }

      if (loadNew) {
        this.eventsTo = this.bestBlock.bestHeight
        this.eventsFrom = this.eventsToMax + 1
      } else {
        this.eventsTo = this.eventsFrom || this.bestBlock.bestHeight
        this.eventsFrom = Math.max(0, this.eventsTo - eventPage)
      }
      this.eventsToMax = Math.max(this.eventsToMax, this.eventsTo)
      this.eventsFromMin = Math.min(this.eventsFromMin, this.eventsFrom)
      if (this.eventsFromMin === -1) {
        this.eventsFromMin = this.eventsFrom
      }
      if (!append) this.events = []
      try {
        const events = await this.$store.dispatch('blockchain/getEvents', {
          eventName: null,
          args: [],
          address: this.address,
          blockto: this.eventsTo,
          blockfrom: this.eventsFrom,
        })
        await wait()
        this.events.push(...events)
      } catch (e) {
        console.error(e)
      }
      this.isLoadingMoreEvents = false
    },
    syntaxHighlight,
  },
}
</script>

<style lang="scss">
.table-wrap {
  .desc-contract {
    display: flex;
    align-items: center;
    margin-top: 25px;
    color: #fff;
    font-size: 14px;
    font-family: DINPro;

    .btn-load-more {
      display: flex;
      align-items: center;
      padding: 3px 5px;
      padding: 0 5px;
      border-radius: 3px;
      border: solid 1px #fff;
      background: transparent;
      color: #fff;
      font-size: 13px;
      line-height: 1.38;
      margin-left: 7px;
    }
    .btn-refresh {
      display: flex;
      align-items: center;
      margin-left: 10px;
      cursor: pointer;
    }
  }

  .result-events {
    thead {
      tr {
        th {
          &:nth-child(3) {
            min-width: 90px;
          }
        }
      }
    }

    tbody {
      tr {
        td {
          a {
            text-decoration: underline;
          }
        }
      }
    }
  }
}
.view-selector {
  display: flex;
  margin: 0 0 0 10px;

  .view-option {
    padding: 0 20px;
    line-height: 2.5;
    margin-right: 4px;
    border-radius: 4px 4px 0 0;
    cursor: pointer;
    background-color: #f0f0f0;
    color: #444;

    &:hover {
      background-color: #e7e7e7;
    }

    &.active {
      background-color: #1e1e1e;
      color: #fff;
    }
  }
}

.view-box {
  background-color: #1e1e1e;
  padding: 1em;
  line-height: 1.4;
  border-radius: 4px;
  font-weight: 500;
  color: #d4d4d4;
  margin-bottom: 20px;
}

.code-highlight-pre {
  font-family: 'Consolas', monospace;
  white-space: pre-wrap;
}

.code-highlight {
  .string,
  .boolean,
  .number,
  .null,
  .function {
    font-weight: 500;
  }

  .function {
    color: #fcffa7;
  }

  .key {
    color: #9cdcfe;
  }

  .string {
    color: #d88e73;
  }

  .boolean {
    color: #569cd6;
  }

  .number {
    color: #aecfa4;
  }

  .annotation {
    color: #ccc;
  }
}

.interactive-contract {
  .function-block {
    margin-bottom: 1em;
  }

  .arg-field {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: #fff;
  }
}

.btn-call {
  font-size: 0.9em;
  cursor: pointer;
  text-transform: uppercase;
  color: #fff;
  border-radius: 3px;

  border: 1px solid #fff;
  padding: 0 4px;
  line-height: 1em;
}

.event-table {
  td,
  th {
    text-align: left;
    padding: 0 1em 0 0;
    line-height: 2;
    word-break: normal;
  }

  th {
    white-space: nowrap;
  }
}

.loadedNumber {
  color: #fff;
}
</style>
