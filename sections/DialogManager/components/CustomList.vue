<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item>
          <a-checkbox
            :indeterminate="indeterminate"
            @change="handleCheckAllChange"
            :checked="checkAll">全选</a-checkbox>
          <a-divider />
          <a-checkbox-group v-decorator="decorators.selected" @change="handleSelectedChange" class="w-100">
            <a-row>
              <a-col
                v-for="item of fields"
                :span="6"
                :key="item.property"
                class="mb-2">
                <a-checkbox :value="item.property">{{ item.title }}</a-checkbox>
              </a-col>
            </a-row>
          </a-checkbox-group>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CustomListDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const fields = this.params.customs.filter(item => item.type !== 'checkbox' && item.property !== 'action')
    const initialSelected = fields.filter(item => item.visible).map(item => item.property)
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        selected: [
          'selected',
          {
            initialValue: initialSelected,
            rules: [
              { required: true, message: '至少选择一列' },
            ],
          },
        ],
      },
      fields,
      indeterminate: initialSelected.length !== 0 && fields.length !== initialSelected.length,
      checkAll: fields.length === initialSelected.length,
    }
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((errors, values) => {
          if (errors) {
            reject(errors)
          } else {
            resolve(values)
          }
        })
      })
    },
    async handleConfirm () {
      try {
        const values = await this.validateForm()
        this.loading = true
        const unSelect = this.fields.filter(item => !values.selected.includes(item.property)).map(item => item.property)
        await this.params.list.updateConfig({
          ...this.params.list.config,
          hiddenColumns: unSelect,
        })
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    handleSelectedChange (val) {
      this.indeterminate = !!val.length && val.length < this.fields.length
      this.checkAll = val.length === this.fields.length
    },
    handleCheckAllChange (e) {
      this.form.fc.setFieldsValue({
        selected: e.target.checked ? this.fields.map(item => item.property) : [],
      })
      this.checkAll = e.target.checked
      this.indeterminate = false
    },
  },
}
</script>
