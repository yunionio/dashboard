<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.disk_perform_attach')}}</div>
    <div slot="body">
      <dialog-selected-tips :count="params.data.length" :action="$t('compute.disk_perform_attach')" :name="$t('dictionary.disk')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('dictionary.server')" v-bind="formItemLayout">
          <!-- <a-select v-decorator="decorators.server">
            <a-select-option v-for="item in serversOpts" :key="item.id">
              {{item.name}}
            </a-select-option>
          </a-select> -->
          <base-select
            class="w-100"
            remote
            filterable
            v-decorator="decorators.server"
            resource="servers"
            search-key="search"
            :remote-fn="q => ({ search: q })"
            :params="serverParams" />
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'DiskMountUpdateDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
        server: [
          'server',
          {
            rules: [
              { required: true, message: this.$t('compute.text_425') },
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
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'scope']),
    serverParams () {
      const itemData = this.params.data[0]
      const params = {
        details: true,
        attachable_servers_for_disk: itemData.id,
        scope: this.scope,
        brand: itemData.brand,
        filter: 'status.in(ready, running)',
        limit: 20,
      }
      if (itemData.cloud_env === 'public' || itemData.cloud_env === 'private') {
        params.manager = itemData.manager_id
        params.zone = itemData.zone_id
      }
      if (this.isAdminMode || this.isDomainMode) params.project_id = itemData.project_id
      return params
    },
  },
  methods: {
    validateForm () {
      return new Promise((resolve, reject) => {
        this.form.fc.validateFields((err, values) => {
          if (!err) {
            resolve(values)
          } else {
            reject(err)
          }
        })
      })
    },
    doUpdate (data) {
      return new this.$Manager('servers').batchPerformAction({
        action: 'attachdisk',
        ids: data.server,
        data: {
          disk_id: this.params.data[0].id,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.validateForm()
        this.loading = true
        await this.doUpdate(values)
        this.loading = false
        this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
