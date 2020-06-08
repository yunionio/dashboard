<!-- 创建和修改属性都需要的 -->
<template>
  <div>
    <template v-if="storage_type === 'rbd'">
      <a-form-item label="Ceph Mon Host" v-if="!edit">
        <a-input placeholder="例如: 192.168.1.1,192.168.1.2" v-decorator="decorators.rbd_mon_host" />
      </a-form-item>
      <a-form-item label="Ceph Key">
        <a-input placeholder="例如：AQCP4L1aORs8HRAAdcVS2y2R1oERNa+3xyacTA==" v-decorator="decorators.rbd_key" />
      </a-form-item>
      <a-form-item label="Ceph Pool" v-if="!edit">
          <a-input placeholder="请输入存储池名称" v-decorator="decorators.rbd_pool" />
      </a-form-item>
    </template>
    <template v-if="storage_type === 'nfs'">
      <a-form-item label="NFS Host">
        <a-input placeholder="例如: 192.168.1.1,192.168.1.2" v-decorator="decorators.nfs_host" />
      </a-form-item>
      <a-form-item label="NFS Shared Dir">
        <a-input placeholder="例如：/nfs_root/" v-decorator="decorators.nfs_shared_dir" />
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
          return _callback(new Error('必须输入Ceph Mon Host'))
        }
        ips.forEach((item) => {
          const [ip, dir] = item.split(':')
          if (!pattern.test(ip)) {
            return _callback(new Error('请输入合法的Ceph Mon Host，例如: 192.168.1.1,192.168.1.2'))
          } else {
            if (dir) {
              const reg = /^\/.+/
              if (!reg.test(dir)) {
                return _callback(new Error('请输入合法的Ceph Mon Host，例如: 192.168.1.1,192.168.1.2'))
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
            return _callback(new Error(`必须指定${name}`))
          } else if (!pattern.test(value)) {
            return _callback(new Error(`必须指定${name}`))
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
              { required: true, message: '请输入Ceph Mon Host' },
              { validator: hostCheckValid },
            ],
          },
        ],
        rbd_key: [
          'rbd_key',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '必须指定Rbd Key', trigger: 'blur' },
              { validator: commonCheckValid('Rbd Key') },
            ],
          },

        ],
        rbd_pool: [
          'rbd_pool',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '必须指定Ceph Pool', trigger: 'blur' },
              { validator: commonCheckValid('Ceph Pool') },
            ],
          },
        ],
        nfs_host: [
          'nfs_host',
          {
            validateFirst: true,
            rules: [
              { required: true, message: '必须指定NFS Host', trigger: 'blur' },
              { validator: hostCheckValid, trigger: 'blur' },
            ],
          },
        ],
        nfs_shared_dir: [
          'nfs_shared_dir',
          {
            rules: [
              { required: true, message: '必须指定NFS Shared Dir', trigger: 'blur' },
            ],
          },
        ],
      }
    },
  },
}
</script>
