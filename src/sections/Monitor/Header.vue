<template>
  <div>
    <template v-if="showAutoRefresh">
      <a-tooltip placement="top">
        <template slot="title" v-show="refreshTooltips && lastSync !== ''">
          <span>{{ $t('refresh.last_sync_at', [lastSync]) }}</span>
        </template>
        <a-button style="width: 45px;padding-left: 15px;padding-right: 15px;" :icon="loading ? 'loading':'sync'" @click="emitRefresh" />
      </a-tooltip>
      <a-select class="ml-2 mr-2" v-model="syncConfig.duration" @change="handleDurationChange" style="width: 90px">
        <a-select-option :dropdownMatchSelectWidth="false" v-for="d of durations" :key="d.label" :value="d.value">
          {{ d.label }}
        </a-select-option>
      </a-select>
    </template>
    <refresh-button v-else :loading="loading" @refresh="refresh" class="mr-2" />
    <a-radio-group class="mr-3" @change="timeChange" :value="time">
      <a-radio-button v-for="item in timeOpts" v-show="!item.hidden" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      <slot name="radio-button-append" v-if="showCustomTime">
        <custom-date @update:time="(val) => timeChange({target: {value: val}})" :customTimeUseTimeStamp="customTimeUseTimeStamp" :customTime="customTime" @update:customTime="customTimeChange" :showCustomTimeText="isCustom" />
      </slot>
    </a-radio-group>
    <template v-if="showTimeGroupInput">
      <div class="ant-form-item-label">
          <label :title="$t('common_166')">{{$t('common_166')}}</label>
      </div>
      <a-input-number :min="1" :value="timeGroupValue" @change="timeGroupValueChange" />
      {{ $t('common_time.minute') }}
    </template>
    <template v-if="showTimegroup">
      <div class="ant-form-item-label">
        <label :title="$t('common_166')">{{$t('common_166')}}</label>
      </div>
      <a-select class="mr-2" style="width: 80px" :value="timeGroup" @change="timeGroupChange">
        <a-select-option v-for="item in timeGroupOpts" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
      </a-select>
    </template>
    <template v-if="showGroupFunc">
      <div class="ant-form-item-label">
        <label :title="$t('common.group_by')">{{$t('common.group_by')}}</label>
      </div>
      <a-select v-model="groupFunc" @change="groupFuncChange" style="width:80px">
        <a-select-option v-for="item in groupFuncOpts" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
      </a-select>
    </template>
  </div>
</template>

<script>
import RefreshButton from '@/components/PageList/RefreshButton'
import i18n from '@/locales'
import CustomDate from './CustomDate'

