import { RecommendationsConfig, RecipeReferenceLookup, RecipeReference, recommendIdsOnly } from 'recs';
import { UserAttributeLookup, UserAttributeReference, UserSegmentLookup, UserSegmentReference } from 'common';

export class TriggerUtils {
    static DEFAULT_CATALOG_OBJECT = 'Product';
    static DEFAULT_CATALOG_OBJECT_ATTRIBUTES = ['id', 'name', 'imageUrl', 'url', 'price', 'listPrice', 'brand', 'categoryName'];

    static getFlatItems(context: CampaignComponentContext, ids: string[]): any[] {
        return context.services.catalog
            .findItems(TriggerUtils.DEFAULT_CATALOG_OBJECT, ids)
            .map((item) => item.toFlatJSON(
                TriggerUtils.DEFAULT_CATALOG_OBJECT_ATTRIBUTES
            ));
    }

    static getUserAttributeValue(attributeId: string, user: User) {
        return (user?.attributes?.[attributeId] as Attribute | undefined)?.value?.toString() || '';
    }

    static getUserSegments(segments: UserSegmentReference[], user: User) {
        if (segments?.length && user?.segmentMembership?.length) {
            const selectedSegments: string[] = segments.map((segment) => segment.id);
            return user.segmentMembership
                .filter((memberSegment) => selectedSegments.includes(memberSegment.segmentId))
                .map((memberSegment) => memberSegment.segmentName).join(',');
        }
        return '';
    }

    static getRecommendations(recipe: RecipeReference, context: CampaignComponentContext, maxRecommendations: number) {
        let result: any[] = [];

        if (recipe) {
            const recipeConfig = new RecommendationsConfig();
            recipeConfig.maxResults = maxRecommendations;
            recipeConfig.recipe = recipe;
            if (recipeConfig?.recipe?.id) {
                const recs = recommendIdsOnly(context, recipeConfig);
                result = TriggerUtils.getFlatItems(context, recs);
            }
        }

        try {
            return JSON.stringify(result);
        } catch (error) {
            return '[]'
        }
    }

    static getTriggerContext(context: CampaignComponentContext): any {
        const result = {};

        if (context.trigger?.type) {
            result['Trigger_Type'] = context.trigger.type;
            let trigger;
            switch (context.trigger.type) {
                case 'SegmentLeave':
                case 'SegmentJoin':
                    trigger = context.trigger as SegmentTrigger;
                    result['Trigger_Segment'] = trigger.segmentName;
                    break;
                case 'EventAction':
                    trigger = context.trigger as ActionTrigger;
                    result['Trigger_Action'] = trigger.action;
                    break;
                default:
                    trigger = context.trigger as CatalogTrigger;
                    const items: any[] = [];

                    if (trigger.itemIdsByType) {
                        Object.keys(trigger.itemIdsByType).forEach((catalogObject) => {
                            items.push(...TriggerUtils.getFlatItems(
                                context, catalogObject, trigger.itemIdsByType[catalogObject]
                            ));
                        });
                    }

                    try {
                        result['Trigger_Catalog_Items'] = JSON.stringify(items);
                    } catch (error) { }
                    break;
            }
        }

        return result;
    }
}

export class TriggerPayload {
    @title('User Attributes')
    @subtitle(`Selected Attributes require matching fields in the Data Extension.`)
    @lookupOptions(() => new UserAttributeLookup())
    attributes: UserAttributeReference[] = [{
        "id": "emailAddress",
        "label": "emailAddress (Email Address)",
        "type": "String"
    }];

    @title('Main Recommendation')
    @lookupOptions(() => new RecipeReferenceLookup(TriggerUtils.DEFAULT_CATALOG_OBJECT))
    recipe: RecipeReference;

    @shownIf(this, (self) => self.ShowRecommendationCountConfig)
    @title(' ')
    @subtitle("Control the maximum number of returned recommendations")
    returnedRecommendationsLimit: 1 | 2 | 3 | 4 | 5 | 6 = 6;

    @title('Include Additional Recommendations')
    includeAdditionalRecommendations: boolean = false;

    @title('Optional Additional Recommendation')
    @shownIf(this, (self) => self.includeAdditionalRecommendations)
    @lookupOptions(() => new RecipeReferenceLookup(TriggerUtils.DEFAULT_CATALOG_OBJECT))
    additionalRecipe: RecipeReference;

    @shownIf(this, (self) => self.ShowRecommendationCountConfig && self.includeAdditionalRecommendations)
    @title(' ')
    @subtitle("Control the maximum number of returned additional recommendations")
    returnedAdditionalRecommendationsLimit: 1 | 2 | 3 | 4 | 5 | 6 = 6;

    @title('Include User Segments')
    @subtitle(`Select only few critical segments.`)
    includeSegments: boolean = false;

    @title(' ')
    @shownIf(this, (self) => self.includeSegments)
    @lookupOptions(() => new UserSegmentLookup())
    segments: UserSegmentReference[];

    @optional(true)
    @title('Show Recommendation Count Config')
    ShowRecommendationCountConfig: boolean = false;

    // Example custom field that can be added to the template
    // @title('Custom string to pass')
    // customFieldText: DateTime;

    getPayload(context: CampaignComponentContext) {
        const triggerContext = TriggerUtils.getTriggerContext(context);

        const result = {
            'Campaign': context.campaignId,
            'Experience': context.experienceId,
            ...triggerContext
        };

        this.attributes.forEach((attr) => {
            result[attr.id] = TriggerUtils.getUserAttributeValue(attr.id, context.user);
        });

        result['Recommendations'] = TriggerUtils.getRecommendations(this.recipe, context, this.returnedRecommendationsLimit);

        if (this.includeAdditionalRecommendations) {
            result['Additional_Recommendations'] =
                TriggerUtils.getRecommendations(this.additionalRecipe, context, this.returnedAdditionalRecommendationsLimit);
        }

        if (this.includeSegments) {
            result['Segments'] = TriggerUtils.getUserSegments(this.segments, context.user);
        }

        // Example custom field handler - the name passed to result Array must be created as a field in Data Extension
        // if (this.customFieldDate) {
        //     result['CustomFieldDate'] = this.customFieldDate.dateTime[0];
        // }

        return result;
    }
}

export class TriggerTemplate implements CampaignTemplateComponent {

    @title(' ')
    templateConfig: TriggerPayload = new TriggerPayload();

    run(context: CampaignComponentContext) {
        return this.templateConfig.getPayload(context);
    }
}