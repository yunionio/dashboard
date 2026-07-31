<template>
  <div>
    <a-form-item class="mb-0">
      <a-radio-group @change="change" v-decorator="decorators.durationStandard">
        <a-radio-button v-for="item in opts" :key="item.key" :value="item.key">{{ item.label }}</a-radio-button>
      </a-radio-group>
    </a-form-item>
    <a-form-item v-if="showDuration">
      <duration-input v-decorator="decorators.duration" @change="onCustomDurationChange" />
    </a-form-item>
  </div>
</template>

<script>
import * as R from 'ramda'
import { getDurationLabel } from '@/utils/utils'
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

const defaultOpts = ['none', '1h', '6h', '1d', '3d', '1w', '1m', 'custom']

export default {
  name: 'Duration',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
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
  created () {
    this.getOpts()
  },
  mounted () {
    // created 时 v-decorator 可能尚未注册，mounted 后再补一次回填
    this.$nextTick(() => this.applyDurationDraftOrDefault())
  },
  methods: {
    sortOptions (options) {
      const opts = [...options]
      opts.sort((a, b) => {
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
        if (priorityA !== priorityB) {
          return priorityA - priorityB
        }
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
        this.scheduleApplyDurationDraft()
      } else {
        this.opts = opts.map(item => {
          return {
            key: item,
            label: this.getLabel(item),
          }
        })
        this.scheduleApplyDurationDraft()
      }
    },
    scheduleApplyDurationDraft () {
      // 等 radio 注册进 form 后再回填，避免 created 阶段 setFieldsValue 不生效
      this.$nextTick(() => this.applyDurationDraftOrDefault())
    },
    applyCreateFormFieldDraft () {
      this.scheduleApplyDurationDraft()
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
      this.$nextTick(() => this.persistDurationDraft())
    },
    onCustomDurationChange () {
      this.$nextTick(() => this.persistDurationDraft())
    },
    serializeFormFieldDraft () {
      if (!this.form?.fc) return undefined
      const durationStandard = this.form.fc.getFieldValue(this.decorators.durationStandard[0])
      const duration = this.form.fc.getFieldValue(this.decorators.duration[0])
      if (durationStandard == null && duration == null) return undefined
      // 预设（如 1m）只存 standard；custom 才带 duration
      if (durationStandard && durationStandard !== 'custom') {
        return { durationStandard, duration: undefined }
      }
      return { durationStandard, duration }
    },
    persistDurationDraft () {
      const data = this.serializeFormFieldDraft()
      if (data !== undefined) this.writeFormFieldDraft(data)
    },
    /**
     * options 就绪后：草稿仍在 opts 中则回填；否则走原 decorator / 首项逻辑
     * custom 的 duration 需等 v-if 挂载后再 setFieldsValue
     */
    applyDurationDraftOrDefault () {
      if (!this.form?.fc || !this.opts.length) return
      const draft = this.readFormFieldDraft()
      const stdField = this.decorators.durationStandard[0]
      const durField = this.decorators.duration[0]
      if (draft && typeof draft === 'object') {
        let preferredStd = draft.durationStandard
        let preferredDur = draft.duration
        // custom + 1m 且 opts 有 1m → 回填预设「1月」
        if (
          preferredStd === 'custom' &&
          preferredDur &&
          this.opts.some(item => item.key === preferredDur)
        ) {
          preferredStd = preferredDur
          preferredDur = undefined
        }
        // 预设 1m 不在 opts，但有 custom → 退化为自定义时长
        if (
          preferredStd &&
          preferredStd !== 'none' &&
          preferredStd !== 'custom' &&
          !this.opts.some(item => item.key === preferredStd) &&
          this.opts.some(item => item.key === 'custom')
        ) {
          preferredDur = preferredDur || preferredStd
          preferredStd = 'custom'
        }
        const hit = preferredStd != null && this.opts.some(item => item.key === preferredStd)
        if (hit) {
          this.showDuration = preferredStd === 'custom'
          this.form.fc.setFieldsValue({ [stdField]: preferredStd })
          if (preferredStd === 'custom' && preferredDur) {
            // duration-input 在 v-if 后才注册，需 nextTick
            this.$nextTick(() => {
              this.form.fc.setFieldsValue({ [durField]: preferredDur })
            })
          }
          return
        }
      }
      // 无可用草稿：保留原 scoped-policy 默认逻辑
      if (!this.opts.some(item => item.key === this.decorators.durationStandard[1].initialValue)) {
        if (this.opts.some(item => item.key === this.decorators.duration[1].initialValue)) {
          this.form.fc.setFieldsValue({
            [stdField]: this.decorators.duration[1].initialValue,
          })
          if (this.decorators.duration[1].initialValue !== 'custom') {
            this.showDuration = false
          } else {
            this.showDuration = true
          }
        } else {
          this.form.fc.setFieldsValue({
            [stdField]: this.opts[0].key,
          })
        }
      }
    },
  },
}
</script>
