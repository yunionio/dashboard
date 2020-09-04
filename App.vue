<template>
  <a-config-provider :locale="locale">
    <div id="app">
      <component :is="layout">
        <router-view />
      </component>
      <dialog-manager />
      <side-page-manager />
      <window-resize-listener />
    </div>
  </a-config-provider>
</template>

<script>
import * as R from 'ramda'
import { mapGetters, mapState } from 'vuex'
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import enUS from 'ant-design-vue/es/locale/en_US'
import DefaultLayout from '@/layouts/Default'
import FullScreenLayout from '@/layouts/FullScreen'
import DialogManager from '@/sections/DialogManager'
import SidePageManager from '@/sections/SidePageManager'
import WindowResizeListener from '@/sections/WindowResizeListener'
import notificationListener from '@/utils/notificationListener'
import i18n from '@/locales'
import { updateThemeColor } from '@/utils/theme/utils'

const antdLocales = {
  'zh-CN': zhCN,
  en: enUS,
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
  data () {
    return {
      locale: antdLocales[this.$store.getters.setting.language],
    }
  },
  computed: {
    ...mapGetters(['auth', 'theme', 'themeColor']),
    ...mapState({
      globalSetting: state => state.globalSetting,
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
        }
      },
      immediate: true,
    },
    theme: {
      handler (val) {
        if (val && val !== process.env.THEME) {
          console.log(val)
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
      if (!session) return
      this.socket.io.opts.query.session = session
      this.socket.connect()
    },
  },
}
</script>
