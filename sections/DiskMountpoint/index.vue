<template>
  <div class="d-flex">
    <a-form-item
      :wrapperCol="{ span: 24 }"
      class="mb-0 mr-1">
      <base-select
        :options="filetypeOpts"
        :item.sync="filetype"
        v-decorator="decorators.filetype"
        :select-props="{ allowClear: true, placeholder: '文件类型' }" />
    </a-form-item>
    <a-form-item class="mb-0" v-if="filetype !== 'swap'" :wrapperCol="{ span: 24 }">
      <a-input
        v-decorator="decorators.mountPath"
        placeholder="非系统目录" />
    </a-form-item>
  </div>
</template>

<script>
import { DISK_MOUNT_POINT_OPTIONS } from '@/constants/compute'

export default {
  name: 'SchedtagPolicy',
  props: {
    decorators: {
      type: Object,
      required: true,
      validator: val => val.filetype && val.mountPath,
    },
    schedtagParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      filetype: '',
      filetypeOpts: DISK_MOUNT_POINT_OPTIONS,
    }
  },
}
</script>
