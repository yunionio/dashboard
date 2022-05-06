<template>
  <div>
    <page-header :title="$t('cloudenv.text_168')" />
    <div style="padding: 7px" />
    <a-spin v-if="isUpdate" :spinning="!isRender">
      <content-info :params="params" v-if="isRender" />
    </a-spin>
    <page-body>
      <div>
        <div v-if="isGoogle" style="margin-bottom: 8px;">
          <span style="width: 190px;margin-right: 45px">{{ $t('cloudenv.bill.data_source') }}</span>
          <a-radio-group v-model="billform">
            <a-radio-button value="bigquery">
              Bigquery
            </a-radio-button>
            <a-radio-button value="bucket">
              Bucket
            </a-radio-button>
          </a-radio-group>
        </div>
        <component :account="account" :is="form" ref="BILL_FORM" />
      </div>
    </page-body>
    <page-footer>
      <div slot="right">
        <a-button class="mr-3" type="primary" @click="handleConfirm" :loading="loading">{{$t('cloudenv.text_169')}}</a-button>
        <test-button class="mr-3" :post="testPost" :isSuccessAlert="false" />
        <a-button @click="cancel">{{$t('cloudenv.text_170')}}</a-button>
      </div>
    </page-footer>
  </div>
</template>

<script>
import BillForm from './form/BillForm'
import BigQueryBillForm from './form/BigQueryBillForm'
import ContentInfo from './form/components/ContentInfo'
import TestButton from '@/sections/TestButton'
import { getRequestT } from '@/utils/utils'

export default {
  name: 'CloudaccountBillFileIndex',
  components: {
    BillForm,
    BigQueryBillForm,
    TestButton,
    ContentInfo,
  },
  props: {
    account: {
      type: Object,
    },
  },
  data () {
    return {
      params: {
        data: [],
      },
      billform: this.isGoogle ? 'bigquery' : 'bucket',
      loading: false,
      createAccountInfo: {},
    }
  },
  computed: {
    isUpdate () {
      return !!this.$route.query.id
    },
    isRender () {
      return this.params.data.length > 0
    },
    isGoogle () {
      return (this.isRender && this.params.data[0].provider === 'Google') || this.createAccountInfo?.provider === 'Google'
    },
    form () {
      if (this.billform === 'bigquery') {
        return 'BigQueryBillForm'
      } else {
        return 'BillForm'
      }
    },
  },
  created () {
    this.fetchData()
  },
  methods: {
    cancel () {
      this.$router.push('/cloudaccount')
    },
    testPost () {
      return this.$refs.BILL_FORM.testPost()
    },
    doSubmit () {
      return this.$refs.BILL_FORM.doSubmit()
    },
    async handleConfirm () {
      this.loading = true
      try {
        await this.$refs.BILL_FORM.doSubmit()
        this.cancel()
      } catch (err) {
        throw err
      } finally {
        this.loading = false
      }
    },
    fetchData () {
      const manager = new this.$Manager('cloudaccounts')
      let ids = []
      if (this.$route.query.id) {
        if (Array.isArray(this.$route.query.id)) {
          ids = this.$route.query.id
        } else {
          ids = [this.$route.query.id]
        }
      } else if (this.account && this.account.provider === 'Google') {
        this.params.data.length === 0 && (this.createAccountInfo = this.account)
        this.billform = 'bigquery'
        return
      }
      if (!ids.length) return
      manager.batchGet({ id: ids, params: { $t: getRequestT() } })
        .then((res) => {
          this.params.data = res.data.data
          if (this.params.data && this.params.data.length > 0) {
            const a = this.params.data[0]
            if (a.provider === 'Google') {
              this.billform = 'bigquery'
            } else {
              this.billform = 'bucket'
            }
          }
        })
    },
  },
}
</script>
