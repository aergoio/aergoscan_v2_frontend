<template>
  <div :class="[css.wrapper]">
    <slot name="search" />
    <slot name="title" />
    <slot name="desc" />
    <slot name="error" />
    <!-- <div class="h-scroll"> -->
    <table :class="[css.table, statusTableCss]">
      <thead>
        <tr>
          <slot name="header" />
        </tr>
      </thead>
      <tbody>
        <template v-if="isLoading">
          <tr class="hidden loading">
            <td colspan="100%">Loading...</td>
          </tr>
        </template>
        <template v-if="transData.length">
          <tr v-for="(row, index) in transData">
            <slot name="list" :row="row" />
            <!-- list slot -->
          </tr>
        </template>
        <template v-else-if="!isLoading && transData.length === 0">
          <tr class="hidden not-found">
            <td colspan="100%">No items found</td>
          </tr>
        </template>
      </tbody>
    </table>
    <!-- </div> -->
    <template>
      <slot name="pagination" />
    </template>
    <template>
      <slot name="more" />
    </template>
  </div>
</template>
<script>
export default {
  name: 'DataTable',
  props: {
    isLoading: Boolean,
    transData: Array,
    css: {
      type: Object,
      default: () => ({
        wrapper: 'table-wrap',
        table: '',
      }),
    },
  },

  data: function () {
    return {}
  },
  watch: {},
  methods: {},
  computed: {
    statusTableCss() {
      if (!this.isLoading && this.transData.length === 0) {
        return 'not-found'
      }

      return this.isLoading ? 'loading' : ''
    },
  },
}
</script>
