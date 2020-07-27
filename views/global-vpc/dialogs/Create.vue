<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <a-form slot="body" :form="form.fc" class="mt-3" v-bind="formItemLayout">
      <a-form-item v-bind="formItemLayout" :label="$t('network.text_205', [$t('dictionary.domain')])" v-if="$store.getters.isAdminMode">
        <domain-select v-decorator="decorators.project_domain" />
      </a-form-item>
      <a-form-item :label="$t('network.text_21')">
        <a-input v-decorator="decorators.name" :placeholder="$t('network.text_116')" />
      </a-form-item>
    </a-form>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { CreateServerForm } from '@Compute/constants'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import validateForm from '@/utils/validate'
import DomainSelect from '@/sections/DomainSelect'

export default {
  name: 'GlobalVpcCreateDialog',
  components: {
    DomainSelect,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
    }
  },
  computed: {
    decorators () {
      const { initialValues = {} } = this.params
      const decorators = {
        name: [
          'name',
          {
            initialValue: initialValues.name,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: validateForm('resourceName') },
            ],
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.$store.getters.userInfo.projectDomainId,
          },
        ],
      }
      return decorators
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
        await this.params.onManager('create', {
          managerArgs: {
            data: values,
          },
        })
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
