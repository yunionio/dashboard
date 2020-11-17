<template>
  <div>
    <!-- <page-header :title="$t('common_198')" /> -->
    <a-tabs v-model="curProcess" @change="curProcessHandle" :animated="false">
      <a-tab-pane
        v-for="obj in tabPanels"
        :tab="obj.label"
        :key="obj.name">
        <component v-if="curProcess === obj.name" :is="curProcess" :listId="curProcess" />
      </a-tab-pane>
    </a-tabs>
  </div>
</template>

<script>
import mixin from './mixins'
import MeProcess from './me-process/components/List'
import ApprovalStart from './approval-start/components/List'
import ApprovedDone from './approved-done/components/List'
import MePartake from './me-partake/components/List'
import ThirdProcess from './third-process/components/List'
import AllProcess from './all-process/components/List'

export default {
  components: {
    MeProcess,
    ApprovalStart,
    ApprovedDone,
    MePartake,
    ThirdProcess,
    AllProcess,
  },
  mixins: [mixin],
  data () {
    return {}
  },
}
</script>
