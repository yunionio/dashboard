<template>
  <div>
    <dashboard-cards ref="dashboardCards" useLocalPanels :extraParams="extraParams" :localPanels="localPanels" />
  </div>
</template>

<script>
import _ from 'lodash'
import { MonitorHelper } from '@/utils/monitor'
import WindowsMixin from '@/mixins/windows'
import DashboardCards from '@Monitor/components/MonitorCard/DashboardCards'

export default {
  name: 'BaseMonitor',
  components: {
    DashboardCards,
  },
  mixins: [WindowsMixin],
  props: {
    data: { // listItemData
      type: Object,
      required: true,
    },
    constants: {
      // import { ONECLOUD_MONITOR, VMWARE_MONITOR, AGENT_MONITOR } from '@Compute/views/vminstance/constants'
      type: Object,
      required: true,
    },
    resId: {
      type: String,
    },
    idKey: {
      type: String, // vm_id, host_id
    },
    extraTags: {
      type: Array,
    },
  },
  data () {
    return {
      singleActions: [
        {
          label: this.$t('compute.text_382'),
          action: async obj => {
            const alertManager = new this.$Manager('nodealerts', 'v1')
            const { metric } = obj.constants
            const { data: { data = [] } } = await alertManager.list({
              params: {
                type: 'guest',
                node_id: this.serverId,
                metric,
              },
            })
            if (data && data.length) {
              if (data.length === 1) {
                this.createDialog('UpdateNodeAlert', {
                  data,
                  alertType: 'guest',
                  alertManager,
                })
              } else {
                throw Error(this.$t('compute.text_383'))
              }
            } else { // 新建报警
              this.createDialog('CreateNodeAlert', {
                alertType: 'guest',
                nodeId: this.serverId,
                metric,
                alertManager,
              })
            }
          },
          meta: (obj) => {
            const ret = {
              validate: true,
              tooltip: '',
            }
            if (_.get(obj, 'constants.fromItem', '').startsWith('agent_')) {
              ret.validate = false
              ret.tooltip = this.$t('compute.text_1287', [''])
            }
            return ret
          },
        },
      ],
      helper: new MonitorHelper(this.$Manager, this.$store.getters.scope),
    }
  },
  computed: {
    serverId () {
      return this.resId || this.data.id
    },
    localPanels () {
      return this.constants.map(item => {
        return {
          panel_name: `${item.label}${item.metric ? `(${item.metric})` : ''}`,
          constants: item,
          queryData: this.helper.genServerQueryData(this.serverId, item, '', '', this.idKey, '', true, this.extraTags),
        }
      })
    },
  },
  created () {
    this.$bus.$on('VmMonitorTypeChange', (tab) => {
      this.$refs.dashboardCards.initMonitorConfig()
    })
  },
  methods: {
  },
}
</script>
