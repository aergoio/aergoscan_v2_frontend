<template>
  <div class="function-block">
    <span :class="isClick ? `function show` : `function`" @click="handleClick">
      <div>
        <span>{{ `${number + 1}. ${name}` }}</span>
        <span class="contract_typemark">[read]</span>
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
      <div style="margin-bottom: 10px">
        <span class="annotation">{{ type }}</span>
        <span class="input" v-if="type === 'map'">
          <input
            type="text"
            v-model="mapKey"
            class="arg-field"
            placeholder="Key to query"
            style="margin-top: 5px"
          />
        </span>
      </div>

      <span class="btn-call" v-if="!isLoading" @click="queryContractState"
        >Query</span
      >
      <div v-if="isLoading" class="loadingProgress" />

      <div v-if="typeof result !== 'undefined'" class="code-highlight-pre">
        <div style="display: flex; flex-direction: column">
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
  props: ['abi', 'name', 'address', 'clickAll', 'number'],
  computed: {
    variable() {
      return (
        this.abi.state_variables.find(
          (variable) => variable.name === this.name
        ) || {}
      )
    },
    type() {
      return this.variable ? this.variable.type : ''
    },
  },
  watch: {
    clickAll() {
      this.isClick = !this.clickAll
    },
  },
  mounted() {
    this.isClick = !this.clickAll
  },

  data() {
    return {
      mapKey: '',
      result: void 0,
      isLoading: false,
      isClick: false,
    }
  },

  methods: {
    syntaxHighlight,

    async queryContractState() {
      const wait = loadAndWait()
      this.isLoading = true
      this.result = void 0

      let stateNames = []
      const arrayLength = 10

      if (this.type == 'array') {
        stateNames = [...Array(arrayLength).keys()].map(
          (idx) => `_sv_${this.name}-${idx + 1}`
        )
      } else if (this.type == 'map') {
        stateNames = [`_sv_${this.name}-${this.mapKey}`]
      } else {
        stateNames = [`_sv_${this.name}`]
      }

      // // Herajs PR-179: https://github.com/aergoio/herajs/pull/179
      // if (this.type === 'array') {
      //   stateNames = [...Array(arrayLength).keys()].map(
      //     (idx) => `${this.name}[${idx}]`
      //   )
      // } else if (this.type === 'map') {
      //   stateNames = [`${this.name}["${this.mapKey}"]`]
      // } else {
      //   stateNames = [this.name]
      // }

      let result
      try {
        result = await this.$store.dispatch('blockchain/queryContractState', {
          stateNames,
          abi: this.abi,
          address: this.address,
        })
        result = JSON.stringify(result, undefined, 2).replace(
          ']',
          '  ... array may have more items ...\n]'
        )
      } catch (e) {
        result = { error: '' + e }
      }

      await wait()
      this.result = result
      this.isLoading = false
    },

    handleClick() {
      if (
        !this.isClick &&
        !this.result &&
        !(this.type === 'map' && !this.mapKey)
      ) {
        this.queryContractState()
      }
      this.isClick = !this.isClick
    },
  },
}
</script>

<style lang="scss">
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
