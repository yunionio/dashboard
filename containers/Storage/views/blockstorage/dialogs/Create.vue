<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-alert type="warning" class="mb-4">
        <div slot="message">{{ $t('storage.local_storage.help_alert_message') }}<help-link :href="localStorageUrl">{{ $t('storage.local_storage.help_link') }}</help-link></div>
      </a-alert>
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('storage.text_55', [$t('dictionary.domain')])">
          <domain-select v-if="isAdminMode && l3PermissionEnable" v-decorator="decorators.project_domain" />
          <template v-else> {{userInfo.domain.name}} </template>
        </a-form-item>
        <a-form-item :label="$t('storage.text_47')">
          <cloudregion-zone
            :cloudregionParams="{cloud_env: 'onpremise'}"
            :decorator="decorators.regionZone"
            filterBrandResource="loadbalancer_engine" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_40')">
          <a-input :placeholder="$t('storage.text_56')" v-decorator="decorators.name" />
        </a-form-item>
        <a-form-item :label="$t('common.description')">
          <a-textarea :auto-size="{ minRows: 1, maxRows: 3 }" v-decorator="decorators.description" :placeholder="$t('common_367')" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_39')">
          <a-radio-group v-decorator="decorators.medium_type" buttonStyle="solid">
            <a-radio-button v-for="(v, k) in MEDIUM_TYPES" :key="v" :value="k">{{v}}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('storage.text_38')">
          <a-radio-group v-decorator="decorators.storage_type" buttonStyle="solid">
            <template v-for="(v, k) in STORAGE_TYPES">
              <a-radio-button v-if="storageTypes.indexOf(k) > -1" :key="k"  :value="k">{{v}}</a-radio-button>
            </template>
          </a-radio-group>
        </a-form-item>
        <form-items :storage_type="getFieldValue('storage_type')" />
        <a-form-item :label="$t('common.text00012')" class="mb-0">
          <tag
            v-decorator="decorators.__meta__" :allowNoValue="false" />
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
import { MEDIUM_TYPES, STORAGE_TYPES, formItemLayout } from '@Storage/constants/index.js'
import FormItems from '@Storage/views/blockstorage/components/FormItems'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import CloudregionZone from '@/sections/CloudregionZone'
import DomainSelect from '@/sections/DomainSelect'
import Tag from '@/sections/Tag'
import validateForm from '@/utils/validate'
import { genDocsUrl } from '@/utils/utils'

export default {
  name: 'BlockStorageCreateDialog',
  components: {
    CloudregionZone,
    FormItems,
    DomainSelect,
    Tag,
  },
  mixins: [DialogMixin, WindowsMixin],
  provide () {
    return {
      form: this.form,
    }
  },
  data () {
    return {
      MEDIUM_TYPES,
      STORAGE_TYPES,
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          storage_type: 'rbd',
        },
      },
      formItemLayout,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'l3PermissionEnable']),
    storageTypes () {
      return this.params.storageTypes || ['rbd', 'slvm', 'nfs', 'gpfs', 'local']
    },
    getFieldValue () {
      return this.form.fc.getFieldValue
    },
    decorators () {
      return {
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
        description: ['description'],
        regionZone: {
          cloudregion: [
            'cloudregion',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: this.$t('storage.text_57') },
              ],
            },
          ],
          zone: [
            'zone',
            {
              initialValue: { key: '', label: '' },
              rules: [
                { required: true, message: this.$t('storage.text_58') },
              ],
            },
          ],
        },
        medium_type: [
          'medium_type',
          {
            initialValue: 'rotate',
          },
        ],
        storage_type: [
          'storage_type',
          {
            initialValue: 'rbd',
          },
        ],
        project_domain: [
          'project_domain',
          {
            initialValue: this.userInfo.projectDomainId,
          },
        ],
        __meta__: [
          '__meta__',
          {
            rules: [
              { validator: validateForm('tagName') },
            ],
          },
        ],
      }
    },
    isLocalStorage () {
      return this.form.fd.storage_type === 'local'
    },
    localStorageUrl () {
      return genDocsUrl({
        scope: this.$store.getters.scope,
        isSysCE: this.$store.getters.isSysCE,
        cePath: 'guides/onpremise/storage/blockstorage/add-storage',
        eePath: 'web_ui/storage/blockstorage/add-storage/',
      })
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          // eslint-disable-next-line camelcase
          const { storage_type, zone, cloudregion, slvm_vg_name } = values
          const deleteRbdKeys = ['nfs_host', 'nfs_shared_dir']
          const deleteNfsKeys = ['rbd_mon_host', 'rbd_key', 'rbd_pool']
          const deleteSlvmKeys = [...deleteRbdKeys, ...deleteNfsKeys]
          const deleteKeys = {
            rbd: [...deleteRbdKeys, 'slvm_vg_name'],
            slvm: deleteSlvmKeys,
            nfs: [...deleteNfsKeys, 'slvm_vg_name'],
            gpfs: [...deleteRbdKeys, ...deleteNfsKeys, 'slvm_vg_name'],
          }
          if (zone) {
            values.zone = zone.key
          }
          if (cloudregion) {
            values.area = cloudregion.key
            delete values.cloudregion
          }
          if (slvm_vg_name) {
            values.lvmlockd = true
          }
          deleteKeys[storage_type].forEach(key => {
            delete values[key]
          })
          resolve(Object.assign({}, { capacity: 0 }, values))
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        const manager = new this.$Manager('storages', 'v2')
        await manager.create({ data: values })
        this.cancelDialog()
        this.params.refresh()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
