<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="title" :name="name" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="params.projectLabel || $t('dictionary.project')" v-bind="formItemLayout">
          <base-select
            v-decorator="decorators.project"
            :params="projectParams"
            version="v1"
            :select-props="{ placeholder: this.$t('rules.project') }"
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
              { required: true, message: this.$t('rules.project') },
            ],
          },
        ],
      },
      formItemLayout: this.params.formItemLayout || {
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
      if (this.params.isHiddenDomain) {
        delete params.domain_id
      }
      return params
    },
    name () {
      return this.params.name || this.$t('common.text00006')
    },
    title () {
      return this.params.title || this.$t('common_641', [this.$t('dictionary.project')])
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
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: this.params.steadyStatus || ['running', 'ready'],
        managerArgs: {
          action: this.params.action || 'change-project',
          data: values,
        },
      })
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
        throw error
      }
    },
  },
}
</script>
