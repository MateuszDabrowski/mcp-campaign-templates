import { RecommendationsConfig, recommend } from "recs";

export class EinsteinProductRecsTemplate implements CampaignTemplateComponent {

    /**
     * Developer Controls
     */

    @hidden(true)
    maximumNumberOfProducts: 2 | 4 | 6 | 8 = 4;

    @hidden(true)
    maxRatingBound: number = 5;

    /**
     * Business-User Controls
     */

    @title("Recommendations Block Title")
    header: string = "Title Text";

    @title(" ")
    recsConfig: RecommendationsConfig = new RecommendationsConfig()
        .restrictItemType("Product")
        .restrictMaxResults(this.maximumNumberOfProducts);

    @header("Recommendation Display Attributes")

    @title("Show product name")
    nameVisibility: boolean = true;

    @title("Show product description")
    descriptionVisibility: boolean = true;

    @title("Show product price")
    priceVisibility: boolean = true;

    @title("Show product rating")
    ratingVisibility: boolean = false;

    run(context: CampaignComponentContext) {
        this.recsConfig.maxResults = this.maximumNumberOfProducts;

        return {
            itemType: this.recsConfig.itemType,
            products: recommend(context, this.recsConfig)
        };
    }

}