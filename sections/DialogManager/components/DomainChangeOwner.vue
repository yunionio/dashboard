<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('common.text00078')}}{{ $t('dictionary.domain') }}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="`${$t('common.text00078')}${$t('dictionary.domain')}`" :name="params.name || $t('common.text00006')" />
      <dialog-table :data="params.data" :columns="columns" />
      <template v-if="domainLoaded">
        <a-form :form="form.fc">
          <a-form-item :label="$t('dictionary.domain')" v-bind="formItemLayout" :extra="extra">
            <a-select v-decorator="decorators.project_domain" showSearch @search="getCanUseDomains" :filterOption="false">
              <template v-for="item of domains">
                <a-select-option :key="item.id" :value="item.id">{{ item.name }}</a-select-option>
              </template>
            </a-select>
          </a-form-item>
        </a-form>
      </template>
      <template v-else>
        <div class="text-center mt-4">
          <a-spin />
        </div>
      </template>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import _ from 'lodash'
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DomainChangeOwenrDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        project_domain: [
          'project_domain',
          {
            initialValue: _.get(this.params, 'data[0].domain_id'),
            rules: [
              { required: true, message: this.$t('rules.domain'), trigger: 'change' },
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
      domains: [],
      domainLoaded: false,
    }
  },
  computed: {
    ...mapGetters(['scope']),
    columns () {
      if (this.params.columns && this.params.columns.length >= 2) {
        const keys = ['name', 'project_domain']
        return this.params.columns.filter(({ field }) => {
          return keys.indexOf(field) > -1
        })
      }
      return this.params.columns
    },
    // 是否为批量操作
    isBatch () {
      return this.params.data.length >= 2
    },
    extra () {
      if (this.params.hiddenExtra) {
        return null
      }
      return this.$t('common.text00088')
    },
  },
  beforeDestroy () {
    this.dm = null
    this.rm = null
  },
  created () {
    this.dm = new this.$Manager('domains', 'v1')
    this.rm = new this.$Manager(this.params.resource, this.params.apiVersion || 'v2')
    this.getCanUseDomains()
  },
  methods: {
    // 获取最终可用的domain list
    async getCanUseDomains (query) {
      try {
        let data = []
        if (!this.isBatch) {
          data = await this.fetchChangeOwnerCandidateDomains(query)
          if (data.length === 0) {
            data = await this.fetchDomains(query)
          }
          const usedDomain = {
            id: this.params.data[0].domain_id,
            name: this.params.data[0].project_domain,
          }
          const hasUsedDomain = R.find(R.propEq('id', usedDomain.id))(data)
          if (!hasUsedDomain) {
            data.push(usedDomain)
          }
        } else {
          data = await this.fetchDomains(query)
        }
        this.domains = data
      } catch (error) {
        throw error
      } finally {
        this.domainLoaded = true
      }
    },
    // 获取可用的domain list
    async fetchChangeOwnerCandidateDomains (query) {
      const params = {
        scope: this.scope,
        details: true,
        limit: 0,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.rm.getSpecific({
          id: this.params.data[0].id,
          spec: 'change-owner-candidate-domains',
        })
        const data = response.data.candidates || []
        return data
      } catch (error) {
        throw error
      }
    },
    // 获取普通的domain list
    async fetchDomains (query) {
      const params = {
        details: true,
        scope: this.scope,
        limit: 0,
      }
      if (query) {
        params.search = query
      }
      try {
        const response = await this.dm.list({
          params,
        })
        const data = response.data.data || []
        return data
      } catch (error) {
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchPerformAction', {
          id: ids,
          managerArgs: {
            action: 'change-owner',
            data: values,
          },
        })
        this.params.refresh()
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
