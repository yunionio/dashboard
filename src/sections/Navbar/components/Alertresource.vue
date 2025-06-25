<template>
  <div class="position-relative">
    <div class="trigger d-flex align-items-center justify-content-center" @click="toggle">
      <a-badge v-if="total" :count="total" :overflowCount="99">
        <icon type="res-commonalerts" class="alertresource-icon" />
      </a-badge>
      <a-tooltip v-else :title="$t('common.resource_alert')" placement="right">
        <icon type="res-commonalerts" class="alertresource-icon" />
      </a-tooltip>
    </div>
    <a-alert type="info" v-if="visible" class="alertresource-error">
      <div slot="message" v-if="total > 0">
        <div v-if="res_total > 0">
          {{$t('common_719', [res_total])}}<a-button type="link" size="small" @click="routerRes">{{$t('common.view')}}</a-button>
        </div>
        <div v-if="alert_total > 0">
          {{$t('common_alert_tips', [alert_total])}}<a-button type="link" size="small" @click="routerAlert">{{$t('common.view')}}</a-button>
        </div>
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
  props: {
    res_total: {
      type: Number,
      default: 0,
    },
    alert_total: {
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      visible: (this.res_total + this.alert_total) > 0,
    }
  },
  computed: {
    total () {
      return this.res_total + this.alert_total
    },
  },
  watch: {
    total (v) {
      if (v > 0) this.visible = true
      else this.visible = false
    },
  },
  methods: {
    toggle () {
      this.visible = !this.visible
    },
    routerRes (e) {
      this.$router.push('/alertresource')
    },
    routerAlert (e) {
      this.$router.push('/alertrecord')
    },
  },
}
</script>

<style lang="less" scoped>
@import "~ant-design-vue/lib/style/themes/default";

@keyframes glint {
  50% {
    color: red;
  }
}

.trigger {
  height: 100%;
  cursor: pointer;
  text-decoration: none;
}
.alertresource-icon {
  font-size: 22px;
  // animation: glint 1.5s infinite; // !打开动画之后 Renderer CPU 会在13%～15%左右
}
.alertresource-error {
  color: rgba(0,0,0,.65);
  width: max-content;
  position: absolute;
  top: 0;
  right:40px;
  z-index: 10;
  &::after {
    display: block;
    content: "";
    width: 8px;
    height: 8px;
    transform: translateX(-50%) rotate(45deg);
    border: 1px solid @primary-color;
    z-index: 10;
    position: absolute;
    background: @alert-info-bg-color;
    border-left-color: transparent !important;
    border-bottom-color: transparent !important;
    top: 14px;
    right: -9px;
  }
}
</style>
