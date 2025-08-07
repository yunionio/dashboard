<!-- 创建和修改属性都需要的 -->
<template>
  <div>
    <template v-if="storage_type === 'rbd'">
      <a-form-item label="Ceph Mon Host" v-if="!edit">
        <a-input :placeholder="$t('storage.host.input.place_holder')" v-decorator="decorators.rbd_mon_host" />
      </a-form-item>
      <a-form-item label="Ceph Pool" v-if="!edit">
          <a-input :placeholder="$t('storage.text_21')" v-decorator="decorators.rbd_pool" />
      </a-form-item>
      <a-form-item label="Ceph Key">
        <a-input :placeholder="$t('storage.text_20')" v-decorator="decorators.rbd_key" />
      </a-form-item>
    </template>
    <template v-if="storage_type === 'nfs'">
      <a-form-item label="NFS Host">
        <a-input :placeholder="$t('storage.host.input.place_holder')" v-decorator="decorators.nfs_host" />
      </a-form-item>
      <a-form-item label="NFS Shared Dir">
        <a-input :placeholder="$t('storage.path.input.place_holder')" v-decorator="decorators.nfs_shared_dir" />
      </a-form-item>
    </template>
    <template v-if="storage_type === 'slvm'">
      <a-form-item label="SlvmVgName">
        <a-input :placeholder="$t('common.tips.input', ['SlvmVgName'])" v-decorator="decorators.slvm_vg_name" />
      </a-form-item>
    </template>
  </div>
</template>

<script>
import { REGEXP } from '@/utils/validate'

export default {
  name: 'BlockStorageFormItems',
  props: {
    storage_type: {
      type: String,
    },
    edit: {
      type: Boolean,
      default: false,
    },
    editData: {
      type: Object,
    },
  },
  inject: ['form'],
  computed: {
    decorators () {
      const hostCheckValid = (rule, value, _callback) => {
        let isValid = true
        if (!value || value === '') isValid = false
        const parts = value.split(',')
        if (parts.some(part => {
          const trimmedPart = part.trim()
          return !REGEXP.IPv4.regexp.test(trimmedPart) && !REGEXP.IPv6.regexp.test(trimmedPart)
        })) {
          isValid = false
        }
        return isValid ? _callback() : _callback(new Error(this.$t('storage.host.input.place_holder')))
      }
      const commonCheckValid = (name) => {
        return (rule, value, _callback) => {
          const pattern = /^[+=./a-zA-Z0-9_-]+$/
          if (!value || value === '') {
            return _callback(new Error(this.$t('storage.text_25', [name])))
          } else if (!pattern.test(value)) {
            return _callback(new Error(this.$t('storage.text_25', [name])))
          } else {
            _callback()
          }
        }
      }
      return {
        rbd_mon_host: [
          'rbd_mon_host',
          {
            validateFirst: true,
            initialValue: this.editData?.storage_conf?.mon_host || '',
            rules: [
              { required: true, validator: hostCheckValid, trigger: 'blur' },
            ],
          },
        ],
        rbd_key: [
          'rbd_key',
          {
            initialValue: this.editData?.storage_conf?.key || '',
            rules: [
            ],
          },
        ],
        rbd_pool: [
          'rbd_pool',
          {
            validateFirst: true,
            initialValue: this.editData?.storage_conf?.pool || '',
            rules: [
              { required: true, message: this.$t('storage.text_28'), trigger: 'blur' },
              { validator: commonCheckValid('Ceph Pool') },
            ],
          },
        ],
        nfs_host: [
          'nfs_host',
          {
            validateFirst: true,
            initialValue: this.editData?.storage_conf?.nfs_host || '',
            rules: [
              { required: true, validator: hostCheckValid, trigger: 'blur' },
            ],
          },
        ],
        nfs_shared_dir: [
          'nfs_shared_dir',
          {
            initialValue: this.editData?.storage_conf?.nfs_shared_dir || '',
            rules: [
              { required: true, message: this.$t('storage.nfs_shared_dir.validate.prompt'), trigger: 'blur' },
            ],
          },
        ],
        slvm_vg_name: [
          'slvm_vg_name',
          {
            initialValue: this.editData?.storage_conf?.slvm_vg_name || '',
            rules: [
              { required: true, message: this.$t('common.tips.input', ['SlvmVgName']), trigger: 'blur' },
            ],
          },
        ],
      }
    },
  },
}
</script>
