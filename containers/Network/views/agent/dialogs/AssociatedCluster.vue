<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{ $t('network.associated_cluster') }}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('network.text_20')" :count="params.data.length" :action="$t('network.associated_cluster')" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('network.associated_cluster')">
          <a-switch
            v-decorator="decorators.enable_associated"
            :checkedChildren="$t('common.text00062')"
            :unCheckedChildren="$t('common.text00063')" />
        </a-form-item>
        <a-form-item :label="$t('network.text_19')" v-if="form.fd.enable_associated">
          <base-select
            v-decorator="decorators.cluster_id"
            resource="loadbalancerclusters"
            :params="clusterParams"
            remote
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            showSync
            :select-props="{ placeholder: $t('network.text_79') }" />
          <p slot="extra">
            {{$t('network.text_80')}}
            <a-button type="link" size="small" @click="createCluster">{{$t('network.text_26')}}</a-button>
          </p>
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
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AssociatedClusterDialog',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            Object.keys(values).forEach((key) => {
              this.form.fd[key] = values[key]
            })
          },
        }),
        fd: {
          enable_associated: !!this.params.data[0].cluster_id,
        },
      },
      decorators: {
        enable_associated: [
          'enable_associated',
          {
            valuePropName: 'checked',
            initialValue: !!this.params.data[0].cluster_id,
          },
        ],
        cluster_id: [
          'cluster_id',
          {
            initialValue: this.params.data[0].cluster_id,
            rules: [
              { required: true, message: this.$t('network.text_79') },
            ],
          },
        ],
      },
      formItemLayout: {
        wrapperCol: {
          span: 19,
        },
        labelCol: {
          span: 5,
        },
      },
    }
  },
  computed: {
    clusterParams () {
      return {
        region: this.params.data[0].region,
      }
    },
  },
  methods: {
    createCluster () {
      this.createDialog('LoadbalancerclusterCreateDialog', {
        title: this.$t('network.text_26'),
      })
    },
    doAssociated (id, cluster_id) {
      return this.params.onManager('performAction', {
        id,
        managerArgs: {
          action: 'join-cluster',
          data: {
            cluster_id,
          },
        },
      })
    },
    doUnAssociated (id, cluster_id) {
      return this.params.onManager('performAction', {
        id,
        managerArgs: {
          action: 'leave-cluster',
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const id = this.params.data[0].id
        const { enable_associated, cluster_id } = values

        if (enable_associated) {
          await this.doAssociated(id, cluster_id)
        } else {
          await this.doUnAssociated(id, cluster_id)
        }

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
