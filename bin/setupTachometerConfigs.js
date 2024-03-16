// Write a bunch of *.tachometer.json files since they contain a lot of boilerplate
import fs from 'node:fs'

const benchmarks = fs.readdirSync('./test/benchmark').filter(_ => _.endsWith('.benchmark.js'))

for (const benchmark of benchmarks) {
  const benchmarkShortName = benchmark.replace('.benchmark.js', '')

  const content = {
    $schema: 'https://raw.githubusercontent.com/Polymer/tachometer/master/config.schema.json',
    sampleSize: 200,
    timeout: 15,
    autoSampleConditions: ['1%'],
    benchmarks: [
      {
        url: `./index.html?benchmark=${benchmarkShortName}`,
        browser: {
          name: 'chrome',
          headless: true,
          cpuThrottlingRate: 4
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
                'emoji-picker-element': {
                  kind: 'git',
                  repo: 'https://github.com/nolanlawson/emoji-picker-element.git',
                  ref: 'master',
                  setupCommands: [
                    'yarn --immutable --ignore-scripts',
                    'PERF=1 yarn build:rollup'
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
