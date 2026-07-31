<template>
  <div>
    <a-form-item class="mb-0">
      <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorator.backupEnable" @change="change" :disabled="switchDisabled" />
    </a-form-item>
    <a-form-item class="mt-2" v-if="backupEnable && !isProjectMode">
      <base-select
        v-decorator="decorator.backup"
        :options="hostList"
        :extra-opts="backupExtraOpts"
        :select-props="{ placeholder: $t('compute.text_117') }"
        :disabled-items="disabledItems"
        @change="onBackupHostChange" />
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
      backupDraftRestoring: false,
      pendingBackup: '',
      pendingBackupName: '',
    }
  },
  computed: {
    ...mapGetters(['isProjectMode']),
    switchDisabled () {
      if (this.diskType === 'gpfs') return true
      if (this.availableHostCount < 2) return true
      return false
    },
    backupExtraOpts () {
      const id = this.pendingBackup || this.readDraftBackupId()
      if (!id) return []
      return [{ id, name: this.pendingBackupName || id }]
    },
  },
  watch: {
    backupEnable: {
      handler (val) {
        if (val) this.fetchBackupHosts()
      },
      immediate: true,
    },
    hostParams: {
      deep: true,
      handler () {
        if (this.backupEnable) this.fetchBackupHosts()
      },
    },
  },
  created () {
    this._backupUserTouched = false
    this._backupDraftApplied = false
  },
  methods: {
    normalizeBackupId (val) {
      if (!val) return ''
      if (typeof val === 'object') return val.key || val.id || val.value || ''
      return val
    },
    readDraftBackupId () {
      if (!this.canReadWriteFormFieldDraft()) return ''
      return this.normalizeBackupId(this.readFormFieldDraft()?.backup)
    },
    /**
     * 拉取备份机名称，避免 extraOpts 展示 UUID
     * @param {string} hostId
     */
    async ensurePendingBackupName (hostId) {
      if (!hostId) {
        this.pendingBackupName = ''
        this._backupNameFor = ''
        return
      }
      if (this._backupNameFor === hostId && this.pendingBackupName && this.pendingBackupName !== hostId) {
        return
      }
      this._backupNameFor = hostId
      try {
        const { data } = await new this.$Manager('hosts', 'v2').get({
          id: hostId,
          params: { scope: this.$store.getters.scope },
        })
        if (this._backupNameFor !== hostId) return
        this.pendingBackupName = data?.name || hostId
      } catch (e) {
        if (this._backupNameFor === hostId) this.pendingBackupName = hostId
      }
    },
    setPendingBackup (hostId) {
      const id = this.normalizeBackupId(hostId)
      this.pendingBackup = id
      if (id) this.ensurePendingBackupName(id)
      else this.pendingBackupName = ''
    },
    getCreateFormFieldDraftSnapshot () {
      const f = this.form?.fc
      if (!f) return { backupEnable: this.backupEnable }
      const prev = this.canReadWriteFormFieldDraft() ? this.readFormFieldDraft() : null
      let backup = this.normalizeBackupId(
        f.getFieldValue(this.decorator.backup[0]) || this.pendingBackup,
      )
      if (!backup) backup = this.normalizeBackupId(prev && prev.backup)
      return {
        backupEnable: !!f.getFieldValue(this.decorator.backupEnable[0]),
        backup: backup || '',
      }
    },
    applyCreateFormFieldDraft () {
      this.tryRestoreBackupDraft()
    },
    tryRestoreBackupDraft () {
      if (!this.canReadWriteFormFieldDraft()) return
      if (this._backupUserTouched) return
      const draft = this.readFormFieldDraft()
      if (!draft) return
      const f = this.form?.fc
      if (!f) return
      this.backupDraftRestoring = true
      try {
        if (draft.backupEnable) {
          this.backupEnable = true
          const backupId = this.normalizeBackupId(draft.backup)
          if (backupId) this.setPendingBackup(backupId)
          const values = { [this.decorator.backupEnable[0]]: true }
          if (backupId) {
            this.form.fc.getFieldDecorator(this.decorator.backup[0], {
              ...(this.decorator.backup[1] || {}),
              initialValue: backupId,
            })
            values[this.decorator.backup[0]] = backupId
            if (this.form.fd) this.$set(this.form.fd, this.decorator.backup[0], backupId)
          }
          f.setFieldsValue(values)
          this._backupDraftApplied = true
        } else if (draft.backupEnable === false) {
          this.backupEnable = false
          this.setPendingBackup('')
          f.setFieldsValue({ [this.decorator.backupEnable[0]]: false })
          this._backupDraftApplied = true
        }
      } finally {
        this.$nextTick(() => {
          this.backupDraftRestoring = false
        })
      }
    },

    change (val) {
      if (!this.backupDraftRestoring) this._backupUserTouched = true
      this.backupEnable = val
      if (!val) this.setPendingBackup('')
      this.$nextTick(() => {
        if (!this.backupDraftRestoring) this.persistFormFieldDraftSnapshot()
      })
    },
    onBackupHostChange (val) {
      const id = this.normalizeBackupId(val)
      if (!id) {
        // options 刷新清空时保留 pending，不算用户触摸
        if (this.pendingBackup || this.backupDraftRestoring) {
          this.$nextTick(() => this.writePendingBackup())
          return
        }
        this._backupUserTouched = true
        this.setPendingBackup('')
      } else {
        if (!this.backupDraftRestoring) this._backupUserTouched = true
        this.setPendingBackup(id)
      }
      this.$nextTick(() => {
        if (!this.backupDraftRestoring) this.persistFormFieldDraftSnapshot()
      })
    },
    writePendingBackup () {
      if (!this.pendingBackup || !this.form?.fc || !this.backupEnable) return
      if (this._backupUserTouched && !this.backupDraftRestoring) return
      const field = this.decorator.backup[0]
      this.form.fc.getFieldDecorator(field, {
        ...(this.decorator.backup[1] || {}),
        initialValue: this.pendingBackup,
      })
      this.form.fc.setFieldsValue({ [field]: this.pendingBackup })
      if (this.form.fd) this.$set(this.form.fd, field, this.pendingBackup)
    },
    async fetchBackupHosts () {
      if (!R.is(Object, this.hostParams) || this.isProjectMode) return
      try {
        const { data: { data = [] } } = await new this.$Manager('hosts', 'v2').list({ params: this.hostParams })
        this.hostList = data
        // 列表里已有真名时同步到 pending map，避免标签仍显示 id
        if (this.pendingBackup) {
          const hit = data.find(item => item.id === this.pendingBackup)
          if (hit?.name) this.pendingBackupName = hit.name
        }
      } catch (error) {
        throw error
      } finally {
        this.$nextTick(() => {
          if (!this._backupDraftApplied && !this._backupUserTouched) {
            this.tryRestoreBackupDraft()
          }
          this.writePendingBackup()
        })
      }
    },
  },
}
</script>
