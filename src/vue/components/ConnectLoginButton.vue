<template>
  <div
    v-if="!activeAccount?.address"
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
      <span class="small_font">{{ activeAccount?.address }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: [],
  computed: {},
  data() {
    return {
      activeAccount: {},
    }
  },
  watch: {
    activeAccount() {
      if (!this.activeAccount) {
        this.$emit('message', 'Network does not match with Aergo Connect 3.0')
        this.activeAccount = {}
      } else if (this.activeAccount.error) {
        this.$emit('message', this.activeAccount.error)
        this.activeAccount = {}
      }
    },
  },
  methods: {
    async connectAccount() {
      this.activeAccount = await this.$store.dispatch(
        'blockchain/refreshActiveAccount'
      )
    },
    async disconnectAccount() {
      this.activeAccount = await this.$store.dispatch(
        'blockchain/disconnectAccount'
      )
    },
  },
}
</script>

<style lang="scss"></style>
