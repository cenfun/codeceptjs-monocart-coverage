# codeceptjs-monocart-coverage
[![](https://img.shields.io/npm/v/codeceptjs-monocart-coverage)](https://www.npmjs.com/package/codeceptjs-monocart-coverage)
[![](https://badgen.net/npm/dw/codeceptjs-monocart-coverage)](https://www.npmjs.com/package/codeceptjs-monocart-coverage)
![](https://img.shields.io/github/license/cenfun/codeceptjs-monocart-coverage)


> A [CodeceptJS](https://github.com/codeceptjs/CodeceptJS/) plugin for [monocart coverage reports](https://github.com/cenfun/monocart-coverage-reports)

## Install
```sh
npm i codeceptjs-monocart-coverage
```

## Usage
```js
// codecept.conf.js
{
    plugins: {
        monocart: {
            require: 'codeceptjs-monocart-coverage',
            enabled: true,
            coverageOptions: {
                name: 'My CodeceptJS Coverage Report',
                outputDir: 'coverage-reports'
            }
        }
    },
    helpers: {
        // Coverage is only supported in Playwright or Puppeteer
        Playwright: {
            browser: 'chromium',
            url: 'http://localhost',
            show: false
        }
        // Puppeteer: {
        //     url: 'http://localhost',
        //     show: false
        // }
    }
}
```

Check repo [monocart coverage reports](https://github.com/cenfun/monocart-coverage-reports) for more options.