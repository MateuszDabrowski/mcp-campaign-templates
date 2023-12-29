(function () {

    /**
     * @function setGaDimension
     * @param {Object} context
     * @description Set one or more segments, for which users are members of, to each dimension.
     * The segment names will be concatenated into one pipe (|) delimited string (e.g. "Segment 1|Segment 2|Segment 3")
     * when more than one segment per dimension are assigned.
     */
    function setGaDimension(context) {
        const gaMapping = context.gaMapping;
        for (const dimension in gaMapping) {
            const matchedSegments = gaMapping[dimension].join("|");
            window.ga('set', dimension, matchedSegments);
        }
    }

    /**
     * @function sendGaDimensions
     * @param {Object} context
     * @description Send an event to Google Analytics with segments.
     */
    function sendGaDimensions(context) {
        window.ga("send", {
            hitType: "event",
            eventCategory: "Evergage",
            eventAction: "Set Segments",
            nonInteraction: true
        });
    }

    function apply(context, template) {
        if (window.ga && typeof window.ga === "function") {
            setGaDimension(context);
            sendGaDimensions(context);
            SalesforceInteractions.mcis.sendStat({
                campaignStats: [
                    {
                        control: false,
                        experienceId: context.experience,
                        stat: "Impression"
                    }
                ]
            });
        }
    }

    function reset(context, template) {

    }

    function control() {

    }

    registerTemplate({
        apply: apply,
        reset: reset,
        control: control
    });

})();
