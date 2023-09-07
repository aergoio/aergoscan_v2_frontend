<template>
  <div class="function-block">
    <span :class="isClick ? `function show` : `function`" @click="handleClick"
      >{{ `${number + 1}. ${name}` }}

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
        >
          <span class="key">{{ arg.name }}</span>
          <div
            :style="{
              display: 'flex',
              width: '100%',
              height: '35px',
              justifyContent: 'space-between',
              alignItems: 'center',
            }"
          >
            <input
              type="text"
              class="arg-field"
              :style="{ marginTop: '5px', width: '90%' }"
              v-model="args[arg.name]"
            />
            <img
              class="validate"
              src="~@assets/img/ic_fail@2x.png"
              alt="validate"
            />
            <!-- <img class="validate" src="~@assets/img/ic-success@2x.png" alt="validate" /> -->
          </div>
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
          <router-link :to="`/transaction/${result}/`" class="result_content">
            <span v-if="typeof result === 'string'" class="resultHash">
              {{ result }}
            </span>
            <span v-else v-html="syntaxHighlight(result)"></span>
          </router-link>
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
  updated() {
    console.log(this.args, 'args')
    // try {
    //   const parsedJSON = JSON.parse(value)
    //   console.log(parsedJSON, 'parsedJSON')
    //   // JSON 데이터 처리
    //   this.args[key] = parsedJSON
    // } catch (error) {
    //   // JSON 파싱 실패 시 다른 유형 확인
    //   if (value === 'true' || value === 'false') {
    //     // 불리언 처리
    //     const booleanValue = value === 'true'
    //     console.log(booleanValue, 'booleanValue')
    //     this.args[key] = booleanValue
    //   } else if (!isNaN(value)) {
    //     // 숫자 처리
    //     const numberValue = parseFloat(value)
    //     console.log(numberValue, 'numberValue')
    //     this.args[key] = numberValue
    //   } else {
    //     // 문자열 처리
    //     this.args[key] = value
    //   }
    // }
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
        console.log(args, 'args')
        console.log(argValues, 'argValues')
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
      console.log(d, 'd')
      const data = { ...d }
      console.log(data, 'data')
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
.validate {
  height: 35px;
  margin-right: 14px;
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
