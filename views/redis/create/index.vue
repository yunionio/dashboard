<template>
  <div class="redis-create-index">
    <page-header title="新建" />
    <a-divider orientation="left">基础配置</a-divider>
    <a-form
      class="mt-3"
      v-bind="formItemLayout"
      :form="form.fc">
      <a-form-item label="指定项目" class="mb-0">
        <domain-project :decorators="decorators.projectDomain" :fc="form.fc" :labelInValue="false" />
      </a-form-item>
      <a-form-item label="名称">
        <a-input v-decorator="decorators.generate_name" :placeholder="$t('validator.serverName')" />
        <name-repeated v-slot:extra res="elasticcaches" :name="form.getFieldValue('generate_name')" />
      </a-form-item>
      <!-- 计费方式 -->
      <clearing-radios v-bind="formItemLayout" />
      <a-form-item label="到期释放" v-if="form.fd.billing_type !== 'prepaid'">
        <duration :decorators="decorators.duration" :form="form" />
      </a-form-item>
      <a-form-item label="数量">
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
      <a-form-item label="管理员密码">
        <server-password :loginTypes="loginTypes" :decorator="decorators.loginConfig" :form="form" />
      </a-form-item>
      <!-- 网络 -->
      <item-network ref="REF_NETWORK" />
      <bottom-bar :values="form.fc.getFieldsValue()" />
    </a-form>
  </div>
</template>
<script>
import { CreateServerForm } from '@Compute/constants'
import { DECORATORS } from '@DB/views/redis/constants'
import ServerPassword from '@Compute/sections/ServerPassword'
import Duration from '@Compute/sections/Duration'
import ItemArea from '@DB/sections/ItemArea'
import ItemNetwork from '@DB/sections/ItemNetwork'
import SKU from './components/SKU'
import BottomBar from './components/BottomBar'
import changeMinxin from './changeMinxin'
import DomainProject from '@/sections/DomainProject'
import NameRepeated from '@/sections/NameRepeated'

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
    // 表单提交
    BottomBar,
    NameRepeated,
  },
  mixins: [changeMinxin],
  data () {
    return {
      loginTypes: ['random', 'password'],
      formItemLayout: {
        wrapperCol: { span: CreateServerForm.wrapperCol },
        labelCol: { span: CreateServerForm.labelCol },
      },
      decorators: DECORATORS,
      scopeParams: {
        scope: this.$store.getters.scope,
        project_domain: '',
      },
    }
  },
}
</script>

<style lang="scss" scoped>
.redis-create-index {
  ::v-deep .ant-form{
    padding-left: 20px;
  }
}
</style>
