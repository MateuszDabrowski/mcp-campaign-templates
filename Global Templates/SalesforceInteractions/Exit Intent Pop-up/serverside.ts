export class StyleField {
    label: string;
    className: string;
}

export class ExitIntentPopupTemplate implements CampaignTemplateComponent {

    @header("Pop-Up Type")

    lightbox: boolean = true;

    @title("Background Image URL")
    imageUrl: string = "https://cdn.evergage.com/evergage-content/cumulus/cumulus_growth.jpg";

    @subtitle("Define header and subheader text styling.")
    @options([
        { label: "Light on Dark", className: "evg-light-on-dark" },
        { label: "Dark on Light", className: "evg-dark-on-light" }
    ])
    style: StyleField = { label: "Dark on Light", className: "evg-dark-on-light" };

    @richText(true)
    header: string = "Header Text";

    @subtitle("Optional rich text field")
    @richText(true)
    subheader: string = "Subheader Text";

    @title("CTA Text")
    ctaText: string = "Call To Action";

    @title("CTA Destination URL")
    @subtitle("Requires full URL string including https://")
    ctaUrl: string = "https://cumulusfinserv.com/banking";

    run(context: CampaignComponentContext) {
        return {};
    }

}
