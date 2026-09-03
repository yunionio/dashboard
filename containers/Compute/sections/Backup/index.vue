<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorator.backupEnable" @change="change" :disabled="switchDisabled" />
    </a-form-item>
    <a-form-item class="mt-2" v-if="backupEnable && !isProjectMode">
      <base-select
        v-decorator="decorator.backup"
        :options="hostList"
        :select-props="{ placeholder: $t('compute.text_117') }"
        :disabled-items="disabledItems" />
    </a-form-item>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import * as R from 'ramda'

import createFormFieldDraftMixin from '@/mixins/createFormFieldDraft'

export default {
  name: 'Backup',
  mixins: [createFormFieldDraftMixin],
  inject: { form: { default: undefined } },
  props: {
    formDraftKey: {
      type: String,
      default: '',
    },
    /** selection：switch / 单选，local + session 双写、可跨 tab 回填 */
    formDraftKind: {
      type: String,
      default: 'selection',
    },
    decorator: {
      type: Object,
      required: true,
      validator: val => R.is(Array, val.backupEnable) && R.is(Array, val.backup),
    },
    disabledItems: {
      type: Array,
      default: () => [],
    },
    diskType: { // 系统盘磁盘类型
      type: String,
    },
    domain: Object,
    availableHostCount: Number, // 可用的宿主机数量
    hostParams: {
      type: Object,
    },
  },
  data () {
    return {
      hostList: [],
      backupEnable: this.decorator.backupEnable[1].initialValue,
    }
  },
  computed: {
    ...mapGetters(['isProjectMode']),
    switchDisabled () {
      if (this.diskType === 'gpfs') return true
      if (this.availableHostCount < 2) return true
      return false
    },
  },
  watch: {
    backupEnable: {
      handler (val) {
        if (val) this.fetchBackupHosts()
      },
      immediate: true,
    },
    hostList: {
      immediate: true,
      handler () {
        // 列表就绪只补宿主机，勿整包 restore（否则草稿 backupEnable:false 会盖掉用户刚开的开关）
        this.$nextTick(() => {
          if (!this.canRestoreFormFieldDraft()) return
          if (!this.backupEnable) return
          const draft = this.sanitizeDraftForRestore(this.readFormFieldDraft())
          if (!draft?.backup) return
          this.writeBackupIfInHostList(draft.backup)
        })
      },
    },
    hostParams: {
      deep: true,
      handler () {
        if (this.backupEnable) this.fetchBackupHosts()
      },
    },
  },
  methods: {
    normalizeBackupId (val) {
      if (!val) return ''
      if (typeof val === 'object') return val.key || val.id || val.value || ''
      return val
    },
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f) return { backupEnable: this.backupEnable, backup: '' }
      const backupEnable = !!f.getFieldValue(this.decorator.backupEnable[0])
      if (!backupEnable) {
        return { backupEnable: false, backup: '' }
      }
      return {
        backupEnable: true,
        backup: this.normalizeBackupId(f.getFieldValue(this.decorator.backup[0])) || '',
      }
    },
    applyCreateFormFieldDraft (draft) {
      if (!draft || !this.form?.fc) return
      // 跨 tab：不自动开开关；开关已开时（用户打开后拉列表）再回填宿主机
      if (this.isFormFieldDraftFromLocal()) {
        if (!this.backupEnable) return
        this.writeBackupIfInHostList(draft.backup)
        return
      }
      if (draft.backupEnable) {
        this.backupEnable = true
        this.applyFormFieldValues({ [this.decorator.backupEnable[0]]: true })
        this.writeBackupIfInHostList(draft.backup)
      } else if (draft.backupEnable === false) {
        this.backupEnable = false
        this.applyFormFieldValues({ [this.decorator.backupEnable[0]]: false })
        const backupField = this.decorator.backup[0]
        this.applyFormFieldValues({ [backupField]: undefined })
        if (this.form?.fd) this.$delete(this.form.fd, backupField)
      }
    },
    /** hostList 命中才写备份机 */
    writeBackupIfInHostList (backupId) {
      const id = this.normalizeBackupId(backupId)
      if (!id || !this.form?.fc || !this.backupEnable) return
      const hostList = Array.isArray(this.hostList) ? this.hostList : []
      if (!hostList.length || !hostList.some(item => item.id === id)) return
      const field = this.decorator.backup[0]
      const current = this.normalizeBackupId(this.form.fc.getFieldValue(field))
      if (current === id) return
      this.form.fc.getFieldDecorator(field, {
        ...(this.decorator.backup[1] || {}),
        initialValue: id,
      })
      this.applyFormFieldValues({ [field]: id })
    },
    change (val) {
      this.backupEnable = val
      if (!val) {
        const backupField = this.decorator.backup[0]
        this.applyFormFieldValues({ [backupField]: undefined })
        if (this.form?.fd) this.$delete(this.form.fd, backupField)
      }
    },
    async fetchBackupHosts () {
      if (!R.is(Object, this.hostParams) || this.isProjectMode) return
      try {
        const { data: { data = [] } } = await new this.$Manager('hosts', 'v2').list({ params: this.hostParams })
        this.hostList = data
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
