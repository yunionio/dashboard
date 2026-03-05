import { DOCS_MAP } from '@/constants/docs'

// 认证源认证类型帮助文档链接
export function docs (scope) {
  return DOCS_MAP.idpDocs()
}

export const idpDrivers = {
  LDAP: ['msad_one_domain', 'msad_multi_domain', 'openldap_one_domain'],
}
