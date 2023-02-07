<template>
  <div class="background" @click="onClose">
    <div class="pop-up">
      <div class="qrcode-wrap">
        <VueQRCodeComponent
            class="qr"
            :text="inputText"
            :size="170">
        </VueQRCodeComponent>
      </div>
      <button @click="onClose">닫기</button>
    </div>
  </div>
</template>

<script>

import VueQRCodeComponent from 'vue-qrcode-component';

export default {
  components: {VueQRCodeComponent},
  props: {
    network: String,
    address: String,
  },
  async beforeMount() {
    this.inputText = this.address;
  },
  data() {
    return {
      inputText: ''
    };
  },
  mounted() {
  },
  computed: {
    getInputText() {
      return this.inputText
    }
  },
  methods: {
    onClose() {
      this.$emit('onClose');
    },
  },
};
</script>

<style lang="scss">
.background {
  position: fixed;
  left: 0;
  top: 0;
  z-index: 300;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.4);

  .pop-up {
    position: absolute;
    left: 55%;
    top: 30%;
    transform: translate(-50%, -50%);
    background: #FFFFFF;
    box-shadow: 0px 2px 15px rgba(192, 200, 226, 0.8);
    border-radius: 8px;
    padding: 20px 24px;
    width: 250px;
    height: 250px;

    .qrcode-wrap {
      margin-top: 50%;
      margin-left: 10%;
      transform: translateY(-50%);
    }

    button {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      bottom: 7px;
      width: 60px;
      height: 25px;
      border-radius: 8px;
      border: none;
      font-size: 13px;
      color: #fff;
      background-color: #363344;
    }
  }
}

</style>
