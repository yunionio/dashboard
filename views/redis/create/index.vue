<template>
  <div class="redis-create-index">
    <page-header :title="$t('db.text_280')" />
    <a-form
      class="mt-3"
      v-bind="formItemLayout"
      :form="form.fc"
      hideRequiredMark>
      <a-form-item :label="$t('db.text_281')" class="mb-0">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item :label="$t('db.text_60')">
        <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.resourceCreateName')" />
        <template #extra>
          <name-repeated res="dbinstances" :name="form.getFieldValue('generate_name')" />
        </template>
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" :auto_renew="false" />
      <a-form-item :label="$t('db.text_71')" v-if="form.fd.billing_type !== 'prepaid'">
        <duration :decorators="decorators.duration" :form="form" />
      </a-form-item>
      <a-form-item :label="$t('db.text_265')">
        <a-input-number v-decorator="decorators.count" :min="1" :max="10" />
      </a-form-item>
      <!-- 区域 -->
      <item-area
        v-if="form.fd.project"
        class="mb-0"
       :defaultActiveFirstOption="['city']"
       :values="form.fc.getFieldsValue()" />
      <!-- 套餐 -->
      <s-k-u ref="REF_SKU" />
      <a-form-item :label="$t('db.text_143')">
        <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
      </a-form-item>
      <!-- 网络 -->
      <item-network ref="REF_NETWORK" />
      <!-- 安全组 -->
      <a-form-item v-if="form.getFieldValue('provider') === 'Qcloud'" :label="$t('db.text_144')">
        <secgroup-config :max="5" :decorators="decorators.secgroup" :secgroup-params="secgroupParams" />
      </a-form-item>
      <!-- 标签 -->
      <a-form-item :label="$t('compute.text_1154')" class="mb-0" key="tag">
        <tag v-decorator="decorators.tag" />
      </a-form-item>
      <bottom-bar :values="form.fc.getFieldsValue()" />
    </a-form>
  </div>
</template>
<script>
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import changeMinxin from './changeMinxin'
import { DECORATORS } from '@DB/views/redis/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import Duration from '@Compute/sections/Duration'
import ItemArea from '@DB/sections/ItemArea'
import ItemNetwork from '@DB/sections/ItemNetwork'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'
import SecgroupConfig from '@Compute/sections/SecgroupConfig'
import Tag from '@Compute/views/vminstance/create/components/Tag'

export default {
  name: 'IDCCreate',
  components: {
    Duration,
    // 区域
    ItemArea,
    // SKU
    SKU,
    // 指定项目
    DomainProject,
    // 管理员密码
    ServerPassword,
    // 网络
    ItemNetwork,
    // 安全组
    SecgroupConfig,
    // 表单提交
    BottomBar,
    NameRepeated,
    // 标签
    Tag,
  },
  mixins: [changeMinxin],
  data () {
    return {
      loginTypes: ['random', 'password'],
      formItemLayout: {
        wrapperCol: {
          lg: { span: 18 },
          xl: { span: 20 },
          xxl: { span: 21 },
        },
        labelCol: {
          lg: { span: 6 },
          xl: { span: 4 },
          xxl: { span: 3 },
        },
      },
      decorators: DECORATORS,
    }
  },
  computed: {
    secgroupParams () {
      return this.scopeParams
    },
    scopeParams () {
      if (this.$store.getters.isAdminMode) {
        return {
          project_domain: this.project_domain,
        }
      }
      return { scope: this.$store.getters.scope }
    },
  },
}
</script>
