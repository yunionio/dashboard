<template>
  <div>
    <a-card hoverable>
      <a-form-item label="CPU" v-bind="formItemLayout">
        <a-input v-decorator="decorator.vcpu_count" type="number" addonAfter="核" />
      </a-form-item>
      <a-form-item label="内存" v-bind="formItemLayout">
        <a-input v-decorator="decorator.vmem_size" type="number" addonAfter="G" />
      </a-form-item>
      <a-form-item label="磁盘" v-bind="formItemLayout">
        <a-input v-decorator="decorator.disk" type="number" addonAfter="G" />
      </a-form-item>
    </a-card>
  </div>
</template>

<script>
// import * as R from 'ramda'
import { mapGetters } from 'vuex'
// import { Manager } from '@/utils/manager'

export default {
  name: 'ServerConfig',
  props: {
    decorator: {
      type: Object,
      required: true,
    },
  },
  inject: ['form'],
  data () {
    return {
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
    }
  },
  computed: mapGetters(['isAdminMode', 'scope', 'isDomainMode', 'userInfo', 'l3PermissionEnable']),
  created () {},
  methods: {},
}
</script>
