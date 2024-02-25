const {
    container, recorder, event
} = require('codeceptjs');
const { CoverageReport } = require('monocart-coverage-reports');

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
        startCoverage: async (page) => {
            await Promise.all([
                page.coverage.startJSCoverage({
                    resetOnNavigation: false
                }),
                page.coverage.startCSSCoverage({
                    resetOnNavigation: false
                })
            ]);
        },
        takeCoverage: async (page, coverageReport) => {
            const [jsCoverage, cssCoverage] = await Promise.all([
                page.coverage.stopJSCoverage(),
                page.coverage.stopCSSCoverage()
            ]);
            const coverageList = [... jsCoverage, ... cssCoverage];
            await coverageReport.add(coverageList);
        }
    },
    Puppeteer: {
        startCoverage: async (page) => {
            await Promise.all([
                page.coverage.startJSCoverage({
                    resetOnNavigation: false,
                    includeRawScriptCoverage: true
                }),
                page.coverage.startCSSCoverage({
                    resetOnNavigation: false
                })
            ]);
        },
        takeCoverage: async (page, coverageReport) => {
            const [jsCoverage, cssCoverage] = await Promise.all([
                page.coverage.stopJSCoverage(),
                page.coverage.stopCSSCoverage()
            ]);
            // to raw V8 script coverage
            const coverageList = [... jsCoverage.map((it) => {
                return {
                    source: it.text,
                    ... it.rawScriptCoverage
                };
            }), ... cssCoverage];
            await coverageReport.add(coverageList);
        }
    }
};

module.exports = function(config) {
    const helpers = container.helpers();
    let coverageRunning = false;

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
        await coverageReport.generate();
    });

    //  we're going to try to "start" coverage before each step because this is
    //  when the browser is already up and is ready to start coverage.
    event.dispatcher.on(event.step.before, () => {
        recorder.add('start coverage', async () => {
            if (coverageRunning) {
                return;
            }
            if (!helper.page || !helper.page.coverage) {
                return;
            }
            coverageRunning = true;
            await v8Helper.startCoverage(helper.page);
        }, true);
    });

    // Save coverage data after every test run
    event.dispatcher.on(event.test.after, (test) => {
        recorder.add('take coverage', async () => {
            if (!coverageRunning) {
                return;
            }
            if (!helper.page || !helper.page.coverage) {
                return;
            }
            coverageRunning = false;
            await v8Helper.takeCoverage(helper.page, coverageReport);
        }, true);
    });
};
