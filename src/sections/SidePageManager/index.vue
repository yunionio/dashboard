<template>
  <div>
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
const requireSidePages = require.context('../../../containers', true, /.\/views\/.*\/sidepage\/index\.(jsx?|vue)$/)
const commonSidePages = require.context('./components', false, /.\/\w+\.(jsx?|vue)$/)

const registerSidePages = (sidePages) => {
  const keys = sidePages.keys()
  for (let i = 0, len = keys.length; i < len; i++) {
    const componentConfig = sidePages(keys[i])
    components[componentConfig.default.name] = componentConfig.default
  }
}

registerSidePages(commonSidePages)
registerSidePages(requireSidePages)

export default {
  name: 'SidePageManager',
  components,
  computed: {
    sidePages () {
      return this.$store.getters.sidePages
    },
  },
}
</script>
