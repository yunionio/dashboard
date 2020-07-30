<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('storage.text_55', [$t('dictionary.project')])" class="mb-0" v-bind="formItemLayout">
          <domain-project :fc="form.fc" :decorators="{ project: decorators.project, domain: decorators.domain }" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_40')">
          <a-input :placeholder="$t('storage.text_56')" v-decorator="decorators.name" />
          <span slot="extra">{{$t('storage.text_101')}}<br />{{$t('storage.text_102')}}</span>
        </a-form-item>
         <a-form-item :label="$t('storage.text_47')">
          <cloud-provider-region @cloudregionChange="handleCloudregionChange" ref="providerRegionRef" :cloudprovideParams="scopeParams" :cloudregionParams="scopeParams" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import { formItemLayout } from '@Storage/constants/index.js'
import CloudProviderRegion from '@Storage/views/bucket/components/CloudProviderRegion'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { isRequired } from '@/utils/validate'
import i18n from '@/locales'
import DomainProject from '@/sections/DomainProject'

export default {
  name: 'BucketCreateDialog',
  components: {
    CloudProviderRegion,
    DomainProject,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, { onValuesChange: this.handleValuesChange }),
      },
      formItemLayout,
      scopeParams: {
        scope: this.$store.getters.scope,
        project_domain: undefined,
      },
      cloudregion: {},
    }
  },
  computed: {
    ...mapGetters(['userInfo']),
    getFieldValue () {
      return this.form.fc.getFieldValue
    },
    decorators () {
      return {
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
              { required: true, message: this.$t('storage.text_56') },
              {
                validator: (rule, value, _callback) => {
                  const isAzure = this.cloudregion.provider === 'Azure'
                  if (isAzure && (value && value.indexOf('-') > -1)) {
                    _callback(new Error(this.$t('storage.text_102')))
                  }
                  return this.$validate('bucketName')(rule, value, _callback)
                },
              },
            ],
          },
        ],
      }
    },
  },
  methods: {
    async handleValuesChange (vm, changedFields) {
      if (changedFields && changedFields.domain) {
        if (this.$store.getters.isAdminMode) {
          this.scopeParams.project_domain = changedFields.domain.key || this.getFieldValue('domain').key
          delete this.scopeParams.scope
        } else {
          delete this.scopeParams.project_domain
        }
      }
    },
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          const { zone, cloudregion } = values
          if (zone) {
            values.zone = zone.key
          }
          if (cloudregion) {
            values.cloudregion = cloudregion.key
          }
          resolve(values)
        })
      })
    },
    handleCloudregionChange (cloudregion) {
      const isAzure = cloudregion.provider === 'Azure'
      const name = this.form.fc.getFieldValue('name')
      this.cloudregion = cloudregion
      if (isAzure && (name && name.indexOf('-'))) {
        this.form.fc.setFields({
          name: {
            value: name,
            errors: [new Error(this.$t('storage.text_102'))],
          },
        })
      } else if (name) {
        this.form.fc.validateFields(['name'])
      }
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
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
