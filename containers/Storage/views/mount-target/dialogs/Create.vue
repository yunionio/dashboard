<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{params.title}}</div>
    <div slot="body">
      <a-form
        :form="form.fc"
        v-bind="formItemLayout">
        <a-form-item :label="$t('dictionary.filesystem')">
          <a-input :default-value="filesystem" disabled="true" />
        </a-form-item>
        <a-form-item :label="$t('common.network.type')">
          <a-radio-group v-decorator="decorators.network_type" @change="onResourceTypeChanged">
            <a-radio value="vpc">{{$t('common.network.type.vpc')}}</a-radio>
            <a-radio value="classic" :disabled="isClassicDisabled">{{$t('common.network.type.classic')}}</a-radio>
          </a-radio-group>
        </a-form-item>
        <template v-if="form.fc.getFieldValue('network_type') !== 'classic'">
          <ip-subnet
            :label="$t('network.text_211')"
            :isRequired="true"
            :labelCol="formItemLayout.labelCol"
            :wrapperCol="formItemLayout.wrapperCol"
            :decorator="decorators"
            :vpcParams="vpcParams"
            :networkParams="networkParams"
            :showIpConfig="false" />
        </template>
        <a-form-item :label="$t('dictionary.access_group')">
          <base-select
            v-decorator="decorators.access_group_id"
            :params="accessGroupParams"
            :select-props="{ placeholder: $t('storage.access.group.select') }"
            resource="access_groups"
            :filterable="true" />
        </a-form-item>
      </a-form>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="handleConfirm" :loading="loading.submit">{{ $t('dialog.ok') }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'
import IpSubnet from '@Network/sections/IpSubnet'

export default {
  name: 'MountTargetCreateDialog',
  components: {
    IpSubnet,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: {
        submit: false,
        trafficPolicy: false,
      },
      form: {
        fc: this.$form.createForm(this, { }),
      },
      formItemLayout: {
        wrapperCol: {
          span: 20,
        },
        labelCol: {
          span: 4,
        },
      },
      filesystem: this.params.data.name,
      decorators: {
        vpc: [
          'vpc',
          {
            rules: [
              { required: true, message: this.$t('network.text_274') },
            ],
          },
        ],
        network: [
          'network',
          {
            rules: [
              { required: true, message: this.$t('network.text_212') },
            ],
          },
        ],
        network_type: [
          'network_type',
          {
            initialValue: 'vpc',
            rules: [
              { required: true },
            ],
          },
        ],
        access_group_id: [
          'access_group_id',
          {
            rules: [
              { required: true, message: this.$t('storage.access.group.select') },
            ],
          },
        ],
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    vpcParams () {
      const params = {
        scope: this.scope,
        usable: true,
        manager: this.params.data.manager_id,
        cloudregion_id: this.params.data.cloudregion_id,
      }
      if (this.isAdminMode) {
        params.project_domain = this.params.data.domain_id
        delete params.scope
      }
      return params
    },
    networkParams () {
      const ret = {
        limit: 0,
        usable: true,
        scope: this.scope,
      }
      return ret
    },
    accessGroupParams () {
      const ret = {
        limit: 0,
        scope: this.scope,
      }
      return ret
    },
    isClassicDisabled () {
      if (this.params.data.file_system_type === 'standard') {
        return false
      }
      return true
    },
  },
  methods: {
    doCreate (data) {
      return this.params.onManager('create', {
        managerArgs: {
          data,
        },
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        let values = await this.form.fc.validateFields()
        values = {
          generate_name: 'access-group-for-' + this.params.data.name,
          file_system_id: this.params.data.id,
          ...values,
        }
        await this.doCreate(values)
        this.loading = false
        this.cancelDialog()
      } catch (error) {
        this.loading = false
        throw error
      }
    },
  },
}
</script>
<style lang="scss" scoped>
.oc-ttl {
  list-style: none;
  .oc-ttl-item {
    .ant-tag {
      cursor: pointer;
    }
  }
}
</style>
