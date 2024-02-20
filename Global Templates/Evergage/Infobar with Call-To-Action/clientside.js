(function() {

    /**
     * @function setInfobarPosition
     * @param {Object} context
     * @description Set the position of the infobar via class assignments, based on content zone selected.
     */
    function setInfobarPosition(context) {
        if (context.infobarClass === "evg-infobar-top") {
            Evergage.cashDom("body").css({ "margin-bottom": "0", "margin-top": "2.5rem" });
        } else {
            Evergage.cashDom("body").css({ "margin-bottom": "2.5rem", "margin-top": "0" });
        }
    }

    /**
     * @function setDismissal
     * @param {Object} context
     * @description Add click listener to the "X" button that removes the template from the DOM.
     */
    function setDismissal(context) {
        Evergage.cashDom(`#evg-infobar-with-cta.${context.infobarClass} .evg-btn-dismissal`).on("click", () => {
            Evergage.cashDom(`#evg-infobar-with-cta.${context.infobarClass}`).remove();
            Evergage.cashDom("body").css({ "margin-top": "0", "margin-bottom": "0" });
        });
    }

    function apply(context, template) {
        if (!context.contentZone) return;

        context.infobarClass = context.contentZone == "global_infobar_top_of_page"
            ? "evg-infobar-top"
            : "evg-infobar-bottom";

        if (Evergage.cashDom(`#evg-infobar-with-cta.${context.infobarClass}`).length > 0) return;

        setInfobarPosition(context);
        const html = template(context);
        Evergage.cashDom("body").append(html);
        setDismissal(context);
    }

    function reset(context, template) {
        Evergage.cashDom(`#evg-infobar-with-cta.${context.infobarClass}`).remove();
        Evergage.cashDom("body").css({ "margin-top": "0", "margin-bottom": "0" });
    }

    function control(context) {
        return new Promise(resolve => { if (context.contentZone) resolve(); });
    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
