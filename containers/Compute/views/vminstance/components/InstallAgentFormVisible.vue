<template>
    <div v-if="visible">
      <a-alert class="mb-2" :type="alertType" v-if="visible">
        <install-agent-form slot="message" :data="data" :serverColumns="serverColumns" :isPageDestroyed="isPageDestroyed" @onInstall="handleInstallResult" />
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
    isPageDestroyed: Boolean,
  },
  data () {
    let ok = _.get(this.data, ['metadata', 'sys:monitor_agent']) || _.get(this.data, ['metadata', '__monitor_agent'])
    if (this.data.hasOwnProperty('agent_status')) {
      ok = this.data.agent_status === 'succeed'
    }
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
