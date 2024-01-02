export class ISTrendsTemplate implements CampaignTemplateComponent {

    purchasesText: string;

    visitorsText: string;

    run(context: CampaignComponentContext) {
        return {
            purchasesText: this.purchasesText || "recently purchased",
            visitorsText: this.visitorsText || "visitors currently viewing"
        };
    }

}