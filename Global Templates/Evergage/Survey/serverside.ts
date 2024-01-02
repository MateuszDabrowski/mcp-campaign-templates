import { SurveyReference, SurveyReferenceLookup } from "surveys";

export class SurveyTemplate implements CampaignTemplateComponent {

    @title("Survey Selector")
    @lookupOptions(() => new SurveyReferenceLookup())
    surveyReference: SurveyReference;

    run(context: CampaignComponentContext) {
        const survey = context.services.surveys.getSurvey(this.surveyReference.id);
        return {
            survey: survey
        }
    }
}
