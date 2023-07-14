<template>
  <div class="select-box">
    <div
      class="selected-item"
      onclick="document.getElementsByClassName('select-box')[0].classList.add('show')"
    >
      <span class="status" v-bind:style="styleObject"></span
      >{{ displayNetworkLabel }}
    </div>
    <div
      class="list"
      onclick="document.getElementsByClassName('select-box')[0].classList.remove('show')"
    >
      <div
        class="item"
        v-for="option in options"
        :key="option.chainid"
        v-on:click="goto(option.url, option.chainid == currentChainId)"
      >
        <span
          class="status"
          v-bind:style="{
            'background-color':
              option.chainid == currentChainId ? '#F91263' : 'transparent;',
          }"
        ></span
        >{{ option.label.toString().toUpperCase() }}
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  data() {
    return {
      blockHeight: 0,
      network: '',
      expanded: false,
      NETWORKS: {
        'aergo.io': {
          url: 'https://mainnet.aergoscan.io',
          label: 'Mainnet',
        },
        'testnet.aergo.io': {
          url: 'https://testnet.aergoscan.io',
          label: 'Testnet',
        },
        'alpha.aergo.io': {
          url: 'https://alpha.aergoscan.io',
          label: 'Alpha',
        },
      },
    }
  },
  computed: {
    ...mapState({
      blocks: (state) => state.blockchain.recentBlocks,
      isConnected: (state) => state.blockchain.streamConnected,
      chainInfo: (state) => state.blockchain.chainInfo,
    }),
    currentChainId() {
      try {
        return this.chainInfo?.chainid.magic
      } catch (e) {}
      return 'unknown'
    },
    displayNetworkLabel() {
      const connectedNetwork = this.options.filter((item) => {
        return item.chainid === this.currentChainId
      })
      return connectedNetwork[0].label.toString().toUpperCase()
    },
    options() {
      let options = []
      let hasCurrent = false
      const current = this.currentChainId
      for (let chainid in this.NETWORKS) {
        options.push({
          chainid,
          url: this.NETWORKS[chainid].url,
          label: this.NETWORKS[chainid].label,
        })
        if (chainid === current) hasCurrent = true
      }
      if (!hasCurrent) {
        options.push({ chainid: current, url: '', label: current })
      }
      return options
    },
    bestBlock() {
      return this.blocks[this.blocks.length - 1]
    },
    networkDisplay() {
      try {
        return this.chainInfo.chainid.magic
      } catch (e) {}
      return this.network.split(':').join(' ')
    },
    styleObject() {
      const color = '#F91263'
      if (this.isConnected || true) {
        return {
          backgroundColor: color,
          borderColor: color,
        }
      } else {
        return {
          borderColor: color,
        }
      }
    },
  },
  methods: {
    toggleExpanded() {
      this.expanded = !this.expanded
    },
    goto(url, current) {
      if (current) return
      window.location.href = url
    },
  },
  components: {},
}
</script>

<style lang="scss">
.select-box {
  position: relative;

  &.main {
    .selected-item {
      color: #bab4bf;
      border: solid 1px #972764;
      background-color: transparent;

      &:hover {
        border: solid 1px #ff088f;
        color: #fff;

        &::after {
          border: solid #fff;
          border-width: 0 1px 1px 0;
        }
      }
    }
  }

  &.show {
    .list {
      display: block;
    }
  }

  .selected-item {
    position: relative;
    min-width: 138px;
    height: 30px;
    padding: 8px 20px 8px 29px;
    border-radius: 5px;
    border: solid 1px #f2c5e0;
    background-color: #f3f3f3;
    font-size: 12px;
    color: #4b494c;
    cursor: pointer;

    @media screen and (max-width: 900px) {
      color: #bab4bf;
      border: solid 1px #972764;
      background-color: transparent;
    }

    @media screen and (max-width: 480px) {
      min-width: 106px;
      height: 28px;
      padding: 7px 20px 7px 24px;
      font-size: 10px;
    }

    &:hover {
      border: solid 1px #ff088f;
      color: #000;

      &::after {
        border: solid #000;
        border-width: 0 1px 1px 0;
      }
    }

    .status {
      content: '';
      position: absolute;
      top: 50%;
      left: 13px;
      width: 5px;
      height: 5px;
      margin-top: -2px;
      border-radius: 50%;

      @media screen and (max-width: 480px) {
        left: 10px;
        width: 4px;
        height: 4px;
      }
    }

    &::after {
      content: '';
      position: absolute;
      top: 50%;
      right: 12px;
      padding: 2.5px;
      margin-top: -5px;
      border: solid #bab4bf;
      border-width: 0 1px 1px 0;
      transform: rotate(45deg);
      -webkit-transform: rotate(45deg);

      @media screen and (max-width: 480px) {
        right: 10px;
      }
    }
  }

  .list {
    display: none;
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    border-radius: 5px;
    box-shadow: 0 2px 10px 0 rgba(0, 0, 0, 0.25);
    overflow: hidden;

    .item {
      position: relative;
      padding: 9px 20px 9px 29px;
      font-size: 12px;
      color: #e3dee7;
      background-color: #363344;
      cursor: pointer;

      @media screen and (max-width: 480px) {
        padding: 7px 20px 7px 24px;
        font-size: 10px;
      }

      .status {
        content: '';
        position: absolute;
        top: 50%;
        left: 13px;
        width: 5px;
        height: 5px;
        margin-top: -2px;
        border-radius: 50%;

        @media screen and (max-width: 480px) {
          left: 10px;
          width: 4px;
          height: 4px;
        }
      }

      &:hover {
        background-color: #201e2c;
      }
    }
  }
}
</style>
