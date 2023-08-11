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

  methods: {
    async connectAccount() {
      //!! chainId 검증해야 함.
      this.activeAccount = await this.$store.dispatch(
        'blockchain/refreshActiveAccount'
      )

      //   const chainId = account.chainId
      //   if (chainId === this.chainId) {
      //     return
      //   }
      //   let nodeUrl = ''
      //   const chainConfig = ChainConfigs.find((conf) => conf.chainId === chainId)
      //   if (chainConfig) {
      //     nodeUrl = chainConfig.nodeUrl
      //   } else {
      //     nodeUrl = prompt(
      //       `Unknown chain id: ${chainId}\nPlease enter a Node URL to connect to this chain.`
      //     )
      //   }
      //   this.$store.dispatch('setChain', { nodeUrl })
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
