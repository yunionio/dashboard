<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('storage.text_55', [$t('dictionary.domain')])">
          <domain-select v-if="isAdminMode && l3PermissionEnable" v-decorator="decorators.project_domain" />
          <template v-else> {{userInfo.domain.name}} </template>
        </a-form-item>
        <a-form-item :label="$t('storage.text_47')">
          <cloudregion-zone
            :cloudregionParams="{cloud_env: 'onpremise'}"
            :decorator="decorators.regionZone" />
        </a-form-item>
        <a-form-item :label="$t('storage.text_40')">
          <a-input :placeholder="$t('storage.text_56')" v-decorator="decorators.name" />
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

export default {
  name: 'BlockStorageCreateDialog',
  components: {
    CloudregionZone,
    FormItems,
    DomainSelect,
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
        fc: this.$form.createForm(this),
      },
      formItemLayout,
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo', 'l3PermissionEnable']),
    storageTypes () {
      return this.params.storageTypes || ['rbd', 'nfs', 'gpfs']
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
              { validator: this.$validate('snapshotName') },
            ],
          },
        ],
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
      }
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (err) return reject(err)
          // eslint-disable-next-line camelcase
          const { storage_type, zone, cloudregion } = values
          const deleteRbdKeys = ['nfs_host', 'nfs_shared_dir']
          const deleteNfsKeys = ['rbd_mon_host', 'rbd_key', 'rbd_pool']
          const deleteKeys = {
            rbd: deleteRbdKeys,
            nfs: deleteNfsKeys,
            gpfs: [...deleteRbdKeys, ...deleteNfsKeys],
          }
          if (zone) {
            values.zone = zone.key
          }
          if (cloudregion) {
            values.area = cloudregion.key
            delete values.cloudregion
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
