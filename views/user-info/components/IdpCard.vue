<template>
  <a-card
    v-if="idps && idps.length > 0"
    size="small"
    :title="$t('common_635')"
    class="mb-4">
    <div class="d-flex">
      <div class="d-flex idp-item align-items-center" v-for="item in idps" :key="item.id">
        <a-tooltip placement="top" :title="tooltipTitle(item)">
          <img :src="getIcon(item)" alt="" />
        </a-tooltip>
        <a-button v-if="item.isBind" type="link" size="small" @click="confirmUnBind(item)" :loading="unLoading === item.idp_id">{{$t('compute.text_260')}}</a-button>
        <a-button v-else type="link" size="small" @click="handleBind(item)">{{$t('common_636')}}</a-button>
      </div>
    </div>
  </a-card>
</template>

<script>
import DialogMixin from '@/mixins/dialog'
import WindowsMixin from '@/mixins/windows'

export default {
  name: 'IdpCard',
  mixins: [DialogMixin, WindowsMixin],
  data () {
    return {
      loading: false,
      unLoading: false,
      idps: [],
    }
  },
  created () {
    this.authManager = new this.$Manager('auth', 'v1')
    this.queryIdp()
  },
  mounted () {
    const { query = {} } = this.$route
    const { result, error_class = this.$t('common_637'), error_details } = query
    if (result === 'error') {
      this.$notification.error({
        message: error_class,
        description: error_details,
      })
    }
    this.$router.replace({
      path: '/user',
      query: {
        result: undefined,
        error_class: undefined,
        error_details: undefined,
        ...query,
      },
    })
  },
  methods: {
    getIcon (idp) {
      const { template, driver } = idp
      const key = (template || driver).toLocaleLowerCase()
      return require(`@/assets/images/idp-icons/round/${key}.png`)
    },
    handleBind (idp) {
      const { origin } = window.location
      const { id } = idp
      window.location.href = `${origin}/api/v1/auth/sso/redirect/${id}?linkuser`
    },
    tooltipTitle (idp) {
      const template = this.$t(`idpTmplTitles.${idp.template || idp.driver}`)
      return this.$t('common_638', [template, idp.name])
    },
    confirmUnBind (idp) {
      const template = this.$t(`idpTmplTitles.${idp.template || idp.driver}`)
      this.createDialog('ConfirmDialog', {
        header: this.$t('compute.text_260'),
        title: this.$t('common_639', [template]),
        onOk: () => this.fetchUnBind(idp),
      })
    },
    async fetchUnBind (idp) {
      const { idp_id, idp_entity_id } = idp
      this.unLoading = idp_id
      try {
        await this.authManager.performClassAction({
          action: 'unlink-idp',
          data: {
            idp_id,
            idp_entity_id,
          },
        })
        await this.queryIdp()
      } catch (err) {
        throw err
      } finally {
        this.unLoading = false
      }
    },
    async queryIdp () {
      this.loading = true
      try {
        const regionRet = await this.authManager.get({
          id: 'regions',
          params: {
            auto_create_user: false,
            domain: this.$store.getters.userInfo.projectDomainId,
          },
        })
        const userRet = await this.authManager.get({
          id: 'user',
        })
        let regionIdps = []
        if (regionRet && regionRet.data && regionRet.data.idps) {
          regionIdps = regionRet.data.idps
        }
        const userIdps = {}
        if (userRet && userRet.data && userRet.data.data && userRet.data.data.idps) {
          const _idps = userRet.data.data.idps || []
          _idps.forEach(item => {
            userIdps[item.idp_id] = item
          })
        }
        if (Object.keys(userIdps).length > 0) {
          this.idps = regionIdps.map(item => {
            const userIdp = userIdps[item.id]
            if (userIdp) {
              item.isBind = true
              item.idp_id = userIdp.idp_id
              item.idp_entity_id = userIdp.idp_entity_id
            }
            return item
          })
        } else {
          this.idps = regionIdps
        }
      } catch (err) {
        throw err
      }
    },
  },
}
</script>
<style lang="scss" scoped>
  .idp-item{
    margin: 15px;
    img {
      height: 30px;
      width: 30px;
    }
  }
</style>
