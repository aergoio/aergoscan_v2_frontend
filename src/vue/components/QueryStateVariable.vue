<template>
  <div class="function-block">
    <span class="function" @click="handleClick">{{ name }}</span>

    <div
      :class="isClick ? `function_body show` : `function_body hide`"
      v-if="isClick"
    >
      <span class="annotation">{{ type }}</span>
      <span class="input" v-if="type === 'map'">
        <input
          type="text"
          v-model="mapKey"
          class="arg-field"
          placeholder="Key to query"
        />
      </span>
      <span class="btn-call" v-if="!isLoading" v-on:click="queryContractState"
        >Query</span
      >
      <!-- <span
        class="btn-call"
        v-if="!isLoading && !func.view"
        v-on:click="queryContract"
      >
        Call
      </span> -->
      <span class="btn-call" v-if="isLoading">Loading...</span>
      <div v-if="typeof result !== 'undefined'" class="code-highlight-pre">
        <span v-html="syntaxHighlight(result)"></span>
      </div>
    </div>
  </div>
</template>

<script>
import { loadAndWait } from '@/src/vue/utils/async'
import { syntaxHighlight } from '@/src/vue/utils/syntax-highlight'

export default {
  props: ['abi', 'name', 'address'],
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
        console.log(e)
        result = { error: '' + e }
      }
      await wait()
      this.result = result
      this.isLoading = false
    },
    handleClick() {
      console.log(this.isClick, this.name)
      this.isClick = !this.isClick
    },
  },
}
</script>

<style lang="scss"></style>
