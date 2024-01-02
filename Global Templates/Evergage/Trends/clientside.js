(function() {

    const ISTrends = (function() {

        const settings = {
            account: Evergage.getConfig().account,
            dataset: Evergage.getConfig().dataset,
            delay: 3000,
            id: (((Evergage.getCurrentPage() || {}).catalog || {}).Product || {})._id,
            lookbackMins: 2 * 60, // maximum 2 day
            minPurchases: 1,
            minViews: 1,
            reloadInterval: 30 * 1000,
            shouldCycle: true,
            stopLoadingAfter: 10 * 60 * 1000,
            url: () => `https://${settings.account}.evergage.com/api/dataset/${settings.dataset}/social/smartTrends/Product`
        };

        const global = {
            context: null,
            template: null
        };

        const actions = {
            handleResults: (results) => {
                const { id, minPurchases, minViews } = settings;
                const { purchasesText, visitorsText } = global.context;

                const mcisTrendsContainer = Evergage.cashDom('ul.mcis-trends');
                mcisTrendsContainer.css({ "opacity": "0" });
                mcisTrendsContainer.empty();
                if (results[id].purchases >= minPurchases) {
                    mcisTrendsContainer.append(`
                        <li id="evg-trend-minPurchases">
                            ${results[id].purchases} ${purchasesText}
                        </li>
                    `);
                }
                if (results[id].visitViews >= minViews) {
                    mcisTrendsContainer.append(`
                        <li id="evg-trend-minViews">
                            ${results[id].visitViews} ${visitorsText}
                        </li>
                    `);
                }
                mcisTrendsContainer.css({ "opacity": "1" });
            },
            loadTrends: () => {
                const { id, lookbackMins, url } = settings;
                const requestUrl = `${url()}?itemIds=${id}&lookbackMins=${lookbackMins}`;

                return fetch(requestUrl)
                    .then((resp) => {
                        return resp.json();
                    })
                    .then((data) => {
                        return actions.handleResults(data);
                    })
                    .catch((err) => {
                        console.warn(err);
                    });
            }
        };

        return {
            init: function({ context, template }) {
                const { reloadInterval, stopLoadingAfter } = settings;
                const { loadTrends } = actions;

                Object.assign(global, { context, template });
                loadTrends();
                const timerId = window.setInterval(loadTrends, reloadInterval);
                window.setTimeout(() => {
                    settings.shouldCycle = false;
                    clearInterval(timerId);
                }, stopLoadingAfter);
            }
        };

    })();

    /**
     * @function buildBindId
     * @param {Object} context
     * @description Create unique bind ID based on the campaign and experience IDs.
     */
    function buildBindId(context) {
        return `${context.campaign}:${context.experience}`;
    }

    function apply(context, template) {
        const contentZoneSelector = Evergage.getContentZoneSelector(context.contentZone);
        return Evergage.DisplayUtils
            .bind(buildBindId(context))
            .pageElementLoaded(contentZoneSelector)
            .then((element) => {
                if (Evergage.cashDom("#mcis-trends").length > 0) return;

                const html = template(context);
                Evergage.cashDom(element).html(html);
                ISTrends.init({ context, template });
            });
    }

    function reset(context, template) {
        Evergage.DisplayUtils.unbind(buildBindId(context));
        Evergage.cashDom("#mcis-trends").remove();
    }

    function control(context) {
        const contentZoneSelector = Evergage.getContentZoneSelector(context.contentZone);
        return Evergage.DisplayUtils
            .bind(buildBindId(context))
            .pageElementLoaded(contentZoneSelector)
            .then((element) => {
                Evergage.cashDom(element).attr({
                    "data-evg-campaign-id": context.campaign,
                    "data-evg-experience-id": context.experience,
                    "data-evg-user-group": context.userGroup
                });
            });
    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();