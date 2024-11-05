<template>
  <div>
    <monitor
      :time.sync="time"
      :timeGroup.sync="timeGroup"
      :customTime.sync="customTime"
      :groupFunc.sync="groupFunc"
      :monitorList="monitorList"
      :singleActions="singleActions"
      :loading="loading"
      @refresh="fetchData" />
  </div>
</template>

<script>
import _ from 'lodash'
import { MonitorHelper } from '@/utils/monitor'
import Monitor from '@/sections/Monitor'
import WindowsMixin from '@/mixins/windows'
import MonitorTimeMixin from '@/mixins/monitorTime'

export default {
  name: 'BaseMonitor',
  components: {
    Monitor,
  },
  mixins: [WindowsMixin, MonitorTimeMixin],
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
                node_id: this.data.id,
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
                nodeId: this.data.id,
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
      loading: false,
      time: '168h',
      timeGroup: '30m',
      customTime: null,
      groupFunc: 'mean',
      monitorList: [],
    }
  },
  computed: {
    serverId () {
      return this.resId || this.data.id
    },
  },
  created () {
    this.helper = new MonitorHelper(this.$Manager, this.$store.getters.scope)
    this.fetchData()
    this.fetchDataDebounce = _.debounce(this.fetchData, 500)
    this.baywatch(['time', 'timeGroup', 'data.id', 'customTime', 'groupFunc'], this.fetchDataDebounce)
  },
  methods: {
    async fetchData () {
      this.loading = true
      try {
        const reqList = this.constants.map(item => {
          const val = { ...item, groupFunc: this.groupFunc }
          return this.helper.fetchFormatData(this.serverId, val, this.time, this.timeGroup, this.idKey, this.customTime, true, this.extraTags)
        })
        const resList = await Promise.all(reqList)
        this.setMonitorList(resList)
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
      this.saveMonitorConfig()
    },
    baywatch (props, watcher) {
      const iterator = function (prop) {
        this.$watch(prop, watcher)
      }
      props.forEach(iterator, this)
    },
    setMonitorList (resList) {
      this.monitorList = this.helper.convertToListData(resList)
    },
  },
}
</script>
