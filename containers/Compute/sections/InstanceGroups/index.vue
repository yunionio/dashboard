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
      return (this.pendingGroups || []).map(id => ({ id, name: id }))
    },
  },
  created () {
    this._groupsDraftApplying = false
    this._groupsUserTouched = false
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
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f) {
        return {
          groupsEnable: this.showGroups,
          groups: this.pendingGroups.slice(),
        }
      }
      const prev = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
      const enableField = this.enableDec[0]
      const groupsField = this.groupsDec[0]
      const groupsEnable = !!f.getFieldValue(enableField)
      let groups = this.normalizeGroups(
        f.getFieldValue(groupsField) || this.pendingGroups,
      )
      if (!groups.length && Array.isArray(prev && prev.groups)) {
        groups = this.normalizeGroups(prev.groups)
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
      if (draft.groupsEnable || groups.length) {
        this.showGroups = true
        this.pendingGroups = groups
        this.form.fc.setFieldsValue({ [enableField]: true })
      } else if (draft.groupsEnable === false) {
        this.showGroups = false
        this.pendingGroups = []
        this.form.fc.setFieldsValue({ [enableField]: false })
        this._groupsDraftApplying = false
        return
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
      if (!val) this.pendingGroups = []
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
      if (!this.pendingGroups.length || !this.form?.fc || !this.showGroups) return
      if (this._groupsUserTouched && !this._groupsDraftApplying) return
      const groupsField = this.groupsDec[0]
      this.form.fc.getFieldDecorator(groupsField, {
        ...(this.groupsDec[1] || {}),
        initialValue: this.pendingGroups.slice(),
      })
      this.form.fc.setFieldsValue({ [groupsField]: this.pendingGroups.slice() })
      if (this.form.fd) this.$set(this.form.fd, groupsField, this.pendingGroups.slice())
    },
    onGroupsInitLoaded () {
      this.writePendingGroups()
      if (!this._groupsUserTouched) {
        setTimeout(() => this.writePendingGroups(), 300)
      }
    },
  },
}
</script>
