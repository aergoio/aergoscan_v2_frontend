<template>
  <span class="icon qrcode" @click="onQrcode">
    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <g clip-path="url(#clip0_2018_1716)">
        <path
            d="M3 10C3 10.5523 3.44772 11 4 11H10C10.5523 11 11 10.5523 11 10V4C11 3.44772 10.5523 3 10 3H4C3.44772 3 3 3.44772 3 4V10ZM5 5.5C5 5.22386 5.22386 5 5.5 5H8.5C8.77614 5 9 5.22386 9 5.5V8.5C9 8.77614 8.77614 9 8.5 9H5.5C5.22386 9 5 8.77614 5 8.5V5.5Z"
            fill="#A391AA"/>
        <path
            d="M3 20C3 20.5523 3.44772 21 4 21H10C10.5523 21 11 20.5523 11 20V14C11 13.4477 10.5523 13 10 13H4C3.44772 13 3 13.4477 3 14V20ZM5 15.5C5 15.2239 5.22386 15 5.5 15H8.5C8.77614 15 9 15.2239 9 15.5V18.5C9 18.7761 8.77614 19 8.5 19H5.5C5.22386 19 5 18.7761 5 18.5V15.5Z"
            fill="#A391AA"/>
        <path
            d="M14 3C13.4477 3 13 3.44772 13 4V10C13 10.5523 13.4477 11 14 11H20C20.5523 11 21 10.5523 21 10V4C21 3.44772 20.5523 3 20 3H14ZM19 8.5C19 8.77614 18.7761 9 18.5 9H15.5C15.2239 9 15 8.77614 15 8.5V5.5C15 5.22386 15.2239 5 15.5 5H18.5C18.7761 5 19 5.22386 19 5.5V8.5Z"
            fill="#A391AA"/>
        <path d="M21 19H19V21H21V19Z" fill="#231F20"/>
        <path d="M15 13H13V15H15V13Z" fill="#231F20"/>
        <path d="M17 15H15V17H17V15Z" fill="#231F20"/>
        <path d="M15 17H13V19H15V17Z" fill="#231F20"/>
        <path d="M17 19H15V21H17V19Z" fill="#231F20"/>
        <path d="M19 17H17V19H19V17Z" fill="#231F20"/>
        <path d="M19 13H17V15H19V13Z" fill="#231F20"/>
        <path d="M21 15H19V17H21V15Z" fill="#231F20"/>
      </g>
      <defs>
        <clipPath id="clip0_2018_1716">
          <rect width="24" height="24" fill="white"/>
        </clipPath>
      </defs>
    </svg>
  </span>
</template>

<script>
export default {
  name: 'QrcodeButton',
  props: ['address'],
  data() {
    return {}
  },
  methods: {
    async onQrcode(e) {
      this.$emit('onQrcode', this.address);
    },
  }
};
</script>
<style lang="scss">
.icon.qrcode {
  margin-left: 5px;
  cursor: pointer;
  width: 18px;
  height: 18px;
  margin-bottom: 4px;

  svg {
    width: 100%;
    height: 100%;
  }

  &:hover {
    background-color: #e8e6ea;
  }

  @media screen and (max-width: 480px) {
    svg {
      width: 22px;
      height: 22px;
    }
  }
}
</style>

