<template>
  <div class="cloudregion-vpc-wrapper">
    <a-row :gutter="8">
      <a-col :span="12">
        <a-form-item>
          <a-select label-in-value v-decorator="decorator.cloudregion" :placeholder="$t('dictionary.region')" @change="regionChange">
            <a-select-option v-for="item in regionOpts" :key="item.id" :provider="item.provider">
              <span class="text-color-secondary">{{ $t('dictionary.region') }}: </span>{{ item.name }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
      <a-col :span="12">
        <a-form-item>
          <a-select label-in-value  v-decorator="decorator.vpc" allow-clear :placeholder="$t('common.text00046')" @change="vpcChange">
            <a-select-option v-for="item in vpcOpts" :key="item.id">
              <span class="text-color-secondary">{{ $t('dictionary.vpc') }}: </span>
              {{ item.account ? `${ item.account }/` : '' }}{{ item.name === 'Default' ? `${$t('common.common_91')}` : item.name }}{{ item.cidr_block ? `（${item.cidr_block}）` : '' }}
            </a-select-option>
          </a-select>
        </a-form-item>
      </a-col>
    </a-row>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { SERVER_TYPE } from '@Compute/constants'
import { Manager } from '@/utils/manager'

export default {
  name: 'CloudregionVpc',
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: obj => R.is(Array, obj.cloudregion) && R.is(Array, obj.vpc),
    },
    cloudregionParams: {
      type: Object,
      default: () => ({}),
    },
    vpcParams: {
      type: Object,
      default: () => ({}),
    },
  },
  inject: ['form'],
  data () {
    return {
      regionOpts: [],
      vpcOpts: [],
      regionLoading: false,
      vpcLoading: false,
      provider: '',
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  watch: {
    cloudregionParams: {
      deep: true,
      handler (val, oldVal) {
        console.log(val, oldVal)
        if (!R.equals(val, oldVal)) {
          this.fetchRegions()
        }
      },
    },
  },
  created () {
    this.cloudregionsM = new Manager('cloudregions')
    this.fetchRegions()
  },
  methods: {
    platformType () {
      return this.form.fc.getFieldValue('platform_type') || SERVER_TYPE.idc
    },
    regionChange (cloudregion, op) {
      if (op) {
        cloudregion = {
          ...cloudregion,
          provider: op.data.attrs.provider,
        }
      }
      this.fetchVpcs(cloudregion.key)
      this.provider = cloudregion.provider
      this.form.fc.setFieldsValue({
        cloudregion,
      })
      this.$emit('regionChange', { key: cloudregion.key, provider: cloudregion.provider })
    },
    vpcChange (vpc) {
      this.form.fc.setFieldsValue({
        vpc,
      })
      this.$emit('vpcChange', vpc.key)
    },
    fetchRegions () {
      this.regionLoading = true
      const params = {
        ...this.cloudregionParams,
      }
      if (this.cloudregionParams.project_domain) {
        params.project_domain = this.cloudregionParams.project_domain
        delete params.scope
      }
      this.cloudregionsM.list({ params })
        .then(({ data: { data = [] } }) => {
          this.regionLoading = false
          this.regionOpts = data
          if (this.regionOpts.length && this.form && this.form.fc) {
            const firstRegion = this.regionOpts[0]
            this.regionChange({ key: firstRegion.id, label: firstRegion.name, provider: firstRegion.provider })
          } else {
            this.form.fc.resetFields(['cloudregion', 'vpc'])
            this.$emit('regionChange')
          }
        })
        .catch(() => {
          this.regionLoading = false
        })
    },
    fetchVpcs (cloudregionId) {
      this.vpcLoading = true
      const params = Object.assign({}, this.vpcParams)
      this.vpcOpts = [] // 清空可用区
      this.cloudregionsM.getSpecific({ id: cloudregionId, spec: 'vpcs', params })
        .then(({ data: { data = [] } }) => {
          this.vpcLoading = false
          this.vpcOpts = data
          if (this.vpcOpts.length && this.form && this.form.fc) {
            const firstVpc = this.vpcOpts[0]
            this.vpcChange({ key: firstVpc.id, label: firstVpc.name })
          } else {
            this.form.fc.resetFields(['vpc'])
          }
        })
        .catch(() => {
          this.vpcLoading = false
        })
    },
  },
}
</script>
