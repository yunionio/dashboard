<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.snapshot')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])">
          <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_228')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceCreateName')" />
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
import DomainProject from '@/sections/DomainProject'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SnapshotCreateDiskDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const { domain_id, tenant_id } = this.params.data[0]

    return {
      loading: false,
      action: this.$t('compute.create_disk'),
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        projectDomain: {
          project: [
            'project',
            {
              initialValue: tenant_id,
            },
          ],
          domain: [
            'domain',
            {
              initialValue: domain_id,
            },
          ],
        },
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('resourceCreateName') },
            ],
          },
        ],
      },
      disabled: false,
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
    }
  },
  computed: {
    columns () {
      const showFields = ['name', 'size', 'storage_type']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    async doCreateDiskSubmit (values) {
      const manager = new this.$Manager('disks')
      return manager.create({
        data: {
          project_id: values.project,
          name: values.name,
          snapshot_id: this.params.data[0].id,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.getFieldsValue()
        await this.doCreateDiskSubmit(values)
        this.loading = false
        this.$message.success(this.$t('k8s.text_184'))
        this.$router.push('/disk')
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
