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
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'
import { DRAFT_KIND } from '@/utils/createFormDraft'

const defaultOpts = ['none', '1h', '6h', '1d', '3d', '1w', '1m', 'custom']

export default {
  name: 'Duration',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    // 选择类：跨 tab 回填 radio；custom 时长为输入不落盘、不回填
    formDraftKind: {
      type: String,
      default: DRAFT_KIND.SELECTION,
    },
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
  watch: {
    opts: {
      handler (list) {
        if (Array.isArray(list) && list.length) {
          this.scheduleApplyDurationDraft()
        }
      },
    },
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
          const res = await new this.$Manager('scopedpolicybindings', 'v1').list({
            params: {
              category: 'server_duration',
              scope: this.$store.getters.scope,
              effective: true,
              ignoreErrorStatusCode: [403],
            },
          })
          if (res.data && res.data.data && res.data.data.length > 0) {
            const { policy = {} } = res.data.data[0]
            const { server_duration = [] } = policy
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
            } else {
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
          this.loading = false
        } catch (error) {
          console.log('error', error)
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
    scheduleApplyDurationDraft () {
      // 等 radio 注册进 form 后再回填（有草稿则覆盖上面 scoped-policy 默认）
      this.$nextTick(() => this.applyDurationDraft())
    },
    getLabel (item) {
      return getDurationLabel(item)
    },
    change (e) {
      if (e?.target?.value === 'custom') {
        this.showDuration = true
      } else {
        this.showDuration = false
      }
    },
    /**
     * 提交时获取表单草稿
     */
    serializeFormFieldDraft () {
      const fc = this.resolveFormFc()
      if (!fc) return undefined
      const durationStandard = fc.getFieldValue(this.decorators.durationStandard[0])
      if (durationStandard == null || durationStandard === '') return undefined
      // custom 仅展示输入框，时长输入不回填；落盘 custom 无意义，提交时清空该控件草稿
      if (durationStandard === 'custom') return null
      return { durationStandard }
    },
    /** 兼容历史：对象 / 纯字符串；custom 不落盘、不回填 */
    resolveDurationStandardFromDraft (draft) {
      if (draft == null || draft === '') return undefined
      if (typeof draft === 'string') {
        return draft === 'custom' ? undefined : draft
      }
      if (typeof draft === 'object') {
        const std = draft.durationStandard
        if (std != null && std !== '' && std !== 'custom') {
          return std
        }
      }
      return undefined
    },
    /**
     * options 就绪后：草稿 durationStandard 仍在 opts 中则回填
     * @returns {boolean} 是否已按草稿回填
     */
    applyDurationDraft () {
      const fc = this.resolveFormFc()
      if (!fc || !this.opts.length) return false
      const preferredStd = this.resolveDurationStandardFromDraft(this.readFormFieldDraft())
      const stdField = this.decorators.durationStandard[0]
      if (preferredStd == null) return false
      if (!this.opts.some(item => item.key === preferredStd)) return false
      const current = fc.getFieldValue(stdField)
      if (current === preferredStd || String(current) === String(preferredStd)) {
        return true
      }
      this.showDuration = false
      this.applyFormFieldValues({ [stdField]: preferredStd })
      return true
    },
  },
}
</script>
