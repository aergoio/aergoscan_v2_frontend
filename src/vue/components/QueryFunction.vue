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
        <span v-html="syntaxHighlight(result)" />
      </div>
    </div>
  </div>
</template>

<script>
import { loadAndWait } from '@/src/vue/utils/async'
import { syntaxHighlight } from '@/src/vue/utils/syntax-highlight'

export default {
  props: ['abi', 'name', 'address'],
  data() {
    return {
      args: {},
      result: void 0,
      isLoading: false,
      isClick: false,
    }
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
      if (this.getActiveAccount.address) {
        const args = this.args
        const argValues = this.func.arguments.map((arg) => args[arg.name])
        if (argValues.some((item) => typeof item === 'undefined')) {
          this.result = {
            error: 'You did not provide all arguments',
          }
          return
        }
        console.log(args, 'args')
        console.log(argValues, 'argValues')
        console.log(
          `callToConnect Name:${this.name} Account:${JSON.stringify(
            this.getActiveAccount,
            null,
            2
          )} Args[Key:Value]${
            (JSON.stringify(args), null, 2)
          }, Arg[Values]:${argValues}`
        )
      }
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
