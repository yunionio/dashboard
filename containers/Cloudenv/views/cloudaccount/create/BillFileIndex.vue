<template>
  <div>
    <page-header :title="$t('cloudenv.text_168')" />
    <div style="padding: 7px" />
    <a-spin :spinning="!isRender">
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
        <component :is="form" ref="BILL_FORM" />
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
  data () {
    return {
      params: {
        data: [],
      },
      billform: this.isGoogle ? 'bigquery' : 'bucket',
      loading: false,
    }
  },
  computed: {
    isRender () {
      return this.params.data.length > 0
    },
    isGoogle () {
      return this.isRender && this.params.data[0].provider === 'Google'
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
      let ids = [this.$route.query.id]
      if (Array.isArray(this.$route.query.id)) {
        ids = this.$route.query.id
      }
      manager.batchGet({ id: ids, params: { $t: getRequestT() } })
        .then((res) => {
          this.params.data = res.data.data
          if (this.params.data && this.params.data.length > 0) {
            const a = this.params.data[0]
            if (a.provider === 'Google' && a.options && a.options.billing_bigquery_table) {
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
