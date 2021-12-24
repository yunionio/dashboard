<template>
  <div>
    <a-button @click="refreshHandle">
      <a-icon v-if="loading" type="sync" spin />
      <a-icon v-else type="sync" />
    </a-button>
    <res-topology v-if="dataSource" :classic="classic" :dataSource="dataSource" />
    <a-skeleton active v-if="!dataSource" />
    <!-- <res-topology :classic="false" :physical="false" :dataSource="dataSource" /> -->
    <!-- <res-topology :classic="true" :physical="true" :dataSource="dataSource" /> -->
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
    detailData: Object,
  },
  data () {
    return {
      loading: false,
      dataSource: null,
    }
  },
  computed: {
    classic () {
      return this.detailData?.id === 'default'
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
  },
}
</script>
