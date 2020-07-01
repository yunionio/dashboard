<template>
  <a-row class="wrap position-relative" type="flex">
    <a-col class="left position-relative" :span="12">
      <div class="d-flex flex-column h-100">
        <h2 class="flex-shrink-0 flex-grow-0">{{ $store.state.app.companyInfo.name }}</h2>
        <div class="flex-fill position-relative">
          <a-carousel class="carousel h-100 w-100">
            <div v-for="(item, idx) of carouselOptions" :key="idx">
              <h4>{{ item.title }}</h4>
              <p v-for="(msg, idx) of item.messages" :key="idx">{{ msg }}</p>
            </div>
          </a-carousel>
        </div>
      </div>
    </a-col>
    <a-col class="right d-flex flex-column" :span="12">
      <div class="logo flex-shrink-0 flex-grow-0 text-right">
        <img :src="loginLogo" />
      </div>
      <div class="flex-fill position-relative">
        <div class="h-100 w-100 overflow-hidden content-wrap">
          <h4>{{ title }}</h4>
          <transition-page>
            <router-view />
          </transition-page>
        </div>
      </div>
      <div class="flex-shrink-0 flex-grow-0">
        <!-- 第三方快速登录 -->
        <template v-if="fastLoginOptions.length > 0">
          <div class="fast-login-wrap">
            <div class="fast-login-title d-flex justify-content-center align-items-center"><span class="mr-2" />{{ $t('auth.login.fast.login.title') }}<span class="ml-2" /></div>
            <template v-for="(item, idx) of fastLoginOptions">
              <div class="fast-login-items mt-2 mb-2" :key="idx">
                <a class="fast-login-item d-flex align-items-center justify-content-center ml-2 mr-2" :href="item.serverUrl">
                  <a-tooltip placement="top">
                    <template slot="title">
                      <span>{{ item.tooltip }}</span>
                    </template>
                    <img :src="item.logo" />
                  </a-tooltip>
                </a>
              </div>
            </template>
          </div>
        </template>
      </div>
    </a-col>
  </a-row>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'AccountIndex',
  data () {
    return {
      prevHeight: 0,
      carouselOptions: this.$t('authCarouselOptions'),
    }
  },
  computed: {
    ...mapGetters(['auth', 'userInfo', 'loginLogo']),
    ...mapState('auth', {
      regions: state => state.regions,
      loggedUsers: state => state.loggedUsers,
    }),
    title () {
      if (this.$route.name === 'Auth') {
        return this.$t('auth.login')
      }
      if (this.$route.name === 'LoginChooser') {
        return this.$t('auth.chooser')
      }
      return '-'
    },
    casConfig () {
      const cas = this.regions.idps.find(item => item.driver === 'cas')
      return cas && cas.config
    },
    casServerUrl () {
      return this.casConfig && `${this.casConfig.cas.cas_server_url}?service=${this.casConfig.cas.service}`
    },
    fastLoginOptions () {
      const ret = []
      if (this.casServerUrl) {
        ret.push({
          tooltip: this.$t('auth.login.cas.tooltip'),
          serverUrl: this.casServerUrl,
          logo: require('../assets/cas.png'),
        })
      }
      return ret
    },
  },
  created () {
    this.$store.dispatch('auth/getRegions')
    let data = Object.entries(this.loggedUsers)
    if (this.$route.query.domain) {
      data = data.filter(v => {
        return v[1].domain.name === this.$route.query.domain
      })
    }
    if (!R.isEmpty(this.loggedUsers) && data.length > 0) {
      this.$router.replace({
        path: '/auth/login/chooser',
        query: this.$route.query,
      })
    }
  },
}
</script>

<style lang="scss" scoped>
.wrap {
  width: 800px;
}
.left {
  min-height: 580px;
  background-color: #69afe8;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='100%25' height='100%25' viewBox='0 0 2 1'%3E%3Cdefs%3E%3ClinearGradient id='a' gradientUnits='userSpaceOnUse' x1='0' x2='0' y1='0' y2='1'%3E%3Cstop offset='0' stop-color='%2369afe8'/%3E%3Cstop offset='1' stop-color='%230c90e8'/%3E%3C/linearGradient%3E%3ClinearGradient id='b' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='0' y2='1'%3E%3Cstop offset='0' stop-color='%23052ee8' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23052ee8' stop-opacity='1'/%3E%3C/linearGradient%3E%3ClinearGradient id='c' gradientUnits='userSpaceOnUse' x1='0' y1='0' x2='2' y2='2'%3E%3Cstop offset='0' stop-color='%23052ee8' stop-opacity='0'/%3E%3Cstop offset='1' stop-color='%23052ee8' stop-opacity='1'/%3E%3C/linearGradient%3E%3C/defs%3E%3Crect x='0' y='0' fill='url(%23a)' width='2' height='1'/%3E%3Cg fill-opacity='0.5'%3E%3Cpolygon fill='url(%23b)' points='0 1 0 0 2 0'/%3E%3Cpolygon fill='url(%23c)' points='2 1 2 0 0 0'/%3E%3C/g%3E%3C/svg%3E");
  background-attachment: fixed;
  background-size: cover;
  color: #fff;
  padding: 40px;
  h2 {
    color: #fff;
    margin-bottom: 40px;
  }
  h4 {
    color: #fff;
    margin-bottom: 20px;
  }
  p {
    font-size: 14px;
    color: #fff;
  }
  .carousel {
    top: 0;
    left: 0;
    position: absolute;
    ::v-deep {
      .slick-slider {
        height: 100%;
      }
    }
  }
}
.right {
  background-color: #fff;
  min-height: 580px;
}
.logo {
  padding-right: 30px;
  padding-top: 40px;
  > img {
    height: 40px;
  }
}
.content-wrap {
  padding: 20px 60px 20px;
  > h4 {
    font-weight: 400;
    margin-bottom: 40px;
  }
}
.fast-login-title {
  font-size: 12px;
  color: #999;
  > span {
    width: 40px;
    height: 1px;
    background-color: #d9d9d9;
  }
}
.fast-login-item {
  height: 35px;
  overflow: hidden;
  img {
    height: 100%;
  }
}
</style>
