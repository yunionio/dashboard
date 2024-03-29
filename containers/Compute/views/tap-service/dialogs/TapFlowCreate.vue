<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.add_tap_flow')}}</div>
    <div slot="body">
      <a-form
        v-bind="formItemLayout"
        :form="form.fc">
        <a-form-item :label="$t('compute.text_228')">
          <a-input :placeholder="$t('validator.serverCreateName')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-input :placeholder="$t('scope.text_55')" v-decorator="decorators.description" />
        </a-form-item>
        <a-form-item :label="$t('compute.tap')">
          {{params.tapService.name}}
        </a-form-item>
        <a-form-item :label="$t('compute.tap_direction')">
          <a-radio-group v-decorator="decorators.direction">
            <a-radio-button value="BOTH">{{ $t('compute.direction_both') }}</a-radio-button>
            <a-radio-button value="IN">{{ $t('compute.direction_in') }}</a-radio-button>
            <a-radio-button value="OUT">{{ $t('compute.direction_out') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('compute.text_175')">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button value="vnic">{{ $t('compute.vnic') }}</a-radio-button>
            <a-radio-button value="vswitch">{{ $t('compute.vswitch') }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <template v-if="serverType === 'vswitch'">
          <a-form-item :label="$t('compute.text_111')">
            <base-select
                v-decorator="decorators.host_id"
                class="w-100"
                remote
                resource="hosts"
                version="v1"
                needParams
                :params="hostParams"
                isDefaultSelect
                :select-props="{ placeholder: $t('compute.text_148', [$t('compute.text_111')]) }"
                @update:item="hostChange" />
          </a-form-item>
          <a-form-item :label="$t('compute.text_844')">
            <base-select
                v-decorator="decorators.wire_id"
                class="w-100"
                :options="hostWires"
                idKey="wire_id"
                nameKey="wire"
                isDefaultSelect
                :select-props="{ placeholder: $t('compute.text_148', [$t('compute.text_844')]) }" />
          </a-form-item>
          <a-form-item :label="$t('compute.vlan_id')">
            <a-input-number :max="4095" :step="1" :min="0" v-decorator="decorators.vlan_id" />
          </a-form-item>
        </template>
        <template v-else>
          <a-form-item :label="$t('compute.text_91')">
            <base-select
                v-decorator="decorators.guest_id"
                class="w-100"
                remote
                resource="servers"
                version="v1"
                needParams
                :params="serverParams"
                isDefaultSelect
                :select-props="{ placeholder: $t('compute.text_148', [$t('compute.text_91')]) }"
                @update:item="serverChange" />
          </a-form-item>
          <a-form-item :label="$t('compute.vm_mac')">
            <base-select
                v-decorator="decorators.mac_addr"
                class="w-100"
                :options="vmMac"
                idKey="mac"
                nameKey="macLabel"
                isDefaultSelect
                :select-props="{ placeholder: $t('compute.text_148', [$t('compute.vm_mac')]) }" />
          </a-form-item>
        </template>
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
import validateForm from '@/utils/validate'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TapFlowCreateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: this.handleValuesChange,
        }),
        fd: {
          type: 'vnic',
        },
      },
      currentHost: {},
      currentServer: {},
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
        direction: [
          'direction',
          { initialValue: 'BOTH' },
        ],
        type: [
          'type',
          {
            initialValue: 'vnic',
          },
        ],
        host_id: [
          'host_id',
          {
            rules: [{ required: true, message: this.$t('compute.text_148', [this.$t('compute.text_111')]) }],
          },
        ],
        wire_id: [
          'wire_id',
          {
            rules: [{ required: true, message: this.$t('compute.text_148', [this.$t('compute.text_844')]) }],
          },
        ],
        vlan_id: ['vlan_id'],
        guest_id: [
          'guest_id',
          {
            rules: [{ required: true, message: this.$t('compute.text_148', [this.$t('compute.text_91')]) }],
          },
        ],
        mac_addr: [
          'mac_addr',
          {
            rules: [{ required: true, message: this.$t('compute.text_148', [this.$t('compute.vm_mac')]) }],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 18,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
    serverType () {
      return this.form.fd.type
    },
    hostWires () {
      const { nic_info = [] } = this.currentHost
      return nic_info.filter(item => item.wire_id)
    },
    vmMac () {
      const { nics = [] } = this.currentServer
      return nics.filter(item => item.mac).map(item => {
        return {
          ...item,
          macLabel: `${item.mac}${item.ip_addr ? ` (${item.ip_addr})` : ''}`,
        }
      })
    },
    hostParams () {
      const ret = {
        scope: this.scope,
        filter: 'hypervisor.notin(baremetal,container)',
        brand: 'OneCloud',
        limit: 20,
        system: this.isAdminMode,
      }
      const { type, target_id } = this.params.tapService
      if (type === 'host') {
        ret.filter = ['hypervisor.notin(baremetal,container)', `id.notin(${target_id})`]
      }
      return ret
    },
    serverParams () {
      const ret = {
        scope: this.scope,
        filter: 'hypervisor.notin(baremetal,container)',
        brand: 'OneCloud',
        limit: 20,
        system: this.isAdminMode,
      }
      const { type, target_id } = this.params.tapService
      if (type === 'guest') {
        ret.filter = ['hypervisor.notin(baremetal,container)', `id.notin(${target_id})`]
      }
      return ret
    },
  },
  created () {
    this.$m = new this.$Manager('tap_flows', 'v1')
  },
  methods: {
    async handleValuesChange (vm, changedFields) {
      this.form.fd = {
        ...this.form.fd,
        ...changedFields,
      }
      await this.$nextTick()
      if (changedFields.guest_id) {
        this.form.fc.setFieldsValue({
          mac_addr: '',
        })
      }
      if (changedFields.host_id) {
        if (!this.hostWires.some(item => item.wire_id === this.form.fd.wire_id)) {
          this.form.fc.setFieldsValue({
            wire_id: '',
          })
        }
      }
    },
    hostChange (data) {
      if (this.serverType === 'vswitch') {
        this.currentHost = data
      } else {
        this.currentHost = {}
      }
    },
    serverChange (data) {
      if (this.serverType === 'vnic') {
        this.currentServer = data
      } else {
        this.currentServer = {}
      }
    },
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
    doCreate (data) {
      return this.$m.create({
        data,
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        values.tap_id = this.params.tapService.id
        await this.doCreate(values)
        this.loading = false
        this.$bus.$emit('tap-service-refresh')
        this.params.success && this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
