<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">添加备份机</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" action="添加备份机" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="备份机的宿主机" v-bind="formItemLayout" extra="提示信息：宿主机为空时，系统会自动选择宿主机">
          <base-select
            class="w-100"
            v-decorator="decorators.prefer_host_id"
            resource="hosts"
            :params="selectParams"
            :disabled-items="disabledItems"
            :select-props="{ placeholder: '请选择宿主机' }" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { typeClouds } from '@/utils/common/hypervisor'

const hypervisorMap = typeClouds.hypervisorMap

export default {
  name: 'VmAddBackupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        prefer_host_id: [
          'prefer_host_id',
          {
            rules: [
              { required: false, message: '请选择备份机', trigger: 'blur' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
    firstData () {
      return this.params.data[0]
    },
    selectParams () {
      const params = { enabled: 1, host_type: this.firstData['hypervisor'] }
      if (this.firstData['hypervisor'] === hypervisorMap.kvm.key) {
        params.host_type = 'hypervisor'
      }
      if (this.isAdminMode && this.params.data.length === 1) {
        params.project_domain = this.firstData['domain_id']
      }
      if (this.isDomainMode) {
        params.scope = this.scope
      }
      return params
    },
    disabledItems () {
      return [this.firstData.host_id]
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: ['running', 'ready'],
          managerArgs: {
            action: 'create-backup',
            data: values,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
