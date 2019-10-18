<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更改项目</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" action="更改项目" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item label="项目" v-bind="formItemLayout">
          <base-select
            v-decorator="decorators.project"
            :params="projectParams"
            version="v1"
            :select-props="{ placeholder: '请选择项目' }"
            resource="projects"
            :filterable="true" />
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

export default {
  name: 'ChangeProjectDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const firstData = this.params.data[0]
    const initialValue = this.params.data.length === 1 ? firstData.tenant_id : undefined
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        project: [
          'project',
          {
            initialValue,
            rules: [
              { required: true, message: '请选择项目' },
            ],
          },
        ],
      },
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
    projectParams () {
      const params = {
        scope: this.$store.getters.scope,
        domain_id: 'default',
      }
      if (this.$store.getters.l3PermissionEnable) {
        params.domain_id = this.params.data[0].domain_id
      }
      return params
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    async doChangeProject (values, ids) {
      return this.params.list.batchPerformAction('change-project', values, null, ids)
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const ids = this.params.data.map(item => item.id)
        this.loading = true
        await this.doChangeProject(values, ids)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
