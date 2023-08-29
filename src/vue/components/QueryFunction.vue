<template>
  <div class="function-block">
    <span :class="isClick ? `function show` : `function`" @click="handleClick"
      >{{ name }}
    </span>
    <span :class="isClick ? `downbutton` : `upbutton`"></span>

    <div
      :class="isClick ? `function_body show` : `function_body hide`"
      v-if="isClick"
    >
      <div v-if="func.arguments.length">
        <div
          v-for="(arg, idx) in func.arguments"
          :key="arg.name"
          :style="{ minHeight: '60px' }"
        >
          <span class="key">{{ arg.name }}</span>
          <input type="text" v-model="args[arg.name]" class="arg-field" />
          <!-- <span v-if="idx != func.arguments.length - 1"></span> -->
        </div>
      </div>
      <span class="btn-call" v-if="!isLoading" v-on:click="queryContract">
        Query
      </span>
      <span
        :class="getActiveAccount?.address ? `btn-call` : `btn-call disabled`"
        v-if="!isLoading && !func.view"
        v-on:click="callToConnect"
      >
        Call
      </span>
      <span class="btn-call" v-if="isLoading">Loading...</span>
      <div v-if="typeof result !== 'undefined'" class="code-highlight-pre">
        <div :style="{ display: 'flex', flexDirection: 'column' }">
          <span class="result_title">Result</span>
          <span class="result_content" v-html="syntaxHighlight(result)"></span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadAndWait } from '@/src/vue/utils/async'
import { syntaxHighlight } from '@/src/vue/utils/syntax-highlight'

export default {
  props: ['abi', 'name', 'address', 'callContractHash', 'clickAll'],
  data() {
    return {
      args: {},
      result: void 0,
      isLoading: false,
      isClick: false,
    }
  },
  watch: {
    clickAll() {
      if (!this.clickAll) {
        this.isClick = true
      } else {
        this.isClick = false
      }
    },
  },
  computed: {
    func() {
      return this.abi.functions.find((func) => func.name === this.name) || {}
    },
    getActiveAccount() {
      return this.$store.getters[`blockchain/getActiveAccount`]
    },
  },

  methods: {
    syntaxHighlight,
    async queryContract() {
      const wait = loadAndWait()

      const args = this.args
      const argValues = this.func.arguments.map((arg) => args[arg.name])
      if (argValues.some((item) => typeof item === 'undefined')) {
        this.result = {
          error: 'You did not provide all arguments',
        }
        return
      }

      this.isLoading = true
      this.result = void 0

      let result
      try {
        result = await this.$store.dispatch('blockchain/queryContract', {
          name: this.name,
          args: argValues,
          abi: this.abi,
          address: this.address,
        })
      } catch (e) {
        let errorMsg
        try {
          errorMsg = e.metadata.headersMap['grpc-message']
        } catch (_) {
          errorMsg = e
        }
        result = { error: errorMsg }
      }
      await wait()
      this.result = result
      this.isLoading = false
    },
    handleClick() {
      this.isClick = !this.isClick
    },
    async callToConnect() {
      const wait = loadAndWait()
      if (this.getActiveAccount.address) {
        const args = this.args
        const argValues = this.func.arguments.map((arg) => args[arg.name])
        if (argValues.some((item) => typeof item === 'undefined')) {
          this.result = {
            error: 'You did not provide all arguments',
          }
          return
        }
        const payload_json = {
          Name: this.name,
          Args: [...argValues],
        }
        const data = {
          amount: '0 aergo',
          from: this.getActiveAccount.address,
          limit: 0,
          payload_json,
          to: this.address,
          type: 5,
        }
        const result = await this.aergoConnectCall(
          'SEND_TX',
          'AERGO_SEND_TX_RESULT',
          data
        )
        await wait()
        this.result = result.hash
        this.$emit('onUpdateResultHash', result.hash)
        this.isLoading = false
      }
    },
    aergoConnectCall(action, responseType, d) {
      const data = { ...d }
      if (!d.payload && !d.payload_json) {
        data.payload = ''
      }
      return new Promise((resolve, reject) => {
        window.addEventListener(
          responseType,
          function (event) {
            if ('error' in event.detail) {
              reject(event.detail.error)
            } else {
              resolve(event.detail)
            }
          },
          { once: true }
        )
        window.postMessage(
          {
            type: 'AERGO_REQUEST',
            action: action,
            data: data,
          },
          '*'
        )
      })
    },
  },
}
</script>

<style lang="scss">
.downbutton {
  background: url('~@assets/img/arrow-right-svgrepo-com.svg');
  transform: rotate(90deg);
}

.upbutton {
  display: inline-block;
  vertical-align: middle;
  background: url('~@assets/img/arrow-right-svgrepo-com.svg');
  background-size: auto 100%;
  background-repeat: no-repeat;
}
</style>
