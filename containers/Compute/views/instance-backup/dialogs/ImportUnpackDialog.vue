<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])" class="mb-0">
          <domain-project
            :fc="form.fc"
            :form-layout="formLayout"
            :decorators="{
              project: decorators.project,
              domain: decorators.domain
            }" />
        </a-form-item>
        <a-form-item :label="$t('compute.instance_backup_name')">
          <a-input
            v-decorator="decorators.name"
            :placeholder="$t('common.tips.input', [$t('compute.instance_backup_name')])" />
        </a-form-item>
        <a-form-item
          :label="$t('compute.backup_storage')">
          <base-select
            style="width: 100%"
            v-decorator="decorators.storage"
            :params="storageParams"
            :select-props="{ placeholder: $t('compute.text_1022', [$t('compute.backup_storage')]) }"
            resource="backupstorages"
            :filterable="true"
            :isDefaultSelect="true" />
        </a-form-item>
        <a-form-item :label="$t('compute.unpack_name')">
          <a-input
            v-decorator="decorators.package_name"
            :placeholder="$t('common.tips.input', [$t('compute.unpack_name')])" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'
import { isRequired } from '@/utils/validate'

export default {
  name: 'ImportUnpackDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.$t('compute.text_679'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: this.$store.getters.userInfo.projectId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('compute.instance_backup_name')]) },
            ],
          },
        ],
        storage: [
          'storage',
          {
            rules: [
              { required: true, message: this.$t('compute.text_1022', [this.$t('compute.backup_storage')]), trigger: 'change' },
            ],
          },
        ],
        package_name: [
          'package_name',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('compute.unpack_name')]) },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      storageParams: {},
    }
  },
  methods: {
    doImportUnpackSubmit (values) {
      const { name, package_name, storage, project } = values
      const params = {
        package_name,
        name,
        backup_storage_id: storage,
        project_id: project.key,
      }
      return this.params.onManager('performClassAction', {
        managerArgs: {
          action: 'create_from_package',
          data: params,
        },
      })
    },
    async handleConfirm () {
      this.loading = false
      try {
        const values = await this.form.fc.validateFields()
        await this.doImportUnpackSubmit(values)
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
