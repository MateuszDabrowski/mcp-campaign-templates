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
        const contentZoneSelector = SalesforceInteractions.mcis.getContentZoneSelector(context.contentZone);

        return SalesforceInteractions.DisplayUtils
            .bind(buildBindId(context))
            .pageElementLoaded(contentZoneSelector)
            .then((element) => {
                const $survey = SalesforceInteractions.cashDom(template(context).trim());

                return SalesforceInteractions.mcis.Surveys.renderSurvey(context.survey, $survey).then(() => {
                    SalesforceInteractions.cashDom(element).append($survey);
                });
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
                    "data-evg-user-group": context.userGroup,
                });
            });
    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
