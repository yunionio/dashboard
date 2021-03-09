<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_21')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_551')" v-bind="formItemLayout">
          <base-select
            v-decorator="decorators.network"
            :params="networkParams"
            :select-props="{ placeholder: $t('network.text_552') }"
            resource="networks"
            :filterable="true" />
        </a-form-item>
        <a-form-item :label="$t('network.text_539')" v-bind="formItemLayout">
          <template #extra>{{$t('network.text_540')}}<router-link :to="{ path: '/eip' }" target="_blank">{{$t('dictionary.eip')}}</router-link>
          </template>
          <base-select
            v-decorator="decorators.ip"
            :params="eipParams"
            :select-props="{ placeholder: $t('network.text_541') }"
            resource="eips"
            :labelFormat="labelFormat"
            :resList.sync="eipOptions"
            :showSync="true" />
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
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SNatCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        name: [
          'name',
          {
            validateTrigger: ['blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('serverCreateName') },
            ],
          },
        ],
        network: [
          'network',
          {
            rules: [
              { required: true, message: this.$t('network.text_552') },
            ],
          },
        ],
        ip: [
          'ip',
          {
            rules: [
              { required: true, message: this.$t('network.text_541') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      tailFormItemLayout: {
        wrapperCol: {
          span: 16,
          offset: 8,
        },
        labelCol: {
          span: 3,
        },
      },
      networkParams: {
        scope: this.$store.getters.scope,
        vpc: this.params.data.vpc_id,
        provider: this.params.data.provider,
      },
      eipParams: {
        scope: this.$store.getters.scope,
        'filter.0': `associate_id.in(${this.params.data.id})`,
        'filter.1': 'associate_id.isnullorempty()',
        filter_any: true,
        provider: this.params.data.provider,
        region: this.params.data.region_id,
      },
      eipOptions: [],
    }
  },
  methods: {
    labelFormat (val) {
      return `${val.name}(${val.ip_addr})`
    },
    doCreate (data) {
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
        const eipObj = R.indexBy(R.prop('id'), this.eipOptions)
        const params = {
          name: values.name,
          natgateway_id: this.params.data.id,
          network_id: values.network,
          ip: eipObj[values.ip].ip_addr,
          external_ip_id: values.ip,
          source_cidr: '',
        }
        await this.doCreate(params)
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
