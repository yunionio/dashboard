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
const requireDialogs = require.context('../../../containers', true, /^((?![\\/]node_modules).)*.\/views\/.*\/dialogs\/\w+\.(jsx?|vue)$/)
const scopeDialogs = require.context('../../../scope', true, /^((?![\\/]node_modules).)*.\/views\/.*\/dialogs\/\w+\.(jsx?|vue)$/)
const commonDialogs = require.context('./components', false, /.\/\w+\.(jsx?|vue)$/)
const sectionDialogs = require.context('../../../containers', true, /^((?![\\/]node_modules).)*.\/sections\/Dialogs\/\w+\.(jsx?|vue)$/)
const srcViewsDialogs = require.context('../../views', true, /^((?![\\/]node_modules).)*.\/dialogs\/\w+\.(jsx?|vue)$/)

const registerDialogs = (dialogs) => {
  const keys = dialogs.keys()
  for (let i = 0, len = keys.length; i < len; i++) {
    const componentConfig = dialogs(keys[i])
    components[componentConfig.default.name] = componentConfig.default
  }
}

registerDialogs(commonDialogs)
registerDialogs(requireDialogs)
registerDialogs(scopeDialogs)
registerDialogs(sectionDialogs)
registerDialogs(srcViewsDialogs)

export default {
  name: 'DialogManager',
  components,
  computed: {
    dialogs () {
      return this.$store.getters.dialogs
    },
  },
}
</script>
