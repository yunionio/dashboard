<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="$t('dictionary.blockstorage')" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <form-items :storage_type="storage_type" :edit="true" :editData="editData" />
         <!-- <a-form-item :label="$t('storage.text_60')" v-if="params.data[0].brand.toLowerCase() !== 'zstack'">
          <a-input-number :step="0.1" v-decorator="decorators.commit_bound" :min="0" />
        </a-form-item> -->
        <a-form-item :label="$t('storage.text_39')">
          <a-select v-decorator="decorators.medium_type" style="width: 200px">
            <a-select-option v-for="(val, key) in MEDIUM_TYPES"  :key="key" :value="key">{{val}}</a-select-option>
          </a-select>
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
import { formItemLayout, MEDIUM_TYPES } from '@Storage/constants/index.js'
import FormItems from '@Storage/views/blockstorage/components/FormItems'
import { getCopyWithContentTableColumn } from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BlockStorageUpdateStorageDialog',
  components: {
    FormItems,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      MEDIUM_TYPES,
      loading: false,
      formItemLayout,
      form: {
        fc: this.$form.createForm(this),
      },
      columns: [
        getCopyWithContentTableColumn(),
        {
          field: 'medium_type',
          title: this.$t('storage.text_39'),
          formatter: ({ row }) => {
            return MEDIUM_TYPES[row.medium_type] || row.medium_type
          },
        },
      ],
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    editData () {
      if (this.params.data && this.params.data.length > 0) {
        return this.params.data[0]
      }
      return undefined
    },
    storage_type () {
      if (this.params.data && this.params.data.length > 0) {
        return this.params.data[0].storage_type
      }
      return undefined
    },
    decorators () {
      return {
        commit_bound: [
          'commit_bound',
          {
            initialValue: this.params.data[0].commit_bound || 1,
            rules: [
              { required: true, message: this.$t('storage.text_61') },
            ],
          },
        ],
        medium_type: [
          'medium_type',
          {
            initialValue: this.params.data[0].medium_type,
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
          resolve(values)
        })
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        if (values.commit_bound) {
          values.cmtbound = values.commit_bound
          Reflect.deleteProperty(values, 'commit_bound')
        }
        const data = {}
        Object.keys(values).map(key => {
          if (this.storage_type === 'rbd') {
            if (key.startsWith('rbd_')) {
              data.storage_conf = { ...(data.storage_conf || {}) }
              data.storage_conf[key.replace('rbd_', '')] = values[key]
            } else {
              data[key] = values[key]
            }
          } else if (this.storage_type === 'nfs') {
            if (key.startsWith('nfs_')) {
              data.storage_conf = { ...(data.storage_conf || {}) }
              data.storage_conf[key] = values[key]
            } else {
              data[key] = values[key]
            }
          } else if (this.storage_type === 'slvm') {
            if (key.startsWith('slvm_')) {
              data.storage_conf = { ...(data.storage_conf || {}) }
              data.storage_conf[key] = values[key]
            } else {
              data[key] = values[key]
            }
          } else {
            data[key] = values[key]
          }
        })
        const manager = new this.$Manager('storages', 'v2')
        await manager.update({ id: this.params.data[0].id, data })
        this.cancelDialog()
        this.params.refresh()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
