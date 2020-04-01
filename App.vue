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
import zhCN from 'ant-design-vue/es/locale/zh_CN'
import DefaultLayout from '@/layouts/Default'
import FullScreenLayout from '@/layouts/FullScreen'
import DialogManager from '@/sections/DialogManager'
import SidePageManager from '@/sections/SidePageManager'
import WindowResizeListener from '@/sections/WindowResizeListener'

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
      locale: zhCN,
    }
  },
  computed: {
    layout () {
      return `${(this.$route.meta.layout || 'default')}-layout`
    },
  },
}
</script>
