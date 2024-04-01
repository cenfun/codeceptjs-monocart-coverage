const {
    container, recorder, event
} = require('codeceptjs');
const { CoverageReport, CDPClient } = require('monocart-coverage-reports');

/**
 * Dumps code coverage from Playwright/Puppeteer after every test.
 *
 * #### Configuration
 *
 * ```js
 * plugins: {
 *    monocart: {
 *      require: 'codeceptjs-monocart-coverage',
 *      enabled: true,
 *      coverageOptions: {}
 *    }
 * }
 * ```
 */

const v8CoverageHelpers = {
    Playwright: {

        startCoverage: async (helper) => {
            const page = helper.page;
            if (!page || !page.coverage) {
                // Coverage APIs are only supported on Chromium-based browsers
                return;
            }
            const session = await page.context().newCDPSession(page);
            const coverageClient = await CDPClient({
                session
            });
            // both js and css coverage
            await coverageClient.startCoverage();
            return coverageClient;
        }

    },

    Puppeteer: {

        startCoverage: async (helper) => {
            const page = helper.page;
            if (!page || !page.coverage) {
                // Coverage APIs are only supported on Chromium-based browsers
                return;
            }
            const session = await page.target().createCDPSession();
            const coverageClient = await CDPClient({
                session
            });
            // both js and css coverage
            await coverageClient.startCoverage();
            return coverageClient;
        }

    },

    WebDriver: {

        startCoverage: async (helper) => {
            // WebDriver to puppeteer API
            const puppeteer = await helper.browser.getPuppeteer();
            // console.log(helper);
            if (!puppeteer) {
                return;
            }
            const page = (await puppeteer.pages())[0];
            if (!page || !page.coverage) {
                // Coverage APIs are only supported on Chromium-based browsers
                return;
            }
            const session = await page.target().createCDPSession();
            const coverageClient = await CDPClient({
                session
            });
            // both js and css coverage
            await coverageClient.startCoverage();
            return coverageClient;
        }

    }
};

module.exports = function(config) {
    const helpers = container.helpers();
    let coverageClient;

    const v8Names = Object.keys(v8CoverageHelpers);
    const helperName = Object.keys(helpers).find((it) => v8Names.includes(it));
    if (!helperName) {
        console.error('Coverage is only supported in Playwright or Puppeteer');
        // no helpers for screenshot
        return;
    }

    const helper = helpers[helperName];
    const v8Helper = v8CoverageHelpers[helperName];

    const coverageOptions = {
        ... config.coverageOptions
    };
    const coverageReport = new CoverageReport(coverageOptions);
    coverageReport.cleanCache();

    event.dispatcher.on(event.all.after, async () => {
        // console.log(`generate coverage =================== ${helperName}`);
        await coverageReport.generate();
    });

    //  we're going to try to "start" coverage before each step because this is
    //  when the browser is already up and is ready to start coverage.
    event.dispatcher.on(event.step.before, () => {
        recorder.add('start coverage', async () => {
            if (coverageClient) {
                return;
            }
            // console.log(`start coverage =================== ${helperName}`);
            coverageClient = await v8Helper.startCoverage(helper);
        }, true);
    });

    // Save coverage data after every test run
    event.dispatcher.on(event.test.after, (test) => {
        recorder.add('stop coverage', async () => {
            if (!coverageClient) {
                return;
            }
            // console.log(`stop coverage =================== ${helperName}`);
            const coverageData = await coverageClient.stopCoverage();
            await coverageClient.close();
            coverageClient = null;
            await coverageReport.add(coverageData);
        }, true);
    });
};
