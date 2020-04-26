<template>
  <div>
    <a-form-item label="启用访问控制">
      <a-switch v-decorator="decorators.acl_status" @change="change" />
    </a-form-item>
    <template v-if="form.fc.getFieldValue('acl_status')">
      <a-form-item label="访问控制方式">
        <a-select v-decorator="decorators.acl_type">
          <a-select-option v-for="item in aclTypeOpts" :value="item.key" :key="item.key">{{ item.label }}</a-select-option>
        </a-select>
      </a-form-item>
      <a-form-item label="访问控制策略组">
        <base-select
          v-decorator="decorators.acl"
          resource="loadbalanceracls"
          show-sync
          :params="{ scope: $store.getters.scope, limit: 0 }"
          :select-props="{ placeholder: '请选择访问控制' }" />
      </a-form-item>
    </template>
  </div>
</template>

<script>
export default {
  name: 'LbAcl',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.acl_status,
    },
    aclTypeOpts: {
      type: Array,
      default: () => [
        { key: 'white', label: '白名单：允许特定IP访问负载均衡' },
        { key: 'black', label: '黑名单：禁止特定IP访问负载均衡' },
      ],
    },
    form: {
      type: Object,
      required: true,
      validator: val => val.fc,
    },
  },
  data () {
    return {
      acl_status: this.decorators.acl_status[1].initialValue,
    }
  },
  methods: {
    change (val) {
      this.acl_status = val
    },
  },
}
</script>
