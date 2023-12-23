export class StyleField {
    label: string;
    className: string;
}

export class ExitIntentPopupWithEmailCapture implements CampaignTemplateComponent {

    @header("Pop-Up Type")

    lightbox: boolean = true;

    @title("Background Image URL")
    imageUrl: string = "https://cdn.evergage.com/evergage-content/nto/nto_footwear.jpg";

    @subtitle("Define header and subheader text styling.")
    @options([
        { label: "Light on Dark", className: "evg-light-on-dark" },
        { label: "Dark on Light", className: "evg-dark-on-light" }
    ])
    style: StyleField = { label: "Light on Dark", className: "evg-light-on-dark" };

    header: string = "Header Text";

    subheader: string = "Subheader Text";

    @title("Subheader Visibility")
    mainSubheaderVisibility: boolean = true;

    @title("CTA Text")
    ctaText: string = "Call To Action";

    @title("Opt-Out Text")
    @subtitle("Clicking this text closes the pop-up.")
    optOutText: string = "No Thanks";

    @title("Confirmation Screen Header")
    @subtitle("Text appears upon successful email submission. Click CTA to preview.")
    confirmationHeader: string = "Confirmation Header Text";

    @title("Confirmation Screen Subheader")
    confirmationSubheader: string = "Confirmation Subheader Text";

    @title("Subheader Visibility")
    confSubheaderVisibility: boolean = true;

    run(context: CampaignComponentContext) {
        return {};
    }

}