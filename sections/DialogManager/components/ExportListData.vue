<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ params.title }}</div>
    <div slot="body">
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="$t('common.text00097')">
          <a-radio-group v-decorator="decorators.type">
            <a-radio-button
              v-for="item of exportType"
              :key="item.key"
              :value="item.key">{{ item.label }}</a-radio-button>
          </a-radio-group>
        </a-form-item>
        <a-form-item :label="$t('common.text00098')">
          <a-checkbox
            :indeterminate="indeterminate"
            @change="handleCheckAllChange"
            :checked="checkAll">{{$t('common.checkAll')}}</a-checkbox>
          <a-divider />
          <a-checkbox-group v-decorator="decorators.selected" @change="handleSelectedChange" class="w-100">
            <a-row>
              <a-col
                v-for="item of exportOptionItems"
                :span="6"
                :key="item.key"
                class="mb-2 checkbox-item">
                <a-checkbox :value="item.key"><span :title="item.label">{{ item.label }}</span></a-checkbox>
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
import { download, getRequestT } from '@/utils/utils'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { getTagTitle } from '@/utils/common/tag'

export default {
  name: 'ExportListDataDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    let exportOptionItems = [...this.params.options.items].filter(item => {
      const { hidden } = item
      if (hidden && R.type(hidden) === 'Function') {
        return hidden()
      }
      return !hidden
    })
    let allExportKeys = exportOptionItems.map(item => item.key)
    const exportTags = (this.params.showTagColumns && this.params.config.showTagKeys) || []
    if (exportTags && exportTags.length) {
      allExportKeys = R.insertAll(0, exportTags.map(item => {
        return `tag:${item}`
      }), allExportKeys)
      exportOptionItems = R.insertAll(0, exportTags.map(item => {
        return {
          label: getTagTitle(item),
          key: `tag:${item}`,
        }
      }), exportOptionItems)
    }
    return {
      loading: false,
      exportOptionItems,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        type: [
          'type',
          {
            initialValue: this.params.options.type || 'custom',
          },
        ],
        selected: [
          'selected',
          {
            initialValue: allExportKeys,
            rules: [
              { required: true, message: this.$t('common_94') },
            ],
          },
        ],
      },
      allExportKeys,
      exportType: this.params.options.exportType || {
        all: { label: this.$t('common_95'), key: 'all' },
        custom: { label: this.$t('common_96'), key: 'custom' },
      },
      indeterminate: false,
      checkAll: true,
    }
  },
  computed: {
    resource () {
      if (R.is(String, this.params.resource)) {
        return this.params.resource
      }
      return this.params.resource.resource.substr(0, this.params.resource.resource.length - 1)
    },
  },
  methods: {
    genParams (formValues, total) {
      const keys = []
      const texts = []
      for (let i = 0, len = formValues.selected.length; i < len; i++) {
        const item = R.find(R.propEq('key', formValues.selected[i]))(this.exportOptionItems)
        keys.push(item.key)
        texts.push(item.label)
      }
      let params = {
        export: this.params.options.fileType || 'xls',
        export_keys: keys.join(','),
        export_texts: texts.join(','),
        export_limit: total || this.params.total,
      }
      if (this.params.options.limit) {
        params.export_limit = R.is(Function, this.params.options.limit) ? this.params.options.limit() : this.params.options.limit
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
      const listParams = this.params.listParams
      if (formValues.type === this.exportType.custom.key) { // 导出范围选择根据筛选条件时
        params = {
          ...params,
          ...listParams,
        }
        if (this.params.selected.length) {
          if (params.filter && params.filter.length) {
            params.filter = [...params.filter, `id.in(${this.params.selected.join(',')})`]
          } else {
            params.filter = [`id.in(${this.params.selected.join(',')})`]
          }
        }
      } else if (formValues.type === this.exportType.all.key) { // 导出范围选择全部时
        if (listParams.scope) params.scope = listParams.scope
        // 如果没有自定义limit，导出全部直接把limt重置为0
        if (R.isNil(this.params.options.limit) || R.isEmpty(this.params.options.limit)) {
          params.export_limit = 0
        }
      }
      if (params.limit) delete params.limit
      if (params.offset) delete params.offset
      delete params.paging_marker
      if (this.params.options.transformParams) {
        params = this.params.options.transformParams(params)
      }
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
        const resource = this.params.options.resource || this.params.resource
        const total = this.params.options.resource && await this.getResourceTotal(resource)
        const params = this.genParams(values, total)
        const response = await this.$http({
          methods: 'GET',
          url: `/${this.params.apiVersion}/${resource}`,
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
    getResourceTotal (resource) {
      let listParams = this.params.listParams
      if (this.params.options.transformParams) {
        listParams = this.params.options.transformParams(listParams)
      }
      return new Promise((resolve, reject) => {
        this.$http({
          methods: 'GET',
          url: `/${this.params.apiVersion}/${resource}`,
          params: {
            $t: getRequestT(),
            ...listParams,
            limit: 1,
          },
        }).then((res) => {
          resolve(res.data.total)
        }).catch(() => {
          resolve(0)
        })
      })
    },
  },
}
</script>

<style lang="less" scoped>
.checkbox-item {
  ::v-deep {
    .ant-checkbox-wrapper {
      display: flex;
      align-items: center;
      .ant-checkbox {
        margin-top: 3px;
        & + span {
          flex: 1;
          overflow: hidden;
          text-overflow:ellipsis;
          white-space: nowrap;
        }
      }
    }
  }
}
</style>
