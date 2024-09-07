// Write a bunch of *.tachometer.json files since they contain a lot of boilerplate
import fs from 'node:fs'

const benchmarks = fs.readdirSync('./test/benchmark').filter(_ => _.endsWith('.benchmark.js'))

// Customize the tachometer config with these env vars
const {
  BENCHMARK_SAMPLE_SIZE = '50',
  BENCHMARK_TIMEOUT = '5',
  BENCHMARK_AUTO_SAMPLE_CONDITIONS = '10%',
  BENCHMARK_BROWSER = 'chrome',
  BENCHMARK_BROWSER_BINARY
} = process.env

for (const benchmark of benchmarks) {
  const benchmarkShortName = benchmark.replace('.benchmark.js', '')

  const content = {
    $schema: 'https://raw.githubusercontent.com/Polymer/tachometer/master/config.schema.json',
    sampleSize: parseInt(BENCHMARK_SAMPLE_SIZE, 10),
    timeout: parseInt(BENCHMARK_TIMEOUT, 10),
    autoSampleConditions: [BENCHMARK_AUTO_SAMPLE_CONDITIONS],
    root: '../..',
    benchmarks: [
      {
        url: `./index.html?benchmark=${benchmarkShortName}`,
        browser: {
          name: BENCHMARK_BROWSER,
          headless: true,
          ...(BENCHMARK_BROWSER_BINARY && { binary: BENCHMARK_BROWSER_BINARY })
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
                    'if [ -f yarn.lock ]; then yarn --frozen-lockfile; else pnpm i --frozen-lockfile; fi'
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
