export class SlideInTriggerOptions {
    name: string;
    label: string;
}

export class StyleField {
    label: string;
    className: string;
}

export class SlideInWithCTATemplate implements CampaignTemplateComponent {

    @options([
        {
            name: "timeOnPage",
            label: "Time on Page (Delay)"
        },
        {
            name: "scrollDepth",
            label: "Scroll Depth"
        },
        {
            name: "inactivity",
            label: "Inactivity"
        }
    ])
    triggerOptions: SlideInTriggerOptions = { name: "", label: "Select..." };

    @shownIf(this, self => self.triggerOptions.name === "timeOnPage")
    @title(" ")
    @subtitle("Second(s) on page")
    secondsOnPage: number = 0;

    @shownIf(this, self => self.triggerOptions.name === "scrollDepth")
    @title(" ")
    @subtitle("% of page the user has scrolled")
    percentageScrolled: number = 0;

    @shownIf(this, self => self.triggerOptions.name === "inactivity")
    @title(" ")
    @subtitle("Second(s) of inactivity on page")
    secondsInactive: number = 0;

    @subtitle("Define slide-in background & text styling.")
    @options([
        { label: "Light on Dark", className: "evg-light-on-dark" },
        { label: "Dark on Light", className: "evg-dark-on-light" }
    ])
    style: StyleField = { label: "Light on Dark", className: "evg-light-on-dark" };

    @subtitle("Optional text field")
    header: string = "Header Text";

    @subtitle("Optional text field")
    subheader: string = "Subheader Text";

    @title("CTA Text")
    @subtitle("Optional text field")
    ctaText: string = "Call To Action";

    @title("CTA Destination URL")
    @subtitle("Requires full URL string including https://")
    ctaUrl: string = "https://www.northerntrailoutfitters.com";

    run(context: CampaignComponentContext) {
        switch (this.triggerOptions.name) {
            case "timeOnPage":
                return {
                    triggerOptionsNumber: this.secondsOnPage * 1000
                };
            case "scrollDepth":
                return {
                    triggerOptionsNumber: (this.percentageScrolled / 100)
                };
            case "inactivity":
                return {
                    triggerOptionsNumber: this.secondsInactive * 1000
                };
            default:
                return {};
        }
    }

}
