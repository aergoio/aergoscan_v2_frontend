<template>
  <div class="skeleton">
    <div v-for="item in list" :key="item" class="wrapper">
      <div class="item">
        <div class="skeleton-line">
          <div>
            <span class="name">{{ item }}</span>
            <span class="type">{{ item }}</span>
          </div>
          <span class="arrow">{{ item }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  props: [''],
  data() {
    return {
      list: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    }
  },
  methods: {},
}
</script>

<style lang="scss">
.skeleton {
  .wrapper {
    display: flex;
    flex-direction: column;
    border: 1px solid rgba(76, 68, 82, 1);
    background-color: #2d2b37;
    border-radius: 0.5rem;
    margin-bottom: 1rem;
    .item {
      cursor: default;
      padding: 0.5rem;
      color: transparent;
      background: transparent;
      border: none;
    }
    .skeleton-line {
      display: flex;
      justify-content: space-between;
      animation: loading 1s infinite ease-in-out;
      .name {
        border-radius: 6px;
        display: inline-block;
        width: 130px;
        background-color: #fff;
        margin-right: 4px;
      }
      .type {
        border-radius: 6px;
        display: inline-block;
        width: 30px;
        background-color: #fff;
        opacity: 0.5;
      }
      .arrow {
        background-color: #fff;
        border-radius: 6px;
        width: 20px;
      }
    }
  }
}

@keyframes loading {
  0% {
    opacity: 0.6;
  }
  50% {
    opacity: 0.8;
  }
  100% {
    opacity: 0.6;
  }
}
</style>
