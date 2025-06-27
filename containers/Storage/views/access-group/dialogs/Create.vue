<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('storage.access.group.create')}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('storage.text_40')">
          <a-input v-decorator="decorators.name" :placeholder="$t('storage.text_56')" />
        </a-form-item>
        <area-selects
          class="mb-0"
          ref="areaSelects"
          :wrapperCol="formItemLayout.wrapperCol"
          :labelCol="formItemLayout.labelCol"
          :names="['provider', 'cloudregion']"
          :cloudregionParams="cloudregionParams"
          :isRequired="true"
          :providerParams="providerParams"
          filterBrandResource="nas"
          @change="handleRegionChange" />
        <a-form-item :label="$t('compute.text_15')">
        <base-select
          resource="cloudproviders"
          v-decorator="decorators.cloudprovider"
          :params="cloudproviderParams"
          :isDefaultSelect="true"
          :showSync="true"
          :select-props="{ placeholder: $t('compute.text_149') }"
          @update:item="cloudproviderSelected" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
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
import { isRequired } from '@/utils/validate'
import AreaSelects from '@/sections/AreaSelects'

export default {
  name: 'AccessGroupCreateDialog',
  components: {
    AreaSelects,
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
            // initialValue: domain || this.$store.getters.userInfo.projectDomainId,
            rules: [
              { validator: isRequired(), message: this.$t('rules.domain'), trigger: 'change' },
            ],
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('storage.text_56') },
            ],
          },
        ],
        cloudprovider: [
          'cloudprovider',
          {
            rules: [{ required: true, message: this.$t('common.tips.input', [this.$t('storage.text_40')]) }],
          },
        ],
        description: ['description'],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      cloudRegionParams: {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: false,
        cloud_env: 'public',
      },
      providerParams: {
        scope: this.$store.getters.scope,
        usable: false,
      },
      regionProvider: '',
      regionId: '',
    }
  },
  computed: {
    cloudproviderParams () {
      const params = {
        limit: 20,
        // brand: this.form.fd.provider,
        cloudregion: this.regionId,
        enabled: true,
        read_only: false,
        scope: this.$store.getters.scope,
      }
      return params
    },
  },
  methods: {
    handleRegionChange (data) {
      const { cloudregion } = data
      if (cloudregion) {
        const { provider } = cloudregion.value
        this.regionProvider = provider
        this.regionId = cloudregion.id
      }
    },
    doCreate (data) {
      return new this.$Manager('access_groups').create({ data: data })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.doCreate({ ...values, cloudregion: this.regionId })
        this.loading = false
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
        this.params.success && this.params.success()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
