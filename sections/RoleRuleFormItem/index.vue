<template>
  <div>
    <a-form :form="form.fc" v-bind="formItemLayout" layout="vertical">
      <div class="d-flex" v-for="(item, i) in resourceList" :key="item.key">
        <a-form-item class="mr-2" :label="i > 0 ? '' : '资源'">
          <base-select
            v-decorator="decorators.resources(item.key)"
            :options="resourceOpts"
            filterable
            @update:item="val => syncItem(val, item)"
            :select-props="{ placeholder: '请选择资源' }" />
        </a-form-item>
        <a-form-item :labelCol="{ span: 24 }" style="min-width: 200px;" :label="i > 0 ? '' : '权限'" class="verbs-item">
          <div v-if="!item.verbs.length" class="no-verbs-tip">暂无权限可选，请先选择资源</div>
          <a-checkbox-group v-else v-decorator="decorators.verbs(item.key)" name="checkboxgroup" :options="item.verbs" />
        </a-form-item>
        <a-button shape="circle" icon="minus" size="small" @click="decrease(i)" :class="i === 0 ? 'mt-4_5': ''" />
      </div>
      <div class="d-flex align-items-center">
        <a-button type="primary" shape="circle" icon="plus" size="small" @click="add" />
        <a-button type="link" @click="add">添加资源</a-button>
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
              { required: true, message: '请选择资源' },
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
              { required: true, message: '请勾选权限' },
            ],
          },
        ],
      },
      resourceOpts: [],
    }
  },
  watch: {
    clusterId: {
      handler (val) {
        this.fetchData()
      },
      immediate: true,
    },
  },
  methods: {
    syncItem (val, item) {
      console.log(val, 'vv')
      item.verbs = val.verbs
    },
    async fetchData () {
      try {
        console.log(this.clusterId, 'this.clusterId')
        if (!this.clusterId) return
        let { data = [] } = await new this.$Manager('kubeclusters', 'v1').getSpecific({ id: this.clusterId, spec: 'api-resources' })
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
      } catch (error) {
        throw error
      }
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
