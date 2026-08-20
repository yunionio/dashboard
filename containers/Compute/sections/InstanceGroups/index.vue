<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch
        :checkedChildren="$t('compute.text_115')"
        :unCheckedChildren="$t('compute.text_116')"
        v-decorator="enableDec"
        @change="change" />
    </a-form-item>
    <a-form-item v-if="showGroups">
      <base-select
        ref="groupsSelect"
        v-decorator="groupsDec"
        :select-props="{ placeholder: $t('compute.text_148', [$t('dictionary.instancegroup')]), mode: 'multiple' }"
        resource="instancegroups"
        :params="params"
        :need-params="true"
        :extra-opts="groupsExtraOpts"
        @change="onGroupsChange"
        @update:initLoaded="onGroupsInitLoaded" />
    </a-form-item>
  </div>
</template>

<script>
import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

const FALLBACK_ENABLE = ['groupsEnable', { valuePropName: 'checked', initialValue: false }]
const FALLBACK_GROUPS = ['groups', { initialValue: [] }]

/**
 * 反亲和组：控件草稿（开关 + 多选 groups）
 * 回填推迟到 nextTick/timeout，避免与 Form/BaseSelect 同帧 patch
 */
export default {
  name: 'InstanceGroups',
  mixins: [createFormFieldDraftMixin],
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    decorators: {
      type: Object,
      default: null,
    },
    params: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    const d = this.decorators
    const enableDec = (d && Array.isArray(d.groupsEnable)) ? d.groupsEnable : FALLBACK_ENABLE
    const groupsDec = (d && Array.isArray(d.groups)) ? d.groups : FALLBACK_GROUPS
    return {
      enableDec,
      groupsDec,
      showGroups: !!(enableDec[1] && enableDec[1].initialValue),
      pendingGroups: [],
    }
  },
  computed: {
    groupsExtraOpts () {
      // 仅作展示占位；列表就绪后会按 sourceList 求交丢掉无效 id
      return (this.pendingGroups || []).map(id => ({ id, name: id }))
    },
  },
  created () {
    this._groupsDraftApplying = false
    this._groupsUserTouched = false
    this._groupsListLoaded = false
  },
  methods: {
    normalizeGroups (val) {
      if (!Array.isArray(val)) return []
      return val.map((item) => {
        if (item == null) return null
        if (typeof item === 'string' || typeof item === 'number') return String(item)
        return item.id || item.key || item.value || null
      }).filter(Boolean)
    },
    /**
     * sourceList 非空才可回填；空列表不写非法 pending。
     */
    filterPendingGroupsByList () {
      if (!this.pendingGroups.length) return false
      const select = this.$refs.groupsSelect
      const sourceList = select?.sourceList || []
      if (!sourceList.length) return false
      const idSet = new Set(sourceList.map(item => item.id))
      this.pendingGroups = this.pendingGroups.filter(id => idSet.has(id))
      return true
    },
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f) {
        return {
          groupsEnable: this.showGroups,
          groups: this.showGroups ? this.pendingGroups.slice() : [],
        }
      }
      const enableField = this.enableDec[0]
      const groupsField = this.groupsDec[0]
      const groupsEnable = !!f.getFieldValue(enableField)
      // 关开关时强制空 groups，避免展示关闭但草稿/提交仍带旧实例组（阴阳表单）
      if (!groupsEnable) {
        return { groupsEnable: false, groups: [] }
      }
      let groups = this.normalizeGroups(
        f.getFieldValue(groupsField) || this.pendingGroups,
      )
      // 仅程序化空窗（列表未就绪）才用 prev；用户已清空则写空
      if (!groups.length && !this._groupsUserTouched) {
        const prev = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
        if (Array.isArray(prev && prev.groups)) {
          groups = this.normalizeGroups(prev.groups)
        }
      }
      return { groupsEnable, groups }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form?.fc) return
      if (this._groupsUserTouched) return
      this._groupsDraftApplying = true
      const enableField = this.enableDec[0]
      const groupsField = this.groupsDec[0]
      const groups = this.normalizeGroups(draft.groups)
      // 显式关闭优先：不因子字段残留而重新打开
      if (draft.groupsEnable === false) {
        this.showGroups = false
        this.pendingGroups = []
        this.form.fc.setFieldsValue({ [enableField]: false })
        if (this.form.fd) this.$set(this.form.fd, groupsField, undefined)
        this._groupsDraftApplying = false
        return
      }
      if (draft.groupsEnable || groups.length) {
        this.showGroups = true
        this.pendingGroups = groups
        this.form.fc.setFieldsValue({ [enableField]: true })
      }
      const writeGroups = () => {
        if (!this.form?.fc || !this.showGroups) return false
        if (this._groupsUserTouched) return false
        if (!this.pendingGroups.length) return true
        this.form.fc.getFieldDecorator(groupsField, {
          ...(this.groupsDec[1] || {}),
          initialValue: this.pendingGroups.slice(),
        })
        this.form.fc.setFieldsValue({ [groupsField]: this.pendingGroups.slice() })
        if (this.form.fd) this.$set(this.form.fd, groupsField, this.pendingGroups.slice())
        return true
      }
      this.$nextTick(() => {
        if (!writeGroups()) {
          this._groupsDraftApplying = false
          return
        }
        setTimeout(() => {
          if (!writeGroups()) this._groupsDraftApplying = false
        }, 800)
        setTimeout(() => {
          writeGroups()
          this._groupsDraftApplying = false
        }, 2000)
      })
    },
    change (val) {
      if (!this._groupsDraftApplying) this._groupsUserTouched = true
      this.showGroups = !!val
      if (!val) {
        this.pendingGroups = []
        const groupsField = this.groupsDec[0]
        if (this.form?.fc) this.form.fc.setFieldsValue({ [groupsField]: undefined })
        if (this.form?.fd) this.$delete(this.form.fd, groupsField)
      }
      this.$nextTick(() => {
        if (!this._groupsDraftApplying) this.persistFormFieldDraftSnapshot()
      })
    },
    onGroupsChange (val) {
      const groups = this.normalizeGroups(val)
      if (!groups.length) {
        // 列表刷新清空：补写 pending，不算用户触摸
        if (this.pendingGroups.length || this._groupsDraftApplying) {
          this.$nextTick(() => this.writePendingGroups())
          return
        }
        this._groupsUserTouched = true
        this.pendingGroups = []
      } else {
        if (!this._groupsDraftApplying) this._groupsUserTouched = true
        this.pendingGroups = groups
      }
      this.$nextTick(() => {
        if (!this._groupsDraftApplying) this.persistFormFieldDraftSnapshot()
      })
    },
    writePendingGroups () {
      if (!this.form?.fc || !this.showGroups) return
      if (this._groupsUserTouched && !this._groupsDraftApplying) return
      // 列表空：不回填 pending（等 initLoaded）；已加载仍空则清空
      if (!this.filterPendingGroupsByList()) {
        if (this._groupsListLoaded) {
          this.pendingGroups = []
          const groupsField = this.groupsDec[0]
          this.form.fc.setFieldsValue({ [groupsField]: [] })
          if (this.form.fd) this.$set(this.form.fd, groupsField, [])
        }
        return
      }
      if (!this.pendingGroups.length) {
        const groupsField = this.groupsDec[0]
        this.form.fc.setFieldsValue({ [groupsField]: [] })
        if (this.form.fd) this.$set(this.form.fd, groupsField, [])
        return
      }
      const groupsField = this.groupsDec[0]
      this.form.fc.getFieldDecorator(groupsField, {
        ...(this.groupsDec[1] || {}),
        initialValue: this.pendingGroups.slice(),
      })
      this.form.fc.setFieldsValue({ [groupsField]: this.pendingGroups.slice() })
      if (this.form.fd) this.$set(this.form.fd, groupsField, this.pendingGroups.slice())
    },
    onGroupsInitLoaded () {
      this._groupsListLoaded = true
      this.writePendingGroups()
      if (!this._groupsUserTouched) {
        setTimeout(() => this.writePendingGroups(), 300)
      }
    },
  },
}
</script>
