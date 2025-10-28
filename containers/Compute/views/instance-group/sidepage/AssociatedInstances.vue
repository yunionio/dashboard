<template>
  <div>
    <a-tabs :defaultActiveKey="currentComponent" @change="callback" :animated="false">
      <template v-for="obj of tabs">
        <a-tab-pane :tab="obj.label" :key="obj.key" />
      </template>
    </a-tabs>
    <div class="mt-2">
      <keep-alive>
        <component :is="currentComponent" :getParams="getParams" :id="id" :data="data" :resId="resId" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import Server from './VMInstanceListForInstanceGroup'
import VmContainer from './VmContainer'

export default {
  name: 'AssociatedInstancesIndex',
  components: {
    Server,
    VmContainer,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: [Function, Object],
    },
    resId: {
      type: String,
      required: true,
    },
  },
  data () {
    return {
      currentComponent: 'Server',
    }
  },
  computed: {
    id () {
      switch (this.currentComponent) {
        case 'Server':
          return 'ServerForSecGroupSidePage'
        case 'VmContainer':
          return 'VmContainerForSecGroupSidePage'
        default:
          return 'DefaultSecGroupSidePage'
      }
    },
    tabs () {
      const ret = [
        {
          key: 'Server',
          label: this.$t('dictionary.server'),
        },
        {
          key: 'VmContainer',
          label: this.$t('dictionary.server_container'),
        },
      ]
      return ret
    },
  },
  methods: {
    callback (key) {
      this.currentComponent = key
    },
  },
}
</script>

<style>

</style>
