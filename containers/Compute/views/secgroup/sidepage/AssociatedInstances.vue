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

export default {
  name: 'AssociatedInstancesIndex',
  components: {
    Server,
    LB,
    RDS,
    Redis,
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
