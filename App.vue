<template>
  <a-locale-provider :locale="locale">
    <div id="app">
      <component :is="layout">
        <router-view />
      </component>
    </div>
  </a-locale-provider>
</template>

<script>
import zhCN from 'ant-design-vue/lib/locale-provider/zh_CN'
import DefaultLayout from '@/layouts/Default'
import FullScreenLayout from '@/layouts/FullScreen'

export default {
  name: 'App',
  components: {
    DefaultLayout,
    FullScreenLayout,
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
