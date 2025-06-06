import { genDocsUrl } from '@/utils/utils'
import i18n from '@/locales'
import store from '@/store'

// 认证源认证类型帮助文档链接
export function docs (scope) {
  const idpUrl = genDocsUrl({
    scope,
    isSysCE: store.getters.isSysCE,
    cePath: 'guides/auth_security/identity/providers',
    eePath: 'web_ui/iam/keystone/ldp',
  })
  return {
    // google_oidc: `${idpUrl}/#${i18n.t('system.google_oidc_doc')}`,
    github_oidc: `${idpUrl}/#${i18n.t('system.github_oidc_doc')}`,
    azure_oidc: `${idpUrl}/#${i18n.t('system.azure_oidc_doc')}`,
    azure_ad_saml: `${idpUrl}/#${i18n.t('system.azure_ad_saml_doc')}`,
    saml: `${idpUrl}/#${i18n.t('system.saml_doc')}`,
    feishu_oauth2: `${idpUrl}/#${i18n.t('system.feishu_oauth2_doc')}`,
    dingtalk_oauth2: `${idpUrl}/#${i18n.t('system.dingtalk_oauth2_doc')}`,
    qywechat_oauth2: `${idpUrl}/#${i18n.t('system.qywechat_oauth2_doc')}`,
  }
}

export const idpDrivers = {
  LDAP: ['msad_one_domain', 'msad_multi_domain', 'openldap_one_domain'],
}
