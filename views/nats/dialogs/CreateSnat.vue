<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('network.text_21')">
          <a-input v-decorator="decorators.name" :placeholder="$t('network.text_44')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_249')">
          <a-radio-group v-model="resource" @change="onResourceTypeChanged">
            <a-radio value="networks">{{$t('network.snat.type.network')}}</a-radio>
            <a-radio value="servers">{{$t('network.snat.type.server')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="resource_label">
          <base-select
            v-decorator="decorators.res_id"
            :params="resParams"
            :select-props="resouce_props"
            :resource="resource"
            :resList.sync="resOptions"
            :filterable="true" />
        </a-form-item>
        <a-form-item :label="$t('network.text_539')">
          <template #extra>{{$t('network.text_540')}}<router-link :to="{ path: '/eip' }" target="_blank">{{$t('dictionary.eip')}}</router-link>
          </template>
          <base-select
            v-decorator="decorators.eip"
            :params="eipParams"
            :select-props="{ placeholder: $t('network.text_541') }"
            resource="eips"
            :labelFormat="labelFormat"
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
      resource_label: this.$t('network.snat.type.network'),
      resource: 'networks',
      resouce_props: { placeholder: this.$t('network.text_552') },
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
        res_id: [
          'res_id',
          {
            rules: [
              { required: true, message: this.$t('network.text_552') },
            ],
          },
        ],
        eip: [
          'eip',
          {
            rules: [
              { required: true, message: this.$t('network.text_541') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
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
      resParams: {
        scope: this.$store.getters.scope,
        vpc: this.params.data.vpc_id,
        status: ['running', 'ready', 'available'],
      },
      eipParams: {
        scope: this.$store.getters.scope,
        usable_eip_for_associate_type: 'natgateway',
        usable_eip_for_associate_id: this.params.data.id,
      },
      resOptions: [],
    }
  },
  methods: {
    onResourceTypeChanged (e) {
      this.resource = e.target.value
      switch (this.resource) {
        case 'servers':
          this.resource_label = this.$t('network.snat.type.server')
          this.resouce_props = { placeholder: this.$t('network.text_60') }
          this.decorators.res_id[1].rules[0].message = this.$t('network.text_60')
          break
        case 'networks':
          this.resource_label = this.$t('network.snat.type.network')
          this.resouce_props = { placeholder: this.$t('network.text_552') }
          this.decorators.res_id[1].rules[0].message = this.$t('network.text_552')
          break
      }
    },
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
        const params = {
          name: values.name,
          natgateway_id: this.params.data.id,
          eip: values.eip,
        }
        const resObj = R.indexBy(R.prop('id'), this.resOptions)
        switch (this.resource) {
          case 'networks':
            params.network_id = values.res_id
            break
          case 'servers':
            resObj[values.res_id].nics.forEach((nic) => {
              if (nic.ip_addr && nic.vpc_id === this.params.data.vpc_id) {
                params.source_cidr = nic.ip_addr + '/32'
              }
            })
            break
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
