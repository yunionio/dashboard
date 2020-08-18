<template>
  <div class="login-index-wrap flex-fill d-flex h-100 align-items-center">
    <div class="login-index-left flex-fill pr-4">
      <h2>{{ $t('login.desc1') }}</h2>
      <h4>{{ $t('login.desc2') }}</h4>
      <h6>{{ $t('login.desc3') }}</h6>
    </div>
    <div class="login-index-right d-flex flex-column shadow-lg bg-white rounded">
      <!-- login form -->
      <div class="flex-fill position-relative">
        <div class="login-content-wrap h-100 w-100 overflow-hidden">
          <h4 class="text-center">{{ title }}</h4>
          <transition-page>
            <router-view />
          </transition-page>
        </div>
      </div>
      <!-- 第三方登录 -->
      <div class="flex-shrink-0 flex-grow-0">
        <template v-if="idps.length > 0">
          <div class="fast-login-wrap">
            <div class="fast-login-title d-flex justify-content-center align-items-center"><span class="mr-2" />{{ $t('auth.login.fast.login.title') }}<span class="ml-2" /></div>
            <div class="d-flex justify-content-center flex-wrap p-1">
              <div class="fast-login-items" :key="idx" v-for="(item, idx) of idps">
                <a class="fast-login-item d-flex align-items-center justify-content-center ml-2 mr-2" @click="handleClickIdp(item)">
                  <a-tooltip placement="top" :title="$t(`idpTmplTitles.${item.template || item.driver}`)">
                    <template slot="title">
                      <span>{{ item.tooltip }}</span>
                    </template>
                    <img :src="getIcon(item)" />
                  </a-tooltip>
                </a>
              </div>
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'

export default {
  name: 'AccountIndex',
  data () {
    return {
      prevHeight: 0,
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
    idps () {
      return this.regions.idps || []
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
    const { query, path } = this.$route
    const { result, error_class } = query
    if (result === 'error') {
      this.$notification.error({
        class: 'error-notification',
        message: error_class,
        icon: h => <a-icon type="info-circle" class="error-color" />,
      })
      this.$router.replace({
        path,
        query: {
          pathAuth: query.pathAuth,
          path: query.path,
        },
      })
      return false
    }
    if (!R.isEmpty(data)) {
      this.$router.replace({
        path: '/auth/login/chooser',
        query,
      })
    }
  },
  methods: {
    getIcon (idp) {
      const { template, driver } = idp
      const key = (template || driver).toLocaleLowerCase()
      return require(`../../../assets/images/idp-icons/round/${key}.png`)
    },
    handleClickIdp (idpItem) {
      const { origin, search } = window.location
      const { id } = idpItem
      window.location.href = `${origin}/api/v1/auth/sso/redirect/${id}${search || ''}`
    },
  },
}
</script>

<style lang="less">
.login-index-wrap {
  background-image: url('./assets/bg.png');
  background-repeat: no-repeat;
  background-position: center left;
  background-color: #fff;
}
.login-index-left {
  h2 {
    margin-bottom: 30px;
    font-weight: 400;
    font-size:34px;
  }
  h4 {
    margin-bottom: 30px;
    font-weight: 400;
    font-size:22px;
  }
  h6 {
    font-weight: 400;
    color:rgb(102,102,102);
    font-size:16px;
  }
}
.login-index-right {
  min-height: 420px;
  min-width: 400px;
  width: 400px;
}
.login-content-wrap {
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
    height: 60%;
  }
}
</style>
