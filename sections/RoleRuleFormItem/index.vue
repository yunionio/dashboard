<template>
  <div>
    <a-form :form="form.fc" v-bind="formItemLayout" layout="vertical">
      <div class="d-flex" v-for="(item, i) in resourceList" :key="item.key">
        <a-form-item class="mr-2" :label="i > 0 ? '' : $t('k8s.text_64')">
          <base-select
            style="width: 300px"
            v-decorator="decorators.resources(item.key)"
            :options="resourceOpts"
            filterable
            @update:item="val => syncItem(val, item)"
            :select-props="{ placeholder: $t('k8s.text_380') }" />
        </a-form-item>
        <a-form-item :labelCol="{ span: 24 }" style="min-width: 200px;" :label="i > 0 ? '' : $t('k8s.text_381')" class="verbs-item">
          <div v-if="!item.verbs.length" class="no-verbs-tip">{{$t('k8s.text_382')}}</div>
          <a-checkbox-group v-else v-decorator="decorators.verbs(item.key)" name="checkboxgroup" :options="item.verbs" />
        </a-form-item>
        <a-button shape="circle" icon="minus" size="small" @click="decrease(i)" :class="i === 0 ? 'mt-4_5': ''" />
      </div>
      <div class="d-flex align-items-center">
        <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" @click="add">{{$t('k8s.text_383')}}</a-button>
      </div>
    </a-form>
  </div>
</template>

<script>
import * as R from 'ramda'
import { uuid } from '@/utils/utils'

export default {
  name: 'RoleRuleFormItem',
  props: {
    clusterId: {
      type: String,
    },
    isNamespace: {
      type: Boolean,
      default: false,
    },
    federatedResource: {
      type: String,
    },
  },
  data () {
    return {
      form: {
        fc: this.$form.createForm(this, { name: 'time_related_controls' }),
      },
      resourceList: [],
      formItemLayout: {
        labelCol: {
          xs: { span: 24 },
          sm: { span: 8 },
        },
        wrapperCol: {
          xs: { span: 24 },
          sm: { span: 16 },
        },
      },
      decorators: {
        resources: i => [
          `resources[${i}]`,
          {
            rules: [
              { required: true, message: this.$t('k8s.text_380') },
            ],
          },
        ],
        apiGroups: i => [
          `apiGroups[${i}]`,
          {
            initialValue: '*',
            normalize: value => {
              if (!value) return ''
              return value
            },
          },
        ],
        verbs: i => [
          `verbs[${i}]`,
          {
            rules: [
              { required: true, message: this.$t('k8s.text_384') },
            ],
          },
        ],
      },
      resourceOpts: [],
    }
  },
  watch: {
    clusterId () {
      this.fetchData()
    },
  },
  created () {
    if (this.federatedResource) {
      this.fetchFederatedData()
    } else {
      this.fetchData()
    }
  },
  methods: {
    syncItem (val, item) {
      item.verbs = val.verbs
    },
    async fetchFederatedData () {
      try {
        const { data = [] } = await new this.$Manager(this.federatedResource, 'v1').get({ id: 'api-resources', params: { scope: this.$store.getters.scope } })
        this.getResourceOpts(data)
      } catch (error) {
        throw error
      }
    },
    async fetchData () {
      try {
        if (!this.clusterId) return
        const { data = [] } = await new this.$Manager('kubeclusters', 'v1').getSpecific({ id: this.clusterId, spec: 'api-resources', params: { scope: this.$store.getters.scope } })
        this.getResourceOpts(data)
      } catch (error) {
        throw error
      }
    },
    getResourceOpts (data) {
      if (this.isNamespace) data = data.filter(val => val.apiResource.namespaced)
      data = data.map(val => {
        let label = val.apiResource.name
        if (val.apiGroup) label = `${val.apiGroup} / ${label}`
        return {
          key: `${val.apiGroup} / ${val.apiResource.name}`,
          label,
          verbs: val.apiResource.verbs,
        }
      })
      this.resourceOpts = data
    },
    async validateForm () {
      try {
        const values = await this.form.fc.validateFields()
        const data = {
          rules: [],
        }
        R.forEachObjIndexed((value, key) => {
          const [apiGroup, resouce] = value.split(' / ')
          data.rules.push({
            apiGroups: [apiGroup],
            resources: [resouce],
            verbs: values.verbs[key],
          })
        }, values.resources)
        return data
      } catch (error) {
        throw error
      }
    },
    decrease (i) {
      this.resourceList.splice(i, 1)
    },
    add () {
      this.resourceList.push({
        key: uuid(),
        verbs: [],
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../src/styles/less/theme';

.mt-4_5 {
  margin-top: 1.8rem;
}
.verbs-item {
  /deep/ .ant-form-item-control-wrapper {
    span.ant-form-item-children {
      display: inline-block;
      .no-verbs-tip {
        font-size: 12px;
        color: @text-color-secondary;
        margin-top: 0.5rem;
      }
    }
  }
}

</style>
