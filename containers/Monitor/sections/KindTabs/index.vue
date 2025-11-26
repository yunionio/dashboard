<template>
    <div slot="header" class="clearfix kind-tab-header">
      <div class="float-left">
        <a-radio-group v-model="activeTab" @change="radioChange">
          <a-radio-button :value="item.key" v-for="item in tabsC" :key="item.key">{{ item.label }}</a-radio-button>
          <project-radio :domain.sync="domain" :activeTab.sync="activeTab" />
          <tag-radio :label.sync="label" :activeTab.sync="activeTab" :tabs="tabs" />
        </a-radio-group>
      </div>
      <div class="float-right d-flex">
        <date-time :getParams.sync="dateParams" :canSelectTodayAfter="false" />
      </div>
    </div>
</template>
<script>
import i18n from '@/locales'
import { currencyUnitMap } from '@/constants/currency'

const allTabs = {
  'cpu-usage': {
    label: i18n.t('common.brand'),
    key: 'cpu-usage',
    index: 1,
  },
  'network-recv': {
    label: i18n.t('common.resource_type'),
    key: 'network-recv',
    index: 2,
  },
  'network-send': {
    label: i18n.t('common.resource'),
    key: 'network-send',
    index: 3,
  },
  'disk-read': {
    label: i18n.t('dictionary.cloudaccount'),
    key: 'disk-read',
    index: 4,
  },
  'disk-write': {
    label: i18n.t('dictionary.cloudprovider'),
    key: 'disk-write',
    index: 5,
  },
}

export default {
  name: 'KindTabs',
  components: {
  },
  props: {
    tabs: {
      type: Array,
      default: () => Object.values(allTabs),
    },
    platform: String,
    account: String,
    envParams: Object,
    currencySign: {
      type: String,
      default: currencyUnitMap.CNY.sign,
    },
    currencyParams: {
      type: Object,
      default: () => ({}),
    },
  },
  data () {
    return {
      activeTab: this.tabs[0].key,
      label: undefined,
      domain: undefined,
      labelLoading: false,
      loading: false,
      dateParams: {},
    }
  },
  computed: {
    tabsC () {
      return this.tabs.filter(val => {
        if (val.key === 'project') return false
        if (val.key === 'tag') return false
        if (!this.$store.getters.isAdminMode && val.key === 'domain') return false
        return true
      }).sort((a, b) => {
        return allTabs[a.key].index - allTabs[b.key].index
      })
    },
  },
  methods: {
    radioChange () {
      this.label = ''
    },
    loadChange (status) {
      this.labelLoading = status
    },
  },
}
</script>

<style lang="less" scoped>
.kind-tab-header {
  &::v-deep .ant-calendar-range-picker-input {
    width: 86px !important;
  }
}
</style>
