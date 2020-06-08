/* eslint-disable no-undef */
export const Manager = jest.fn()

Manager.prototype.list = jest.fn(() => {
  return Promise.resolve({ data: { data: [] } })
})
