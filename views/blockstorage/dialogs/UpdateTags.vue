<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="$t('dictionary.blockstorage')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('storage.text_45')">
          <a-select :loading="schedTagsLoading" allowClear showSearch :filterOption="filterOption" mode="multiple" v-decorator="decorators.schedTags" :placeholder="$t('storage.text_63')">
            <a-select-option v-for="item in schedTags" :key="item.id" :value="item.id">{{item.name}}</a-select-option>
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
import { formItemLayout } from '@Storage/constants/index.js'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'BlockStorageUpdateTagsDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      schedTagsLoading: false,
      schedTags: [],
      formItemLayout,
      form: {
        fc: this.$form.createForm(this),
      },
    }
  },
  provide () {
    return {
      form: this.form,
    }
  },
  computed: {
    storage_type () {
      if (this.params.data && this.params.data.length > 0) {
        return this.params.data[0].storage_type
      }
      return undefined
    },
    decorators () {
      return {
        schedTags: [
          'schedTags',
          {
            initialValue: undefined,
          },
        ],
      }
    },
  },
  created () {
    this.querySchedTags()
  },
  methods: {
    filterOption (input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      )
    },
    async querySchedTags () {
      const params = { 'filter.0': 'resource_type.equals(storages)', scope: this.$store.getters.scope }
      const manager = new this.$Manager('schedtags', 'v2')
      this.schedTagsLoading = true
      try {
        const { data = {} } = await manager.list({ params })
        this.schedTags = data.data || []
        // 回填表单
        const rowItem = this.params.data[0]
        if (rowItem && rowItem.schedtags && rowItem.schedtags.length > 0) {
          this.form.fc.setFieldsValue({
            schedTags: rowItem.schedtags.map(({ id }) => id),
          })
        }
      } catch (err) {
        throw err
      } finally {
        this.schedTagsLoading = false
      }
    },
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
      const params = {}
      try {
        const { schedTags } = await this.validateForm()
        if (schedTags && schedTags.length > 0) {
          schedTags.forEach((id, i) => {
            params[`schedtag.${i}`] = id
          })
        }
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('performAction', {
          id: ids[0],
          managerArgs: {
            action: 'set-schedtag',
            data: params,
          },
        })
        this.cancelDialog()
        this.loading = false
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
