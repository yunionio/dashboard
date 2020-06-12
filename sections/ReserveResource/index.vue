<template>
  <a-form-item :label="label" style="margin-bottom:0;" v-bind="formItemLayout">
      <a-row>
        <a-col :span="8">
          <a-form-item>
          CPU: <a-input-number v-decorator="decorators.cpu" :min="1" /> 核
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item>
          内存: <a-input-number v-decorator="decorators.memory" :min="1" /> G
          </a-form-item>
        </a-col>
        <a-col :span="8">
          <a-form-item>
          硬盘: <a-input-number v-decorator="decorators.disk" :min="1" /> G
          </a-form-item>
        </a-col>
      </a-row>
      <div class="info" v-if="isShowData">
        <h3 class="title">每台宿主机总预留资源情况如下:</h3>
        <ul class="content">
          <li v-for="v in data" :key="v.id">宿主机{{v.name}}: {{getResource(v)}}</li>
        </ul>
      </div>
  </a-form-item>
</template>

<script>
import { sizestr } from '@/utils/utils'

export default {
  name: 'ReserveResource',
  props: {
    decorators: {
      type: Object,
      required: true,
    },
    label: {
      type: String,
      default: '预留宿主机资源',
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
            span: 20,
          },
          labelCol: {
            span: 4,
          },
        }
      },
    },
  },
  computed: {
    isShowData () {
      return this.data.length > 0
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

<style lang="scss" scoped>
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
