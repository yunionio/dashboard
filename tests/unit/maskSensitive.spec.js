import { maskSensitiveData, maskSensitiveUrlQuery } from '@/utils/maskSensitive'

describe('maskSensitiveData', () => {
  it('打码密码类字段', () => {
    const data = {
      username: 'admin',
      password: 'secret123',
      password_old: 'oldpass',
      password_new: 'newpass',
      password_confirm: 'newpass',
    }
    expect(maskSensitiveData(data)).toEqual({
      username: 'admin',
      password: '******',
      password_old: '******',
      password_new: '******',
      password_confirm: '******',
    })
  })

  it('打码 token/密钥/认证字段（不区分大小写）', () => {
    const data = {
      name: 'vm1',
      token: 'jwt-token-value',
      AccessToken: 'access-value',
      api_key: 'key-value',
      SECRET_KEY: 'secret-value',
      client_secret: 'client-secret-value',
      authorization: 'Bearer xxx',
    }
    const masked = maskSensitiveData(data)
    expect(masked.name).toBe('vm1')
    expect(masked.token).toBe('******')
    expect(masked.AccessToken).toBe('******')
    expect(masked.api_key).toBe('******')
    expect(masked.SECRET_KEY).toBe('******')
    expect(masked.client_secret).toBe('******')
    expect(masked.authorization).toBe('******')
  })

  it('递归打码嵌套对象与数组，非敏感字段原样保留', () => {
    const data = {
      auth: {
        user: 'u1',
        password: 'nested-pass',
        meta: [{ key: 'a', token: 'nested-token' }],
      },
      projects: [{ id: 'p1', name: 'project1' }],
      count: 3,
    }
    const masked = maskSensitiveData(data)
    expect(masked.auth.password).toBe('******')
    expect(masked.auth.meta[0].token).toBe('******')
    expect(masked.auth.meta[0].key).toBe('a')
    expect(masked.projects).toEqual([{ id: 'p1', name: 'project1' }])
    expect(masked.count).toBe(3)
  })

  it('headers 中认证头与 cookie 被打码', () => {
    const headers = {
      Accept: 'application/json',
      Authorization: 'Bearer real-jwt',
      'X-Auth-Token': 'xauth-value',
      Cookie: 'session=abc123',
    }
    expect(maskSensitiveData(headers)).toEqual({
      Accept: 'application/json',
      Authorization: '******',
      'X-Auth-Token': '******',
      Cookie: '******',
    })
  })

  it('非对象输入原样返回', () => {
    expect(maskSensitiveData(null)).toBe(null)
    expect(maskSensitiveData(undefined)).toBe(undefined)
    expect(maskSensitiveData('string')).toBe('string')
    expect(maskSensitiveData(42)).toBe(42)
  })
})

describe('maskSensitiveUrlQuery', () => {
  it('打码 query 中敏感参数，保留其余参数', () => {
    expect(maskSensitiveUrlQuery('/api/v1/login?username=admin&password=pw123&captcha=ab'))
      .toBe('/api/v1/login?username=admin&password=******&captcha=ab')
  })
  it('无 query 或无敏感参数时原样返回', () => {
    expect(maskSensitiveUrlQuery('/api/v1/servers')).toBe('/api/v1/servers')
    expect(maskSensitiveUrlQuery('/api/v1/servers?name=vm1')).toBe('/api/v1/servers?name=vm1')
    expect(maskSensitiveUrlQuery(null)).toBe(null)
  })
})
