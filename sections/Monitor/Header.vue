<template>
  <div>
    <refresh-button :loading="loading" @refresh="refresh" class="mr-2" />
    <a-radio-group class="mr-3" @change="timeChange" :value="time">
      <a-radio-button v-for="item in timeOpts" v-show="!item.hidden" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      <slot name="radio-button-append" />
    </a-radio-group>
    <div class="ant-form-item-label">
      <label :title="$t('common_166')">{{$t('common_166')}}</label>
    </div>
    <a-select :value="timeGroup" @change="timeGroupChange">
      <a-select-option v-for="item in timeGroupOpts" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
    </a-select>
  </div>
</template>

<script>
import RefreshButton from '@/components/PageList/RefreshButton'
import i18n from '@/locales'

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
        [`${24}h`]: {
          key: `${24}h`,
          label: i18n.t('common_170'),
          timeFormat: 'YYYY-MM-DD HH:mm',
          timeGroupOpts: [
            { key: '5m', label: i18n.t('common_169') },
            { key: '10m', label: i18n.t('common_171') },
            { key: '30m', label: i18n.t('common_172') },
            { key: '1h', label: i18n.t('common_173') },
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
        [`${30 * 3 * 24}h`]: {
          key: `${30 * 3 * 24}h`,
          label: i18n.t('common_179'),
          timeFormat: 'YYYY-MM-DD',
          timeGroupOpts: [
            { key: '24h', label: i18n.t('common_178') },
            { key: '48h', label: i18n.t('common_180') },
          ],
        },
        [`${30 * 6 * 24}h`]: {
          key: `${30 * 6 * 24}h`,
          label: i18n.t('common_181'),
          timeFormat: 'YYYY-MM-DD',
          timeGroupOpts: [
            { key: '24h', label: i18n.t('common_178') },
            { key: `${7 * 24}h`, label: i18n.t('common_182') },
          ],
        },
      }),
    },
  },
  computed: {
    timeGroupOpts () {
      return this.timeOpts[this.time].timeGroupOpts
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
      const { timeFormat } = this.timeOpts[time]
      this.$emit('update:time', time, timeFormat)
    },
    timeGroupChange (val) {
      this.$emit('update:timeGroup', val)
    },
  },
}
</script>
