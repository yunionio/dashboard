import storage from '@/utils/storage'

export default {
  data () {
    return {
      STORAGE_TIME_KEY: '__oc_monitor_query_config__',
    }
  },
  props: {
    monitorType: String,
    currentMonitorType: String,
  },
  provide: function () {
    return {
      monitorType: this.monitorType,
      currentMonitorType: this.currentMonitorType,
    }
  },
  created () {
    this.initMonitorConfig()
  },
  watch: {
    currentMonitorType: {
      handler: function (val, oldVal) {
        if (val === this.monitorType) {
          this.initMonitorConfig()
        }
      },
    },
  },
  methods: {
    initMonitorConfig () {
      const monitorConfig = storage.get(this.STORAGE_TIME_KEY, {})
      const { time, timeGroup, customTime, groupFunc } = monitorConfig
      if (time) {
        this.time = time
        if (time === 'custom' && customTime) {
          this.customTime = customTime
        }
      }
      if (timeGroup) {
        this.timeGroup = timeGroup
      }
      if (groupFunc) {
        this.groupFunc = groupFunc
      }
    },
    saveMonitorConfig () {
      const monitorConfig = storage.get(this.STORAGE_TIME_KEY, {})
      storage.set(this.STORAGE_TIME_KEY, {
        ...monitorConfig,
        time: this.time,
        timeGroup: this.timeGroup,
        customTime: this.time === 'custom' ? this.customTime : {},
        groupFunc: this.groupFunc,
      })
    },
  },
}
