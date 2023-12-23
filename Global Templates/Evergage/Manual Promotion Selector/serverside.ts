import { ItemReference } from "common";

function isCdnOrExternalImage(asset?: Asset) {
    return asset?.type === "CdnImage" || asset?.type === "ExternalImage";
}

export class PromotionSearchOptions implements Search<string> {

    search(context: GearLifecycleContext, searchString: string): ItemReference[] {
        if (!searchString) return [];

        const promos: Promotion[] = context.services.catalog.findByName("Promotion", searchString) as Promotion[];
        return promos.reduce((allPromos, promo: Promotion) => {
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

    selectedPromo: ItemReference

    constructor(selectedPromo: ItemReference) {
        this.selectedPromo = selectedPromo;
    }

    lookup(context: GearLifecycleContext): string[] {
        if (!this.selectedPromo) return [];

        const fullPromo: Promotion = context.services.catalog.findItem("Promotion", this.selectedPromo.id) as Promotion;
        if (!fullPromo || !fullPromo.assets) return [];

        return fullPromo.assets.reduce((contentZones: string[], asset: Asset) => {
            if (isCdnOrExternalImage(asset) && asset?.contentZones) {
                asset.contentZones.forEach(zone => { if (!(zone in contentZones)) contentZones.push(zone) });
            }
            return contentZones;
        }, []);
    }
}

export class ManualPromotionSelectorTemplate implements CampaignTemplateComponent {

    @searchOptions(() => new PromotionSearchOptions())
    @title("Promotion Selector")
    @subtitle("Select the promotion that you want to display in the targeted web content zone.")
    selectedPromo: ItemReference;

    @title("Asset Selector")
    @lookupOptions((self) => new AssetLookupOptions(self.selectedPromo))
    @subtitle(`Select a Content Zone or Tag to determine which asset from your selected promotion is rendered in the
              targeted web content zone.`)
    selectedAsset: string;

    run(context: CampaignComponentContext) {
        const promotion: Promotion = context.services.catalog.findItem("Promotion", this.selectedPromo.id) as Promotion;
        const fetchImageUrl = (promotion: Promotion, contentZone: string): string => {
            if (!promotion || !promotion.assets) return "";

            for (const asset of promotion.assets) {
                if (!isCdnOrExternalImage(asset)) continue;
                if (asset.contentZones?.includes(this.selectedAsset)) {
                    return (asset as ImageAsset).imageUrl;
                }
            }
            for (const asset of promotion.assets) {
                if (!isCdnOrExternalImage(asset)) continue;
                if (asset.contentZones?.includes(contentZone)) {
                    return (asset as ImageAsset).imageUrl;
                }
            }
            return "";
        };
        const imageUrl: string = fetchImageUrl(promotion, context.contentZone);
        const url: string = promotion?.attributes?.url?.value ? promotion.attributes.url.value as string : "";

        return { imageUrl, url };
    }

}