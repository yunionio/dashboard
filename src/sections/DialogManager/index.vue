<template>
  <div>
    <component
      v-for="item of dialogs"
      :key="item.id"
      :is="item.name"
      :assigned-id="item.id"
      :param="item.params" />
  </div>
</template>

<script>
const components = {}
const requireDialogs = require.context('../../../containers', true, /.\/views\/.*\/dialogs\/\w+\.(jsx|vue)$/)
const keys = requireDialogs.keys()
for (let i = 0, len = keys.length; i < len; i++) {
  const componentConfig = requireDialogs(keys[i])
  components[componentConfig.default.name] = componentConfig.default
}

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
