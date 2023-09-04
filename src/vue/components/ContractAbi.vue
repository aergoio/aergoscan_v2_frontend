<template>
  <div>
    <Tabs :value="selectedTab" @tab-change="tabChanged" :routeReplace="true">
      <Tab
        title="ABI (JSON)"
        :route="{ query: query({ tab: 'abi' }) }"
        :id="'abi'"
      >
        <div class="content">
          <codemirror
            class="json"
            :key="interactiveKey"
            v-if="jsonCode !== 'Loading...'"
            v-model="jsonCode"
            :options="jsonOptions"
          />
          <div v-else>Loading...</div>
        </div>
      </Tab>

      <Tab
        title="Interactive"
        :route="{ query: query({ tab: 'interactive' }) }"
        :id="'interactive'"
      >
        <div class="content h-scroll">
          <div
            :style="{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap-reverse',
            }"
          >
            <div :style="{ display: 'flex' }">
              <ConnectLoginButton @message="handleAlertMessage" />
              <div class="alert" v-if="alert">
                {{ message }}
              </div>
            </div>
            <div
              :style="{
                display: 'flex',
                justifyContent: 'space-between',
                width: '140px',
                minWidth: '140px',
              }"
            >
              <button
                class="expandButton"
                @click="() => handleClickAll(!clickAll)"
              >
                {{ clickAll ? `[Expand All]` : `[No Expand]` }}
              </button>

              <button class="expandButton" @click="handleClickReset">
                [Reset]
              </button>
            </div>
          </div>

          <div
            class="monospace interactive-contract code-highlight"
            :key="interactiveKey"
          >
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
              :clickAll="clickAll"
              @onUpdateResultHash="onUpdateResultHash"
            />
            <QueryStateVariable
              v-for="variable in stateVariables"
              :key="variable.name"
              :abi="abi"
              :name="variable.name"
              :address="address"
              :clickAll="clickAll"
            />
          </div>
        </div>
      </Tab>

      <Tab
        title="Events"
        :route="{ query: query({ tab: `events ${totalEvents}` }) }"
        :id="'events'"
      >
        <div class="table-wrap">
          <div class="h-scroll">
            <events-list
              :events="events"
              :columns="['blockno', 'tx']"
              :css="tabTableCss"
            />
            <pagination
              slot="pagination"
              :css="paginationCss"
              :page="currentPage"
              :total-items="limitPageTotalCount"
              :itemsPerPage="itemsPerPage"
              @onUpdate="changePage"
              @updateCurrentPage="updateCurrentPage"
            />
          </div>
        </div>
      </Tab>

      <Tab title="Code" :route="{ query: query({ tab: 'code' }) }" :id="'code'">
        <div class="content">
          <codemirror
            v-if="code.code"
            v-model="code.code"
            :options="luaOptions"
          />
          <div v-else>No Authorized Code</div>
          <!-- <div class="desc-contract"></div> -->
        </div>
      </Tab>
    </Tabs>
  </div>
</template>

<script>
import { syntaxHighlight } from '@/src/vue/utils/syntax-highlight'
// import { loadAndWait } from '@/src/vue/utils/async'
import cfg from '@/src/config'
import ReloadButton from '@/src/vue/components/ReloadButton'
import QueryFunction from '@/src/vue/components/QueryFunction'
import QueryStateVariable from '@/src/vue/components/QueryStateVariable'
import EventsList from '@/src/vue/components/EventsList.vue'
import ConnectLoginButton from '@/src/vue/components/ConnectLoginButton.vue'

import { codemirror } from 'vue-codemirror'
import 'codemirror/lib/codemirror.css'
import 'codemirror/theme/material-ocean.css'
import 'codemirror/mode/javascript/javascript.js'
import 'codemirror/mode/lua/lua.js'

// foldGutter
import 'codemirror/addon/fold/foldgutter.css'
import 'codemirror/addon/fold/brace-fold.js'
import 'codemirror/addon/fold/comment-fold.js'
import 'codemirror/addon/fold/foldcode.js'
import 'codemirror/addon/fold/foldgutter.js'
import 'codemirror/addon/fold/indent-fold.js'
import 'codemirror/addon/fold/markdown-fold.js'
import 'codemirror/addon/fold/xml-fold.js'

const contractTabs = ['abi', 'interactive', 'events', 'code']

const defaultdict = (def) =>
  new Proxy(
    {},
    {
      get: (target, name) => (name in target ? target[name] : def),
    }
  )

