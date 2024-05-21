<template>
  <div>
    <!-- <div class="side-page-shadow" v-show="hasSidePages" /> -->
    <component
      v-for="item of sidePages"
      :key="item.id"
      :is="item.name"
      :assigned-id="item.id"
      :params="item.params" />
  </div>
</template>

<script>
const components = {}
const requireSidePages = require.context('../../../containers', true, /^((?![\\/]node_modules).)*.\/views\/.*\/sidepage\/index\.(jsx?|vue)$/)
const scopeSidePages = require.context('../../../scope', true, /^((?![\\/]node_modules).)*.\/views\/.*\/sidepage\/index\.(jsx?|vue)$/)
const commonSidePages = require.context('./components', true, /.\/index\.(jsx?|vue)$/)
const srcViewsSidePages = require.context('../../views', true, /^((?![\\/]node_modules).).*\/sidepage\/index\.(jsx?|vue)$/)
const sidePageNames = []
const registerSidePages = (sidePages) => {
  const keys = sidePages.keys()
  for (let i = 0, len = keys.length; i < len; i++) {
    const componentConfig = sidePages(keys[i])
    components[componentConfig.default.name] = componentConfig.default
    sidePageNames.push(componentConfig.default.name)
  }
}

registerSidePages(commonSidePages)
registerSidePages(requireSidePages)
registerSidePages(scopeSidePages)
registerSidePages(srcViewsSidePages)

export default {
  name: 'SidePageManager',
  components,
  computed: {
    sidePages () {
      return this.$store.getters.sidePages
    },
  },
  beforeCreate () {
    this.$store.dispatch('common/updateObject', {
      name: 'globalSidePages',
      data: {
        names: sidePageNames,
      },
    })
  },
}
</script>

<style lang="less">
.side-page-shadow {
  position: fixed;
  left: 500px;
  right: 0;
  bottom: 0;
  top: 60px;
  box-shadow: -5px 0 3px rgba(197, 219, 232, 0.4);
}
</style>
