<template>
  <div :class="`backdrop ${animation}`">
    <div class="alert-container">
      <div :class="`alert ${type}`">
        {{ message }}
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'Alert',
  props: {
    type: { type: String, default: '' },
    message: { type: String, default: '' },
  },
  data() {
    return {
      animation: '',
    }
  },
  created() {
    this.animation = 'openAnimation'
  },
  beforeDestroy() {
    this.animation = 'closeAnimation'
  },

  methods: {
    close() {
      this.$emit('close')
    },
  },
}
</script>

<style lang="scss" scoped>
.backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;

  transition: width 0.3s ease-in-out;
  .alert-container {
    background-color: transparent;
    text-align: center;
    font-size: larger;
    font-weight: bold;

    .alert {
      padding: 20px;
      border-radius: 5px;
      display: inline-block;
      text-align: left;

      &.success {
        background-color: #d4edda;
        color: #155724;
      }

      &.info {
        background-color: #d1ecf1;
        color: #0c5460;
      }

      &.warning {
        background-color: #fff3cd;
        color: #856404;
      }

      &.error {
        background-color: #fff;
        color: rgb(220, 53, 69);
      }
    }
  }
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}
@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}
.openAnimation {
  animation: fadeIn 0.3s ease-in-out;
}

.closeAnimation {
  animation: fadeOut 0.3s ease-in-out;
}
</style>
