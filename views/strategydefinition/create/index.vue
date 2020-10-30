<template>
  <div>
    <page-header :title="$t('cloudenv.text_501',[actions[this.$route.query.type]])" />
    <page-body>
      <a-form
        :form="form.fc">
        <a-form-item :label="$t('cloudenv.text_95')" v-bind="formItemLayout" v-if="this.$route.query.type !== 'assign'">
          <a-input v-decorator="decorators.name" :placeholder="$t('cloudenv.text_190')" />
        </a-form-item>
        <a-form-item :label="$t('cloudenv.text_502')" v-bind="formItemLayout">
          <a-select v-decorator="decorators.category" :disabled="categoryDisabled">
            <a-select-option v-for="item in categories" :key="item.key" :value="item.key">{{ item.label }}</a-select-option>
          </a-select>
        </a-form-item>
        <component :is="componentName" :options="options" :present-policies="presentPolicies" :disabled="policiesDisabled" />
        <scope-application v-if="this.$route.query.type === 'assign'" />
      </a-form>
    </page-body>
    <page-footer>
      <a-button
        class="ml-3"
        type="primary"
        native-type="submit"
        html-type="submit"
        @click="handleConfirm"
        :loading="loading">{{ actions[this.$route.query.type] }}</a-button>
    </page-footer>
  </div>
</template>

<script>
import * as R from 'ramda'
import { mapGetters } from 'vuex'
import { categories, policies } from '../config/index'
import HiddenMenus from './components/HiddenMenus'
import ConfiguredCallbackAddress from './components/ConfiguredCallbackAddress'
import ScopeApplication from './components/ScopeApplication'
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CreateStrategyDefinitionIndex',
  components: {
    HiddenMenus,
    ConfiguredCallbackAddress,
    ScopeApplication,
  },
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      form: {
        fc: this.$form.createForm(this, {
          onValuesChange: (props, values) => {
            if (R.has('category', values)) {
              R.forEach((item) => {
                if (item.key === values.category) this.componentName = item.component
              }, categories)
              this.selectedCategory = values.category
            }
          },
        }),
      },
      decorators: {
        name: [
          'name',
          {
            rules: [
              { required: true, message: this.$t('cloudenv.text_190') },
            ],
          },
        ],
        category: [
          'category',
          {
            initialValue: categories[0].key,
            rules: [
              { required: true, message: this.$t('cloudenv.text_553') },
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
      categories,
      selectedCategory: categories[0].key,
      componentName: 'HiddenMenus',
      actions: {
        create: this.$t('cloudenv.text_104'),
        edit: this.$t('cloudenv.text_554'),
        assign: this.$t('cloudenv.text_555'),
      },
    }
  },
  computed: {
    ...mapGetters(['isAdminMode', 'scope', 'userInfo']),
    options () {
      return policies[this.selectedCategory]
    },
    presentPolicies () {
      if (this.$route.query.type !== 'create' && this.$route.query.policies) return this.$route.query.policies
      return {}
    },
    categoryDisabled () {
      return this.$route.query.type !== 'create'
    },
    policiesDisabled () {
      return this.$route.query.type === 'assign'
    },
  },
  provide () {
    return {
      form: this.form,
    }
  },
  created () {
    this.setInitValue()
  },
  methods: {
    setInitValue () {
      if (this.$route.query.type === 'edit') {
        const { name, category } = this.$route.query
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({
            name,
            category,
          })
        })
      } else if (this.$route.query.type === 'assign') {
        const { category } = this.$route.query
        this.$nextTick(() => {
          this.form.fc.setFieldsValue({
            category,
          })
        })
      }
    },
    genData (values) {
      const { name, category } = values
      if (this.$route.query.type === 'assign') {
        return {
          name,
          scope: values.scope,
          target_ids: values.projects || values.domains,
        }
      }
      const ret = {
        name,
        category,
        policies: {},
      }
      if (R.has('hiddenMenus', values)) {
        values.hiddenMenus.map(item => {
          ret.policies[item] = true
        })
      } else {
        const _values = R.clone(values)
        delete _values.name
        delete _values.category
        ret.policies = { ..._values }
      }
      if (this.$route.query.type === 'edit') delete ret.category
      return ret
    },
    doCreate (data) {
      return new this.$Manager('scopedpolicies', 'v1').create({ data })
    },
    doUpdate (data) {
      return new this.$Manager('scopedpolicies', 'v1').update({
        data,
        id: this.$route.query.id,
      })
    },
    doAssign (data) {
      return new this.$Manager('scopedpolicies', 'v1').performAction({
        data,
        id: this.$route.query.id,
        action: 'bind',
      })
    },
    async handleConfirm () {
      this.loading = true
      try {
        const values = await this.form.fc.validateFields()
        const data = this.genData(values)
        const { type } = this.$route.query
        if (R.isEmpty(data.policies)) {
          this.loading = false
          this.$message.warn(this.$t('cloudenv.text_556'))
          return
        }
        if (type === 'create') {
          await this.doCreate(data)
        } else if (type === 'edit') {
          await this.doUpdate(data)
        } else if (type === 'assign') {
          await this.doAssign(data)
        }
        this.loading = false
        this.$message.success(this.$t('cloudenv.text_324', [this.actions[type]]))
        this.$router.push('/strategydefinition')
      } catch (error) {
        this.loading = false
      }
    },
  },
}
</script>

<style lang="scss" scoped>
  ::v-deep .ant-checkbox-group {
    width: 800px;
    .ant-checkbox-group-item {
      width: 140px;
      margin-bottom: 20px;
    }
  }
</style>
