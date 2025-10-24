<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group @change="change" v-decorator="decorators.durationStandard">
        <a-radio-button v-for="item in opts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="showDuration">
      <duration-input v-decorator="decorators.duration" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { getDurationLabel } from '@/utils/utils'

const defaultOpts = ['none', '1h', '6h', '1d', '3d', '1w', '1m', 'custom']

export default {
  name: 'Duration',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => !R.isNil(val.durationStandard) && !R.isNil(val.duration),
    },
    form: {
      type: Object,
    },
    useServerDuration: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      opts: [],
      loading: false,
      showDuration: this.decorators.durationStandard[1].initialValue === 'custom',
    }
  },
  created () {
    this.getOpts()
  },
  methods: {
    sortOptions (options) {
      const opts = [...options]
      opts.sort((a, b) => {
        // 定义排序优先级
        const getPriority = (key) => {
          if (key === 'none') return 0
          if (key === 'custom') return 999
          if (key.endsWith('h')) return 1
          if (key.endsWith('d')) return 2
          if (key.endsWith('w')) return 3
          if (key.endsWith('m')) return 4
          if (key.endsWith('y')) return 5
          return 6
        }
        const priorityA = getPriority(a)
        const priorityB = getPriority(b)
        // 如果优先级不同，按优先级排序
        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
        // 如果优先级相同，按数字大小排序
        const numA = parseInt(a) || 0
        const numB = parseInt(b) || 0
        return numA - numB
      })
      return opts
    },
    async getOpts () {
      const opts = [...defaultOpts]
      if (this.useServerDuration) {
        try {
          this.loading = true
          const res = await new this.$Manager('scopedpolicies', 'v1').list({
            params: {
              category: 'server_duration',
            },
          })
          if (res.data && res.data.data && res.data.data.length > 0) {
            const { policies = {} } = res.data.data[0]
            const { server_duration = [] } = policies
            if (server_duration.length > 0) {
              this.opts = this.sortOptions(server_duration).map(item => {
                return {
                  key: item,
                  label: this.getLabel(item),
                }
              })
              if (!this.opts.some(item => item.key === this.decorators.durationStandard[1].initialValue)) {
                if (this.opts.some(item => item.key === this.decorators.duration[1].initialValue)) {
                  this.form.fc.setFieldsValue({
                    [this.decorators.durationStandard[0]]: this.decorators.duration[1].initialValue,
                  })
                  if (this.decorators.duration[1].initialValue !== 'custom') {
                    this.showDuration = false
                  } else {
                    this.showDuration = true
                  }
                } else {
                  this.form.fc.setFieldsValue({
                    [this.decorators.durationStandard[0]]: this.opts[0].key,
                  })
                }
              }
            }
          }
        } catch (error) {
          this.loading = false
          this.opts = opts.map(item => {
            return {
              key: item,
              label: this.getLabel(item),
            }
          })
        }
      } else {
        this.opts = opts.map(item => {
          return {
            key: item,
            label: this.getLabel(item),
          }
        })
      }
    },
    getLabel (item) {
      return getDurationLabel(item)
    },
    change (e) {
      if (e.target.value === 'custom') {
        this.showDuration = true
      } else {
        this.showDuration = false
      }
    },
  },
}
</script>
