---
name: Technical detail-ticket
about: Technical description with implementation details
title: ''
labels: ''
assignees: ''

---

Title: [Feature/Task Name]

Description:
[A concise explanation of what the feature or fix is about, including its context and purpose. This should also include any relevant technical details or specifications.]

Integration points:
[Describe any integrations in detail, for example if it requires a call to a particular endpoint - call 

Configuration requirements:
[Describe any configurations that are required for this feature to work, and outline where they should be stored - for example, if all configuration should be stored in azure key store.] 

Logging:
[Beyond project-wide logging requirements, detail any requirements that exist for logging and analytics - e.g. logging should include the github repo ID with all logs etc]

Implementation approach:
[Describe in as detailed a way as possible the implementation and how it should work
Technical Acceptance Criteria
Scenario: [Specific action or situation being handled]
Given:

[Specific initial conditions, configurations, or prerequisites]
[Detailed state of the system, e.g., "The user is logged in with role X and has permission Y."]
[Any external dependencies, e.g., "API Z is available and returns a valid response."]
When:

[Explicit action or trigger, e.g., "The user clicks the 'Save' button after entering valid form data."]
[Secondary or edge-case actions, e.g., "The user enters an invalid field and clicks 'Submit.'"]
Then:

[Expected system behaviour, e.g., "The system validates the input, saves it to the database, and returns a success message."]
[UI feedback, e.g., "The user sees a confirmation toast with the message: 'Changes saved successfully.'"]
[Other outcomes, e.g., "A record is logged in the audit trail."]
