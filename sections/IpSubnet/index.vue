<template>
  <a-form-item :labelCol="labelCol" :wrapperCol="wrapperCol" :label="label" :required="isRequired">
    <a-row :gutter="8">
      <a-col :span="8">
        <a-form-item
          :wrapperCol="{ span: 24 }"
          class="mb-0 mr-1">
          <base-select
            class="w-100"
            v-decorator="decorator.vpc"
            :resource="vpcResource"
            remote
            :label-format="vpcLabelFormat"
            :isDefaultSelect="true"
            :need-params="true"
            :params="vpcParmasConcat"
            :mapper="vpcResourceMapper"
            :item.sync="selectedVpc"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_194') }" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item
          :wrapperCol="{ span: 24 }"
          class="mb-0 mr-1">
          <base-select
            class="w-100"
            v-decorator="decorator.network"
            resource="networks"
            remote
            :need-params="true"
            :isDefaultSelect="true"
            :params="networkParamsConcat"
            :mapper="networkResourceMapper"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_195') }" />
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-button v-if="!this.ipShow" type="link" class="mr-1 mt-1" @click="triggerShowIp">{{$t('compute.text_198')}}</a-button>
        <a-row v-else>
          <a-col :span="21">
            <a-form-item class="mb-0" :wrapperCol="{ span: 24 }">
              <a-input
                :placeholder="$t('compute.text_197')"
                v-decorator="decorator.ip_addr" />
            </a-form-item>
          </a-col>
          <a-col :span="3">
            <a-button type="link" class="mt-1" @click="triggerShowIp">{{$t('compute.text_135')}}</a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
  </a-form-item>
</template>

<script>
import i18n from '@/locales'

export default {
  name: 'IpSubnet',
  inject: ['form'],
  props: {
    labelCol: {
      type: Object,
      default: () => {
        return {
          span: 24,
        }
      },
    },
    wrapperCol: {
      type: Object,
      default: () => {
        return {
          span: 24,
        }
      },
    },
    label: {
      type: String,
      default: i18n.t('dictionary.region'),
    },
    isRequired: {
      type: Boolean,
      default: false,
    },
    decorator: {
      type: Object,
      required: true,
    },
    networkParams: {
      type: Object,
    },
    networkResourceMapper: {
      type: Function,
      default: (data) => { return data },
    },
    vpcParams: {
      type: Object,
    },
    vpcResource: {
      type: String,
      default: 'vpcs', // 还可能是这样的resource cloudregions/{region_id}/vpcs
    },
    vpcResourceMapper: {
      type: Function,
      default: data => { return data },
    },
  },
  data () {
    return {
      ipShow: false,
      selectedVpc: {},
    }
  },
  computed: {
    vpcParmasConcat () {
      return {
        limit: 0,
        show_emulated: true,
        ...this.vpcParams,
      }
    },
    networkParamsConcat () {
      return {
        vpc: this.selectedVpc.id,
        usable: true,
        ...this.networkParams,
      }
    },
  },
  methods: {
    triggerShowIp () {
      this.ipShow = !this.ipShow
    },
    vpcLabelFormat (item) {
      if (!item.cidr_block) return item.name
      return `${item.name}（${item.cidr_block}）`
    },
  },
}
</script>
