<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ action }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.disk')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_99')">
          <list-select
            v-decorator="decorators.storage"
            :list-props="resourceProps"
            :formatter="v => { return formatterVal(v) }"
            :multiple="false"
            :placeholder="$t('compute.text_1351')"
            :dialog-params="{ title: $t('compute.text_99'), width: 1060 }" />
        </a-form-item>
        <a-form-item :label="$t('compute.keep_origin_disk')">
          <a-switch :checkedChildren="$t('compute.text_115')" :unCheckedChildren="$t('compute.text_116')" v-decorator="decorators.keep_origin_disk" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import ListSelect from '@/sections/ListSelect'
import { STORAGE_TYPES } from '@Storage/constants'
import StorageResourcePropsMixin from '../mixins/storageResourceProps'
export default {
  name: 'DiskChangeBlockStorageDialog',
  components: {
    ListSelect,
  },
  mixins: [DialogMixin, WindowsMixin, StorageResourcePropsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        storage: [
          'storage',
          {
            initialValue: this.params.data[0].storage_id,
            rules: [
              { required: false, message: this.$t('compute.text_1351'), trigger: 'change' },
            ],
          },
        ],
        keep_origin_disk: [
          'keep_origin_disk',
          {
            valuePropName: 'checked',
            initialValue: false,
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      action: this.$t('compute.vminstance.change_disk_storage'),
    }
  },
  computed: {
    selectedItems () {
      return this.params.data || []
    },
    isSingle () {
      return this.selectedItems?.length === 1
    },
    selectedItemsStorageIds () {
      return this.selectedItems.map(item => item.storage_id)
    },
    selectedItemsDiskIds () {
      return this.selectedItems.map(item => item.id)
    },
    selectedItemsGuestIds () {
      const guestIds = []
      this.selectedItems.forEach(item => {
        if (item.guests) {
          item.guests.forEach(v => {
            guestIds.push(v.id)
          })
        }
      })
      return guestIds
    },
    columns () {
      const showFields = ['name', 'storage_type', 'guest']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
  },
  methods: {
    formatterVal (v) {
      if (v) {
        return `${STORAGE_TYPES[v.storage_type] || v.storage_type}(${v.name})`
      }
    },
    doSingleHandle (ids, values) {
      const data = {
        target_storage_id: values.storage,
        disk_id: this.selectedItemsDiskIds[0],
        keep_origin_disk: !values.keep_origin_disk,
      }
      return new this.$Manager('servers').performAction({
        id: this.selectedItemsGuestIds[0],
        action: 'change-disk-storage',
        data,
      })
    },
    doBatchHandle (ids, values) {
      const data = {
        target_storage_id: values.storage,
        disk_id: this.selectedItemsDiskIds[0],
      }
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: ['running', 'ready'],
        managerArgs: {
          action: 'change-disk-storage',
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        if (this.isSingle) {
          await this.doSingleHandle(ids, values)
        } else {
          await this.doBatchHandle(ids, values)
        }
        this.$message.success(this.$t('common.success'))
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
<style>
</style>
