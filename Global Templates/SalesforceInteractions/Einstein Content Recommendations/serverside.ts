import { RecommendationsConfig, recommend } from "recs";

export class EinsteinContentRecsTemplate implements CampaignTemplateComponent {

    /**
     * Developer Controls
     */

    @hidden(true)
    maximumNumberOfItems: 2 | 4 | 6 = 4;

    /**
     * Business-User Controls
     */

    @title("Recommendations Block Title")
    header: string = "Title Text";

    @title(" ")
    recsConfig: RecommendationsConfig = new RecommendationsConfig()
        .restrictItemType("Blog")
        .restrictMaxResults(this.maximumNumberOfItems);

    @header('Recommendation Display Options')

    @title("Show content name")
    nameVisibility: boolean = true;

    @title("Show content description")
    descriptionVisibility: boolean = true;

    run(context: CampaignComponentContext) {
        this.recsConfig.maxResults = this.maximumNumberOfItems;

        return {
            itemType: this.recsConfig.itemType,
            blogs: recommend(context, this.recsConfig)
        }
    }

}
