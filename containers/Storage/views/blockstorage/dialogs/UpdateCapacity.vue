<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="this.params.title" :name="$t('dictionary.blockstorage')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
       <a-form-item :label="$t('storage.text_59')">
          <a-input style="width: 150px" name="capacity" v-decorator="decorators.capacity" @blur="handelBlur">
            <span slot="addonAfter">
              GB
            </span>
          </a-input>
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
  name: 'BlockStorageUpdateCapacityDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
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
    initCapacity () {
      const { data = [] } = this.params
      if (data.length > 0) {
        return Math.round(parseFloat(data[0].capacity / 1024))
      }
      return 0
    },
    decorators () {
      return {
        capacity: [
          'capacity',
          {
            initialValue: this.initCapacity,
          },
        ],
      }
    },
  },
  methods: {
    handelBlur ({ target }) {
      const { value, name } = target
      if (!/^\d+$/.test(value)) {
        this.form.fc.setFieldsValue({
          [name]: this.initCapacity,
        })
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const { capacity } = await this.form.fc.validateFields()
        const manager = new this.$Manager('storages', 'v2')
        await manager.update({
          id: this.params.data[0].id,
          data: {
            capacity: parseFloat(capacity) * 1024,
          },
        })
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
