<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_709', [$t('dictionary.instancegroup')])}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('compute.text_297', [$t('dictionary.project')])" class="mb-0" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_228')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_694')" v-bind="formItemLayout" :extra="forceDispersionExtra">
          <a-radio-group v-decorator="decorators.force_dispersion">
            <a-radio-button :value="true">{{$t('compute.text_695')}}</a-radio-button>
            <a-radio-button :value="false">{{$t('compute.text_696')}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_697')" v-bind="formItemLayout" :extra="$t('compute.text_710')">
          <a-input-number :min="1" :max="10" :parser="Math.round" v-decorator="decorators.granularity" />
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
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { isRequired } from '@/utils/validate'
import i18n from '@/locales'
import DomainProject from '@/sections/DomainProject'

export default {
  name: 'InstanceGroupCreateDialog',
  components: {
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (values.hasOwnProperty('force_dispersion')) {
              this.form.fd.force_dispersion = values.force_dispersion
            }
          },
        }),
        fd: {
          force_dispersion: true,
        },
      },
      decorators: {
        domain: [
          'domain',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        project: [
          'project',
          {
            rules: [
              { validator: isRequired(), message: i18n.t('rules.project'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        force_dispersion: [
          'force_dispersion',
          {
            initialValue: true,
          },
        ],
        granularity: [
          'granularity',
          {
            initialValue: 1,
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_711') },
              { type: 'number', min: 1, max: 10, message: this.$t('compute.text_712') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    forceDispersionExtra () {
      let s = this.$t('compute.text_713')
      if (!this.form.fd.force_dispersion) {
        s = this.$t('compute.text_714')
      }
      return s
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
        const { project, domain, ...rest } = values
        await this.params.onManager('create', {
          managerArgs: {
            data: {
              ...rest,
              project_domain: (domain && domain.key) || this.userInfo.projectDomainId,
              project_id: (project && project.key) || this.userInfo.projectId,
            },
          },
        })
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
