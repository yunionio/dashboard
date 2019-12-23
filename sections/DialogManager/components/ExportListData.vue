<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="导出范围">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button
              v-for="item of exportType"
              :key="item.key"
              :value="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item label="导出数据列">
          <a-checkbox
            :indeterminate="indeterminate"
            @change="handleCheckAllChange"
            :checked="checkAll">全选</a-checkbox>
          <a-divider />
          <a-checkbox-group v-decorator="decorators.selected" @change="handleSelectedChange">
            <a-row>
              <a-col
                v-for="item of params.options.items"
                :span="6"
                :key="item.key"
                class="mb-2">
                <a-checkbox :value="item.key">{{ item.label }}</a-checkbox>
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
import * as R from 'ramda'
import { download } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'ExportListDataDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const allExportKeys = this.params.options.items.map(item => item.key)
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: 'custom',
          },
        ],
        selected: [
          'selected',
          {
            initialValue: allExportKeys,
            rules: [
              { required: true, message: '至少选择一列数据' },
            ],
          },
        ],
      },
      allExportKeys,
      exportType: {
        all: { label: '全部', key: 'all' },
        custom: { label: '根据当前列表筛选条件', key: 'custom' },
      },
      indeterminate: false,
      checkAll: true,
    }
  },
  methods: {
    genParams (formValues) {
      const keys = []
      const texts = []
      for (let i = 0, len = formValues.selected.length; i < len; i++) {
        const item = R.find(R.propEq('key', formValues.selected[i]))(this.params.options.items)
        keys.push(item.key)
        texts.push(item.label)
      }
      let params = {
        export: this.params.options.fileType || 'xls',
        export_keys: keys.join(','),
        export_texts: texts.join(','),
        export_limit: 0,
      }
      if (this.params.options.getParams) {
        if (R.is(Function, this.params.options.getParams)) {
          params = {
            ...params,
            ...this.params.options.getParams({
              selected: formValues.selected,
              exportType: formValues.type,
              options: this.params.options,
            }),
          }
        } else {
          params = { ...params, ...this.params.options.getParams }
        }
      }
      const listParams = this.params.list.params
      if (formValues.type === this.exportType.custom.key) { // 导出范围选择根据筛选条件时
        params = {
          ...params,
          ...listParams,
        }
        if (this.params.list.selected.length) {
          if (params.filter && params.filter.length) {
            params.filter = [...params.filter, `id.in(${this.params.list.selected.join(',')})`]
          } else {
            params.filter = [`id.in(${this.params.list.selected.join(',')})`]
          }
        }
      } else if (formValues.type === this.exportType.all.key) { // 导出范围选择全部时
        if (listParams.is_on_premise) params.is_on_premise = listParams.is_on_premise
        if (listParams.private_cloud) params.private_cloud = listParams.private_cloud
        if (listParams.public_cloud) params.public_cloud = listParams.public_cloud
        if (listParams.scope) params.scope = listParams.scope
      }
      if (params.limit) delete params.limit
      if (params.offset) delete params.offset
      return params
    },
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
        const params = this.genParams(values)
        const response = await this.$http({
          methods: 'GET',
          url: `/${this.params.list.apiVersion}/${this.params.list.resource}`,
          params,
          responseType: 'blob',
          headers: {
            'X-Export-Keys': true,
          },
        })
        const contentDisposition = response.headers['content-disposition']
        let fileName = 'unknown'
        if (contentDisposition) {
          const fileNameMatch = contentDisposition.match(/filename="(.+)"/)
          if (fileNameMatch.length === 2) fileName = fileNameMatch[1]
        }
        download(response.data, fileName, response.headers['content-type'])
        this.cancelDialog()
      } catch (error) {
        throw error
      } finally {
        this.loading = false
      }
    },
    handleSelectedChange (val) {
      this.indeterminate = !!val.length && val.length < this.allExportKeys.length
      this.checkAll = val.length === this.allExportKeys.length
    },
    handleCheckAllChange (e) {
      this.form.fc.setFieldsValue({
        selected: e.target.checked ? this.allExportKeys : [],
      })
      this.checkAll = e.target.checked
      this.indeterminate = false
    },
  },
}
</script>
