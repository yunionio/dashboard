<template>
  <div>
    <a-alert
      message="提示：安全组出方向默认允许所有访问，即从安全组内云服务器访问外部都是放行的"
      type="warning"
      style="margin-bottom: 20px" />
    <direction-list :type="this.getParams.type" :id="this.getParams.id" :isRead="isRead" />
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
