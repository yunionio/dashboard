<template>
  <a-form-item :label="label" style="margin-bottom:0;" v-bind="formItemLayout">
    <a-row>
      <a-col :span="8">
        <a-form-item>
        CPU: <a-input-number v-decorator="decorators.cpu" :min="1" :precision="0" />{{$t('compute.text_167')}}</a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>{{$t('compute.text_168')}}<a-input-number v-decorator="decorators.memory" :min="1" :precision="0" /> G
        </a-form-item>
      </a-col>
      <a-col :span="8">
        <a-form-item>{{$t('compute.text_169')}}<a-input-number v-decorator="decorators.disk" :min="1" :precision="0" /> G
        </a-form-item>
      </a-col>
    </a-row>
  </a-form-item>
</template>

<script>
import { sizestr } from '@/utils/utils'
import i18n from '@/locales'

export default {
  name: 'ReserveResource',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      default: i18n.t('compute.text_170'),
    },
    data: {
      type: Array,
      default: () => {
        return []
      },
    },
    formItemLayout: {
      type: Object,
      default: () => {
        return {
          wrapperCol: {
            span: 18,
          },
          labelCol: {
            span: 6,
          },
        }
      },
    },
  },
  methods: {
    getResource (v) {
      const rs = v.reserved_resource_for_gpu || {}
      const count = v.isolated_device_count || 1
      const config = rs.reserved_cpu * count + 'C' + (rs.reserved_memory ? sizestr(rs.reserved_memory * count, 'M', 1024) : '') + (rs.reserved_storage ? sizestr(rs.reserved_storage * count, 'M', 1024) : '')
      return config
    },
  },
}
</script>

<style lang="less" scoped>
.info {
  margin-left: -124px;
  .title {
    font-size: 14px;
    font-weight: normal;
    color: rgba(0, 0, 0, 0.85);
  }
  .content {
    list-style: none;
  }
}
</style>
