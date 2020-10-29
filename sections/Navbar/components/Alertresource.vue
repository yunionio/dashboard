<template>
  <div class="position-relative">
    <div class="trigger d-flex align-items-center justify-content-center" @click="toggle">
      <a-badge :count="total" :overflowCount="99">
        <icon type="res-commonalert" class="alertresource-icon" />
      </a-badge>
    </div>
    <a-alert type="info" v-if="visible" class="alertresource-error">
      <div slot="message" v-if="total > 0">
        {{$t('common_719', [total])}},<a-button type="link" size="small" @click="routerPush">{{$t('common.view')}}</a-button>
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
    total: {
      type: Number,
      default: 0,
    },
  },
  data () {
    return {
      visible: this.total > 0,
    }
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
    routerPush (e) {
      this.$router.push('/alertresource')
    },
  },
}
</script>

<style lang="less" scoped>
@import '../../../styles/less/theme';

@keyframes glint {
  50% {
    color: red;
  }
}

.trigger {
  height: 100%;
  cursor: pointer;
  text-decoration: none;
  background: url('../')
}
.alertresource-icon {
  font-size: 24px;
  animation: glint 1.5s infinite;
}
.alertresource-error {
  color: rgba(0,0,0,.65);
  width: max-content;
  position: absolute;
  top: 0;
  right:40px;
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
