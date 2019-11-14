<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">关联安全组</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" message="提示信息：安全组最多可关联五个，最少关联一个" />
      <dialog-selected-tips :count="params.data.length" action="关联安全组" />
      <vxe-grid class="mb-2" :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item label="安全组" v-bind="formItemLayout" v-if="bindedSecgroupsLoaded">
          <base-select
            class="w-100"
            filterable
            remote
            v-decorator="decorators.secgroups"
            resource="secgroups"
            :mapper="mapperSecgroups"
            :params="{ limit: 20 }"
            :select-props="{ allowClear: true, placeholder: '请选择安全组', mode: 'tags' }" />
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
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'VmSetSecgroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const validateSecgroups = (rule, value, callback) => {
      let maxError = '最多关联五个'
      let minError = '最少关联一个'
      if (!value || value.length < 1) {
        return callback(minError)
      }
      if (value.length > 5) {
        return callback(maxError)
      }
      return callback()
    }
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        secgroups: [
          'secgroups',
          {
            initialValue: this.params.data[0]['secgroups'] && this.params.data[0]['secgroups'].map(item => item.id),
            validateFirst: true,
            rules: [
              { validator: validateSecgroups, trigger: 'change' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 21,
        },
        labelCol: {
          span: 3,
        },
      },
      bindedSecgroups: [],
      bindedSecgroupsLoaded: false,
    }
  },
  created () {
    this.fetchBindedSecgroups()
  },
  methods: {
    mapperSecgroups (data) {
      data = data.concat(this.bindedSecgroups)
      data = R.uniqBy(item => item.id, data)
      return data
    },
    async fetchBindedSecgroups () {
      const manager = new this.$Manager('secgroups')
      try {
        const { data: { data = [] } } = await manager.list({
          params: {
            scope: this.scope,
            server: this.params.data[0]['id'],
          },
        })
        this.bindedSecgroups = data
        this.bindedSecgroupsLoaded = true
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.$promiseValidateForm(this.form.fc)
        const ids = this.params.data.map(item => item.id)
        const data = {}
        values.secgroups.forEach((id, idx) => {
          data[`secgrp.${idx}`] = id
        })
        await this.params.list.onManager('batchPerformAction', {
          id: ids,
          managerArgs: {
            action: 'set-secgroup',
            data,
          },
        })
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
