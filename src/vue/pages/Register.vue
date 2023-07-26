<template>
  <div class="wrap">
    <div id="category" class="contract-regi">
      <Header />
      <div class="category-inner">
        <div class="page-wrap">
          <div class="page-content">
            <search />
            <div class="title">Contract Registration Request</div>
            <div class="content">
              <p>
                To enter Token/NFT information, you must fill out the 'Enter
                Token/NFT Info.' form.
              </p>
              <p>
                For any other enquiries, please contact
                <a href="mailto:aergoscan@aergo.io">aergoscan@aergo.io</a>.
              </p>
              <p>Thank you.</p>
            </div>
            <div class="btn register" v-on:click="gotoRegister">
              <button>Register</button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  </div>
</template>

<script>
import Search from '@/src/vue/components/Search'

export default {
  data() {
    return {}
  },
  created() {},
  beforeDestroy() {},
  computed: {},
  methods: {
    gotoRegister: function () {
      window.open('https://forms.gle/xmDPgfJTEPZHSi1r7')
    },
  },
  components: {
    Search,
  },
}
</script>

<style lang="scss" scoped>
#category {
  > .header {
    .select-box {
      display: none;
    }
  }
}

.category-inner {
  > .page-wrap {
    padding-bottom: 30px;

    @media screen and (max-width: 900px) {
      padding-top: 20px;
    }
  }

  .page-content {
    > .title {
      display: flex;
      align-items: center;
    }

    > .content {
      margin: 47px 0 50px;

      @media screen and (max-width: 480px) {
        margin: 60px 0 80px;
      }

      p {
        margin: 0;
        font-size: 14px;
        line-height: 1.71;
        color: #3c3b3e;

        a {
          color: #ff088f;

          &:hover {
            text-decoration: underline;
          }
        }
      }
    }

    .btn.register {
      @media screen and (max-width: 480px) {
        text-align: center;
      }

      button {
        height: 32px;
        padding: 0 34px 0 33px;
        border-radius: 33px;
        border: 1px solid #ff088f;
        outline: none;
        font-size: 14px;
        font-weight: bold;
        color: #fff;
        background-color: #ff088f;

        @media screen and (max-width: 480px) {
          height: 40px;
          padding: 0 45px;
          font-size: 16px;
        }

        &:hover {
          color: #ff088f;
          background-color: #fff;
        }
      }
    }
  }
}
</style>
