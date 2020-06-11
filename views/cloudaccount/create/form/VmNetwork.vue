<template>
  <div>
    asdasd
    <a-alert :showIcon="false" banner>
      <div slot="message">
        注意事项：对接VMware账号需保证本地IP子网包含该vCenter下所有宿主机的IP，若无对应IP子网则无法使用和同步该宿主机下的资源。
        <div style="margin-left: 68px">您可在下方新建缺失的IP子网，无需新建关闭下方配置IP子网开关即可</div>
      </div>
   </a-alert>
    <a-form class="mt-3" :form="form.fc">
      <a-divider orientation="left">基础配置</a-divider>
      <a-form-item label="配置IP子网" v-bind="formLayout">
        <a-switch checkedChildren="开" unCheckedChildren="关" v-model="configNetwork" />
      </a-form-item>
      <template v-if="configNetwork">
        <a-form-item label="子网名称" v-bind="formLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item label="二层网络" class="mb-0" v-bind="formLayout">
          <cloudregion-vpc-wire
            :vpc-params="params.vpc"
            :cloudregion-params="params.cloudregion"
            :wire-params="params.wire"
            :vpcMapper="vpcMapper"
            :decorator="decorators.cloudregionVpcWire" />
        </a-form-item>
        <a-form-item v-bind="formLayout">
          <span slot="label">IP子网<help-tooltip class="ml-1" name="networkIpSubnets" /></span>
          <ip-subnets :decorator="decorators.ipSubnets" />
        </a-form-item>
      </template>
    </a-form>
  </div>
</template>

<script>
import createMixin from './components/createMixin'
import IpSubnets from './components/IpSubnets'
import CloudregionVpcWire from '@/sections/CloudregionVpcWire'
import { isRequired } from '@/utils/validate'

function validateGateway (rule, value, callback) {
  // 只需要查看是否是以 0 结尾
  const ipItems = value.split('.')
  const msg = '网关不能以0结尾'
  if (ipItems[ipItems.length - 1] === '0') {
    callback(msg)
  } else {
    callback()
  }
}

export default {
  name: 'VmNetworkCreate',
  components: {
    CloudregionVpcWire,
    IpSubnets,
  },
  mixins: [createMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      configNetwork: true,
      decorators: {
        name: [
          'name',
          {
            validateTrigger: ['change', 'blur'],
            validateFirst: true,
            rules: [
              { required: true, message: '请输入名称' },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        cloudregionVpcWire: {
          cloudregion: [
            'cloudregion',
            {
              rules: [
                { validator: isRequired(), message: '请选择区域' },
              ],
            },
          ],
          vpc: [
            'vpc',
            {
              rules: [
                { validator: isRequired(), message: '请选择VPC' },
              ],
            },
          ],
          wire: [
            'wire',
            {
              rules: [
                { validator: isRequired(), message: '请选择二层网络' },
              ],
            },
          ],
        },
        ipSubnets: {
          startip: i => [
            `startip[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: '请输入起始IP' },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
          endip: i => [
            `endip[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: '请输入结束IP' },
                { validator: this.$validate('IPv4') },
              ],
            },
          ],
          netmask: i => [
            `netmask[${i}]`,
            {
              initialValue: '24',
              validateTrigger: ['change', 'blur'],
              rules: [
                { required: true, message: '请选择子网掩码' },
              ],
            },
          ],
          gateway: i => [
            `gateway[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: '请输入默认网关' },
                { validator: this.$validate('IPv4') },
                { validator: validateGateway },
              ],
            },
          ],
          vlan: i => [
            `vlan[${i}]`,
          ],
        },
      },
      params: {
        cloudregion: {
          scope: this.$store.getters.scope,
          limit: 0,
          is_on_premise: true,
        },
        vpc: {
          scope: this.$store.getters.scope,
          limit: 0,
        },
        wire: {
          scope: this.$store.getters.scope,
        },
      },
      keepAliveFields: true,
    }
  },
  methods: {
    vpcMapper (list) {
      return list.filter(val => val.id === 'default')
    },
  },
}
</script>
