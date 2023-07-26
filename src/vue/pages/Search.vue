<template>
  <div class="wrap">
    <div id="category" class="search-result">
      <Header />
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search />
            <div
              class="search-result not-found"
              v-if="$route.query.found === 'no'"
            >
              <div class="search-result-inner">
                <div class="img">
                  <img src="~@assets/img/aergo-symbol-no-item@3x.png" />
                </div>
                <div class="content not-found">
                  <h2>No items found</h2>
                  <template
                    v-if="
                      $route.query.keyword && $route.query.keyword.length < 3
                    "
                  >
                    <p>Keyword "{{ $route.query.keyword }}" is too short.</p>
                    <p>Please enter at least 3 characters.</p>
                  </template>
                  <template v-else>
                    <p>The keyword you entered could not be found.</p>
                    <p>Please check the keyword and try again.</p>
                  </template>
                </div>
                <div class="content error">
                  <p>
                    Sorry. AERGO Scan results cannot be displayed due to a
                    temporary network problem.
                  </p>
                  <p>Please refresh the page or retry the search.</p>
                </div>
              </div>
            </div>
            <template v-else>
              <div class="title tokens">
                Tokens
                <span class="sub">{{ tokenTotalItems }}</span>
                <span class="sub-2">ARC-1</span>
                <span style="flex: 1 1 0%"></span>
              </div>
              <search-result-token-table
                :keyword="$route.query.keyword"
                @onUpdateTotalCount="updateTokenTotalCount"
                ref="searchResultTokenTable"
              />
              <div class="title nfts">
                NFT
                <span class="sub">{{ nftTotalItems }}</span>
                <span class="sub-2">ARC-2</span>
                <span style="flex: 1 1 0%"></span>
              </div>
              <search-result-nft-table
                :keyword="$route.query.keyword"
                @onUpdateTotalCount="updateNftTotalCount"
                ref="searchResultNftTable"
              />
            </template>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>
<script>
import Search from '@/src/vue/components/Search'
import SearchResultTokenTable from '@/src/vue/components/SearchResultTokenTable'
import SearchResultNftTable from '@/src/vue/components/SearchResultNftTable'

export default {
  data() {
    return {
      tokenTotalItems: 0,
      nftTotalItems: 0,
    }
  },
  created() {},
  beforeDestroy() {},
  computed: {},
  watch: {
    $route(to, from) {
      if (to.path === from.path && to.query.keyword) {
        if (this.$refs.searchResultTokenTable) {
          this.$refs.searchResultTokenTable.reload(to.query.keyword)
        }
        if (this.$refs.searchResultNftTable) {
          this.$refs.searchResultNftTable.reload(to.query.keyword)
        }
      }
    },
  },
  methods: {
    updateTokenTotalCount(count) {
      this.tokenTotalItems = count
    },
    updateNftTotalCount(count) {
      this.nftTotalItems = count
    },
  },
  components: {
    SearchResultNftTable,
    SearchResultTokenTable,
    Search,
  },
}
</script>

<style lang="scss" scoped>
.category-inner {
  > .page-wrap {
    padding-bottom: 30px;

    @media screen and (max-width: 900px) {
      padding-top: 20px;
    }
  }
}

.page-content > .title {
  display: flex;
  align-items: center;

  &.nft {
    @media screen and (max-width: 900px) {
      margin-top: 30px;
    }
  }

  .sub {
    margin-left: 10px;
    margin-top: 4px;
    color: #b6b6b6;
    font-size: 20px;
    font-weight: bold;
  }

  .sub-2 {
    padding: 2px 5px;
    margin-left: 5px;
    margin-top: 4px;
    font-size: 8px;
    color: #fff;
    border-radius: 2px;
    background-color: #2c2938;
    white-space: nowrap;
  }
}

.page-content > .table-wrap {
  padding-bottom: 25px;

  ::v-deep .btn-wrap {
    margin-top: 25px;
    text-align: center;

    button {
      width: 134px;
      height: 36px;
      border-radius: 25px;
      border: none;
      font-size: 13px;
      color: #fff;
      background-color: #363344;
    }
  }
}
</style>
