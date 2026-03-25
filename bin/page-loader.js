#!/usr/bin/env node

import { Command } from 'commander'
import path from 'path'
import process from 'process'
import pageLoader from '../src/index.js'

const program = new Command()

program
  .name('page-loader')
  .description('Page loader utility')
  .argument('<url>')
  .version('1.0.0')
  .option('-o, --output [dir]', 'output dir', process.cwd())
  .action((url, options) => {
    const outputDir = path.resolve(options.output)

    pageLoader(url, outputDir)
      .then((filepath) => {
        console.log(filepath)
      })
      .catch((err) => {
        console.error(err.message)
        process.exit(1)
      })
  })

program.parse(process.argv)
