export const API = 'http://localhost:3002/api'

export const getToken = () => localStorage.getItem('token')

export const authHeaders = () => ({
  Authorization: `Bearer ${getToken()}`,
  'Content-Type': 'application/json',
})

export const fetchAuth = (url, options = {}) => {
  return fetch(url, {
    ...options,
    headers: { Authorization: `Bearer ${getToken()}`, ...options.headers },
  })
}
