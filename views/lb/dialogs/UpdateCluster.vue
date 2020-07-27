<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <dialog-selected-tips :name="$t('dictionary.loadbalancer')" :count="params.data.length" :action="params.title" />
      <dialog-table :data="params.data" :columns="params.columns.slice(0, 3)" />
      <a-form :form="form.fc" v-bind="formItemLayout">
        <a-form-item :label="$t('network.text_19')">
          <base-select
            remote
            showSync
            :params="clusterParams"
            v-decorator="decorators.cluster_id"
            resource="loadbalancerclusters"
            :remote-fn="q => ({ filter: `name.contains(${q})` })"
            :select-props="{ placeholder: $t('network.text_79') }" />
          <!-- <p slot="extra" v-if="this.params.data.length === 1">{{$t('network.text_80')}}<a-button type="link" size="small" @click="createCluster">{{$t('network.text_26')}}</a-button>
          </p> -->
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
import expectStatus from '@/constants/expectStatus'

export default {
  name: 'LbUpdateCluster',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this),
      },
      decorators: {
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
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
    }
  },
  computed: {
    clusterParams () {
      return {
        limit: 0,
        scope: this.$store.getters.scope,
        zone_id: this.params.data[0].zone_id,
      }
    },
  },
  methods: {
    createCluster () {
      this.createDialog('LoadbalancerclusterCreateDialog', {
        title: this.$t('network.text_26'),
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const ids = this.params.data.map(item => item.id)
        await this.params.onManager('batchUpdate', {
          id: ids,
          steadyStatus: Object.values(expectStatus.lb).flat(),
          managerArgs: {
            data: values,
          },
        })
        this.params.refresh()
        this.cancelDialog()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
  },
}
</script>
