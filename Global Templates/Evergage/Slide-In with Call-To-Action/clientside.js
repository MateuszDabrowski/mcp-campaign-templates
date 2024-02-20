(function() {

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
     * @description Add click listener to the "X" button that removes the template from the DOM.
     */
    function setDismissal() {
        Evergage.cashDom("#evg-slide-in-with-cta .evg-btn-dismissal").on("click", () => {
            Evergage.cashDom("#evg-slide-in-with-cta").remove();
        });
    }

    /**
     * @function handleTemplateContent
     * @param {Object} context
     * @description Build and insert Template HTML, attach dismissal listener
     */
    function handleTemplateContent({ context, template }) {
        const html = template(context);
        Evergage.cashDom("body").append(html);
        setDismissal();
    }

    /**
     * @function handleTriggerEvent
     * @param {Object} context
     * @description Create trigger event based on context
     */
    function handleTriggerEvent({ context, template }) {
        if (!context.contentZone) return;

        const { userGroup, triggerOptions, triggerOptionsNumber } = context || {};

        switch (triggerOptions.name) {
            case "timeOnPage":
                return new Promise((resolve, reject) => {
                    setTimeout(() => {
                        if (userGroup === "Control") return true;

                        handleTemplateContent({ context, template });
                        resolve(true);
                    }, triggerOptionsNumber);
                });
            case "scrollDepth":
                return Evergage.DisplayUtils
                    .bind(buildBindId(context))
                    .pageScroll(triggerOptionsNumber)
                    .then((event) => {
                        if (userGroup === "Control") return true;

                        handleTemplateContent({ context, template });
                    });
            case "inactivity":
                return Evergage.DisplayUtils
                    .bind(buildBindId(context))
                    .pageInactive(triggerOptionsNumber)
                    .then((event) => {
                        if (userGroup === "Control") return true;

                        handleTemplateContent({ context, template });
                    });
        }
    }

    function apply(context, template) {
        if (Evergage.cashDom("#evg-slide-in-with-cta").length > 0) return;

        return handleTriggerEvent({ context, template });
    }

    function reset(context, template) {
        Evergage.DisplayUtils.unbind(buildBindId(context));
        Evergage.cashDom("#evg-slide-in-with-cta").remove();
    }

    function control(context) {
        return handleTriggerEvent({ context });
    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
