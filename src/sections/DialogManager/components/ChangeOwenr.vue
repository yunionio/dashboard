<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common.text00078')}}{{ $t('dictionary.project') }}</div>
    <div slot="body">
      <template v-if="params.alertMessage">
        <a-alert :message="params.alertMessage" banner class="mb-2" />
      </template>
      <dialog-selected-tips :count="params.data.length" :action="`${$t('common.text00078')}${$t('dictionary.project')}`" :name="params.name || $t('common.text00006')" />
      <dialog-table v-if="columns" :data="params.data" :columns="columns" />
      <a-form
        :form="form.fc">
        <a-form-item :label="params.projectLabel || $t('dictionary.project')" v-bind="formItemLayout">
          <domain-project
            :fc="form.fc"
            :fd="form.fd"
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
import { is } from 'ramda'
import _ from 'lodash'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainProject from '@/sections/DomainProject/last'

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
        fc: this.$form.createForm(this, {
          name: 'change_project_form',
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          domain: _.get(this.params, 'data[0].domain_id'),
          project: _.get(this.params, 'data[0].tenant_id') || _.get(this.params, 'data[0].project_id'),
        },
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
            initialValue: _.get(this.params, 'data[0].tenant_id') || _.get(this.params, 'data[0].project_id'),
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
      if (this.params.custom_columns) {
        return this.params.custom_columns
      }
      if (this.params.columns && this.params.columns.length >= 2) {
        const keys = ['name', 'tenant']
        return this.params.columns.filter(({ field }) => {
          return keys.indexOf(field) > -1
        })
      }
      return this.params.columns
    },
    getDomainList () {
      if (this.params.ignoreCandidateDomains) {
        return undefined
      }
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
        const { manager } = this.params
        if (manager) {
          await manager.batchPerformAction({
            ids,
            action: this.params.action || 'change-owner',
            data: values,
          })
        } else {
          await this.params.onManager('batchPerformAction', {
            id: ids,
            steadyStatus: this.params.steadyStatus === undefined ? ['running', 'ready'] : this.params.steadyStatus,
            managerArgs: {
              action: this.params.action || 'change-owner',
              data: values,
            },
          })
        }
        this.loading = false
        this.cancelDialog()
        is(Function, this.params.refresh) && this.params.refresh()
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
