<template>
  <a-popover v-model="visible" trigger="click" placement="left">
    <template slot="content">
      <a-icon type="sync" spin v-if="loading" />
      <div v-else class="info-wrapper">
        <div>
          <span class="label inline-block">{{$t('compute.text_1017')}}：</span>
          <span class="inline-block"><list-body-cell-wrap copy alwaysShowCopyBtn field="vnc_type" :row="form" /></span>
        </div>
        <div class="mt-2">
          <span class="label inline-block">{{$t('compute.text_386')}}：</span>
          <span class="inline-block"><list-body-cell-wrap copy alwaysShowCopyBtn field="ip" :row="form" /></span>
        </div>
        <div class="mt-2">
          <span class="label inline-block">{{$t('compute.text_349')}}：</span>
          <span class="inline-block"><list-body-cell-wrap copy alwaysShowCopyBtn field="port" :row="form" /></span>
        </div>
        <div class="mt-2">
          <span class="label inline-block">{{$t('compute.text_340')}}：</span>
          <span class="inline-block"><list-body-cell-wrap copy alwaysShowCopyBtn field="password" :row="form" /></span>
        </div>
      </div>
    </template>
    <div>
      <div class="info-btn d-flex justify-content-center" @click.stop="handleWrapClick">
        <span @click.stop="handleButtonClick" style="font-size: 12px">{{buttonText}}</span>
        <span class="ml-2" @click.stop="handleKeyClick">
          <icon size="12" class="keypair-icon" type="keypairs" fill="#555" />
        </span>
      </div>
    </div>
  </a-popover>
</template>

<script>
export default {
  name: 'VncInfoFetcher',
  props: {
    onManager: Function,
    row: Object,
    buttonText: String,
    buttonProps: Object,
  },
  data () {
    return {
      visible: false,
      loading: false,
      form: {
        vnc_type: '',
        ip: '',
        port: '',
        password: '',
      },
    }
  },
  methods: {
    handleWrapClick (e) {
      this.$nextTick(() => {
        if (this.visible) return
        this.buttonProps.onClick(e)
      })
    },
    handleButtonClick (e) {
      this.$nextTick(() => {
        if (this.visible) return
        this.buttonProps.onClick(e)
      })
    },
    handleKeyClick () {
      this.visible = !this.visible
      this.$nextTick(async () => {
        if (this.visible === false) return
        this.loading = true
        try {
          const { data = {} } = await new this.$Manager('servers', 'v2').getSpecific({
            id: this.row.id,
            spec: 'vnc',
          })
          this.form.vnc_type = data.protocol || '-'
          this.form.ip = data.host || '-'
          this.form.port = data.port || '-'
          this.form.password = data.password || '-'
          this.loading = false
        } catch (err) {
          this.loading = false
          throw err
        }
      })
    },
  },
}
</script>

<style lang="less" scoped>
@import '~@/styles/less/theme';
.info-btn:hover{
  color: @primary-color;
}
.info-wrapper {
  font-size: 14px;
}
.label {
  width: 100px;
}
.inline-block {
  display: inline-block;
}
</style>
