<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.text_1116')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning" :message="message" />
      <dialog-selected-tips :name="params.name" :count="params.data.length" :action="$t('compute.text_1116')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <loader loading v-if="!(bindedSecgroupsLoaded && secgroupsInitLoaded)" />
      <a-form :form="form.fc" hideRequiredMark v-show="bindedSecgroupsLoaded && secgroupsInitLoaded" v-bind="formItemLayout">
        <a-form-item :label="$t('compute.text_105')" v-if="bindedSecgroupsLoaded">
          <div slot="extra">{{$t('compute.text_1242', [max])}}<!-- <help-link :href="href">{{$t('compute.text_189')}}</help-link> -->
            <dialog-trigger :vm="params.vm" :extParams="{ tenant, domain }" :name="$t('compute.text_189')" value="CreateSecgroupDialog" resource="secgroups" @success="successCallback" />
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
            :params="secgroupsParams"
            :init-loaded.sync="secgroupsInitLoaded"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_190'), mode: 'multiple' }" />
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
import { mapGetters } from 'vuex'
import * as R from 'ramda'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import { HYPERVISORS_MAP } from '@/constants'

export default {
  name: 'SetSecgroupDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    const validateSecgroups = (rule, value, callback) => {
      const maxError = this.isBindOne ? this.$t('compute.text_1243') : this.$t('compute.text_1244')
      const minError = this.$t('compute.text_192')
      const max = this.isBindOne ? 1 : 5
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
            initialValue: this.params.data[0].secgroups && this.params.data[0].secgroups.map(item => item.id),
            validateFirst: true,
            rules: [
              { validator: validateSecgroups, trigger: 'change' },
            ],
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
      secgroupsInitLoaded: false,
      bindedSecgroups: [],
      bindedSecgroupsLoaded: false,
      secgroupOptions: [],
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope']),
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
      let str = this.$t('compute.text_1245')
      if (this.isBindOne) {
        str = this.$t('compute.text_1246')
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
    secgroupsParams () {
      const params = { limit: 20 }
      if (this.isAdminMode) {
        params.project_domain = this.params.data[0].domain_id
      } else {
        params.scope = this.scope
      }
      return params
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
            [this.params.resource]: this.params.data[0].id,
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
        const data = {
          secgroup_ids: values.secgroups,
        }
        await this.params.onManager('batchPerformAction', {
          id: ids,
          managerArgs: {
            action: 'set-secgroup',
            data,
          },
        })
        this.params.refresh && this.params.refresh()
        this.cancelDialog()
      } finally {
        this.loading = false
      }
    },
    async successCallback () {
      await this.$refs.secgroupRef.loadOpts()
      const secgroups = this.form.fc.getFieldValue('secgroups')
      const newSecgroup = this.secgroupOptions[0]
      secgroups.push(newSecgroup.id)
      this.form.fc.setFieldsValue({ secgroups: secgroups })
    },
  },
}
</script>