export default {
  props: ['abi', 'codehash', 'address'],
  data() {
    return {
      viewMode: 'abi',
      interactiveResults: [],
      interactiveArguments: defaultdict({}),
      isLoading: [],
      events: [],
      totalEvents: 0,
      paginationCss: {
        pagination: 'pagination events',
        paginationInner: 'pagination-events',
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      },
      currentPage: 1,
      itemsPerPage: 10,
      limitPageTotalCount: 0,
      selectedTab: 0,
      tabTableCss: {
        table: 'result-events',
      },
      code: {},
      jsonOptions: {
        tabSize: 4,
        styleActiveLine: true,
        lineNumbers: true,
        line: true,
        lineWrapping: true,
        foldGutter: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        readOnly: true,
        theme: 'material-ocean',
        mode: 'application/json',
      },
      luaOptions: {
        // tabSize: 4,
        // styleActiveLine: true,
        lineNumbers: true,
        line: true,
        lineWrapping: true,
        gutters: ['CodeMirror-linenumbers', 'CodeMirror-foldgutter'],
        readOnly: true,
        theme: 'material-ocean',
        mode: 'text/x-lua',
      },
      message: '',
      alert: false,
      clickAll: true,
      interactiveKey: 0,
      // jsonCode: '',
    }
  },

  created() {
    if (this.$route.query.tab) {
      this.selectedTab = contractTabs.indexOf(this.$route.query.tab) || 0
    }
  },
  watch: {
    selectedTab(to, from) {
      if (to === 0) {
        this.interactiveKey += 1
      }
      if (to === 2) {
        this.loadEvents()
      }
      if (to === 3) {
        this.loadCode()
      }
    },
  },
  mounted() {
    this.changePage(this.currentPage)
  },

  beforeDestroy() {},
  components: {
    ReloadButton,
    QueryFunction,
    QueryStateVariable,
    EventsList,
    ConnectLoginButton,
    codemirror,
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
    jsonCode() {
      if (!this.$props.abi) {
        return 'Loading...'
      } else {
        return JSON.stringify(this.$props.abi, null, 2)
      }
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
    reload: async function () {
      this.isLoading = true
      await this.loadEvents({
        currentPage: this.currentPage,
        itemsPerPage: this.itemsPerPage,
      })
      this.isLoading = false
    },
    async loadEvents() {
      ;(async () => {
        const start = (this.currentPage - 1) * this.itemsPerPage
        const response = await (
          await this.$fetch.get(`${cfg.API_URL}/event`, {
            q: `contract:${this.address}`,
            from: start,
            size: this.itemsPerPage,
          })
        ).json()
        if (response.error) {
          this.error = response.error.msg
        } else if (response.hits.length) {
          this.totalEvents = response.total
          this.events = response.hits
          this.limitPageTotalCount = response.total
        } else {
          this.events = []
          this.limitPageTotalCount = 0
        }
      })()
    },

    async loadCode() {
      ;(async () => {
        try {
          const response = await this.$fetch.get(`${cfg.API_URL}/contractTx`, {
            q: `_id:${this.address}`,
          })
          const data = await response.json()
          if (data.hits.length > 0) {
            this.code = {
              code: data.hits[0].meta.code,
              code_url: data.hits[0].meta.code_url,
            }
          }
        } catch (e) {
          console.error(e)
          this.isLoadingDetail = false
        }
      })()
    },

    syntaxHighlight,
    onUpdateResultHash(callContractHash) {
      this.$emit('onUpdateResultHash', callContractHash)
    },
    changePage: function (currentPage) {
      this.currentPage = currentPage
      this.reload()
    },
    updateCurrentPage: function (currentPage) {
      this.currentPage = currentPage
    },

    handleAlertMessage(message) {
      if (!message) {
        this.alert = false
        this.message = ''
      } else {
        this.alert = true
        this.message = message
      }
    },
    handleClickAll(click) {
      this.clickAll = click
    },
    handleClickReset() {
      this.clickAll = true
      this.interactiveKey += 1
    },
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
            /* text-decoration: underline; */
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
.connect_button {
  display: flex;
  align-items: center;
  cursor: pointer;
  width: fit-content;
  border: 1px solid rgba(76, 68, 82, 1);
  background-color: #2d2b37;
  border-radius: 0.5rem;
  padding: 0.5rem;
  margin-bottom: 1rem;
  transition: background-color 0.3s ease-out;
  .status {
    content: '\f111';
    margin-right: 4px;
    width: 5px;
    height: 5px;
    border-radius: 50%;

    &.no_connect {
      border: solid 5px rgb(220, 53, 69);
      background-color: rgb(220, 53, 69);
    }
    &.connected {
      border: solid 5px rgb(0, 161, 134);
      background-color: rgb(0, 161, 134);
    }
  }
  .large_font {
    font-size: 0.7em;
  }
  .small_font {
    opacity: 0.5;
    font-size: 0.5em;
  }
}
.connect_button:hover {
  background-color: #69647e;
}
.code-highlight-pre {
  margin: 0.5rem;
  font-family: 'Roboto Mono', monospace;
  white-space: pre-wrap;
  .result_title {
    color: #fff;
    border-bottom: 1px solid rgb(76, 68, 82);
    padding-top: 5px;
    padding-bottom: 10px;
  }
  .result_content {
    margin-top: 10px;
  }
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

.expandButton {
  background: none;
  border: none;
  padding: 0;
  display: inline-block;
  /* font-weight: bold; */
  border-radius: 2px;
  color: #279ecc;

  &:hover {
    color: #0784c3;
    text-decoration: none;
  }
}

.interactive-contract {
  .function-block {
    border: 1px solid rgba(76, 68, 82, 1);
    border-radius: 0.5rem;

    display: flex;
    flex-direction: column;
    margin-bottom: 1rem;
    transition: color 0.3s ease-in-out;
    .function {
      padding: 0.5rem;
      /* background-color: #1e1b26; */
      background-color: #2d2b37;
      border-radius: 0.5rem;
      cursor: pointer;
      color: #fff;
      &.show {
        border-radius: 0.5rem 0.5rem 0 0;
      }
    }
    .function:hover {
      color: #066a9c;
    }

    .function_body {
      animation-duration: 0.3s;
      &.show {
        height: 100%;
        padding: 0.5rem;
        border-radius: 0.5rem;
        animation-name: fadeIn;
      }
      &.hide {
        animation-name: fadeOut;
      }

      @keyframes fadeIn {
        0% {
          opacity: 0;
          transform: translateY(-10px);
        }
        100% {
          opacity: 1;
          transform: translateY(0);
        }
      }

      @keyframes fadeOut {
        0% {
          opacity: 1;
          transform: translateY(0);
        }
        100% {
          opacity: 0;
          transform: translateY(-10px);
        }
      }
    }
  }

  .arg-field {
    display: block;
    width: 100%;
    border: 1px solid rgba(76, 68, 82, 1);
    padding: 0.3rem 0.6rem;
    font-size: 0.9062rem;
    font-weight: 400;
    line-height: 1.5;
    background-color: #111a2e;

    /* background-clip: border-box; */
    background-clip: padding-box;
    appearance: none;
    border-radius: 0.5rem;
    /* transition: border-color 0.15s ease-in-out, box-shadow 0.15s ease-in-out; */
    border: none;
    color: #fff;
  }
  .arg-field:focus {
    outline: none; /* 포커스 시 나타나는 외곽선 제거 */
    border: 2px solid rgba(76, 68, 82, 1) !important;
  }
}

.btn-call {
  display: inline-block;
  margin-top: 0.5rem;
  margin-right: 0.5rem;
  font-size: 0.9em;
  padding: 0.5rem;
  cursor: pointer;
  text-align: center;
  color: #f2f6fa;
  background-color: #3a4759;
  border: 1px solid rgba(76, 68, 82, 1);
  border-radius: 0.5rem;
  line-height: 1em;
  transition: background-color 0.3s;

  &.disabled {
    cursor: not-allowed;
    opacity: 0.65;
  }
  &:not(.disabled):hover {
    background-color: #47566a;
  }
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

.CodeMirror {
  font-size: smaller;
  height: max-content;
  line-height: 1.5;
  font-family: 'Roboto Mono', monospace;
  /* font-family: 'Lato', monospace; */

  &.cm-s-material-ocean,
  .CodeMirror-foldgutter,
  .CodeMirror-linenumbers,
  .CodeMirror-gutters {
    background: #363344;
  }
  .CodeMirror-linenumber {
    color: #fff;
    width: 25px;
  }
  .CodeMirror-guttermarker-subtle {
    color: #999;
  }
}
.json {
  .cm-s-material-ocean {
    .cm-string {
      color: #d88e73;
    }
    .cm-property {
      color: #9cdcfe;
    }
    .cm-atom {
      color: #569cd6;
    }
    .cm-number {
      color: #aecfa4;
    }
  }
}
.alert {
  margin-top: 10px;
  margin-left: 10px;
  color: #f07178;
}
</style>
