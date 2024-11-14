import 'whatwg-fetch'
import 'intersection-observer'
import Vue from 'vue'
import App from '@/src/vue/App'
import VueRouter from 'vue-router'
import VueFetch from 'vue-fetch'
import VueClipboard from 'vue-clipboard2'

import routes from '@/src/vue/config/routes'
import Header from '@/src/vue/components/Header'
import Footer from '@/src/vue/components/Footer'
import { DataTable, Pagination } from '@/src/vue/components/tables'
import { Tabs, Tab } from '@/src/vue/components/tabs'
import CopyLinkButton from '@/src/vue/components/CopyLinkButton'
import QrcodeButton from '@/src/vue/components/QrcodeButton'
import QRcodeModal from '@/src/vue/components/modal/QRcodeModal'
import VueJsonPretty from 'vue-json-pretty'
import 'vue-json-pretty/lib/styles.css'

import store from '@/src/vue/store/index'
import { shortAddress } from '@/src/vue/filters/address'
import { formatToken, formatGenericToken } from '@/src/vue/filters/format-token'
import { formatNumber } from '@/src/vue/filters/format-number'
import { formatBigNumAmount } from '@/src/vue/filters/format-amount'
import { formatEllipsisText } from '@/src/vue/filters/format-truncate-text'
import { formatPercentageText } from '@/src/vue/filters/format-percentage-text'
import { changeStringByKeyword } from '@/src/vue/filters/format-replace'
import { tooltip } from '@/src/vue/directives/tooltip'

export default async function setup(opts) {
  Vue.prototype.$window = window
  Vue.use(VueRouter)
  Vue.use(VueFetch, { polyfill: true })
  Vue.use(VueClipboard)
  Vue.directive('tooltip', tooltip)
  Vue.component('Header', Header)
  Vue.component('Footer', Footer)
  Vue.component('DataTable', DataTable)
  Vue.component('Pagination', Pagination)
  Vue.component('Tabs', Tabs)
  Vue.component('Tab', Tab)
  Vue.component('CopyLinkButton', CopyLinkButton)
  Vue.component('QrcodeButton', QrcodeButton)
  Vue.component('QrcodeModal', QRcodeModal)
  Vue.component('vue-json-pretty', VueJsonPretty)

  Vue.filter('shortAddress', shortAddress)
  Vue.filter('formatToken', formatToken)
  Vue.filter('formatGenericToken', formatGenericToken)
  Vue.filter('formatNumber', formatNumber)
  Vue.filter('formatBigNumAmount', formatBigNumAmount)
  Vue.filter('formatEllipsisText', formatEllipsisText)
  Vue.filter('changeStringByKeyword', changeStringByKeyword)
  Vue.filter('formatPercentageText', formatPercentageText)

  const router = new VueRouter({
    routes,
    mode: 'history',
    scrollBehavior(from, to, savedPosition) {
      if (from.path !== to.path) {
        return { x: 0, y: 0 }
      }
      return savedPosition
    },
  })

  const vue = new Vue({
    el: '#app',
    render: (createElement) => createElement(App),
    router,
    store,
  })

  Vue.config.devtools = true
}
