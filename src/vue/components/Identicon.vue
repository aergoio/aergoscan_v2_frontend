<template>
  <div class="identicon" :class="{'identicon-new': !text}">
  </div>
</template>

<script>
import jdenticon from 'jdenticon';

export default {
  name: 'Icon',
  props: ['text', 'size'],
  data () {
    return {
    }
  },
  watch: {
    'text' (to, from) {
      this.load();
    }
  },
  methods: {
    load() {
      if (this.text) {
        this.$el.innerHTML = jdenticon.toSvg(this.$props.text, this.$props.size || 200);
      } else {
        this.$el.innerHTML = '';
      }
    }
  },
  mounted () {
    this.load();
  },
};
</script>

<style lang="scss">
.identicon {
  line-height: 1;
}
.mini-identicon {
  display: inline-block;
  border: 1px solid #ddd;
  vertical-align: middle;
  position: relative;
}
.tiny-identicon {
  display: inline-block;
  vertical-align: middle;
}
.identicon-new {
  background: url(~@assets/img/identicon-new.svg);
}
.identicon-multi {
  background: url(~@assets/img/multicall.svg);
}
</style>
