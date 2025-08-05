<template>
  <div :class="wrapperClass" :style="wrapperStyle">
    <a-row class="d-flex">
      <a-form-item v-if="decorator.name">
        <a-input :addon-before="$t('network.text_21')" v-decorator="decorator.name" :placeholder="$t('network.text_21')" />
      </a-form-item>
      <a-form-item :class="{'ml-2': decorator.name}">
        <a-input :addon-before="$t('network.text_607')" v-decorator="decorator.startip" :placeholder="$t('common_161')" />
      </a-form-item>
      <a-form-item class="ml-2">
        <a-input :addon-before="$t('network.text_608')" v-decorator="decorator.endip" :placeholder="$t('common_162')" />
      </a-form-item>
      <a-form-item class="ml-2" style="width: 110px;">
        <a-select v-decorator="decorator.netmask" :placeholder="$t('network.text_595')" dropdownClassName="oc-select-dropdown">
          <a-select-option
            v-for="item of netMaskOptions"
            :key="item.key"
            :value="item.key">
            <span class="text-color-secondary option-prefix">{{$t('common_600')}}: </span>{{item.label}}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item class="ml-2">
        <a-input :addon-before="$t('network.text_610')" v-decorator="decorator.gateway" :placeholder="$t('common_163')" />
      </a-form-item>
      <a-form-item class="ml-2" style="width: 180px;">
        <a-input addon-before="VLAN ID" v-decorator="decorator.vlan" placeholder="VLAN ID" />
      </a-form-item>
    </a-row>
    <a-row class="d-flex">
      <a-form-item v-if="showV6" :class="{'ml-2': decorator.name}">
        <a-input :addon-before="$t('network.ipv6.ip_start.label')" v-decorator="decorator.startip6" :placeholder="$t('network.ipv6.ip_start.label')" />
      </a-form-item>
      <a-form-item v-if="showV6" class="ml-2">
        <a-input :addon-before="$t('network.ipv6.ip_end.label')" v-decorator="decorator.endip6" :placeholder="$t('network.ipv6.ip_end.label')" />
      </a-form-item>
      <a-form-item v-if="showV6" class="ml-2" style="width: 110px;">
        <a-select v-decorator="decorator.netmask6" :placeholder="$t('network.ipv6.ip_mask.label')" dropdownClassName="oc-select-dropdown">
          <a-select-option
            v-for="item of net6MaskOptions"
            :key="item.key"
            :value="item.key">
            <span class="text-color-secondary option-prefix">{{$t('common_600')}}: </span>{{item.label}}
          </a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item v-if="showV6" class="ml-2">
        <a-input :addon-before="$t('network.ipv6.gateway.label')" v-decorator="decorator.gateway6" :placeholder="$t('network.ipv6.gateway.label')" />
      </a-form-item>
      <a-button type="link" class="mt-1" @click="() => (showV6 = !showV6)" v-if="!isButtonHide">{{ showV6 ? $t('common.hide_ipv6') : $t('common.config_ipv6') }}</a-button>
    </a-row>
  </div>
</template>

<script>
export default {
  name: 'IpSubnet',
  props: {
    decorator: {
      type: Object,
      required: true,
      validator: val => {
        const fields = ['startip', 'endip', 'netmask', 'gateway', 'startip6', 'endip6', 'netmask6', 'gateway6', 'vlan']
        return fields.every(item => val.hasOwnProperty(item))
      },
    },
    showIpv6: {
      type: Boolean,
      default: false,
    },
    isButtonHide: {
      type: Boolean,
      default: false,
    },
  },
  data () {
    return {
      netMaskOptions: [
        { label: '16', key: '16' },
        { label: '17', key: '17' },
        { label: '18', key: '18' },
        { label: '19', key: '19' },
        { label: '20', key: '20' },
        { label: '21', key: '21' },
        { label: '22', key: '22' },
        { label: '23', key: '23' },
        { label: '24', key: '24' },
        { label: '25', key: '25' },
        { label: '26', key: '26' },
        { label: '27', key: '27' },
        { label: '28', key: '28' },
        { label: '29', key: '29' },
        { label: '30', key: '30' },
      ],
      net6MaskOptions: [
        { label: '64', key: '64' },
        { label: '72', key: '72' },
        { label: '80', key: '80' },
        { label: '88', key: '88' },
        { label: '96', key: '96' },
        { label: '104', key: '104' },
        { label: '112', key: '112' },
        { label: '120', key: '120' },
        { label: '124', key: '124' },
      ],
      showV6: this.showIpv6,
    }
  },
  computed: {
    wrapperClass () {
      return 'pt-4 pl-4 pr-5 mb-2'
    },
    wrapperStyle () {
      return {
        border: '1px solid #d9d9d9',
      }
    },
  },
}
</script>
