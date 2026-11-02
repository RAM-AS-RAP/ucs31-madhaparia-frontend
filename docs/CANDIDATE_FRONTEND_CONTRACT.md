# Candidate frontend response contract

Backend source: the implemented candidate assessment and `/predict`
response in the backend repository. These frontend fixtures are
representative examples, not complete backend response snapshots.

The frontend sends age, sex, text and confirmed_codes to POST /predict.
The backend selects the active model. The frontend never loads the ML
model or applies its uncertainty thresholds.

| Backend status | Predictions | Display requirement |
| --- | --- | --- |
| prediction_complete | One | Show the accepted condition and model score with its explanation. |
| insufficient_information | Empty | Explain that no condition can be shown from the available information. |
| unsupported_input | Empty | Explain which confirmed symptoms need clarification or are unsupported. |
| urgent_review | Empty | Show urgent guidance and no disease prediction. |

All four states may be successful HTTP 200 responses. An empty
predictions array does not mean that the API request failed.

For candidate sessions, assessment has contract_version=1 and records
the runtime decision, message, uncertainty_reasons, reported_unit_count,
prediction_performed, score_note, safety and unsupported symptoms,
clarification_required, and unmatched_wording. An accepted assessment
has a condition and model_score. Withheld assessments have both fields
set to null, even when prediction_performed is true.

Only an accepted prediction receives an enriched condition and a
display percentage. The model score is not a diagnosis or an
individual clinical risk. The frontend must never show a hidden
leading condition for a withheld result.

The independent urgent safety route can bypass the model. Its
assessment has status=safety_review_required and may have null model,
policy and reporting-unit fields.

Patient and administrator history return the saved assessment.
Older V1/V2 records can have assessment=null; their saved predictions
remain available. The frontend must not recalculate historical results.

Issue #79 documents and tests transport and storage of these shapes.
Issues #80 and #81 implement their screen presentation. Issue #82
validates the full workflow.