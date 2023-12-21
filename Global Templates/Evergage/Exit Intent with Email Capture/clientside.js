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
     * @function setConfirmationPanel
     * @description Add click listener to the Call-To-Action button that validates the user email address,
     * shows the Confirmation Panel, removes dismissal tracking from the "X" button and overlay, and sends
     * an event to Interaction Studio to set the emailAddress attribute to the user email address.
     */
    function setConfirmationPanel() {
        Evergage.cashDom("#evg-exit-intent-popup-email-capture .evg-cta").on("click", () => {
            const emailAddress = Evergage.cashDom(".evg-form input[placeholder='Email']").val();
            const regex = RegExp(/^([a-zA-Z0-9_\-\.]+)@([a-zA-Z0-9_\-\.]+)\.([a-zA-Z]+)$/);
            if (emailAddress && regex.test(emailAddress)) {
                Evergage.cashDom("#evg-exit-intent-popup-email-capture .evg-main-panel").addClass("evg-hide");
                Evergage.cashDom("#evg-exit-intent-popup-email-capture .evg-confirm-panel").removeClass("evg-hide");
                Evergage.cashDom(`
                    #evg-exit-intent-popup-email-capture .evg-overlay,
                    #evg-exit-intent-popup-email-capture .evg-btn-dismissal
                `).removeAttr("data-evg-dismissal");
                Evergage.sendEvent({
                    user: {
                        attributes: {
                            emailAddress: emailAddress
                        }
                    }
                });
            } else {
                Evergage.cashDom("#evg-exit-intent-popup-email-capture .evg-error-msg")
                    .removeClass("evg-hide")
                    .addClass("evg-error");
            }
        });
    }

    /**
     * @function setDismissal
     * @param {Object} context
     * @description Add click listener to the overlay, "X" button, and opt-out text that removes the
     * template from the DOM.
     */
    function setDismissal(context) {
        const dismissSelectors = `
            #evg-exit-intent-popup-email-capture .evg-overlay,
            #evg-exit-intent-popup-email-capture .evg-btn-dismissal,
            #evg-exit-intent-popup-email-capture .evg-opt-out-msg
        `;

        Evergage.cashDom(dismissSelectors).on("click", () => {
            Evergage.cashDom("#evg-exit-intent-popup-email-capture").remove();
        });
    }

    function apply(context, template) {

        /**
         * The pageExit method waits for the user's cursor to exit through the top edge of the page before rendering the
         * template after a set delay.
         *
         * Visit the Template Display Utilities documentation to learn more:
         * https://developer.evergage.com/templates/display-utilities
         */
        return Evergage.DisplayUtils.bind(buildBindId(context)).pageExit(pageExitMillis).then(() => {
            if (Evergage.cashDom("#evg-exit-intent-popup").length > 0) return;

            const html = template(context);
            Evergage.cashDom("body").append(html);
            setConfirmationPanel();
            setDismissal(context);
        });
    }

    function reset(context, template) {
        Evergage.DisplayUtils.unbind(buildBindId(context));
        Evergage.cashDom("#evg-exit-intent-popup-email-capture").remove();
    }

    function control(context) {
        return Evergage.DisplayUtils.bind(buildBindId(context)).pageExit(pageExitMillis).then(() => {
            return true;
        });
    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
