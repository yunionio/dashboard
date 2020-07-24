<template>
  <div>
     <a-alert
      message="提示：安全组未设置任何自定义放行规则，会导致无法访问云服务器端口，若需访问请添加安全组规则放行对应的端口"
      type="warning"
      style="margin-bottom: 20px" />
    <direction-list :type="getParams.type" :id="getParams.id" :isRead="isRead" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import DirectionList from '../components/Direction'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'InDirection',
  components: {
    DirectionList,
  },
  mixins: [WindowsMixin],
  props: {
    getParams: {
      type: Object,
      required: true,
    },
    resId: String,
    data: {
      type: Object,
      required: true,
    },
  },
  computed: {
    ...mapGetters(['isAdminMode', 'isDomainMode', 'isProjectMode', 'userInfo']),
    isRead () {
      return this.isProjectMode && this.userInfo.projectId !== this.data.tenant_id
    },
  },
}
</script>
