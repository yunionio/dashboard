<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{$t('k8s.text_49')}}</div>
    <div slot="body">
      <a-form class="mt-3" :form="form.fc">
        <a-form-item :label="$t('k8s.text_151')" class="mb-0" v-bind="formItemLayout">
          <base-select
            :options="options"
            v-decorator="decorators.cluster_id"
            idKey="cluster_id"
            nameKey="cluster"
            :select-props="{ placeholder: $t('k8s.text_30'), loading: clusterLoading }" />
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
      options: [],
      clusterLoading: false,
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
    }
  },
  computed: {
    ...mapGetters(['scope']),
  },
  created () {
    this.fetchCluster()
  },
  methods: {
    async fetchCluster () {
      try {
        this.clusterLoading = true
        const { data: { data = [] } } = await this.params.onManager('getSpecific', {
          managerArgs: {
            id: this.params.data[0].id,
            spec: 'kubeclusters',
            params: {
              details: true,
            },
          },
        })
        this.clusterLoading = false
        this.options = data
      } catch (error) {
        this.clusterLoading = false
        throw error
      }
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        await this.params.onManager('performAction', {
          id: this.params.data[0].id,
          managerArgs: {
            action: 'attach-cluster',
            data: values,
          },
        })
        this.loading = false
        this.$message.success(this.$t('k8s.text_281'))
        // this.params.refresh()
        this.cancelDialog()
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>
