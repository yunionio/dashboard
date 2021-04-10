<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.secgroup')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="columns" />
      <a-form :form="form.fc" hideRequiredMark>
        <a-form-item :label="$t('dictionary.server')" v-bind="formItemLayout">
          <base-select
            class="w-100"
            @update:options="onServerSucceed"
            filterable
            v-decorator="decorators.sergroups"
            resource="servers"
            :mapper="mapperServers"
            :params="requestParams"
            :select-props="{ allowClear: true, placeholder: $t('compute.text_1022', [$t('dictionary.server')]), mode: 'multiple', defaultValue }" />
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
import { mapGetters } from 'vuex'
import {
  getNameDescriptionTableColumn,
  getProjectTableColumn,
} from '@/utils/common/tableColumn'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'SetServerDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    // const validateServers = (rule, value, callback) => {
    //   let minError = '最少关联一个'
    //   if (!value || value.length < 1) {
    //     return callback(minError)
    //   }
    //   return callback()
    // }
    return {
      loading: false,
      scope: this.$store.getters.scope,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        sergroups: [
          'sergroups',
          {
            validateFirst: true,
            rules: [
              // { validator: validateServers, trigger: 'change' },
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
      bindServers: [],
      bindServersLoaded: false,
      defaultValue: [],
    }
  },
  computed: {
    ...mapGetters([
      'isAdminMode',
      'isDomainMode',
      'userInfo',
    ]),
    requestParams () {
      if (this.isAdminMode || this.isDomainMode) {
        // if (this.requestParams.tenant) {
        //   delete this.requestParams.tenant
        // }
        return {
          limit: 0,
          offset: 0,
          filter: 'hypervisor.notin(container, baremetal, esxi)',
          project_domain: this.userInfo.projectDomain,
          project_id: this.params.data[0].project_id,
          secgroup: `!${this.params.data[0].id}`,
        }
      } else {
        // if (this.requestParams.scope) {
        //   return {
        //     search: '',
        //     limit: 20,
        //     offset: 0,
        //     filter: 'hypervisor.notin(container, baremetal, esxi)',
        //   }
        // }
        return {
          limit: 0,
          offset: 0,
          filter: 'hypervisor.notin(container, baremetal, esxi)',
          // tenant: this.params.data[0]['tenant_id'],
          scope: this.$store.getters.scope,
          secgroup: `!${this.params.data[0].id}`,
        }
      }
    },
    columns () {
      return [
        getNameDescriptionTableColumn({
          onManager: this.onManager,
          hideField: true,
          slotCallback: row => {
            return (
              <side-page-trigger onTrigger={ () => this.handleOpenSidepage(row) }>{ row.name }</side-page-trigger>
            )
          },
        }),
        {
          field: 'guest_cnt',
          title: this.$t('compute.text_1023'),
          width: 80,
        },
        getProjectTableColumn(),
      ]
    },
  },
  created () {
    // this.fetchBindedServers()
  },
  methods: {
    mapperServers (data) {
      data = data.concat(this.bindServers)
      data = R.uniqBy(item => item.id, data)
      return data
    },
    onServerSucceed () {
      this.fetchBindedServers()
    },
    async fetchBindedServers () {
      const manager = new this.$Manager('servers')
      try {
        const params = {
          scope: this.scope,
          filter: 'hypervisor.notin(container, baremetal)',
          limit: 0,
          secgroup: `!${this.params.data[0].id}`,
        }
        if (this.isAdminMode) {
          params.project_domain = this.userInfo.projectDomain
          delete params.scope
        }
        const { data: { data = [] } } = await manager.list({ params })
        this.bindServers = data
        this.bindServersLoaded = true
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({ sergroups: data.map(item => item.id) })
        })
      } catch (error) {
        console.error(error)
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        let ids = []
        const bindServers = []
        const removeServers = []
        const data = {
          secgroup_ids: [this.params.data[0].id],
        }
        ids = JSON.parse(JSON.stringify(values.sergroups))
        this.bindServers.forEach((item, idx) => {
          bindServers.push(item.id)
        })
        for (var i = 0; i < bindServers.length; i++) {
          if (!R.includes(bindServers[i], ids)) {
            removeServers.push(bindServers[i])
          }
          for (var j = 0; j < ids.length; j++) {
            if (bindServers[i] === ids[j]) {
              ids.splice(j, 1)
            }
          }
        }
        if (removeServers.length > 0) {
          await new this.$Manager('servers').batchPerformAction({
            ids: removeServers,
            action: 'revoke-secgroup',
            data,
          })
        }
        if (ids.length > 0) {
          await new this.$Manager('servers').batchPerformAction({
            ids,
            action: 'add-secgroup',
            data,
          })
        }
        this.loading = false
        this.cancelDialog()
        this.params.refresh()
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
