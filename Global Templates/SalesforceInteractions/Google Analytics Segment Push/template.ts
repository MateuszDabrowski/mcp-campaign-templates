import { UserSegmentLookup, UserSegmentReference } from "common";

export class GAConfig {
    @title("Google Analytics Dimension")
    @subtitle("e.g. dimension27")
    gaDimension: string;

    @title("Associated IS Segment(s)")
    @subtitle("Select one or more segments to associate to the above GA dimension.")
    @lookupOptions(() => new UserSegmentLookup())
    segments: UserSegmentReference[]
}

export class GASegmentPushTemplate implements CampaignTemplateComponent {

    @title("Map IS Segment(s) to Google Analytics")
    tabularComplexField: GAConfig[];

    run(context: CampaignComponentContext) {

        let gaMapping = {};
        this.tabularComplexField.forEach(mapping => {
            if (('gaDimension' in mapping) && ('segments' in mapping)) {
                const segments = [];
                mapping.segments.forEach(segment => {
                    const segmentJoinDate = context.user.getSegmentJoinDate(segment.id);
                    if (segmentJoinDate) {
                        segments.push(segment.label);
                    }
                })
                if (mapping['gaDimension'] && segments.length) {
                    gaMapping[mapping.gaDimension] = segments;
                }
            }
        })

        return {
            gaMapping: gaMapping
        };
    }
}