(function() {

    /**
     * @function buildBindId
     * @param {Object} context
     * @description Create unique bind ID based on the campaign and experience IDs.
     */
    function buildBindId(context) {
        return `${context.campaign}:${context.experience}`;
    }

    function apply(context, template) {
        if (!context.contentZone || !context.imageUrl || !context.url) return;

        let contentZoneSelector = SalesforceInteractions.mcis.getContentZoneSelector(context.contentZone);
        if (!contentZoneSelector && context.selectedAsset) {
            contentZoneSelector = SalesforceInteractions.mcis.getContentZoneSelector(context.selectedAsset);
        }
        /**
         * The pageElementLoaded method waits for the content zone to load into the DOM
         * before rendering the template. The observer element that monitors for the content
         * zone element to get inserted into its DOM node is set to "body" by default.
         * For performance optimization, this default can be overridden by adding
         * a second selector argument, which will be used as the observer element instead.
         *
         * Visit the Template Display Utilities documentation to learn more:
         * https://developer.salesforce.com/docs/marketing/personalization/guide/web-template-display-utilities
         */
        return SalesforceInteractions.DisplayUtils
            .bind(buildBindId(context))
            .pageElementLoaded(contentZoneSelector)
            .then((element) => {
                const html = template(context);
                SalesforceInteractions.cashDom(element).html(html);
            });
    }

    function reset(context, template) {
        SalesforceInteractions.DisplayUtils.unbind(buildBindId(context));
        SalesforceInteractions.cashDom(`[data-evg-campaign-id="${context.campaign}"][data-evg-experience-id="${context.experience}"]`)
            .remove();
    }

    function control(context) {
        const contentZoneSelector = SalesforceInteractions.mcis.getContentZoneSelector(context.contentZone);
        return SalesforceInteractions.DisplayUtils
            .bind(buildBindId(context))
            .pageElementLoaded(contentZoneSelector)
            .then((element) => {
                SalesforceInteractions.cashDom(element).attr({
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
