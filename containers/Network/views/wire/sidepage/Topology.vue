<template>
  <div>
    <div class="d-flex">
      <a-button @click="refreshHandle">
        <a-icon v-if="loading" type="sync" spin />
        <a-icon v-else type="sync" />
      </a-button>
      <a-radio-group v-model="view" @change="handleChange" class="ml-2">
        <a-radio-button value="virtual">{{ $t('network.topology.view.virtual') }}</a-radio-button>
        <a-radio-button value="physical">{{ $t('network.topology.view.pysical') }}</a-radio-button>
      </a-radio-group>
    </div>
    <res-topology v-if="dataSource" :physical="physical" :dataSource="dataSource" />
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
  created () {
    this.fetchVpcTopology()
  },
  methods: {
    fetchVpcTopology () {
      const wireManager = new this.$Manager('wires')
      this.loading = true
      this.dataSource = null
      wireManager.get({ id: `${this.resId}/topology` }).then((res) => {
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
    handleChange (e) {
      this.physical = e.target.value === 'physical'
    },
  },
}
</script>
