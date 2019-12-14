<template>
  <div>
    <refresh-button :loading="loading" @refresh="refresh" class="mr-2" />
    <a-radio-group class="mr-3" @change="timeChange" :value="time">
      <a-radio-button v-for="item in timeOpts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
    </a-radio-group>
    <div class="ant-form-item-label">
      <label title="时间粒度">时间粒度</label>
    </div>
    <a-select :value="timeGroup" @change="timeGroupChange">
      <a-select-option v-for="item in timeGroupOpts" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
    </a-select>
  </div>
</template>

<script>
import RefreshButton from '@/components/PageList/RefreshButton'

export default {
  name: 'MonitorHeader',
  components: {
    RefreshButton,
  },
  props: {
    time: {
      type: String,
      required: true,
    },
    timeGroup: {
      type: String,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      timeOpts: {
        [`${1}h`]: {
          key: `${1}h`,
          label: '近1小时',
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '1m', label: '1分钟' },
            { key: '5m', label: '5分钟' },
          ],
        },
        [`${24}h`]: {
          key: `${24}h`,
          label: '近1天',
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '5m', label: '5分钟' },
            { key: '10m', label: '10分钟' },
            { key: '30m', label: '30分钟' },
            { key: '1h', label: '1小时' },
          ],
        },
        [`${7}d`]: {
          key: `${7}d`,
          label: '近1周',
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '30m', label: '30分钟' },
            { key: '1h', label: '1小时' },
          ],
        },
        [`${30}d`]: {
          key: `${30}d`,
          label: '近1月',
          timeFormat: 'YYYY-MM-DD HH时',
          timeGroupOpts: [
            { key: '6h', label: '6小时' },
            { key: '1d', label: '1天' },
          ],
        },
        [`${30 * 3}d`]: {
          key: `${30 * 3}d`,
          label: '近3月',
          timeFormat: 'YYYY-MM-DD',
          timeGroupOpts: [
            { key: '1d', label: '1天' },
            { key: '2d', label: '2天' },
          ],
        },
        [`${30 * 6}d`]: {
          key: `${30 * 6}d`,
          label: '近6月',
          timeFormat: 'YYYY-MM-DD',
          timeGroupOpts: [
            { key: '1d', label: '1天' },
            { key: '7d', label: '7天' },
          ],
        },
      },
    }
  },
  computed: {
    timeGroupOpts () {
      return this.timeOpts[this.time].timeGroupOpts
    },
  },
  watch: {
    timeGroupOpts () {
      const isExist = this.timeGroupOpts.find(val => val.key === this.time)
      if (!isExist) {
        this.timeGroupChange(this.timeGroupOpts[0].key)
      }
    },
  },
  methods: {
    refresh () {
      this.$emit('refresh')
    },
    timeChange (val) {
      const time = val.target.value
      const { timeFormat } = this.timeOpts[time]
      this.$emit('update:time', time, timeFormat)
    },
    timeGroupChange (val) {
      this.$emit('update:timeGroup', val)
    },
  },
}
</script>
