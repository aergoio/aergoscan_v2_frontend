<template>
  <div
    v-if="!getActiveAccount?.address"
    class="connect_button"
    @click="connectAccount"
  >
    <div class="status no_connect" />
    <div :style="{ display: 'flex', flexDirection: 'column' }">
      <span class="large_font">CONNECT</span>
      <span class="small_font">with Aergo Connect 3.0</span>
    </div>
  </div>
  <div v-else class="connect_button" @click="disconnectAccount">
    <div class="status connected" />
    <div :style="{ display: 'flex', flexDirection: 'column' }">
      <span class="large_font">CONNECTED</span>
      <span class="small_font">{{ getActiveAccount?.address }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: [],
  computed: {
    getActiveAccount() {
      return this.$store.getters[`blockchain/getActiveAccount`]
    },
  },
  data() {
    return {}
  },

  watch: {
    getActiveAccount() {
      if (this.getActiveAccount?.error) {
        this.$emit('message', this.getActiveAccount?.error)
      } else {
        this.$emit('message', false)
      }
    },
  },
  methods: {
    async connectAccount() {
      await this.$store.dispatch('blockchain/refreshActiveAccount')
    },
    async disconnectAccount() {
      await this.$store.dispatch('blockchain/disconnectAccount')
    },
  },
}
</script>

<style lang="scss"></style>
