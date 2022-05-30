<template>
  <div :class="[css.pagination]">
    <div :class="[css.paginationInner]">
      <span
          v-if="moveFirstPage"
          :class="[css.moveFirstPage, isActionDisabled('firstPage') ? 'disabled' : '']"
          @click="changePage(1)"
      >
        <svg width="15" height="12" viewBox="0 0 15 12" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M15 12H0V0h15z"/>
            <path fill="#DAD8DE" fill-rule="nonzero"
                  d="M8.59 6.046 10.5 8.11l-.545.59L7.5 6.046l2.455-2.654.545.59z"/>
            <path fill="#DAD8DE" fill-rule="nonzero"
                  d="m10.724 6.046 1.91 2.064-.546.59-2.455-2.654 2.455-2.654.545.59zM2.59 6.046 4.5 8.11l-.545.59L1.5 6.046l2.455-2.654.545.59z"/>
            <path fill="#DAD8DE" fill-rule="nonzero"
                  d="m4.724 6.046 1.91 2.064-.546.59-2.455-2.654 2.455-2.654.545.59z"/>
          </g>
        </svg>
      </span>
      <span
          v-if="movePreviousPage"
          :class="[css.movePreviousPage, isActionDisabled('previousPage') ? 'disabled' : '']"
          @click="changePage(currPage - 1)"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M12 12H0V0h12z"/>
            <path fill="#DAD8DE" fill-rule="nonzero"
                  d="M3.59 6.046 5.5 8.11l-.545.59L2.5 6.046l2.455-2.654.545.59z"/>
            <path fill="#DAD8DE" fill-rule="nonzero"
                  d="m5.724 6.046 1.91 2.064-.546.59-2.455-2.654 2.455-2.654.545.59z"/>
          </g>
        </svg>
      </span>
      <span class="page">
        <span class="cur">{{currPage}}</span>/<span class="tot">{{lastPage}}</span>
      </span>
      <span
          v-if="moveNextPage"
          :class="[css.moveNextPage, isActionDisabled('nextPage') ? 'disabled' : '']"
          @click="changePage(currPage + 1)"
      >
        <svg width="12" height="12" viewBox="0 0 12 12" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M0 0h12v12H0z"/>
            <path fill="#5D5960" fill-rule="nonzero"
                  d="M7.41 5.954 5.5 3.89l.545-.59L8.5 5.954 6.045 8.608l-.545-.59z"/>
            <path fill="#5D5960" fill-rule="nonzero"
                  d="M5.276 5.954 3.366 3.89l.546-.59 2.455 2.654-2.455 2.654-.545-.59z"/>
          </g>
        </svg>
      </span>
      <span
          v-if="moveLastPage"
          :class="[css.moveLastPage, isActionDisabled('lastPage') ? 'disabled' : '']"
          @click="changePage(lastPage)"
      >
        <svg width="15" height="12" viewBox="0 0 15 12" xmlns="http://www.w3.org/2000/svg">
          <g fill="none" fill-rule="evenodd">
            <path d="M0 0h15v12H0z"/>
            <path fill="#5D5960" fill-rule="nonzero"
                  d="M6.41 5.954 4.5 3.89l.545-.59L7.5 5.954 5.045 8.608l-.545-.59z"/>
            <path fill="#5D5960" fill-rule="nonzero"
                  d="M4.276 5.954 2.366 3.89l.546-.59 2.455 2.654-2.455 2.654-.545-.59zM12.41 5.954 10.5 3.89l.545-.59L13.5 5.954l-2.455 2.654-.545-.59z"/>
            <path fill="#5D5960" fill-rule="nonzero"
                  d="M10.276 5.954 8.366 3.89l.546-.59 2.455 2.654-2.455 2.654-.545-.59z"/>
          </g>
        </svg>
      </span>
    </div>
  </div>
</template>
<script>

export default {
  name: 'Pagination',
  props: {
    totalItems: {
      type: Number,
      required: true
    },
    itemsPerPage: {
      type: Number,
      default: 10
    },
    page: {
      type: Number,
      default: 1
    },
    moveLastPage: {
      type: Boolean,
      default: true
    },
    moveFirstPage: {
      type: Boolean,
      default: true
    },
    moveNextPage: {
      type: Boolean,
      default: true
    },
    movePreviousPage: {
      type: Boolean,
      default: true
    },
    css: {
      type: Object,
      default: () => ({
        pagination: '',
        paginationInner: '',
        moveFirstPage: 'pprev',
        movePreviousPage: 'prev',
        moveNextPage: 'next',
        moveLastPage: 'nnext',
      })
    },
  },

  data: function () {
    return {
      perPage: this.itemsPerPage,
      currPage: this.page
    }
  },

  computed: {
    lastPage: function () {
      if(this.totalItems === 0) {
        return 1;
      }
      return Math.ceil(this.totalItems / this.perPage)
    }
  },
  watch: {
    page: function (newPage) {
      this.currPage = newPage
    },
  },
  methods: {
    changePage: function (pageToMove) {
      if (pageToMove <= this.lastPage && pageToMove >= 1 && pageToMove !== this.currPage) {
        this.$emit('onUpdate', pageToMove)
      }
    },
    isActionDisabled: function (action) {
      switch (action) {
        case 'firstPage':
          return this.currPage === 1
        case 'previousPage':
          return this.currPage === 1
        case 'lastPage':
          return this.currPage === this.lastPage || !this.totalItems || this.currPage * this.itemsPerPage >= this.totalItems
        case 'nextPage':
          return this.currPage === this.lastPage || !this.totalItems || this.currPage * this.itemsPerPage >= this.totalItems
      }
    },
  }
};
</script>

<style lang="scss" scoped>
</style>
