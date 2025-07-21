<template>
  <div class="function-block">
    <span :class="isClick ? `function show` : `function`" @click="handleClick">
      <div>
        <span>{{ `${number + 1}. ${name}` }}</span>
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
          style="margin-bottom: 10px"
        >
          <div class="argument-header" v-if="arg.name === '...'">
            <span class="key"> Variadic argument </span>
            <span class="helper-text">
              Please enter each value inside double quotes (e.g., "value")
            </span>
          </div>

          <span v-else class="key">
            {{ arg.name }}
          </span>

          <!-- Variadic argument input -->
          <div
            v-if="arg.name === '...'"
            style="
              display: flex;
              flex-direction: column;
              row-gap: 6px;
              margin-top: 5px;
            "
          >
            <div
              v-for="(val, idx) in args['...']"
              :key="idx"
              style="display: flex; align-items: center"
            >
              <span
                style="
                  width: 20px;
                  text-align: right;
                  margin-right: 6px;
                  cursor: default;
                "
                >{{ idx }}.</span
              >
              <input
                type="text"
                class="arg-field"
                style="width: 100%"
                v-model="args['...'][idx]"
              />
              <button
                class="arg-btn"
                @click="removeVariadicArg(idx)"
                v-if="args['...'].length > 1"
              >
                -
              </button>
              <button
                class="arg-btn"
                @click="addVariadicArg"
                v-if="idx === args['...'].length - 1"
              >
                +
              </button>
              <img
                v-if="jsonValidate(args['...'][idx])"
                class="validate"
                src="~@assets/img/ic-success@2x.png"
              />
              <img v-else class="validate" src="~@assets/img/ic_fail@2x.png" />
            </div>
          </div>

          <!-- Regular argument input -->
          <div
            v-else
            style="display: flex; align-items: center; margin-top: 5px"
          >
            <input
              type="text"
              class="arg-field"
              style="width: 100%"
              v-model="args[arg.name]"
            />
            <span
              v-if="args[arg.name]"
              style="display: flex; align-items: center; margin-left: 6px"
            >
              <span
                v-if="jsonValidate(args[arg.name])"
                style="white-space: nowrap; text-transform: capitalize"
              >
                {{ jsonTypeof(args[arg.name]) }}
              </span>
              <img
                v-if="jsonValidate(args[arg.name])"
                class="validate"
                src="~@assets/img/ic-success@3x.png"
              />
              <img v-else class="validate" src="~@assets/img/ic_fail@3x.png" />
            </span>
          </div>
        </div>
      </div>

      <span
        class="btn-call"
        @click="queryContract"
        v-if="
          func.view &&
          !(func.arguments.length === 0 && typeof result !== 'undefined')
        "
        >Query</span
      >
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
        <div style="display: flex; flex-direction: column">
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
                v-if="receipt?.status === 'ERROR'"
                src="~@assets/img/ic-fail.png"
              />
              <img v-else src="~@assets/img/ic-success.png" />
              <span class="receipt_text">{{ receipt?.status }}</span>
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

export default {
  props: ['abi', 'name', 'number', 'address', 'callContractHash', 'clickAll'],
  data() {
    return {
      args: { '...': ['""'] },
      result: void 0,
      isLoading: false,
      isClick: false,
      receipt: {},
      activeAccount: {},
    }
  },

  mounted() {
    this.func.arguments.forEach((arg) => {
      if (!this.args[arg.name]) {
        if (arg.name === '...') {
          this.$set(this.args, arg.name, '""')
        } else {
          this.$set(this.args, arg.name, '""')
        }
      }
    })
  },

  watch: {
    clickAll() {
      this.isClick = !this.clickAll

      if (
        !this.clickAll && // Expand All 상태일 때
        this.isClick && // 실제로 열렸을 때
        this.func.view && // 읽기 함수일 때
        this.func.arguments.length === 0 && // 인자 없음
        typeof this.result === 'undefined' // 결과 아직 없음
      ) {
        this.queryContract()
      }
    },
    async result() {
      const wait = loadAndWait()
      this.isLoading = true
      await wait()
      const isBase58Hash = this.isBase58Hash(this.result)
      this.receipt = isBase58Hash
        ? await this.$store.dispatch('blockchain/fetchTransactionReceipt', {
            hash: this.result,
          })
        : null
      this.isLoading = false
    },
  },

  computed: {
    func() {
      return this.abi.functions.find((func) => func.name === this.name) || {}
    },
    getActiveAccount() {
      return this.$store.getters['blockchain/getActiveAccount']
    },
  },

  methods: {
    syntaxHighlight,

    addVariadicArg() {
      this.args['...'].push('""')
    },
    removeVariadicArg(idx) {
      if (this.args['...'].length > 1) {
        this.args['...'].splice(idx, 1)
      }
    },

    async queryContract() {
      const wait = loadAndWait()
      const argValues = this.func.arguments.map((arg) =>
        arg.name === '...'
          ? this.args['...'].map((v) => JSON.parse(v))
          : JSON.parse(this.args[arg.name])
      )

      if (argValues.some((item) => typeof item === 'undefined')) {
        this.result = { error: 'You did not provide all arguments' }
        return
      }

      this.isLoading = true
      this.result = void 0

      try {
        this.result = await this.$store.dispatch('blockchain/queryContract', {
          name: this.name,
          args: argValues,
          address: this.address,
        })
      } catch (e) {
        this.result = { error: e?.metadata?.headersMap?.['grpc-message'] || e }
      }

      await wait()
      this.isLoading = false
    },

    async callToConnect() {
      const wait = loadAndWait()
      if (this.getActiveAccount.address) {
        const argValues = this.func.arguments.flatMap((arg) =>
          arg.name === '...'
            ? this.args['...'].map((v) => JSON.parse(v))
            : JSON.parse(this.args[arg.name])
        )
        if (argValues.some((item) => typeof item === 'undefined')) {
          this.result = { error: 'You did not provide all arguments' }
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
      if (!data.payload && !data.payload_json) {
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
        window.postMessage({ type: 'AERGO_REQUEST', action, data }, '*')
      })
    },

    jsonValidate(value) {
      try {
        JSON.parse(value)
        return true
      } catch {
        return false
      }
    },

    jsonTypeof(value) {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? 'Array' : typeof parsed
    },

    isBase58Hash(hash) {
      return /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]{44,64}$/.test(
        hash
      )
    },

    handleClick() {
      if (
        !this.isClick &&
        this.func.arguments.length === 0 &&
        this.func.view &&
        !this.result
      ) {
        this.queryContract()
      }
      this.isClick = !this.isClick
    },
  },
}
</script>

<style lang="scss">
.validate {
  height: 24px;
  margin-left: 6px;
  margin-right: 6px;
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
.arg-btn {
  background-color: #1c1f2a; // 깊은 네이비 그레이
  color: #e0e0e0; // 부드러운 흰색 계열 텍스트
  border: 1px solid #2c2f3c; // 미묘한 외곽선
  border-radius: 6px;
  padding: 6px 12px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-left: 6px;
  transition: all 0.2s ease-in-out;

  &:hover {
    background-color: #262a38; // 더 밝은 블루그레이
    border-color: #3c4050;
  }

  &:active {
    background-color: #13161f; // 클릭 시 더 짙어짐
    border-color: #2a2d3a;
  }
}
.argument-header {
  display: flex;
  justify-content: space-between;
  align-items: baseline;
  margin-bottom: 4px;
}

.helper-text {
  font-size: 12px;
  color: #c0c0c0;
  font-style: italic;
  white-space: nowrap;
}
</style>
