<template>
  <div>
    <access-group-rule-list :type="getParams.type" :id="getParams.id" :isRead="isRead" />
  </div>
</template>

<script>
import { mapGetters } from 'vuex'
import AccessGroupRuleList from '../components/AccessGroupRule'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'AccessGroupRule',
  components: {
    AccessGroupRuleList,
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
      return !this.isPower
    },
    isPower (obj) {
      if (!obj.domain_id && obj.data.domain_id) {
        obj = obj.data
      }
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return false
    },
  },
}
</script>
