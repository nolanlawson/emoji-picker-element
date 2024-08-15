// Write a bunch of *.tachometer.json files since they contain a lot of boilerplate
import fs from 'node:fs'

const benchmarks = fs.readdirSync('./test/benchmark').filter(_ => _.endsWith('.benchmark.js'))

for (const benchmark of benchmarks) {
  const benchmarkShortName = benchmark.replace('.benchmark.js', '')

  const content = {
    $schema: 'https://raw.githubusercontent.com/Polymer/tachometer/master/config.schema.json',
    sampleSize: 50,
    timeout: 5,
    autoSampleConditions: ['10%'],
    root: '../..',
    benchmarks: [
      {
        url: `./index.html?benchmark=${benchmarkShortName}`,
        browser: {
          name: 'chrome',
          headless: true
        },
        measurement: [
          {
            mode: 'performance',
            entryName: 'benchmark-total'
          }
        ],
        expand: [
          {
            name: 'this-change'
          },
          {
            name: 'tip-of-tree',
            packageVersions: {
              label: 'tip-of-tree',
              dependencies: {
                '@nolanlawson/emoji-picker-element-for-tachometer': {
                  kind: 'git',
                  repo: 'https://github.com/nolanlawson/emoji-picker-element.git',
                  ref: 'master',
                  setupCommands: [
                    // we're comparing against historical branches, so support yarn as well as pnpm since we switched
                    'if [ -f yarn.lock ]; then yarn --frozen-lockfile; else pnpm i --frozen-lockfile; fi',
                    'PERF=1 npm run build:rollup'
                  ]
                }
              }
            }
          }
        ]
      }
    ]
  }

  fs.writeFileSync(`./test/benchmark/${benchmarkShortName}.tachometer.json`, JSON.stringify(content, null, 2), 'utf-8')
}
