(function() {

    const BIND_IDS = {
        Base: null,
        ChatBot: null
    };

    const mainFormContainerSelector = ".embeddedServiceSidebar .showDockableContainer .formContent";

    /**
     * @function buildBindId
     * @param {Object} context
     * @description Create unique bind ID based on the campaign and experience IDs.
     */
    function buildBindId(context) {
        return `${context.campaign}:${context.experience}`;
    }

    /**
     * @function buildChatBotBindIds
     * @param {Object} context
     * @description Build unique bind IDs and assign them to BIND_IDS for use in different util calls
     */
    function buildChatBotBindIds(context) {
        const baseId = buildBindId(context);
        Object.assign(BIND_IDS, {
            Base: baseId,
            ChatBot: `${baseId}:chatbot`
        });
    }

    /**
     * @function openChatbot
     * @description Call the function 'embedded_svc.inviteAPI.inviteButton.acceptInvite();' to activate
     * the chatbot session
     */
    function openChatBot() {
        try {
            embedded_svc.inviteAPI.inviteButton.acceptInvite();
        } catch (e) {
            SalesforceInteractions.sendException(e, `Error caught in 'handleChatBotWhenTrue' from Salesforce Chatbot Template`);
        }
    }

    /**
     * @function sendStatOfType
     * @param {Object} obj
     * @param {Object} obj.context
     * @param {string} obj.statType
     * @description Abstract wrapper for `SalesforceInteractions.mcis.sendStat`
     */
    function sendStatOfType({ context, statType }) {
        SalesforceInteractions.mcis.sendStat({
            campaignStats: [{
                control: context.userGroup === "Control",
                experienceId: context.experience,
                stat: statType
            }]
        });
    }

    /**
     * @function initStatTracking
     * @param {Object} context
     * @description Initialize stat tracking based on presence of main chatbot element
     */
    function initStatTracking(context) {
        return SalesforceInteractions.DisplayUtils
            .bind(BIND_IDS.ChatBot)
            .pageElementLoaded(mainFormContainerSelector)
            .then((element) => {
                sendStatOfType({ context, statType: "Impression" });
                return element;
            });
    }

    /**
     * @function handleTriggerEvent
     * @param {Object} context
     * @description Create trigger event based on context
     */
    function handleTriggerEvent(context) {
        if (!context.contentZone) return;

        const { triggerOptions, triggerOptionsNumber } = context || {};

        switch (triggerOptions.name) {
            case "timeOnPage":
                return new Promise((resolve) => {
                    setTimeout(() => {
                        resolve(true);
                    }, triggerOptionsNumber);
                })
                    .then(() => {
                        if (context.userGroup !== "Control") {
                            openChatBot();
                        }
                        return initStatTracking(context);
                    });
            case "scrollDepth":
                return SalesforceInteractions.DisplayUtils
                    .bind(BIND_IDS.Base)
                    .pageScroll(triggerOptionsNumber)
                    .then(() => {
                        if (context.userGroup !== "Control") {
                            openChatBot();
                        }
                        return initStatTracking(context);
                    });
            case "inactivity":
                return SalesforceInteractions.DisplayUtils
                    .bind(BIND_IDS.Base)
                    .pageInactive(triggerOptionsNumber)
                    .then(() => {
                        if (context.userGroup !== "Control") {
                            openChatBot();
                        }
                        return initStatTracking(context);
                    });
        }
    }

    /**
     * @function handleChatBotWhenTrue
     * @param {Object} context
     * @description Open chatbot when ready, then initialize trigger event setup
     */
    function handleChatBotWhenTrue(context) {
        const predicate = () => typeof (((window.embedded_svc || {}).inviteAPI || {}).inviteButton || {}).acceptInvite === "function";

        return SalesforceInteractions.util.resolveWhenTrue
            .bind(predicate, BIND_IDS.Base, (1000 * 60 * 5), 500)
            .then(() => {
                return handleTriggerEvent(context);
            });
    }

    function apply(context) {
        buildChatBotBindIds(context);
        return handleChatBotWhenTrue(context);
    }

    function reset(context) {
        buildChatBotBindIds(context);
        SalesforceInteractions.DisplayUtils.unbind(BIND_IDS.Base);
        SalesforceInteractions.DisplayUtils.unbind(BIND_IDS.ChatBot);
        SalesforceInteractions.cashDom(mainFormContainerSelector).remove();
    }

    function control(context) {
        buildChatBotBindIds(context);
        return handleChatBotWhenTrue(context);
    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
