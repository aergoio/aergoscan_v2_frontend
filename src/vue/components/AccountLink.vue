<template>
  <div :class="css.wrapper" :aria-label="address">
    <Identicon :text="address" :size="iconSize" :class="css.icon"/>
    <router-link :class="css.address" :to="toLink">
      {{ label }}
    </router-link>
  </div>
</template>

<script>
import Identicon from '@/src/vue/components/Identicon';

export default {
  name: "ui-account-link",
  props: {
    address: String,
    name: String,
    toLink: String,
    iconSize: {
      type: Number,
      default: 18
    },
    css: {
      type: Object,
      default: () => ({
        wrapper: '',
        address: '',
        icon: 'icon',
      })
    },
  },
  components: {
    Identicon,
  },
  computed: {
    label() {
      if (this.name) {
        return this.name;
      }
      if (this.address) {
        return this.address;
      }
      return 'Contract Creation';
    }
  }
}
</script>

<style lang="scss">
</style>


