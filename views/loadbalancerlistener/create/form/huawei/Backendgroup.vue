<template>
  <a-form :form="form.fc" class="mt-3" v-bind="formItemLayout">
    <a-form-item label="后端服务器组">
      <base-select
        v-decorator="decorators.backend_group"
        resource="loadbalancerbackendgroups"
        :params="backendgroupParams"
        :item.sync="backendgroup"
        @change="fetchBackendList"
        :select-props="{ placeholder: '请选择后端服务器组' }" />
    </a-form-item>
    <a-form-item label="后端服务器" :extra="backendgroup.name ? `${backendgroup.name} 后端服务器组所包含的服务器` : ''">
      <vxe-grid size="mini" border :columns="backendColumns" :data="backendList" />
    </a-form-item>
  </a-form>
</template>

<script>
import mixin from '../mixins/formStepItem'

export default {
  name: 'LBListenerCreateBackendgroup',
  mixins: [mixin],
}
</script>
