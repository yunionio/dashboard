<template>
  <div>
    <a-alert
      :message="$t('compute.text_1032')"
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
