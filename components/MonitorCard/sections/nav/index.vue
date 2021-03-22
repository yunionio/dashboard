<template>
  <div>
    <a-breadcrumb style="padding: 5px;">
      <span>{{ $t('cloudenv.text_374') + ": " }}</span>
      <a-breadcrumb-item v-for="(item, index) in navs" :key="item.id">
        <template v-if="index === lastIndex">
          <span class="monitor-overview-breadcrumb-span">{{ locationTitle(item.location) }}</span>
        </template>
        <template v-else>
          <a class="monitor-overview-breadcrumb-link" @click="changeNav(index)">{{ item.location }}</a>
        </template>
      </a-breadcrumb-item>
    </a-breadcrumb>
    <div
        v-if="this.total > 1"
        class="col-3"
        :style="{ fontSize: '20px', padding: '5px'}">
      <a-icon type="arrow-left" class="anticon anticon-arrow-left monitor-overview-breadcrumb-link" :style="{ cursor: 'pointer', }" @click="changeNav(navs.length-2)" />
      <span :style="{ paddingLeft: '5px' }">{{ navs[navs.length-1].name }}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OverviewNav',
  props: {
    items: {
      type: Array,
      /* { id: res_uuid, name: res_name, location: xxx } */
      default: () => { return [] },
    },
  },
  data () {
    const navs = [...this.items]
    return {
      navs: navs,
    }
  },
  computed: {
    total () {
      return this.navs ? this.navs.length : 0
    },
    lastIndex () {
      return this.total > 0 ? this.total - 1 : 0
    },
  },
  watch: {
    items: {
      deep: true,
      handler: function (val, oldVal) {
        this.$nextTick(() => {
          this.navs = [...val]
        })
      },
    },
  },
  methods: {
    locationTitle: function (base) {
      return this.$t('monitor.overview.location', [base])
    },
    changeNav (i) {
      this.navs = this.navs.slice(0, i + 1)
      console.log(this.navs)
      this.$emit('change', this.navs[i])
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../../../../src/styles/less/theme';

.monitor-overview-breadcrumb-span {
  color: @text-color-secondary !important;
}

.monitor-overview-breadcrumb-link {
  color: @primary-color !important;
}
</style>
