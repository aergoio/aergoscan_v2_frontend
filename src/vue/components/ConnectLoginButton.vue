<template>
  <div v-if="!isConnect" class="connect_button" @click="connectAccount">
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
      isConnect: false,
    }
  },
  watch: {
    activeAccount() {
      if (this.activeAccount?.error) {
        this.$emit('message', this.activeAccount?.error)
        this.isConnect = false
      } else if (this.activeAccount?.address) {
        this.$emit('message', false)
        this.isConnect = true
      } else {
        this.$emit('message', 'Network does not match with Aergo Connect 3.0')
      }
    },
    isConnect() {
      if (!this.isConnect) {
        this.$emit('message', false)
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
      this.isConnect = false
    },
  },
}
</script>

<style lang="scss"></style>
