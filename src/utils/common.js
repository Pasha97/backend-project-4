import { URL } from 'url'

export const buildFilename = (url) => {
  const { hostname, pathname } = new URL(url)

  const name = `${hostname}${pathname}`
    .replace(/[^a-zA-Z0-9]/g, '-')
    .replace(/-+$/g, '')

  return `${name}.html`
}
