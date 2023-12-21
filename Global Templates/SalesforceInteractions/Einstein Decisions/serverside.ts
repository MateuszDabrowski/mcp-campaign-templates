import { ContextualBanditConfig, decide } from "corvus";
import { ItemReference } from "common";

function isCdnOrExternalImage(asset?: Asset) {
    return asset?.type === "CdnImage" || asset?.type === "ExternalImage";
}

export class PromotionSearchOptions implements Search<string> {

    search(context: GearLifecycleContext, searchString: string): ItemReference[] {
        if (!searchString) return [];

        const promos: Promotion[] = context.services.catalog.findByName("Promotion", searchString) as Promotion[];
        return promos.reduce((allPromos: ItemReference[], promo: Promotion) => {
            const promoItem = {
                itemType: "Promotion",
                id: promo.id,
                label: promo.attributes["name"] != null ? promo.attributes["name"].value : promo.id,
            } as ItemReference;
            allPromos.push(promoItem);
            return allPromos;
        }, []);
    }
}

export class AssetLookupOptions implements Lookup<string> {

    fallbackArm: ItemReference

    constructor(fallbackArm: ItemReference) {
        this.fallbackArm = fallbackArm;
    }

    lookup(context: GearLifecycleContext): string[] {
        if (!this.fallbackArm) return [];

        const fullPromo: Promotion = context.services.catalog.findItem("Promotion", this.fallbackArm.id) as Promotion;
        if (!fullPromo || !fullPromo.assets) return [];

        return fullPromo.assets.reduce((contentZones: string[], asset: Asset) => {
            if (isCdnOrExternalImage(asset) && asset?.contentZones) {
                asset.contentZones.forEach(zone => { if (!(zone in contentZones)) contentZones.push(zone) });
            }
            return contentZones;
        }, []);
    }
}

export class EinsteinDecisionsTemplate implements CampaignTemplateComponent {

    @header(' ')
    @headerSubtitle('Only promotion assets tagged with the targeted web content zone will be eligible to return in the campaign.')

    @hidden(true)
    forHeaderSubtitle;

    @searchOptions((self) => new PromotionSearchOptions())
    @title("Optional Fallback Promotion Selector")
    @subtitle(`Search for a fallback promotion to display if there are no eligible promotions to show to the end user.
              If no fallback is selected, the default site experience would display. (NOTE: This field is case-sensitive.)`)
    fallbackArm: ItemReference;

    @title("Fallback Asset Selector")
    @lookupOptions((self) => new AssetLookupOptions(self.fallbackArm))
    @hidden(this, (self) => !self.fallbackArm)
    @subtitle(`Select a Content Zone or Tag to determine which asset on your selected fallback promotion is rendered in
              the targeted web content zone.`)
    fallbackAsset: string;

    run(context: CampaignComponentContext) {
        const banditConfig: ContextualBanditConfig = {
            maxResults: 1,
            contentZone: context.contentZone,
            fallbackArms: this.fallbackArm ? [this.fallbackArm.id] : []
        } as ContextualBanditConfig;

        const promotion: Promotion = decide(context, banditConfig, null)[0] as Promotion;

        const fetchImageUrl = (promotion: Promotion, contentZone: string): string => {
            if (!promotion || !promotion.assets) return "";

            for (const asset of promotion.assets) {
                if (!isCdnOrExternalImage(asset)) continue;
                if (asset.contentZones?.includes(contentZone)) {
                    return (asset as ImageAsset).imageUrl;
                }
            }
            if (this.fallbackAsset && this.fallbackArm?.id === promotion.id) {
                for (const asset of promotion.assets) {
                    if (!isCdnOrExternalImage(asset)) continue;
                    if (asset.contentZones?.includes(this.fallbackAsset)) {
                        return (asset as ImageAsset).imageUrl;
                    }
                }
            }
            return "";
        };

        const imageUrl: string = fetchImageUrl(promotion, context.contentZone);
        const url: string = promotion?.attributes?.url?.value ? promotion.attributes.url.value as string : "";
        const id: string = promotion.id;

        return { imageUrl, url, id };
    }

}