export default {
  name: 'MonitorHeader',
  components: {
    CustomDate,
    RefreshButton,
  },
  props: {
    time: {
      type: String,
      required: true,
    },
    timeGroup: {
      type: String,
    },
    timeGroupValue: {
      type: Number,
    },
    customTime: {
      type: Object,
    },
    groupFunc: {
      type: String,
      default: 'mean',
    },
    loading: {
      type: Boolean,
      default: false,
    },
    timeOpts: {
      type: Object,
      default: () => ({
        [`${1}h`]: {
          key: `${1}h`,
          label: i18n.t('common_167'),
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '1m', label: i18n.t('common_168') },
            { key: '5m', label: i18n.t('common_169') },
          ],
        },
        [`${6}h`]: {
          key: `${6}h`,
          label: i18n.t('common_nearly_num_hours', [6]),
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '3m', label: i18n.t('common_num_minutes', [3]) },
            { key: '5m', label: i18n.t('common_num_minutes', [5]) },
            { key: '10m', label: i18n.t('common_num_minutes', [10]) },
            { key: '15m', label: i18n.t('common_num_minutes', [15]) },
          ],
        },
        [`${12}h`]: {
          key: `${12}h`,
          label: i18n.t('common_nearly_num_hours', [12]),
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '5m', label: i18n.t('common_num_minutes', [5]) },
            { key: '10m', label: i18n.t('common_num_minutes', [10]) },
            { key: '20m', label: i18n.t('common_num_minutes', [20]) },
            { key: '30m', label: i18n.t('common_num_minutes', [30]) },
          ],
        },
        [`${24}h`]: {
          key: `${24}h`,
          label: i18n.t('common_nearly_num_hours', [24]),
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '10m', label: i18n.t('common_num_minutes', [10]) },
            { key: '20m', label: i18n.t('common_num_minutes', [20]) },
            { key: '30m', label: i18n.t('common_num_minutes', [30]) },
            { key: '60m', label: i18n.t('common_num_minutes', [60]) },
          ],
        },
        [`${7 * 24}h`]: {
          key: `${7 * 24}h`,
          label: i18n.t('common_174'),
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '30m', label: i18n.t('common_172') },
            { key: '1h', label: i18n.t('common_173') },
          ],
        },
        [`${30 * 24}h`]: {
          key: `${30 * 24}h`,
          label: i18n.t('common_175'),
          timeFormat: i18n.t('common_176'),
          timeGroupOpts: [
            { key: '6h', label: i18n.t('common_177') },
            { key: '24h', label: i18n.t('common_178') },
          ],
        },
      }),
    },
    showTimegroup: {
      type: Boolean,
      default: true,
    },
    showGroupFunc: {
      type: Boolean,
      default: true,
    },
    showTimeGroupInput: {
      type: Boolean,
      default: false,
    },
    showAutoRefresh: {
      type: Boolean,
      default: false,
    },
    refreshDuration: {
      type: Number,
      default: 0,
    },
    refreshTooltips: {
      type: Boolean,
      default: true,
    },
    durations: {
      type: Array,
      default: () => {
        return [
          { label: i18n.t('refresh.auto.disable'), value: 0 },
          { label: i18n.t('refresh.duration.seconds', [5]), value: 5 },
          { label: i18n.t('refresh.duration.seconds', [10]), value: 10 },
          { label: i18n.t('refresh.duration.seconds', [30]), value: 30 },
          { label: i18n.t('refresh.duration.minutes', [1]), value: 60 },
          { label: i18n.t('refresh.duration.minutes', [5]), value: 300 },
          { label: i18n.t('refresh.duration.minutes', [15]), value: 900 },
          { label: i18n.t('refresh.duration.minutes', [30]), value: 1800 },
          { label: i18n.t('refresh.duration.hours', [1]), value: 3600 },
          { label: i18n.t('refresh.duration.hours', [2]), value: 7200 },
          { label: i18n.t('refresh.duration.days', [1]), value: 86400 },
        ]
      },
    },
    customTimeUseTimeStamp: {
      type: Boolean,
      default: false,
    },
    showCustomTime: {
      type: Boolean,
      default: true,
    },
  },
  data () {
    let timer
    if (this.showAutoRefresh && this.refreshDuration > 0) {
      timer = setInterval(this.emitRefresh, this.refreshDuration * 1000)
    }
    return {
      customTimeNumber: '5',
      customTimeUnit: 'm',
      customTimeGroupOpts: [
        { key: '1m', label: this.$t('common_num_minutes', [1]) },
        { key: '5m', label: this.$t('common_num_minutes', [5]) },
        { key: '15m', label: this.$t('common_num_minutes', [15]) },
        { key: '30m', label: this.$t('common_num_minutes', [30]) },
        { key: '1h', label: this.$t('common_num_hours', [1]) },
        { key: '6h', label: this.$t('common_num_hours', [6]) },
        { key: '12h', label: this.$t('common_num_hours', [12]) },
      ],
      // 时间间隔内，如何聚合数据，暂只支持 MEAN
      groupFuncOpts: [
        // { key: 'min', label: this.$t('common.min') },
        // { key: 'max', label: this.$t('common.max') },
        { key: 'mean', label: this.$t('common.mean') },
      ],
      lastSync: '',
      timer: timer,
      syncConfig: {
        enable: false,
        duration: this.refreshDuration,
      },
    }
  },
  computed: {
    isCustom () {
      return this.time === 'custom'
    },
    timeGroupOpts () {
      return this.isCustom ? this.customTimeGroupOpts : this.timeOpts[this.time || '1h'].timeGroupOpts
    },
  },
  watch: {
    timeGroupOpts () {
      const isExist = this.timeGroupOpts.find(val => val.key === this.timeGroup)
      if (!isExist) {
        this.$emit('update:timeGroup', this.timeGroupOpts[this.timeGroupOpts.length - 1].key)
      }
    },
  },
  beforeDestroy () {
    this.cancelAutoRefresh()
  },
  methods: {
    refresh () {
      this.$emit('refresh')
    },
    timeChange (val) {
      const time = val.target.value
      if (time === 'custom') {
        this.$emit('update:time', time, 'YYYY-MM-DD HH:mm')
      } else {
        const { timeFormat } = this.timeOpts[time || '1h']
        this.$emit('update:time', time, timeFormat)
      }
    },
    customTimeChange (val) {
      this.$emit('update:customTime', val)
    },
    timeGroupChange (val) {
      const isExist = this.timeGroupOpts.find(v => v.key === val)
      if (!isExist) {
        val = this.timeGroupOpts[this.timeGroupOpts.length - 1].key
      }
      this.$emit('update:timeGroup', val)
    },
    groupFuncChange (val) {
      this.$emit('update:groupFunc', val)
    },
    timeGroupValueChange (val) {
      this.$emit('update:timeGroupValue', val)
    },
    emitRefresh () {
      this.lastSync = new Date().toLocaleTimeString()
      if (this.loading) {
        return
      }
      this.$emit('refresh')
    },
    cancelAutoRefresh () {
      if (this.timer) {
        clearInterval(this.timer)
      }
    },
    handleDurationChange (v) {
      this.syncConfig.duration = v
      this.syncConfig.enable = v > 0
      this.syncConfig.enable ? this.resetAutoRefresh(v) : this.cancelAutoRefresh()
      this.emitRefresh()
    },
    resetAutoRefresh (v) {
      if (this.timer) {
        clearInterval(this.timer)
      }
      this.timer = setInterval(this.emitRefresh, v * 1000)
    },
  },
}
</script>
