<template>
  <a-form-item :label="$t('monitor.channel')">
    <a-checkbox-group name="checkboxgroup" :options="channelOpts" v-decorator="decorators.channel" />
  </a-form-item>
</template>

<script>
import { channelMaps } from '@Monitor/constants'

export default {
  name: 'NotifyTypes',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.channel,
    },
  },
  data () {
    return {
      channelOpts: [],
    }
  },
  created () {
    this.fetchData()
  },
  methods: {
    async fetchData () {
      try {
        const { data: { types } } = await new this.$Manager('notifyconfigs', 'v1').performClassAction({ action: 'get-types', data: { robot: 'yes' } })
        this.channelOpts = types.map(val => {
          const item = {
            label: channelMaps[val] ? channelMaps[val].label : val,
            value: val,
          }
          if (val === 'webconsole') item.disabled = true
          return item
        })
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
