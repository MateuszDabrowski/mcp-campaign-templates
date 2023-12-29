(function() {

    const pageExitMillis = 500;

    /**
     * @function buildBindId
     * @param {Object} context
     * @description Create unique bind ID based on the campaign and experience IDs.
     */
    function buildBindId(context) {
        return `${context.campaign}:${context.experience}`;
    }

    /**
     * @function setDismissal
     * @param {Object} context
     * @description Add click listener to the overlay and "X" button that removes the template from the DOM.
     */
    function setDismissal(context) {
        const dismissSelectors = `
            #evg-exit-intent-popup .evg-overlay,
            #evg-exit-intent-popup .evg-btn-dismissal
        `;

        SalesforceInteractions.cashDom(dismissSelectors).on("click", () => {
            SalesforceInteractions.cashDom("#evg-exit-intent-popup").remove();
        });
    }

    function apply(context, template) {
        if (!context.contentZone) return;

        /**
         * The pageExit method waits for the user's cursor to exit through the top edge of the page before rendering the
         * template after a set delay.
         *
         * Visit the Template Display Utilities documentation to learn more:
         * https://developer.evergage.com/campaign-development/web-templates/web-display-utilities
         */
        return SalesforceInteractions.DisplayUtils
            .bind(buildBindId(context))
            .pageExit(pageExitMillis)
            .then(() => {
                if (SalesforceInteractions.cashDom("#evg-exit-intent-popup").length > 0) return;

                const html = template(context);
                SalesforceInteractions.cashDom("body").append(html);
                setDismissal(context);
            });
    }

    function reset(context, template) {
        SalesforceInteractions.DisplayUtils.unbind(buildBindId(context));
        SalesforceInteractions.cashDom("#evg-exit-intent-popup").remove();
    }

    function control(context) {
        return SalesforceInteractions.DisplayUtils
            .bind(buildBindId(context))
            .pageExit(pageExitMillis)
            .then(() => {
                if (context.contentZone) return true;
            });
    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
