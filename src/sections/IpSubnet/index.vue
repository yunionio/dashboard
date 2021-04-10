<template>
  <div class="d-flex">
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
        const fields = ['startip', 'endip', 'netmask', 'gateway', 'vlan']
        return fields.every(item => val.hasOwnProperty(item))
      },
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
    }
  },
}
</script>
