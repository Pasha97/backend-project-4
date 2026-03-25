import { beforeEach, expect, test } from '@jest/globals'

import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import nock from 'nock'
import pageLoader from '../src/index.js'

const host = 'https://page.ru'
const route = '/test'
const url = `${host}${route}`

let tempDir

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'))
})

test('downloads page', async () => {
  const html = '<html><body>Test</body></html>'

  nock(host)
    .get(route)
    .reply(200, html)

  const filepath = await pageLoader(url, tempDir)

  const content = await fs.readFile(filepath, 'utf-8')

  expect(content).toBe(html)
})

test('throws error on bad request', async () => {
  nock(host)
    .get(route)
    .reply(500)

  await expect(pageLoader(url, tempDir)).rejects.toThrow()
})
