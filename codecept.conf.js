const { setHeadlessWhen, setCommonPlugins } = require('@codeceptjs/configure');
// turn on headless mode when running with HEADLESS=true environment variable
// export HEADLESS=true && npx codeceptjs run
setHeadlessWhen(process.env.HEADLESS);

// enable all common plugins https://github.com/codeceptjs/configure#setcommonplugins
setCommonPlugins();

/** @type {CodeceptJS.MainConfig} */
exports.config = {
    tests: './test/*_test.js',
    output: './output',
    plugins: {
        monocart: {
            // require: 'codeceptjs-monocart-coverage',
            require: './lib',
            enabled: true,
            coverageOptions: {
                // logging: 'debug',
                name: 'My CodeceptJS Coverage Report',

                sourceFilter: '**/src/**',
                sourcePath: {
                    'todomvc-react/': '',
                    'todomvc.com/examples/react/': ''
                },

                outputDir: 'coverage-reports'
            }
        }
    },
    helpers: {
        Playwright: {
            browser: 'chromium',
            url: 'http://localhost',
            show: false
        }
        // Puppeteer: {
        //     url: 'http://localhost',
        //     show: false
        // }
    },
    include: {

    },
    name: 'codeceptjs-monocart-coverage'
};
