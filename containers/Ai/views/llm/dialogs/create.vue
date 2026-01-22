<template>
  <base-dialog :width="900" @cancel="cancelDialog">
    <div slot="header">{{ params.type === 'edit' ? $t('table.action.modify') : $t('common.create') }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('common.name')">
          <a-input v-decorator="decorators.name" :placeholder="$t('common.tips.input', [$t('common.name')])" />
          <template v-slot:extra>
            <name-repeated res="llms" :name="form.fd.name" />
          </template>
        </a-form-item>
        <a-form-item :label="$t('aice.llm_sku')">
          <base-select
            v-decorator="decorators.llm_sku_id"
            resource="llm_skus"
            :select-props="{
              placeholder: $t('common.tips.select', [$t('aice.llm_sku')]),
            }"
            :params="llmSkuParams" />
        </a-form-item>
        <a-form-item :label="$t('aice.bandwidth_mb')">
          <a-input-number
            v-decorator="decorators.bandwidth_mb"
            :min="1"
            :max="10000"
            :step="1"
            :precision="0" />
        </a-form-item>
        <a-form-item :label="$t('dictionary.host')">
          <base-select
            v-decorator="decorators.prefer_host"
            resource="hosts"
            :select-props="{
              placeholder: $t('common.tips.select', [$t('dictionary.host')]),
            }"
            :params="hostParams" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_104')" class="mb-0">
          <server-network
            :form="form"
            :decorator="decorators.network"
            :network-list-params="networkParams"
            :schedtag-params="resourcesParams.schedtag"
            :network-resource-mapper="networkResourceMapper"
            :hiddenNetworkOptions="['schedtag']"
            defaultNetworkType="default"
            :hiddenAdd="true"
            :isDialog="true" />
        </a-form-item>
        <a-form-item :label="$t('compute.text_494')" :extra="$t('compute.text_495')">
          <a-switch v-decorator="decorators.auto_start" :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" />
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
import validateForm from '@/utils/validate'
import NameRepeated from '@/sections/NameRepeated'
import { NETWORK_OPTIONS_MAP } from '@Compute/constants'
import ServerNetwork from '@Compute/sections/ServerNetwork'

export default {
  name: 'LlmCreateDialog',
  provide () {
    return {
      form: this.form,
    }
  },
  components: {
    NameRepeated,
    ServerNetwork,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.$set(this.form.fd, key, values[key])
            })
          },
        }),
        fd: {},
        fi: {
          networkList: [],
          capability: {
            max_nic_count: 8,
          },
        },
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, validator: this.$validate('resourceName') },
            ],
          },
        ],
        llm_sku_id: [
          'llm_sku_id',
          {
            rules: [
              { required: true, message: this.$t('common.tips.select', [this.$t('aice.llm_sku')]) },
            ],
          },
        ],
        bandwidth_mb: [
          'bandwidth_mb',
          {
            initialValue: 30,
            rules: [
              { required: true, message: this.$t('common.tips.input', [this.$t('aice.bandwidth_mb')]) },
            ],
          },
        ],
        prefer_host: [
          'prefer_host',
          {
            rules: [
              { required: false, message: this.$t('common.tips.select', [this.$t('dictionary.host')]) },
            ],
          },
        ],
        network: {
          networkType: [
            'networkType',
            {
              initialValue: NETWORK_OPTIONS_MAP.default.key,
            },
          ],
          networkConfig: {
            vpcs: i => [
              `vpcs[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_194'),
                }],
              },
            ],
            networks: i => [
              `networks[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_217'),
                }],
              },
            ],
            ips: (i, networkData) => [
              `networkIps[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    validator: validateForm('IPv4'),
                  },
                ],
              },
            ],
            macs: (i, networkData) => [
              `networkMacs[${i}]`,
              {
                validateFirst: true,
                validateTrigger: ['blur', 'change'],
                rules: [
                  {
                    validator: validateForm('mac'),
                  },
                ],
              },
            ],
          },
          networkSchedtag: {
            schedtags: i => [
              `networkSchedtags[${i}]`,
              {
                validateTrigger: ['change', 'blur'],
                rules: [{
                  required: true,
                  message: this.$t('compute.text_123'),
                }],
              },
            ],
            policys: (i, networkData) => [
              `networkPolicys[${i}]`,
              {
                validateTrigger: ['blur', 'change'],
                rules: [{
                  required: true,
                  message: this.$t('common_256'),
                }],
              },
            ],
          },
        },
        auto_start: [
          'auto_start',
          {
            valuePropName: 'checked',
            initialValue: false,
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
    networkParams () {
      const ret = {
        scope: this.$store.getters.scope,
        limit: 20,
        usable: true,
        server_type: ['guest', 'hostlocal'],
        vpc: this.form.fd.vpc,
        host_type: 'hypervisor',
      }
      return ret
    },
    resourcesParams () {
      const schedtag = {
        limit: 1024,
        'filter.0': 'resource_type.equals(networks)',
      }
      return {
        schedtag,
      }
    },
    llmSkuParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
      }
    },
    hostParams () {
      return {
        limit: 20,
        scope: this.$store.getters.scope,
        host_status: 'online',
        host_type: 'container',
      }
    },
  },
  methods: {
    networkResourceMapper (list) {
      return list
    },
    async genNetworks (values) {
      let ret = [{ exit: false }]
      // 指定 IP 子网
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.manual.key) {
        ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            network: value,
          }
          if (this.form.fd.networkIps) {
            const address = this.form.fd.networkIps[key]
            if (address) {
              obj.address = address
            }
          }
          if (this.form.fd.networkMacs) {
            const mac = this.form.fd.networkMacs[key]
            if (mac) {
              obj.mac = mac
            }
          }
          ret.push(obj)
        }, values.networks)
      }
      // 指定 调度标签
      if (this.form.fd.networkType === NETWORK_OPTIONS_MAP.schedtag.key) {
        ret = []
        R.forEachObjIndexed((value, key) => {
          const obj = {
            id: value,
          }
          const strategy = this.form.fd.networkPolicys[key]
          if (strategy) {
            obj.strategy = strategy
          }
          ret.push({
            schedtags: [obj],
          })
        }, values.networkSchedtags)
      }
      return ret
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const networks = await this.genNetworks(values)
        const data = {
          generate_name: values.name,
          llm_sku_id: values.llm_sku_id,
          bandwidth_mb: values.bandwidth_mb,
          prefer_host: values.prefer_host,
          auto_start: values.auto_start,
          nets: networks,
        }
        await this.params.onManager('create', {
          managerArgs: { data },
        })
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
