<template>
    <div>
      <a-alert class="mb-2" :type="alertType">
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
    const deploy = _.get(this.data, ['metadata', 'telegraf_deployed'])
    if (this.data.hasOwnProperty('agent_status') || deploy) {
      ok = this.data.agent_status === 'succeed' || deploy
    }
    // const visible = this.data.status === 'running' && !ok
    return {
      visible: !ok,
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
