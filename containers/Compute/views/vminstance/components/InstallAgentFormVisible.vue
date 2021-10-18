<template>
    <div v-if="visible">
      <a-alert class="mb-2" :type="alertType" v-if="visible">
        <install-agent-form slot="message" :data="data" :serverColumns="serverColumns" @onInstall="handleInstallResult" />
      </a-alert>
    </div>
</template>

<script>
import _ from 'lodash'
import InstallAgentForm from '@Compute/views/vminstance/components/InstallAgentForm'

export default {
  name: 'InstallAgentFormVisible',
  components: {
    InstallAgentForm,
  },
  props: {
    data: {
      type: Object,
      required: true,
    },
    serverColumns: {
      type: Array,
      required: true,
    },
  },
  data () {
    const ok = _.get(this.data, ['metadata', 'sys:monitor_agent']) || _.get(this.data, ['metadata', '__monitor_agent'])
    const visible = this.data.status === 'running' && !ok
    return {
      visible: visible,
      alertType: 'warning',
    }
  },
  methods: {
    handleInstallResult (ret) {
      if (ret && ret.status === 'succeed') {
        this.alertType = 'success'
        this.$nextTick(() => {
          setTimeout(() => { this.visible = false }, 3000)
        })
      }
    },
  },
}
</script>
