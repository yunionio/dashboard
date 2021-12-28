<template>
  <div>
    <a-button @click="refreshHandle">
      <a-icon v-if="loading" type="sync" spin />
      <a-icon v-else type="sync" />
    </a-button>
    <a-select
      v-show="classic"
      v-model="view"
      @change="handleChange"
      style="width: 180px; margin-left: -1px;">
      <a-select-option value="virtual">{{ $t('network.topology.view.virtual') }}</a-select-option>
      <a-select-option value="physical">{{ $t('network.topology.view.pysical') }}</a-select-option>
    </a-select>
    <res-topology v-if="dataSource" :classic="classic" :physical="physical" :dataSource="dataSource" />
    <a-skeleton active v-if="!dataSource" />
  </div>
</template>

<script>
import ResTopology from '../components/ResTopology'

export default {
  name: 'Topology',
  components: {
    ResTopology,
  },
  props: {
    resId: String,
  },
  data () {
    return {
      loading: false,
      dataSource: null,
      physical: false,
      view: 'virtual',
    }
  },
  computed: {
    classic () {
      return this.resId === 'default'
    },
  },
  created () {
    this.fetchVpcTopology()
  },
  methods: {
    fetchVpcTopology () {
      const vpcManager = new this.$Manager('vpcs')
      this.loading = true
      this.dataSource = null
      vpcManager.get({ id: `${this.resId}/topology` }).then((res) => {
        this.dataSource = res.data
        this.loading = false
      }).catch((err) => {
        this.loading = false
        throw err
      })
    },
    refreshHandle () {
      this.fetchVpcTopology()
    },
    handleChange (v) {
      this.physical = v === 'physical'
    },
  },
}
</script>
