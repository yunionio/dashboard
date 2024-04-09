<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('compute.perform_delete')}}</div>
    <div slot="body">
      <a-alert class="mb-2" type="warning">
        <div slot="message">{{$t('compute.text_1392')}}</div>
      </a-alert>
      <dialog-selected-tips :name="$t('compute.vminstance-container')" :count="params.data.length" :action="this.params.title" />
      <dialog-table v-if="params.columns && params.columns.length" :data="params.data" :columns="params.columns.slice(0, 3)" />
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading">{{ confirmText }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import WorkflowMixin from '@/mixins/workflow'

export default {
  name: 'DeleteVmContainerDialog',
  mixins: [DialogMixin, WindowsMixin, WorkflowMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
        fd: {},
      },
      decorators: {},
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
      formItemLayoutWithoutLabel: {
        wrapperCol: {
          span: 19,
          offset: 5,
        },
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'userInfo']),
    confirmText () {
      return this.$t('dialog.ok')
    },
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        await this.handleDelete()
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
    async handleDelete () {
      if (this.params.ok) {
        await this.params.ok()
      } else {
        const ids = this.params.data.map(item => item.id)
        let params = {}
        params = {
          ...params,
          ...this.params.requestParams,
        }
        const response = await this.params.onManager('batchDelete', {
          id: ids,
          managerArgs: { params },
        })
        if (this.params.vm && this.params.vm.destroySidePages) {
          this.params.vm.destroySidePage(this.params.vm.windowId)
        }
        if (this.params.success && R.is(Function, this.params.success)) {
          this.params.success(response)
        }
      }
      this.$message.success(this.$t('compute.text_423'))
    },
  },
}
</script>
