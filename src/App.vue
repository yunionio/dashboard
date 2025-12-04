<template>
  <a-config-provider :locale="locale">
    <div id="app" @click="handleAppAction">
      <component :is="layout">
        <router-view />
      </component>
      <dialog-manager />
      <side-page-manager />
      <window-resize-listener />
      <oc-term />
    </div>
  </a-config-provider>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import jaJP from 'ant-design-vue/es/locale/ja_JP'
import DefaultLayout from '@/layouts/Default'
import FullScreenLayout from '@/layouts/FullScreen'
import DialogManager from '@/sections/DialogManager'
import SidePageManager from '@/sections/SidePageManager'
import WindowResizeListener from '@/sections/WindowResizeListener'
import notificationListener from '@/utils/notificationListener'
import i18n from '@/locales'
import { updateThemeColor } from '@/utils/theme/utils'
import setting from '@/config/setting'
import WindowsMixin from '@/mixins/windows'
import LogoutMixin from '@/mixins/logout'

const antdLocales = {
  'zh-CN': zhCN,
  en: enUS,
  'ja-JP': jaJP,
}

export default {
  name: 'App',
  components: {
    DefaultLayout,
    FullScreenLayout,
    DialogManager,
    SidePageManager,
    WindowResizeListener,
  },
  mixins: [WindowsMixin, LogoutMixin],
  data () {
    return {
      locale: antdLocales[this.$store.getters.setting.language],
      monitorAlertTimer: null,
    }
  },
  computed: {
    ...mapGetters(['auth', 'theme', 'themeColor', 'scope']),
    ...mapState({
      globalSetting: state => state.globalSetting,
      tenant: state => state.auth.tenant,
      session: state => state.auth.auth.session,
    }),
    layout () {
      return `${(this.$route.meta.layout || 'default')}-layout`
    },
  },
  watch: {
    'auth.auth' (val, oldVal) {
      if (val && !R.equals(val, oldVal)) {
        if (val.session) {
          this.connect(val.session)
        }
      }
    },
    'globalSetting.value.dictionary': {
      handler (val, oldVal) {
        i18n.setOriginDictionary()
        if (!R.equals(val, oldVal) && !R.isNil(val) && !R.isEmpty(val)) {
          if (!R.isNil(val.en) && !R.isEmpty(val.en)) {
            i18n.mergeLocaleMessage('en', {
              dictionary: val.en,
            })
          }
          if (!R.isNil(val.zh) && !R.isEmpty(val.zh)) {
            i18n.mergeLocaleMessage('zh-CN', {
              dictionary: val.zh,
            })
          }
          if (!R.isNil(val.ja) && !R.isEmpty(val.ja)) {
            i18n.mergeLocaleMessage('ja-JP', {
              dictionary: val.ja,
            })
          }
        }
      },
      immediate: true,
    },
    themeColor: {
      handler (val) {
        if (val && val !== process.env.THEME_COLOR) {
          updateThemeColor(val)
        }
      },
      immediate: true,
    },
  },
  created () {
    this.initIO()
    this.initMonitorAlertNotify()
  },
  beforeDestroy () {
    // 组件销毁时清除定时器
    if (this.monitorAlertTimer) {
      clearInterval(this.monitorAlertTimer)
      this.monitorAlertTimer = null
    }
  },
  methods: {
    initIO () {
      if (!this.$appConfig.isPrivate) return
      const options = {}
      if (process.env.NODE_ENV === 'production') {
        options.server = '/'
      }
      this.notificationListener = notificationListener(this.$store, options)
      this.socket = this.notificationListener.getSocket()
      this.connect(this.auth && this.auth.auth && this.auth.auth.session)
    },
    connect (session) {
      if (!session || !this.socket) return
      this.socket.io.opts.query.session = session
      this.socket.connect()
    },
    initMonitorAlertNotify () {
      // 防止重复创建定时器
      if (this.monitorAlertTimer) {
        clearInterval(this.monitorAlertTimer)
      }
      this.monitorAlertTimer = setInterval(() => {
        // 检测是否已登录，未登录则不执行 dispatch
        if (!this.session) return
        this.$store.dispatch('monitor/loadMonitorResourceAlerts')
      }, setting.monitorAlertNotifyTriggerTime)
      this.createDialog('MonitorAlertNotifyDialog', {})
    },
  },
}
</script>

<style lang="scss" scoped>
#app {
  position: relative;
}
</style>
