<template>
  <div>
    <refresh-button :loading="loading" @refresh="refresh" class="mr-2" />
    <a-radio-group class="mr-3" @change="timeChange" :value="time">
      <a-radio-button v-for="item in timeOpts" v-show="!item.hidden" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      <slot name="radio-button-append">
        <custom-date @update:time="(val) => timeChange({target: {value: val}})" :customTime="customTime" @update:customTime="customTimeChange" :showCustomTimeText="isCustom" />
      </slot>
    </a-radio-group>
    <template v-if="showTimegroup">
      <template v-if="time !== 'custom'">
        <div class="ant-form-item-label">
          <label :title="$t('common_166')">{{$t('common_166')}}</label>
        </div>
        <a-select class="mr-2" :value="timeGroup" @change="timeGroupChange">
          <a-select-option v-for="item in timeGroupOpts" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </template>
      <template v-else>
        <div class="ant-form-item-label">
          <label :title="$t('common_166')">{{$t('common_166')}}</label>
        </div>
        <a-select class="mr-2" :value="timeGroup" @change="timeGroupChange">
          <a-select-option v-for="item in customTimeGroupOpts" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </template>
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
import CustomDate from '@/sections/CustomDate'
import RefreshButton from '@/components/PageList/RefreshButton'
import i18n from '@/locales'

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
            { key: '5m', label: i18n.t('common_169') },
            { key: '15m', label: i18n.t('common_num_minutes', [15]) },
          ],
        },
        [`${12}h`]: {
          key: `${12}h`,
          label: i18n.t('common_nearly_num_hours', [12]),
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '10m', label: i18n.t('common_num_minutes', [10]) },
            { key: '30m', label: i18n.t('common_num_minutes', [30]) },
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
  },
  data () {
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
      groupFuncOpts: [
        { key: 'min', label: this.$t('common.min') },
        { key: 'max', label: this.$t('common.max') },
        { key: 'mean', label: this.$t('common.mean') },
        { key: 'p95', label: this.$t('common.p95') },
        { key: 'p50', label: this.$t('common.p50') },
      ],
    }
  },
  computed: {
    isCustom () {
      return this.time === 'custom'
    },
    timeGroupOpts () {
      return this.isCustom ? this.customTimeGroupOpts : this.timeOpts[this.time].timeGroupOpts
    },
  },
  watch: {
    timeGroupOpts () {
      const isExist = this.timeGroupOpts.find(val => val.key === this.timeGroup)
      if (!isExist) {
        this.$emit('update:timeGroup', this.timeGroupOpts[0].key)
      }
    },
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
        const { timeFormat } = this.timeOpts[time]
        this.$emit('update:time', time, timeFormat)
      }
    },
    customTimeChange (val) {
      this.$emit('update:customTime', val)
    },
    timeGroupChange (val) {
      this.$emit('update:timeGroup', val)
    },
    groupFuncChange (val) {
      this.$emit('update:groupFunc', val)
    },
  },
}
</script>
