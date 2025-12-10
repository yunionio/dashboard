<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('storage.text_55', [$t('dictionary.domain')])">
          <domain-select v-if="isAdminMode && l3PermissionEnable" v-decorator="decorators.project_domain" />
          <template v-else> {{userInfo.domain.name}} </template>
        </a-form-item>
        <a-form-item :label="$t('common.name')">
          <a-input
            v-decorator="decorators.name"
            :placeholder="$t('common.tips.input', [$t('common.name')])" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-input
            v-decorator="decorators.description"
            :placeholder="$t('common.tips.optional_input', [$t('common.description')])" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_38')">
          <a-radio-group v-decorator="decorators.storage_type" @change="onStorageTypeChange">
              <a-radio-button v-for="obj in STORAGE_TYPES" :key="obj.key" :value="obj.key">{{ obj.value }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="NFS Host" v-if="isNfs">
          <a-input :placeholder="$t('storage.host.input.place_holder')" v-decorator="decorators.nfs_host" />
        </a-form-item>
        <a-form-item label="NFS Shared Dir" v-if="isNfs">
          <a-input :placeholder="$t('storage.path.input.place_holder')" v-decorator="decorators.nfs_shared_dir" />
        </a-form-item>
        <a-form-item label="Bucket URL" v-if="isObjectStorage">
          <a-input :placeholder="$t('storage.url.input.place_holder')" v-decorator="decorators.object_bucket_url" />
        </a-form-item>
        <a-form-item label="Access Key" v-if="isObjectStorage">
          <a-input :placeholder="$t('storage.access_key.input.place_holder')" v-decorator="decorators.object_access_key" />
        </a-form-item>
        <a-form-item label="Secret" v-if="isObjectStorage">
          <a-input-password :placeholder="$t('storage.access_secret.input.place_holder')" v-decorator="decorators.object_secret" />
        </a-form-item>
        <a-form-item label="Signing Version" v-if="isObjectStorage">
          <a-radio-group v-decorator="decorators.object_sign_ver">
            <a-radio-button value="">{{ $t('common_712') }}</a-radio-button>
            <a-radio-button value="v2">V2</a-radio-button>
            <a-radio-button value="v4">V4</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('storage.capacity')" v-show="false">
          <a-input-number :min="0" v-decorator="decorators.capacity_mb" /> GB
        </a-form-item>
        <a-form-item label="Public Bucket URL" v-if="isObjectStorage">
          <a-input :placeholder="$t('storage.url.input.place_holder')" v-decorator="decorators.object_bucket_url_ext" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import DomainSelect from '@/sections/DomainSelect'

export default {
  name: 'BackupStorageCreateDialog',
  components: {
    DomainSelect,
  },
  mixins: [WindowsMixin, DialogMixin],
  data () {
    return {
      loading: false,
      STORAGE_TYPES: [
        {
          key: 'nfs',
          value: 'NFS',
        },
        {
          key: 'object',
          value: this.$t('storage.object_storage'),
        },
      ],
      form: {
        fc: this.$form.createForm(this),
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      storage_type: 'nfs',
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'l3PermissionEnable']),
    decorators () {
      const hostCheckValid = (rule, value, _callback) => {
        const pattern = /^(?=(\b|\D))(((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))\.){3}((\d{1,2})|(1\d{1,2})|(2[0-4]\d)|(25[0-5]))(?=(\b|\D))$/
        const ips = value.split(',')
        if (!value || value === '') {
          return _callback(new Error(this.$t('storage.nfs_host_check_reqiure')))
        }
        ips.forEach((item) => {
          const [ip, dir] = item.split(':')
          if (!pattern.test(ip)) {
            return _callback(new Error(this.$t('storage.nfs_host_check_valid')))
          } else {
            if (dir) {
              const reg = /^\/.+/
              if (!reg.test(dir)) {
                return _callback(new Error(this.$t('storage.nfs_host_check_valid')))
              }
            }
          }
        })
        _callback()
      }

      return {
        project_domain: [
          'project_domain',
          {
            initialValue: this.userInfo.projectDomainId,
          },
        ],
        name: [
          'name',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('storage.text_56') },
              { validator: this.$validate('blockStorageName') },
            ],
          },
        ],
        description: [
          'description',
        ],
        storage_type: [
          'storage_type',
          {
            initialValue: 'nfs',
          },
        ],
        nfs_host: [
          'nfs_host',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('storage.nfs_host.validate.prompt'), trigger: 'blur' },
              { validator: hostCheckValid, trigger: 'blur' },
            ],
          },
        ],
        nfs_shared_dir: [
          'nfs_shared_dir',
          {
            rules: [
              { required: true, message: this.$t('storage.nfs_shared_dir.validate.prompt'), trigger: 'blur' },
            ],
          },
        ],
        object_bucket_url: [
          'object_bucket_url',
          {
            validateFirst: true,
            rules: [
              { required: true, message: this.$t('storage.object_bucket_url.validate.prompt'), trigger: 'blur' },
            ],
          },
        ],
        object_access_key: [
          'object_access_key',
          {
            rules: [
              { required: true, message: this.$t('storage.object_access_key.validate.prompt'), trigger: 'blur' },
            ],
          },
        ],
        object_secret: [
          'object_secret',
          {
            rules: [
              { required: true, message: this.$t('storage.object_secret.validate.prompt'), trigger: 'blur' },
            ],
          },
        ],
        object_sign_ver: [
          'object_sign_ver',
          {
            initialValue: '',
          },
        ],
        capacity_mb: [
          'capacity_mb',
          {
            initialValue: 0,
          },
        ],
        object_bucket_url_ext: [
          'object_bucket_url_ext',
          {
            validateFirst: true,
            rules: [
              { required: false, message: this.$t('storage.object_bucket_url_ext.validate.prompt'), trigger: 'blur' },
            ],
          },
        ],
      }
    },
    isNfs () {
      return this.storage_type === 'nfs'
    },
    isObjectStorage () {
      return this.storage_type === 'object'
    },
  },
  methods: {
    async handleConfirm () {
      const manager = new this.$Manager('backupstorages')
      try {
        const values = await this.form.fc.validateFields(Object.keys(this.decorators))
        await manager.create({ data: { ...values, capacity_mb: values.capacity_mb * 1024 } })
        this.cancelDialog()
        this.params.refresh && this.params.refresh()
      } catch (error) {
        throw error
      }
    },
    onStorageTypeChange (e) {
      console.log(e, e.target.value)
      this.storage_type = e.target.value
    },
  },
}
</script>
