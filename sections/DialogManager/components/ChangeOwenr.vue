<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">更改{{ $t('dictionary.project') }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="`更改${$t('dictionary.project')}`" :name="params.name || '实例'" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item :label="params.projectLabel || $t('dictionary.project')" v-bind="formItemLayout">
          <domain-project
            :fc="form.fc"
            :form-layout="formItemLayout"
            :labelInValue="false"
            :decorators="{ project: decorators.project, domain: decorators.domain }"
            :getDomainList="getDomainList" />
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
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject'

export default {
  name: 'ChangeOwenrDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, { name: 'change_project_form' }),
      },
      decorators: {
        domain: [
          'domain',
          {
            initialValue: _.get(this.params, 'data[0].domain_id'),
            rules: [
              { required: true, message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            initialValue: _.get(this.params, 'data[0].tenant_id'),
            rules: [
              { required: true, message: this.$t('rules.project'), trigger: 'change' },
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
    columns () {
      if (this.params.columns && this.params.columns.length >= 2) {
        const keys = ['name', 'tenant']
        return this.params.columns.filter(({ field }) => {
          return keys.indexOf(field) > -1
        })
      }
      return this.params.columns
    },
    getDomainList () {
      if (this.params.data.length === 1) {
        return this.getCandidateDomains
      }
      return undefined
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
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchPerformAction', {
          id: ids,
          steadyStatus: this.params.steadyStatus || ['running', 'ready'],
          managerArgs: {
            action: this.params.action || 'change-owner',
            data: values,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
    async getCandidateDomains (params) {
      try {
        let data
        const candidatesResponse = await new this.$Manager(this.params.resource, this.params.apiVersion || 'v2').getSpecific({
          id: this.params.data[0].id,
          spec: 'change-owner-candidate-domains',
        })
        data = candidatesResponse.data.candidates || []
        if (data.length <= 0) {
          const domainResponse = await new this.$Manager('domains', 'v1').list({
            params,
          })
          data = domainResponse.data.data || []
        }
        return {
          data: {
            data,
          },
        }
      } catch (error) {
        throw error
      }
    },
  },
}
</script>
