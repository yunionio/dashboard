<template>
  <div>
    <component
      v-for="item of dialogs"
      :key="item.id"
      :is="item.name"
      :assigned-id="item.id"
      :params="item.params" />
  </div>
</template>

<script>
const components = {}
const requireDialogs = require.context('../../../containers', true, /.\/views\/.*\/dialogs\/\w+\.(jsx?|vue)$/)
const commonDialogs = require.context('./components', false, /.\/\w+\.(jsx?|vue)$/)

const registerDialogs = (dialogs) => {
  const keys = dialogs.keys()
  for (let i = 0, len = keys.length; i < len; i++) {
    const componentConfig = dialogs(keys[i])
    components[componentConfig.default.name] = componentConfig.default
  }
}

registerDialogs(commonDialogs)
registerDialogs(requireDialogs)

export default {
  name: 'DialogManager',
  components,
  computed: {
    dialogs () {
      return this.$store.getters.dialogs
    },
  },
  watch: {
    // hack fix，antd vue 的 modal 打开时背景还可以滚动
    dialogs (val) {
      if (Object.keys(val).length > 0) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'auto'
      }
    },
  },
}
</script>
