<template>
  <div class="position-relative">
    <div class="trigger d-flex align-items-center justify-content-center" @click="toggle">
      <a-badge :count="total" :overflowCount="99">
        <icon type="res-commonalert" style="font-size: 24px;" />
      </a-badge>
    </div>
    <a-alert type="error" v-if="visible" class="alertresource-error">
      <div slot="message" v-if="total > 0">
        <!-- 有 {{ total }} 个资源发生报警，<help-link href="/alertresource" @click="routerPush">查看</help-link> -->
        {{$t('common_719', [total])}},<a-button type="link" size="small" @click="routerPush">{{$t('common.view')}}<icon type="blank" /></a-button>
      </div>
      <div slot="message" v-else>
        {{$t('common_720')}}
      </div>
    </a-alert>
  </div>
</template>

<script>
export default {
  name: 'Alertresource',
  data () {
    return {
      visible: false,
      total: 0,
    }
  },
  created () {
    this.fetchAlertresource()
  },
  methods: {
    toggle () {
      this.visible = !this.visible
    },
    routerPush (e) {
      this.$router.push('alertresource')
    },
    async fetchAlertresource () {
      try {
        const params = { scope: this.$store.getters.scope, limit: 20, $t: +new Date() }
        const { data } = await new this.$Manager('alertresources', 'v1').list({ params })
        this.total = data.total
        this.visible = this.total > 0
      } catch (error) {
        throw error
      }
    },
  },
}
</script>

<style lang="less" scoped>
.trigger {
  height: 100%;
  cursor: pointer;
  text-decoration: none;
}
.alertresource-error {
  color: rgba(0,0,0,.65);
  width: 232px;
  position: absolute;
  top: 0;
  right:40px;
  &::after {
    display: block;
    content: "";
    width: 8px;
    height: 8px;
    transform: translateX(-50%) rotate(45deg);
    border: 1px solid #ffa39e;
    z-index: 10;
    position: absolute;
    background: #fff1f0;
    border-left-color: transparent;
    border-bottom-color: transparent;
    top: 14px;
    right: -9px;
  }
}
</style>
