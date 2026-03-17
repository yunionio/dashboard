<template>
  <base-dialog @cancel="cancelDialog">
    <div slot="header">{{this.params.title}}</div>
    <div slot="body" v-loading="loading" style="min-height: 130px">
        <template v-if="isSuccess">
        <div class="text-center mt-2">
          <a-icon type="check-circle" style="font-size: 46px;"  theme="twoTone" twoToneColor="#52c41a" />
          <h4 style="color: #52c41a;" class="mt-2">{{$t('scope.text_9')}}</h4>
          <a @click.stop="downloadFile"><a-icon type="download" class="mr-2" />{{$t('scope.text_10')}}</a>
        </div>
        <div class="mt-2">
          <div class="d-flex">
            <div style="width: 140px;" class="text-right flex-shrink-0 flex-grow-0">AccessKey：</div>
            <div class="flex-fill">
              <list-body-cell-wrap copy :row="data" field="key_id" />
            </div>
          </div>
          <div class="d-flex mt-2">
            <div style="width: 140px;" class="text-right flex-shrink-0 flex-grow-0">AccessKeySecret：</div>
            <div class="flex-fill">
              <list-body-cell-wrap copy :row="data" field="secret" />
            </div>
          </div>
        </div>
      </template>
      <template v-else>
        <div class="text-center">
          <a-icon type="close-circle" style="font-size: 46px;" theme="twoTone" twoToneColor="#f5222d" />
          <h4 style="color: #f5222d;" class="mt-2">{{$t('scope.text_11')}}</h4>
          <a-button type="link" @click="doCreateAk">{{$t('scope.text_12')}}</a-button>
        </div>
      </template>
    </div>
    <div slot="footer">
      <a-button type="primary" @click="cancelDialog">{{ $t("dialog.ok") }}</a-button>
      <a-button @click="cancelDialog">{{ $t('dialog.cancel') }}</a-button>
    </div>
  </base-dialog>
</template>
<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'CredentialAccessKeyCreate',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      isSuccess: false,
      data: {},
    }
  },
  destroyed () {
    this.manager = null
  },
  created () {
    this.manager = new this.$Manager('credentials', 'v1')
    this.doCreateAk()
  },
  methods: {
    async doCreateAk () {
      this.loading = true
      try {
        const response = await this.manager.rpc({ methodname: 'DoCreateAccessKeySecret' })
        const data = response.data || {}
        this.data = data
        this.isSuccess = true
        this.params.refresh()
      } catch (error) {
        this.isSuccess = false
      } finally {
        this.loading = false
      }
    },
    downloadFile (e) {
      const thead = [
        {
          title: 'AccessKey',
          field: 'key_id',
        },
        {
          title: 'AccessKeySecret',
          field: 'secret',
        },
      ]
      const tbody = [this.data]
      const theadStr = thead.map(({ title }) => title).join(',')
      let tbodyStr = ''
      tbody.forEach(tr => {
        const trArr = thead.map(ths => {
          const k = ths.field
          if (tr[k] && typeof tr[k] === 'string') {
            return tr[k]
          } else {
            return '-'
          }
        })
        tbodyStr += trArr.join(',')
        tbodyStr += '\n'
      })
      const str = encodeURIComponent(`${theadStr}\n${tbodyStr}`)
      e.target.href = 'data:text/csv;charset=utf-8,\ufeff' + str
      e.target.download = 'accesskey.csv'
    },
  },
}
</script>
