<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{action}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('aice.llm')" :count="params.data.length" :action="action" />
      <dialog-table :data="params.data" :columns="columns" />
      <!-- <a-form :form="form.fc" v-show="isRestart">
        <a-form-item class="mb-0">
          <a-checkbox :checked="form.fd.sync_image" @change="changeSyncImage">
            {{$t('aice.phone.restart.sync_image.pompt')}}
          </a-checkbox>
        </a-form-item>
      </a-form> -->
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
  name: 'LlmBatchConfirmDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      action: this.params.actionText,
      form: {
        fc: this.$form.createForm(this),
        fd: {
          sync_image: false,
        },
      },
      decorators: {
        sync_image: [
          'sync_image',
          {
            valuePropName: 'checked',
            initialValue: false,
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
    ...mapGetters(['userInfo']),
    columns () {
      const showFields = ['name', 'llm_ip', 'status', 'llm_sku']
      return this.params.columns.filter((item) => { return showFields.includes(item.field) })
    },
    isRestart () {
      if (this.action === this.$t('aice.action.restart') || this.action === this.$t('aice.action.reset')) {
        return true
      }
      return false
    },
  },
  methods: {
    async doShutDownSubmit () {
      const data = {}
      if (this.form.fd.sync_image) {
        data.sync_image = true
      }
      const ids = this.params.data.map(item => item.id)
      return this.params.onManager('batchPerformAction', {
        id: ids,
        steadyStatus: this.params.steadyStatus,
        managerArgs: {
          action: this.params.action,
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.doShutDownSubmit()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    changeSyncImage (val) {
      const { checked } = val.target
      this.form.fd.sync_image = checked
    },
  },
}
</script>
