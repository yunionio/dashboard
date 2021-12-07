<template>
  <div>
    <a-alert
      :message="$t('compute.text_1032')"
      type="warning"
      style="margin-bottom: 20px" />
    <direction-list :type="this.getParams.type" :id="this.getParams.id" :isRead="isRead" :listId="getParams.listId" />
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
      return !this.isOwner
    },
    isOwner (obj) {
      if (!obj.domain_id && obj.data.domain_id) {
        obj = obj.data
      }
      if (this.isAdminMode) return true
      if (this.isDomainMode) return obj.domain_id === this.userInfo.projectDomainId
      return obj.tenant_id === this.userInfo.projectId
    },
  },
}
</script>
