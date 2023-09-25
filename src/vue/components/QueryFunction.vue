<template>
  <div class="function-block">
    <span :class="isClick ? `function show` : `function`" @click="handleClick">
      <div>
        <span>
          {{ `${number + 1}. ${name}` }}
        </span>
        <span class="contract_typemark">{{
          func.view ? '[read]' : '[write]'
        }}</span>
      </div>
      <svg
        fill="#ffffff"
        width="800px"
        height="800px"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
        :class="isClick ? `arrow downbutton` : `arrow upbutton`"
      >
        <rect x="0" fill="none" width="24" height="24" />
        <g>
          <path
            d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8-8-8z"
          />
        </g>
      </svg>
    </span>

    <div
      :class="isClick ? `function_body show` : `function_body hide`"
      v-if="isClick"
    >
      <div v-if="func.arguments.length">
        <div
          v-for="arg in func.arguments"
          :key="arg.name"
          :style="{ minHeight: '60px', marginBottom: '5px' }"
          @click="() => addDynamicArg(arg.name)"
        >
          <span class="key">{{
            arg.name === '...' ? 'Variadic argument' : arg.name
          }}</span>
          <div
            :style="{
              display: 'flex',
              width: '100%',
              justifyContent: 'space-between',
            }"
          >
            <input
              type="text"
              class="arg-field"
              :style="{ marginTop: '5px', width: '90%' }"
              v-model="args[arg.name]"
            />
            <span
              v-if="args[arg.name]"
              :style="{ display: 'flex', alignItems: 'center' }"
            >
              <img
                v-if="jsonValidate(args[arg.name])"
                class="validate"
                src="~@assets/img/ic-success@2x.png"
              />
              <img v-else class="validate" src="~@assets/img/ic_fail@2x.png" />
              <span
                v-if="jsonValidate(args[arg.name])"
                :style="{
                  whiteSpace: 'nowrap',
                  marginRight: '10px',
                  textTransform: 'capitalize',
                }"
                >{{ jsonTypeof(args[arg.name]) }}</span
              >
            </span>
          </div>
        </div>
      </div>
      <span class="btn-call" v-on:click="queryContract"> Query </span>
      <span
        class="btn-call"
        v-if="!func.view"
        @click="
          getActiveAccount?.address ? callToConnect() : connectAfterCall()
        "
      >
        Call
      </span>
      <div v-if="isLoading" class="loadingProgress" />
      <div
        v-if="typeof result !== 'undefined' && !isLoading"
        class="code-highlight-pre"
      >
        <div :style="{ display: 'flex', flexDirection: 'column' }">
          <div class="result_wrapper">
            <span class="result_title">Result</span>
            <router-link
              v-if="receipt?.status"
              :to="`/transaction/${result}/`"
              class="hash"
            >
              <span v-html="result" class="result_content" />
            </router-link>

            <span
              v-else-if="typeof result === 'string' && !receipt"
              v-html="result"
              class="result_content"
            />
            <span
              v-else-if="typeof result !== 'string' && !receipt"
              v-html="syntaxHighlight(result)"
              class="result_content"
            />
          </div>

          <div v-if="receipt?.status" class="result_wrapper status">
            <span class="result_title">
              <span>Status:</span>
              <img
                class="status_img"
                v-if="receipt?.status === 'ERROR'"
                src="~@assets/img/ic_fail@1x.png"
              />
              <img v-else src="~@assets/img/ic-success.png" />
              <span class="receipt_text">
                {{ receipt?.status }}
              </span>
            </span>
            <span v-html="receipt?.result" class="result_content" />
            <span v-if="!receipt?.result" class="result_content empty"
              >(Empty Result)</span
            >
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { loadAndWait } from '@/src/vue/utils/async'
import { syntaxHighlight } from '@/src/vue/utils/syntax-highlight'
import ArrowSvg from '@assets/img/arrow-right-svgrepo-com.svg'

export default {
  props: ['abi', 'name', 'number', 'address', 'callContractHash', 'clickAll'],
  components: {
    ArrowSvg,
  },
  data() {
    return {
      args: { '...': null },
      result: void 0,
      isLoading: false,
      isClick: false,
      receipt: {},
      activeAccount: {},
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
    async result() {
      const hash = this.result
      const wait = loadAndWait()
      this.isLoading = true
      await wait()
      this.receipt = await this.$store.dispatch(
        'blockchain/fetchTransactionReceipt',
        { hash }
      )
      this.isLoading = false
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
      const argValues = this.func.arguments.map((arg) =>
        JSON.parse(args[arg.name])
      )
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
      if (this.func.arguments.length === 0 && this.func.view && !this.result) {
        this.queryContract()
      }
      this.isClick = !this.isClick
    },
    async callToConnect() {
      const wait = loadAndWait()
      if (this.getActiveAccount.address) {
        const args = this.args
        const argValues = this.func.arguments.map((arg) =>
          JSON.parse(args[arg.name])
        )
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
        this.isLoading = true
        this.receipt = {}
        await wait()
        this.result = result.hash
        this.$emit('onUpdateResultHash', result.hash)
        this.isLoading = false
      }
    },

    async connectAfterCall() {
      await this.$store.dispatch('blockchain/refreshActiveAccount')
      if (this.getActiveAccount?.address) {
        await this.callToConnect()
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
    jsonValidate(value) {
      try {
        JSON.parse(value)
        return true
      } catch (e) {
        return false
      }
    },
    addDynamicArg(name) {
      if (!this.args[name]) {
        this.$set(this.args, name, '""')
      }
    },
    jsonTypeof(value) {
      const parsedValue = JSON.parse(value)
      if (typeof parsedValue === 'object') {
        if (Array.isArray(parsedValue)) {
          return 'Array'
        } else {
          return 'JSON'
        }
      } else {
        return typeof parsedValue
      }
    },
  },
}
</script>

<style lang="scss">
.validate {
  height: 35px;
  margin-left: 8px;
  margin-right: 8px;
  position: relative;
  top: 2px;
}

.function {
  display: flex;
  align-content: center;
  justify-content: space-between;
  .arrow {
    width: 20px;
    height: 20px;
  }
  &:hover {
    svg {
      fill: #0784c3;
    }
  }
}

.downbutton {
  transform: rotate(90deg);
  transition: transform 0.3s ease-in-out;
}
.upbutton {
  transform: rotate(0deg);
  transition: transform 0.3s ease-in-out;
}
</style>
