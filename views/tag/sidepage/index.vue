<template>
  <base-side-page
    @cancel="cancelSidePage"
    :title="$t('cloudenv.text_16')"
    icon="res-tag"
    :res-name="detailData.name"
    :actions="params.actions"
    :current-tab="params.windowData.currentTab"
    :tabs="detailTabs"
    :loaded="loaded"
    @tab-change="handleTabChange">
    <component
      :is="params.windowData.currentTab"
      :res-id="data.id"
      :data="detailData"
      :on-manager="onManager"
      :cloud-env="params.cloudEnv"
      @tab-change="handleTabChange" />
  </base-side-page>
</template>

<script>
import ColumnsMixin from '../mixins/columns'
import TagDetail from './Detail'
import BindResource from './BindResource'
import SidePageMixin from '@/mixins/sidePage'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'TagSidePage',
  components: {
    TagDetail,
    BindResource,
  },
  mixins: [SidePageMixin, WindowsMixin, ColumnsMixin],
  data () {
    return {
      detailTabs: [
        { label: this.$t('cloudenv.text_237'), key: 'tag-detail' },
        { label: this.$t('cloudenv.text_439'), key: 'bind-resource' },
        // { label: '操作日志', key: 'event-drawer' },
      ],
    }
  },
}
</script>
