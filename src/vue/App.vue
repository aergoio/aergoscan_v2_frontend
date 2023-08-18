<template>
  <div id="app">
    <SideNav />
    <div class="page-container">
      <TransitionPage>
        <router-view></router-view>
      </TransitionPage>
    </div>
  </div>
</template>

<script>
import SideNav from '@/src/vue/components/SideNav'
import TransitionPage from '@/src/vue/components/TransitionPage'

export default {
  data() {
    return {}
  },
  created() {
    this.$store.dispatch('blockchain/updateChainInfo')
  },
  beforeDestroy() {},
  computed: {},
  methods: {},
  components: {
    SideNav,
    TransitionPage,
  },
}
</script>

<style lang="scss">
.monospace,
.hash,
pre {
  font-family: 'Lato', monospace;
  word-break: break-all;
}
pre {
  white-space: pre-wrap;
  line-height: 1.3;
}
.hash {
  font-size: 0.9em;
  min-width: 13em;
}
.formatted-value {
  //white-space: nowrap;

  &.token {
    //background-color: #f0f0f0;
    /* padding: 0 3px; */
  }
  .unit {
  }
  .value {
    font-weight: 500;
  }
  .sep {
    display: inline-block;
    width: 4px;
  }
  .point {
    display: inline-block;
    padding: 0 2px;
  }
}
</style>
