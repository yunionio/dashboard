<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">关联安全组</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" :message="message" />
      <dialog-selected-tips :name="$t('dictionary.server')" :count="params.data.length" action="关联安全组" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <loader loading v-if="!(bindedSecgroupsLoaded && secgroupsInitLoaded)" />
      <a-form :form="form.fc" hideRequiredMark v-show="bindedSecgroupsLoaded && secgroupsInitLoaded">
        <a-form-item label="安全组" v-bind="formItemLayout" v-if="bindedSecgroupsLoaded">
          <div slot="extra">
            最多支持选择{{max}}个安全组。没有想要的安全组？可以前往
            <!-- <help-link :href="href"> 新建安全组</help-link> -->
            <dialog-trigger :vm="params.vm" :extParams="{ tenant, domain }" name="新建安全组" value="CreateSecgroupDialog" resource="secgroups" @success="successCallback" />
          </div>
          <base-select
            ref="secgroupRef"
            class="w-100"
            remote
            show-sync
            v-decorator="decorators.secgroups"
            resource="secgroups"
            :resList.sync="secgroupOptions"
            :mapper="mapperSecgroups"
            :params="{ limit: 20 }"
            :init-loaded.sync="secgroupsInitLoaded"
            :select-props="{ allowClear: true, placeholder: '请选择安全组', mode: 'multiple' }" />
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
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'VmSetSecgroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const validateSecgroups = (rule, value, callback) => {
      let maxError = this.isBindOne ? '最多关联一个' : '最多关联五个'
      let minError = '最少关联一个'
      let max = this.isBindOne ? 1 : 5
      if (value.length > max) {
        return callback(maxError)
      }
      if (value.length < 1) {
        return callback(minError)
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
      secgroupsInitLoaded: false,
      bindedSecgroups: [],
      bindedSecgroupsLoaded: false,
      secgroupOptions: [],
    }
  },
  computed: {
    isAzure () {
      return this.params.data[0].provider === HYPERVISORS_MAP.azure.provider
    },
    isUCloud () {
      return this.params.data[0].provider === HYPERVISORS_MAP.ucloud.provider
    },
    isZStack () {
      return this.params.data[0].provider === HYPERVISORS_MAP.zstack.provider
    },
    isBindOne () {
      return this.isAzure || this.isUCloud || this.isZStack
    },
    message () {
      let str = '提示信息：安全组最多可关联五个'
      if (this.isBindOne) {
        str = '提示信息：安全组最多可关联一个'
      }
      return str
    },
    href () {
      const url = this.$router.resolve('/secgroup')
      return url.href
    },
    max () {
      if (this.isBindOne) {
        return 1
      }
      return 5
    },
    domain () {
      return this.params.data[0].domain_id
    },
    tenant () {
      return this.params.data[0].tenant_id
    },
  },
  created () {
    this.fetchBindedSecgroups()
  },
  methods: {
    mapperSecgroups (data) {
      let newData = [...data, ...this.bindedSecgroups]
      newData = R.uniqBy(item => item.id, newData)
      return newData
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
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        const data = {}
        values.secgroups.forEach((id, idx) => {
          data[`secgrp.${idx}`] = id
        })
        await this.params.onManager('batchPerformAction', {
          id: ids,
          managerArgs: {
            action: 'set-secgroup',
            data,
          },
        })
        this.params.callback && this.params.callback()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    async successCallback () {
      await this.$refs.secgroupRef.loadOpts()
      let secgroups = this.form.fc.getFieldValue('secgroups')
      const newSecgroup = this.secgroupOptions[0]
      secgroups.push(newSecgroup.id)
      this.form.fc.setFieldsValue({ 'secgroups': secgroups })
    },
  },
}
</script>
