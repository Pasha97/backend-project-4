import { beforeEach, expect, test } from '@jest/globals'

import fs from 'fs/promises'
import path from 'path'
import os from 'os'
import { fileURLToPath } from 'url'
import nock from 'nock'
import * as cheerio from 'cheerio'
import pageLoader from '../src/index.js'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const fixturesPath = path.join(__dirname, '__fixtures__')

const host = 'https://page.ru'
const route = '/test'
const url = `${host}${route}`

const pageHost = 'https://ru.hexlet.io'
const pageRoute = '/courses'
const pageUrl = `${pageHost}${pageRoute}`

let tempDir

beforeEach(async () => {
  tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'page-loader-'))
})

const mockPageWithAllResources = (inputHtml, imageData) => {
  nock(pageHost).get(pageRoute).reply(200, inputHtml)
  nock(pageHost).get('/assets/professions/nodejs.png').reply(200, imageData)
  nock(pageHost).get('/assets/application.css').reply(200, Buffer.from('body {}'))
  nock(pageHost).get('/packs/js/runtime.js').reply(200, Buffer.from('console.log(1)'))
  nock(pageHost).get('/courses').reply(200, '<html></html>')
}

test('downloads page', async () => {
  const html = '<html><body>Test</body></html>'

  nock(host)
    .get(route)
    .reply(200, html)

  const filepath = await pageLoader(url, tempDir)

  const content = await fs.readFile(filepath, 'utf-8')

  expect(content).toContain('Test')
})

test('throws error on bad request', async () => {
  nock(host)
    .get(route)
    .reply(500)

  await expect(pageLoader(url, tempDir)).rejects.toThrow()
})

test('downloads image from same host', async () => {
  const inputHtml = await fs.readFile(path.join(fixturesPath, 'ru-hexlet-io-courses.html'), 'utf-8')
  const imageData = await fs.readFile(path.join(fixturesPath, 'images', 'nodejs.png'))

  mockPageWithAllResources(inputHtml, imageData)

  await pageLoader(pageUrl, tempDir)

  const imagePath = path.join(tempDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-professions-nodejs.png')
  const savedImage = await fs.readFile(imagePath)

  expect(savedImage).toEqual(imageData)
})

test('downloads css and js files', async () => {
  const inputHtml = await fs.readFile(path.join(fixturesPath, 'ru-hexlet-io-courses.html'), 'utf-8')
  const imageData = await fs.readFile(path.join(fixturesPath, 'images', 'nodejs.png'))
  const cssData = Buffer.from('body {}')
  const jsData = Buffer.from('console.log(1)')

  nock(pageHost).get(pageRoute).reply(200, inputHtml)
  nock(pageHost).get('/assets/professions/nodejs.png').reply(200, imageData)
  nock(pageHost).get('/assets/application.css').reply(200, cssData)
  nock(pageHost).get('/packs/js/runtime.js').reply(200, jsData)
  nock(pageHost).get('/courses').reply(200, '<html></html>')

  await pageLoader(pageUrl, tempDir)

  const cssPath = path.join(tempDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-assets-application.css')
  const jsPath = path.join(tempDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-packs-js-runtime.js')

  expect(await fs.readFile(cssPath)).toEqual(cssData)
  expect(await fs.readFile(jsPath)).toEqual(jsData)
})

test('rewrites img src to local path in saved HTML', async () => {
  const inputHtml = await fs.readFile(path.join(fixturesPath, 'ru-hexlet-io-courses.html'), 'utf-8')
  const imageData = await fs.readFile(path.join(fixturesPath, 'images', 'nodejs.png'))

  mockPageWithAllResources(inputHtml, imageData)

  const htmlFilepath = await pageLoader(pageUrl, tempDir)
  const savedHtml = await fs.readFile(htmlFilepath, 'utf-8')
  const $ = cheerio.load(savedHtml)

  expect($('img').attr('src')).toBe('ru-hexlet-io-courses_files/ru-hexlet-io-assets-professions-nodejs.png')
})

test('rewrites link href and script src to local paths in saved HTML', async () => {
  const inputHtml = await fs.readFile(path.join(fixturesPath, 'ru-hexlet-io-courses.html'), 'utf-8')
  const imageData = await fs.readFile(path.join(fixturesPath, 'images', 'nodejs.png'))

  mockPageWithAllResources(inputHtml, imageData)

  const htmlFilepath = await pageLoader(pageUrl, tempDir)
  const savedHtml = await fs.readFile(htmlFilepath, 'utf-8')
  const $ = cheerio.load(savedHtml)

  expect($('link[rel="stylesheet"][href*="application"]').attr('href'))
    .toBe('ru-hexlet-io-courses_files/ru-hexlet-io-assets-application.css')
  expect($('script[src*="runtime"]').attr('src'))
    .toBe('ru-hexlet-io-courses_files/ru-hexlet-io-packs-js-runtime.js')
  expect($('link[rel="canonical"]').attr('href'))
    .toBe('ru-hexlet-io-courses_files/ru-hexlet-io-courses.html')
  expect($('link[href*="cdn2.hexlet.io"]').attr('href'))
    .toBe('https://cdn2.hexlet.io/assets/menu.css')
  expect($('script[src*="stripe"]').attr('src'))
    .toBe('https://js.stripe.com/v3/')
})

test('does not download images from other hosts', async () => {
  const htmlWithExternal = '<html><body><img src="https://external.com/img.png"><img src="/local.png"></body></html>'
  const localImageData = Buffer.from([0x89, 0x50, 0x4e, 0x47])

  nock(pageHost).get(pageRoute).reply(200, htmlWithExternal)
  nock(pageHost).get('/local.png').reply(200, localImageData)

  await pageLoader(pageUrl, tempDir)

  const localPath = path.join(tempDir, 'ru-hexlet-io-courses_files', 'ru-hexlet-io-local.png')
  const saved = await fs.readFile(localPath)

  expect(saved).toEqual(localImageData)
})
