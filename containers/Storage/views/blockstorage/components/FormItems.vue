<!-- 创建和修改属性都需要的 -->
<template>
  <div>
    <template v-if="storage_type === 'rbd'">
      <a-form-item label="Ceph Mon Host" v-if="!edit">
        <a-input :placeholder="$t('storage.text_19')" v-decorator="decorators.rbd_mon_host" />
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
        <a-input :placeholder="$t('storage.text_19')" v-decorator="decorators.nfs_host" />
      </a-form-item>
      <a-form-item label="NFS Shared Dir">
        <a-input :placeholder="$t('storage.text_22')" v-decorator="decorators.nfs_shared_dir" />
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
  },
  inject: ['form'],
  computed: {
    decorators () {
      const hostCheckValid = (rule, value, _callback) => {
        const pattern = /^(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))$/
        const ips = value.split(',')
        if (!value || value === '') {
          return _callback(new Error(this.$t('storage.text_23')))
        }
        ips.forEach((item) => {
          const [ip, dir] = item.split(':')
          if (!pattern.test(ip)) {
            return _callback(new Error(this.$t('storage.text_24')))
          } else {
            if (dir) {
              const reg = /^\/.+/
              if (!reg.test(dir)) {
                return _callback(new Error(this.$t('storage.text_24')))
              }
            }
          }
        })
        _callback()
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
            rules: [
              { required: true, message: this.$t('storage.text_26') },
              { validator: hostCheckValid },
            ],
          },
        ],
        rbd_key: [
          'rbd_key',
          {
            rules: [
            ],
          },
        ],
        rbd_pool: [
          'rbd_pool',
          {
            validateFirst: true,
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
            rules: [
              { required: true, message: this.$t('storage.text_29'), trigger: 'blur' },
              { validator: hostCheckValid, trigger: 'blur' },
            ],
          },
        ],
        nfs_shared_dir: [
          'nfs_shared_dir',
          {
            rules: [
              { required: true, message: this.$t('storage.text_30'), trigger: 'blur' },
            ],
          },
        ],
        slvm_vg_name: [
          'slvm_vg_name',
          {
            rules: [
              { required: true, message: this.$t('common.tips.input', ['SlvmVgName']), trigger: 'blur' }
            ]
          }
        ]
      }
    },
  },
}
</script>
