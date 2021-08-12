<template>
    <div v-if="visible">
      <a-alert class="mb-2" :type="alertType" v-if="visible">
        <install-agent-form slot="message" :data="data" :serverColumns="serverColumns" @onInstall="handleInstallResult" />
      </a-alert>
    </div>
</template>

<script>
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
    const visible = this.data.status === 'running' && (!this.data.metadata || this.data.metadata['sys:monitor_agent'] !== 'true')
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
