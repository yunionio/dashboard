<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">新建</div>
    <div slot="body">
      <a-form
        v-bind="formLayout"
        :form="form.fc">
        <a-form-item :label="`指定${$t('dictionary.domain')}`" v-bind="formLayout">
          <domain-select v-decorator="decorators.project_domain" />
        </a-form-item>
        <a-form-item label="名称">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <common-form-items />
        <a-form-item v-bind="offsetFormLayout">
          <test-button :post="testPost" />
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
import CommonFormItems from '../components/CommonFormItems'
import DomainSelect from '@/sections/DomainSelect'
import { isRequired } from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import TestButton from '@/sections/TestButton'

export default {
  name: 'ProxysettingCreateDialog',
  components: {
    CommonFormItems,
    DomainSelect,
    TestButton,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const projectDomainInitialValue = this.$store.getters.userInfo.projectDomainId
    return {
      loading: false,
      projectDomainInitialValue,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.projectDomainInitialValue,
          },
        ],
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
      },
      formLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      offsetFormLayout: {
        wrapperCol: {
          span: 21,
          offset: 3,
        },
      },
    }
  },
  methods: {
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async testPost () {
      try {
        const values = await this.form.fc.validateFields(['http_proxy', 'https_proxy'])
        await this.params.onManager('performClassAction', {
          managerArgs: {
            action: 'test',
            data: {
              http_proxy: values.http_proxy,
              https_proxy: values.https_proxy,
            },
          },
        })
      } catch (err) {
        throw err
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.params.onManager('create', {
          managerArgs: {
            data: values,
          },
        })
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
