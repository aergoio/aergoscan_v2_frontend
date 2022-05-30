<template>
  <div class="wrap">
    <div id="category" class="bp-list">
      <Header/>
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search/>
            <div class="title">Chain Info</div>
            <div class="detail-box">
              <div class="table-wrap">
                <div class="error">
                  에러메시지 영역입니다.
                </div>
                <table class="bp-detail">
                  <tbody>
                  <tr class="hidden loading">
                    <td colspan="100%">Loading...</td>
                  </tr>
                  <tr class="hidden not-found">
                    <td colspan="100%">No items found</td>
                  </tr>
                  <tr>
                    <th><div>Chain ID</div></th>
                    <td><div>alpha.aergo.io (private, non-main)</div></td>
                  </tr>
                  <tr>
                    <th><div>Maximum block size</div></th>
                    <td><div>1048976</div></td>
                  </tr>
                  <tr>
                    <th><div>Total token supply</div></th>
                    <td><div>50 000 000 AERGO</div></td>
                  </tr>
                  <tr>
                    <th><div>Consensus</div></th>
                    <td><div>raft</div></td>
                  </tr>
                  <tr>
                    <th><div>BP number</div></th>
                    <td><div>3</div></td>
                  </tr>
                  </tbody>
                </table>
              </div>
              <div class="table-wrap">
                <div class="error">
                  에러메시지 영역입니다.
                </div>
                <table class="bp-detail">
                  <tbody>
                  <tr class="hidden loading">
                    <td colspan="100%">Loading...</td>
                  </tr>
                  <tr class="hidden not-found">
                    <td colspan="100%">No items found</td>
                  </tr>
                  <tr>
                    <th><div>Min. staking amount</div></th>
                    <td><div>0 AERGO</div></td>
                  </tr>
                  <tr>
                    <th><div>Total staked amount</div></th>
                    <td><div>0 AERGO</div></td>
                  </tr>
                  <tr>
                    <th><div>Nameprice</div></th>
                    <td><div>1 AERGO</div></td>
                  </tr>
                  <tr>
                    <th><div>Gasprice</div></th>
                    <td><div>50 000 000 000  AERGO</div></td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
            <div class="table-wrap">
              <div class="title">BP List <div class="btn-refresh" onclick="document.getElementsByClassName('icon refresh')[0].classList.add('loading')"><span class="icon refresh"></span></div> </div>
              <div class="error bp-list">
                에러메시지 영역입니다.
              </div>
              <div class="h-scroll">
                <table class="bp-list-table">
                  <thead>
                  <tr>
                    <th><div>POS.</div></th>
                    <th><div>NAME</div></th>
                    <th><div>RAFT ID</div></th>
                    <th><div>PEER ID</div></th>
                    <th><div>STATUS</div></th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr class="hidden loading">
                    <td colspan="100%">Loading...</td>
                  </tr>
                  <tr class="hidden not-found">
                    <td colspan="100%">No items found</td>
                  </tr>
                  <tr>
                    <td><div>1</div></td>
                    <td><div>alpha1</div></td>
                    <td><div><a href="javascript:;" class="block">7b3dc0dc4248a073</a></div></td>
                    <td><div><span class="identicon"></span><a href="javascript:;" class="block">16Uiu2wtJRR9vbLxqSSULZw68hgY8KzH8ymAe1Z7QzwAe1Z7Qzw49i</a></div></td>
                    <td><div></div></td>
                  </tr>
                  <tr>
                    <td><div>2</div></td>
                    <td><div>alpha2</div></td>
                    <td><div><a href="javascript:;" class="block">7b3dc0dc4248a073</a></div></td>
                    <td><div><span class="identicon"></span><a href="javascript:;" class="block">16Uiu2wtJRR9vbLxqSSULZw68hgY8KzH8ymAe1Z7QzwAe1Z7Qzw49i</a></div></td>
                    <td><div></div></td>
                  </tr>
                  <tr class="focus">
                    <td><div>3</div></td>
                    <td><div>alpha3</div></td>
                    <td><div><a href="javascript:;" class="block">7b3dc0dc4248a073</a></div></td>
                    <td><div><span class="identicon"></span><a href="javascript:;" class="block">16Uiu2wtJRR9vbLxqSSULZw68hgY8KzH8ymAe1Z7QzwAe1Z7Qzw49i</a></div></td>
                    <td><div><span class="boxicon gray">LEADER</span></div></td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer/>
    </div>
  </div>
</template>

<script>

export default {
  data () {
    return {
    }
  },
  created () {
  },
  beforeDestroy () {
  },
  computed: {
  },
  methods: {
  },
  components: {
  }
};
</script>

<style lang="scss" scoped>
.category-inner {
  > .page-wrap {
    padding-bottom: 30px;

    @media screen and (max-width: 780px) {
      padding-top: 20px;
    }
  }
}

.table-wrap {
  padding: 20px 19px 50px 20px;

  > .title {
    display: flex;
    align-items: center;

    .btn-refresh {
      display: flex;
      align-items: center;
      margin-left: 8px;
      cursor: pointer;
    }
  }
}

.detail-box {
  display: flex;
  margin: 0 -7.5px;
  margin-bottom: 15px;

  @media screen and (max-width: 780px) {
    flex-wrap: wrap;
  }

  .h-scroll {
    height: 100%;
  }

  .table-wrap {
    width: calc(50% - 7.5px);
    padding: 10px 19px 10px 20px;
    margin: 0 7.5px;

    @media screen and (max-width: 780px) {
      width: 100%;

      &:first-child {
        margin-bottom: 15px;
      }
    }
  }
}

table.bp-detail {
  table-layout: fixed;
  border-collapse: separate;
  border-spacing: 0 20px;

  th {
    width: 150px;
    height: auto;
    font-size: 14px;
    color: #a391aa;
    border-bottom: none;
    vertical-align: top;

    @media screen and (max-width: 780px) {
      padding-right: 20px;
    }

    @media screen and (max-width: 480px) {
      font-size: 15px;
    }

    > div {
      align-items: start;
    }
  }

  td {
    height: auto;
    font-size: 14px;
    border-bottom: none;
    vertical-align: top;

    @media screen and (max-width: 480px) {
      font-size: 15px;
    }

    > div {
      align-items: start;
    }

    .identicon {
      display: inline-block;
      width: 18px;
      height: 18px;
      flex: 18px 0 0;
      margin-right: 8px;
      vertical-align: middle;
    }

    .hash-block,
    .prev-block {
      font-size: 13px;
      word-break: break-all;

      &:hover {
        font-weight: bold;
        color: #3c3b3e;
        text-decoration: underline;
      }
    }

    //.icon.copy {
    //  margin-left: 5px;
    //
    //  @media screen and (max-width: 480px) {
    //    svg {
    //      width: 24px;
    //      height: 24px;
    //    }
    //  }
    //}
  }
}

table.bp-list-table {
  tr {
    &.focus {
      background-color: #fcfaff;
    }
  }

  th {
    &:first-child {
      padding-left: 10px;
    }
  }

  td {
    &:first-child {
      padding-left: 10px;
    }

    &:nth-child(4) {
      .block {
        font-weight: bold;
      }
    }

    .boxicon {
      &.gray {
        padding: 0 7px;
        font-weight: normal;
        line-height: 22px;
        border-radius: 11px;
      }
    }
  }
}
</style>
