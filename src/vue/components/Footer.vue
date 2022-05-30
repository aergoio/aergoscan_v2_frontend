<template>
  <div :class="['footer', css.page]">
    <div class="social">
      <a href="https://www.aergo.io/" class="icon" target="_blank"><img src="~@assets/img/btn-aergo@3x.png"></a>
      <a href="https://twitter.com/aergo_io" class="icon" target="_blank"><img src="~@assets/img/btn-twitter@3x.png"></a>
      <a href="https://medium.com/aergo" class="icon" target="_blank"><img src="~@assets/img/btn-medium@3x.png"></a>
      <a href="https://t.me/aergoofficial" class="icon" target="_blank"><img src="~@assets/img/btn-telegram@3x.png"></a>
    </div>
    <div class="copyright">
      Copyright © {{(new Date()).getFullYear()}} AERGO. All Rights Reserved.
    </div>
  </div>
</template>

<script>

export default {
  name: 'Footer',
  props:{
    css: {
      type: Object,
      default: () => ({
        page: '',
      })
    },
  },
  data () {
    return {
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
  },
  components: {
  }
};
</script>

<style lang="scss" scoped>
</style>
