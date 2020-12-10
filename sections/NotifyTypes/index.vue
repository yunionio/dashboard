<template>
  <a-form-item :label="label" :extra="extraStr">
    <a-checkbox-group name="checkboxgroup" :options="channelOpts" v-decorator="decorator" />
  </a-form-item>
</template>

<script>
import * as R from 'ramda'
import i18n from '@/locales'
import { channelMaps } from '@/constants'

export default {
  name: 'NotifyTypes',
  props: {
    decorator: {
      type: Array,
      required: true,
    },
    getParams: {
      type: Object,
      default: () => ({
        robot: 'only',
      }),
    },
    label: {
      type: String,
      default: i18n.t('monitor.channel'),
    },
    showAllRobot: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      channelOpts: [],
      extraStr: '',
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        const { data: { types = [] } } = await new this.$Manager('notifyconfigs', 'v1').performClassAction({ action: 'get-types', data: this.getParams })
        const channelOpts = types.map(val => {
          const channel = channelMaps[val]
          let label = channel ? channel.label : val
          if (label === 'webconsole') label = this.$t('dictionary.webconsole')
          const item = {
            label,
            value: val,
            sort: channel.sort ? channel.sort : 99,
          }
          if (val === 'webconsole') item.disabled = true
          return item
        })
        if (this.showAllRobot) {
          R.forEachObjIndexed((value, key) => {
            if (!types.includes(key) && key.includes('robot')) {
              const item = {
                label: value.label,
                value: value.value,
                sort: value.sort,
                disabled: true,
              }
              channelOpts.push(item)
            }
          }, channelMaps)
        }
        this.channelOpts = channelOpts.sort((a, b) => b.sort - a.sort)
        const disableRobotArr = channelOpts.filter(val => val.disabled).map(val => val.label)
        if (disableRobotArr.length > 0) {
          this.extraStr = this.$t('common_657', [disableRobotArr.join('、')])
        }
        this.$emit('channelOptsChange', this.channelOpts)
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
