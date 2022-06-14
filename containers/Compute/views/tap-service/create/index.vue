<template>
  <div>
    <page-header :title="$t('compute.create_tap_service')" />
    <page-body>
      <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_228')">
          <a-input :placeholder="$t('validator.serverCreateName')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-input :placeholder="$t('scope.text_55')" v-decorator="decorators.description" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_175')">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button value="host">{{ $t('compute.host_port') }}</a-radio-button>
            <a-radio-button value="guest">{{ $t('compute.guest_port') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.target_server')">
          <base-select
              v-decorator="decorators.target_id"
              class="w-100"
              :filterable="true"
              :resource="serverType === 'guest' ? 'servers' : 'hosts'"
              version="v1"
              needParams
              :params="serverParams"
              isDefaultSelect
              :select-props="{ placeholder: $t('compute.text_148', [$t('compute.target_server')]) }"
              @update:item="serverChange" />
        </a-form-item>
        <a-form-item :label="$t('compute.target_mac')">
          <base-select
            v-decorator="decorators.mac_addr"
            :options="macAddrs"
            idKey="mac"
            nameKey="mac"
            isDefaultSelect
            :select-props="{ placeholder: $t('compute.text_148', [$t('compute.target_mac')]) }" />
        </a-form-item>
      </a-form>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">{{$t('compute.text_907')}}</a-button>
        <a-button @click="handleCancel">{{$t('compute.text_908')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import validateForm from '@/utils/validate'

export default {
  name: 'TapServiceCreate',
  data () {
    return {
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.handleValuesChange,
        }),
        fd: {
          type: 'host',
        },
      },
      decorators: {
        name: [
          'name',
          {
            initialValue: '',
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('compute.text_210') },
              { validator: validateForm('serverCreateName') },
            ],
          },
        ],
        description: [
          'description',
        ],
        type: [
          'type',
          {
            initialValue: 'host',
          },
        ],
        target_id: [
          'target_id',
          {
            rules: [{ required: true, message: this.$t('compute.text_148', [this.$t('compute.target_server')]) }],
          },
        ],
        mac_addr: [
          'mac_addr',
          {
            rules: [{ required: true, message: this.$t('compute.text_148', [this.$t('compute.target_mac')]) }],
          },
        ],
      },
      currentHost: {},
      formItemLayout: {
        wrapperCol: {
          md: { span: 16 },
          xl: { span: 18 },
          xxl: { span: 20 },
        },
        labelCol: {
          md: { span: 8 },
          xl: { span: 6 },
          xxl: { span: 4 },
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
    serverParams () {
      return {
        scope: this.scope,
        filter: 'hypervisor.notin(baremetal,container)',
        brand: 'OneCloud',
        limit: 20,
        system: this.isAdminMode,
      }
    },
    serverType () {
      return this.form.fd.type
    },
    macAddrs () {
      const { nic_info = [] } = this.currentHost
      console.log(nic_info)
      return nic_info.filter(item => !item.wire_id)
    },
  },
  methods: {
    async handleValuesChange (vm, changedFields) {
      this.form.fd = {
        ...this.form.fd,
        ...changedFields,
      }
      await this.$nextTick()
      // if (changedFields.project) {
      //   this.projectChange()
      // }
      // if (changedFields.brand) {
      //   this.brandChange()
      // }
      // if (changedFields.guest_template_id) {
      //   this.templateChange()
      // }
      // if (changedFields.vpc || Object.keys(changedFields).indexOf('vpc') > -1) {
      //   this.vpcChange()
      // }
    },
    serverChange (data) {
      if (this.serverType === 'host') {
        this.currentHost = data
      } else {
        this.currentHost = {}
      }
    },
    handleCancel () {
      this.$router.push({
        name: 'TapService',
      })
    },
    async handleConfirm () {
      const manager = new this.$Manager('tap_services', 'v1')
      try {
        const values = await this.form.fc.validateFields()
        console.log(values)
        this.loading = true
        await manager.create({
          data: values,
        })
        this.handleCancel()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
