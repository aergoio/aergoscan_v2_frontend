<template>
  <div :class="['header', css.page]">
    <div class="header-inner">
      <div class="app-logo">
        <router-link :to="`/`">
          <img src="~@assets/img/aergo-logo@3x.png">
        </router-link>
      </div>
      <span style="flex: 1 1 0%;"></span>
      <network-selector :class="[css.page]"/>
      <div class="btn-mobile-menu"
           onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.toggle('show');document.getElementsByClassName('mobile-menu')[0].classList.toggle('show');">
        <img src="~@assets/img/ic-menu@3x.png" class="menu">
        <img src="~@assets/img/ic-exit@3x.png" class="exit">
      </div>
      <div class="mobile-menu">
        <div class="mobile-menu-inner">
          <div class="list">
            <router-link :to="`/blocks`" class="item"
                         onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');">
                      <span class="icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fill-rule="evenodd">
                            <path opacity=".2" d="M0 0h20v20H0z"/>
                            <path
                                d="M10 1.12 1.604 4.85v10.3L10 18.88l8.396-3.73V4.85L10 1.12zm6.663 4.055L10 8.137 3.338 5.175 10 2.213l6.663 2.962zm-14.059.77L9.5 9.009v8.555L2.604 14.5V5.946zM10.5 17.563V9.008l6.896-3.062V14.5L10.5 17.563z"
                                fill="#FFF" fill-rule="nonzero" class="color"/>
                          </g>
                        </svg>
                      </span>
              <span class="text">Blocks</span>
            </router-link>
            <router-link :to="`/transactions`" class="item"
                         onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');">
                      <span class="icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fill-rule="evenodd">
                            <path opacity=".28" d="M0 0h20v20H0z"/>
                            <path
                                d="m15.525 12.35 1.896 1.896h-3.43c-.416 0-.808-.204-1.07-.559L10.196 10l2.729-3.688a1.334 1.334 0 0 1 1.07-.558h3.43L15.529 7.65l.709.708 3.104-3.104-3.104-3.104-.709.708 1.896 1.896h-3.43c-.737 0-1.42.35-1.874.963L9.575 9.158l-2.55-3.45a2.322 2.322 0 0 0-1.875-.962H1.37v1h3.776c.417 0 .808.204 1.07.558L8.95 10l-2.733 3.696a1.334 1.334 0 0 1-1.071.558H1.37v1h3.775c.737 0 1.42-.35 1.875-.962l2.55-3.45 2.546 3.441a2.322 2.322 0 0 0 1.875.963h3.429l-1.896 1.896.708.708 3.104-3.104-3.104-3.104-.708.708z"
                                fill="#A89CB3" fill-rule="nonzero" class="color"/>
                          </g>
                        </svg>
                      </span>
              <span class="text">Transactions</span>
            </router-link>
            <router-link :to="`/tokens`" class="item"
                         onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');">
                      <span class="icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fill-rule="evenodd">
                            <path opacity=".2" d="M0 0h20v20H0z"/>
                            <path
                                d="M10 18.396c-4.63 0-8.396-3.767-8.396-8.396 0-4.63 3.767-8.396 8.396-8.396 4.63 0 8.396 3.767 8.396 8.396 0 4.63-3.767 8.396-8.396 8.396zm0-15.792A7.403 7.403 0 0 0 2.604 10 7.403 7.403 0 0 0 10 17.396 7.403 7.403 0 0 0 17.396 10 7.403 7.403 0 0 0 10 2.604z"
                                fill="#A89CB3" fill-rule="nonzero" class="color"/>
                          </g>
                        </svg>
                      </span>
              <span class="text">Tokens</span>
            </router-link>
            <router-link :to="`/nfts`" class="item"
                         onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');">
                      <span class="icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fill-rule="evenodd">
                            <path opacity=".28" d="M0 0h20v20H0z"/>
                            <path
                                d="M10 17.363 1.088 8.046 5.22 2.858h9.562l4.134 5.188L10 17.363zM2.412 7.988 10 15.917l7.587-7.934L14.3 3.858H5.7l-3.288 4.13z"
                                fill="#A89CB3" fill-rule="nonzero" class="color"/>
                          </g>
                        </svg>
                      </span>
              <span class="text">NFT</span>
            </router-link>
            <a href="javascript:;" class="item more"
               onclick="event.target.closest('.item').classList.toggle('show');event.target.closest('.mobile-menu').getElementsByClassName('item-sub more')[0].classList.toggle('show');">
                      <span class="icon">
                        <svg width="20" height="20" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                          <g fill="none" fill-rule="evenodd">
                            <path opacity=".2" d="M0 0h20v20H0z"/>
                            <g transform="translate(3.22 8.87)" fill="#A89CB3" fill-rule="nonzero" class="color">
                              <circle cx="1.129" cy="1.129" r="1.129"/>
                              <circle cx="6.779" cy="1.129" r="1.129"/>
                              <circle cx="12.429" cy="1.129" r="1.129"/>
                            </g>
                          </g>
                        </svg>
                      </span>
              <span class="text">More</span>
              <span style="flex: 1 1 0%;"></span>
              <span class="icon arrow"><img src="~@assets/img/ic-arrow-down-white@3x.png"></span>
            </a>
            <div class="item-sub more">
              <div class="list">
                <a href="javascript:;" class="item"
                   v-on:click="gotoStore">
                          <span class="text">
                            AERGO Wallet
                            <span class="sub">(Mobile)</span>
                            <span class="icon goto"></span>
                          </span>
                </a>
                <a href="https://chrome.google.com/webstore/detail/aergo-connect/iopigoikekfcpcapjlkcdlokheickhpc?hl=ko" class="item"
                   onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');" target="_blank">
                          <span class="text">
                            AERGO Wallet
                            <span class="sub">(Chrome Extension)</span>
                            <span class="icon goto"></span>
                          </span>
                </a>
                <a href="https://ide.aergo.io/" class="item"
                   onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');" target="_blank">
                          <span class="text">
                            AERGO IDE
                            <span class="icon goto"></span>
                          </span>
                </a>
                <a href="https://aergo.readthedocs.io/en/2.2/" class="item"
                   onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');" target="_blank">
                          <span class="text">
                            AERGO Docs
                            <span class="icon goto"></span>
                          </span>
                </a>
                <router-link :to="`/register`" class="item"
                             onclick="document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');">
                  <span class="text">Contract Registration</span>
                </router-link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { isAndroid, isIOS } from 'mobile-device-detect';
import NetworkSelector from '@/src/vue/components/NetworkSelector';

export default {
  name: 'Header',
  props:{
    css: {
      type: Object,
      default: () => ({
        page: '',
      })
    },
  },
  data() {
    return {}
  },
  created() {
  },
  beforeDestroy() {
  },
  computed: {},
  methods: {
    gotoStore: function () {
      document.getElementsByClassName('btn-mobile-menu')[0].classList.remove('show');document.getElementsByClassName('mobile-menu')[0].classList.remove('show');
      if(isAndroid) {
        window.open('https://play.google.com/store/apps/details?id=com.aergomobilewallet');
      } else if(isIOS) {
        window.open('https://apps.apple.com/kr/app/aergo-wallet/id1577313604');
      } else {
        window.open('https://www.aergo.io/');
      }
    },
  },
  components: {
    NetworkSelector,
    isAndroid,
    isIOS
  }
};
</script>

<style lang="scss" scoped>
</style>
