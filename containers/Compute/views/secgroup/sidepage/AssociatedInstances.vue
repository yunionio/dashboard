<template>
  <div>
    <a-tabs :defaultActiveKey="currentComponent" @change="callback" :animated="false">
      <template v-for="obj of tabs">
        <a-tab-pane :tab="obj.label" :key="obj.key" />
      </template>
    </a-tabs>
    <div class="mt-2">
      <keep-alive>
        <component :is="currentComponent" :getParams="getParams" :id="id" :data="data" />
      </keep-alive>
    </div>
  </div>
</template>

<script>
import Server from './Server'
import LB from './LB'
import RDS from './RDS'
import Redis from './Redis'
import VmContainer from './VmContainer'
import Network from './Network'

export default {
  name: 'AssociatedSecgroupsIndex',
  components: {
    Server,
    LB,
    RDS,
    Redis,
    VmContainer,
    Network,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    getParams: {
      type: [Function, Object],
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
        case 'LB':
          return 'LBForSecGroupSidePage'
        case 'RDS':
          return 'RDSForSecGroupSidePage'
        case 'Redis':
          return 'RedisForSecGroupSidePage'
        case 'VmContainer':
          return 'VmContainerForSecGroupSidePage'
        case 'Network':
          return 'NetworkForSecGroupSidePage'
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
        {
          key: 'LB',
          label: this.$t('dictionary.elb'),
        },
        {
          key: 'RDS',
          label: 'RDS',
        },
        {
          key: 'Redis',
          label: 'Redis',
        },
        {
          key: 'Network',
          label: this.$t('compute.nic'),
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
