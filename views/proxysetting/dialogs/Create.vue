<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('cloudenv.text_411')}}</div>
    <div slot="body">
      <a-form
        v-bind="formLayout"
        :form="form.fc">
        <a-form-item :label="$t('cloudenv.text_410', [$t('dictionary.domain')])" v-bind="formLayout">
          <domain-select v-if="isAdminMode && l3PermissionEnable" v-decorator="decorators.project_domain" :params="domainParams" />
          <template v-else> {{userInfo.domain.name}} </template>
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_95')">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <common-form-items />
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <test-button
        :disabled="!form.fc.getFieldValue('http_proxy') && !form.fc.getFieldValue('https_proxy')"
        :post="testPost"
        :isSuccessAlert="false" />
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import CommonFormItems from '../components/CommonFormItems'
import DomainSelect from '@/sections/DomainSelect'
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
    const projectDomainInitialValue = (this.params.domain && this.params.domain.key) || this.$store.getters.userInfo.projectDomainId
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: projectDomainInitialValue,
            rules: [
              { required: true, message: this.$t('cloudenv.text_284', [this.$t('dictionary.domain')]) },
            ],
          },
        ],
      },
      formLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
      offsetFormLayout: {
        wrapperCol: {
          span: 18,
          offset: 6,
        },
      },
      domainParams: {
        limit: 0,
        filter: 'enabled.equals(1)',
      },
    }
  },
  computed: mapGetters(['isAdminMode', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  methods: {
    doCreate (data) {
      return new this.$Manager('proxysettings').create({ data: data })
    },
    async testPost () {
      const manager = new this.$Manager('proxysettings')
      try {
        const keys = ['http_proxy', 'https_proxy']
        const values = await this.form.fc.validateFields(['http_proxy', 'https_proxy'])
        const { data } = await manager.performClassAction({
          action: 'test',
          data: {
            http_proxy: values.http_proxy,
            https_proxy: values.https_proxy,
          },
        })
        keys.forEach(k => {
          if (!data[k] || !values[k] || R.type(data[k]) !== 'Object') return false
          const { ok, reason } = data[k]
          if (ok) {
            this.$notification.success({
              message: this.$t('cloudenv.text_407', [this.$t('proxysettings')[k]]),
              description: this.$t('cloudenv.text_408'),
            })
          } else {
            this.$notification.error({
              message: this.$t('cloudenv.text_409', [this.$t('proxysettings')[k]]),
              description: reason,
            })
          }
        })
      } catch (err) {
        throw err
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
        this.params.success && this.params.success()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
