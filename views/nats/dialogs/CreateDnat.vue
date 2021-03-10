<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('network.text_538')" v-bind="formItemLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_539')" v-bind="formItemLayout">
          <template #extra>{{$t('network.text_540')}}<router-link :to="{ path: '/eip' }" target="_blank">{{$t('dictionary.eip')}}</router-link>
          </template>
          <base-select
            v-decorator="decorators.ip"
            :params="eipParams"
            :select-props="{ placeholder: $t('network.text_541') }"
            resource="eips"
            :showSync="true"
            :labelFormat="eiplabelFormat"
            :resList.sync="eipOptions"
            :mapper="eipsMapper" />
        </a-form-item>
        <a-form-item :label="$t('network.text_542')" v-bind="formItemLayout">
          <base-select
            v-decorator="decorators.server"
            :params="serverParams"
            :select-props="{ placeholder: $t('network.text_543') }"
            resource="servers"
            :filterable="true"
            :labelFormat="serverlabelFormat"
            :resList.sync="serverOptions"
            :mapper="serversMapper" />
        </a-form-item>
        <a-form-item :label="$t('network.text_544')" v-bind="formItemLayout" :extra="$t('network.text_545')">
          <a-input-number :min="1" :max="65535" v-decorator="decorators.externalPort" />
        </a-form-item>
        <a-form-item :label="$t('network.text_546')" v-bind="formItemLayout" :extra="$t('network.text_545')">
          <a-input-number :min="1" :max="65535" v-decorator="decorators.internalPort" />
        </a-form-item>
        <a-form-item :label="$t('network.text_547')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.protocol">
            <a-select-option value="tcp">TCP</a-select-option>
            <a-select-option value="udp">UDP</a-select-option>
          </a-select>
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
  name: 'DNatCreateDialog',
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
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_116') },
              { validator: this.$validate('serverCreateName') },
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
        server: [
          'server',
          {
            rules: [
              { required: true, message: this.$t('network.text_543') },
            ],
          },
        ],
        externalPort: [
          'externalPort',
          {
            validateTrigger: ['blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_548') },
            ],
          },
        ],
        internalPort: [
          'internalPort',
          {
            validateTrigger: ['blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('network.text_549') },
            ],
          },
        ],
        protocol: [
          'protocol',
          {
            rules: [
              { required: true, message: this.$t('network.text_550') },
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
      serverParams: {
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
      snatEips: [],
      serverOptions: [],
      eipOptions: [],
    }
  },
  created () {
    this.querySnatResources()
  },
  methods: {
    eiplabelFormat (val) {
      return `${val.name}(${val.ip_addr})`
    },
    serverlabelFormat (val) {
      return `${val.name}(${val.ips})`
    },
    eipsMapper (data) {
      data = data.filter((item) => { return !this.snatEips.includes(item.ip_addr) })
      return data
    },
    querySnatResources () {
      const manager = new this.$Manager('natgateways')
      manager.performAction({ id: this.params.data.id, action: 'snat-resources', data: {} })
        .then((res) => {
          this.snatEips = res.data.eips
        })
    },
    serversMapper (data) {
      data = data.filter((item) => { return !item.eip })
      return data
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
        const serverObj = R.indexBy(R.prop('id'), this.serverOptions)
        const params = {
          name: values.name,
          natgateway_id: this.params.data.id,
          internal_ip: serverObj[values.server].ips,
          internal_port: Number(values.internalPort),
          external_ip: eipObj[values.ip].ip_addr,
          external_ip_id: eipObj[values.ip].id,
          external_port: Number(values.externalPort),
          ip_protocol: values.protocol,
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
