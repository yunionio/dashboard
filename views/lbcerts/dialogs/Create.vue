<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_205', [$t('dictionary.project')])" class="mt-3 mb-0" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('network.text_317')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">{{$t('network.text_322')}}<a-tooltip>
              <div slot="title">{{$t('network.text_323')}}<br />{{$t('network.text_324')}}<br />{{$t('network.text_325')}}</div>
              <a-icon type="info-circle" />
            </a-tooltip>
          </span>
          <a-textarea
            v-decorator="decorators.certificate"
            :placeholder="$t('network.text_326')"
            rows="4" />
        </a-form-item>
        <a-form-item v-bind="formItemLayout">
          <span slot="label">{{$t('network.text_327')}}<a-tooltip>
              <div slot="title">{{$t('network.text_328')}}<br />{{$t('network.text_324')}}<br />{{$t('network.text_325')}}</div>
              <a-icon type="info-circle" />
            </a-tooltip>
          </span>
          <a-textarea
            v-decorator="decorators.private_key"
            :placeholder="$t('network.text_329')"
            rows="4" />
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
import { isRequired } from '@/utils/validate'
import DomainProject from '@/sections/DomainProject'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'LbcertsCreateDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: this.$t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('certName') },
            ],
          },
        ],
        certificate: [
          'certificate',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_330') },
            ],
          },
        ],
        private_key: [
          'private_key',
          {
            validateFirst: true,
            validateTrigger: ['blur'],
            rules: [
              { required: true, message: this.$t('network.text_331') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 6,
        },
      },
    }
  },
  methods: {
    doCreate (data) {
      data.project_id = data.project.key
      delete data.domain
      delete data.project
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
