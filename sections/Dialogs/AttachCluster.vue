<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('k8s.text_366')}}</div>
    <div slot="body">
      <a-form class="mt-3" :form="form.fc">
        <a-form-item :label="$t('k8s.text_28')" class="mb-0" v-bind="formItemLayout">
          <base-select
            resource="kubeclusters"
            :params="clusterParams"
            version="v1"
            v-decorator="decorators.cluster_id"
            :select-props="{ placeholder: $t('k8s.text_30') }" />
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
  name: 'AttachClusterDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
        }),
      },
      decorators: {
        cluster_id: [
          'cluster_id',
          {
            initialValue: this.$store.state.common.k8s.cluster,
            rules: [
              { required: true, message: this.$t('k8s.text_30'), trigger: 'blur' },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: { span: 20 },
        labelCol: { span: 3 },
      },
      clusterParams: {
        federated_keyword: this.params.resource,
        federated_used: false,
        federatedresource_id: this.params.data.id,
      },
    }
  },
  computed: {
    ...mapGetters(['scope']),
  },
  methods: {
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.params.onManager('performAction', {
          id: this.params.data.id,
          managerArgs: {
            action: 'attach-cluster',
            data: values,
          },
        })
        this.loading = false
        this.params.success && this.params.success()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
