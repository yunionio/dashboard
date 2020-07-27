<template>
  <div>
    <a-alert :showIcon="false" banner>
      <div slot="message">{{$t('cloudenv.text_225')}}<div style="margin-left: 68px">{{$t('cloudenv.text_226')}}</div>
      </div>
   </a-alert>
    <a-form class="mt-3" :form="form.fc">
      <a-divider orientation="left">{{$t('cloudenv.text_227')}}</a-divider>
      <a-form-item :label="$t('cloudenv.text_228')" v-bind="formLayout">
        <a-switch :checkedChildren="$t('cloudenv.text_84')" :unCheckedChildren="$t('cloudenv.text_85')" v-model="configNetwork" />
      </a-form-item>
      <template v-if="configNetwork">
        <a-form-item :label="$t('cloudenv.text_184')" v-bind="formLayout">
          <a-input v-decorator="decorators.name" :placeholder="$t('validator.resourceName')" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_229')" class="mb-0" v-bind="formLayout">
          <cloudregion-vpc-wire
            :vpc-params="params.vpc"
            :cloudregion-params="params.cloudregion"
            :wire-params="params.wire"
            :vpcMapper="vpcMapper"
            :decorator="decorators.cloudregionVpcWire" />
        </a-form-item>
        <a-form-item v-bind="formLayout">
          <span slot="label">{{$t('cloudenv.text_181')}}<help-tooltip class="ml-1" name="networkIpSubnets" /></span>
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
  const msg = this.$t('cloudenv.text_230')
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
              { required: true, message: this.$t('cloudenv.text_190') },
              { validator: this.$validate('resourceName') },
            ],
          },
        ],
        cloudregionVpcWire: {
          cloudregion: [
            'cloudregion',
            {
              rules: [
                { validator: isRequired(), message: this.$t('cloudenv.text_231') },
              ],
            },
          ],
          vpc: [
            'vpc',
            {
              rules: [
                { validator: isRequired(), message: this.$t('cloudenv.text_232') },
              ],
            },
          ],
          wire: [
            'wire',
            {
              rules: [
                { validator: isRequired(), message: this.$t('cloudenv.text_233') },
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
                { required: true, message: this.$t('cloudenv.text_191') },
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
                { required: true, message: this.$t('cloudenv.text_192') },
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
                { required: true, message: this.$t('cloudenv.text_234') },
              ],
            },
          ],
          gateway: i => [
            `gateway[${i}]`,
            {
              validateTrigger: ['change', 'blur'],
              validateFirst: true,
              rules: [
                { required: true, message: this.$t('cloudenv.text_235') },
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
