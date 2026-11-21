# Module 3 Playbook Submission — Service Request Portal

**Name:** [David Darus]
**Live URL:** [https://dpd-vbc-m3-starter.netlify.app]
**Repo:** [(https://github.com/darusdp/vbc-m3-starter)]

## What I built

*3–5 plain-English sentences about what you built and who it's for. No jargon — write it the way you'd explain it to a coworker who doesn't code.*

[I built a Service Request portal using the Morrowlane web interface that stores a list of requests. The requests record their priority and progress status. The application is used by service providing staff to track customer requests.]

## Debug Log

*Document the bug you hit when your deployed site stopped behaving like your laptop. Fill in all five fields below. Keep it factual — what you saw, what you asked, what turned out to be true.*

**Symptom:** [YOUR DESCRIPTION OF WHAT WENT WRONG — what you saw on screen, and how it differed from what happened locally]

Issue #1: Server not reachable
Date: 11/18/2026
Status: Fixed
Found during:
X Valid-entry test
☐ Empty-form test
☐ Duplicate test
☐ Unrealistic-value test
☐ Math check
☐ Other:_________

**Symptom**
What did you do?
Entered New Request and clicked Submit Request
What did you expect?
Expected the request to be submitted, saved and Stat tiles updated
What happened instead?
Could not reach the server. Please try again.

**What I asked Claude:**
I entered data in the new request form and clicked submit request.
I expected the data to save and stat tiles to update.
Instead I got an error 'Could not reach the server. Please try again.'

**Root cause**
The site was private, not public

**Fix**
Made Netlify site public

**Verification**
How did you test the fix?
Retried submitting a request
What happened after the fix?
Request submitted with no error message
Evidence or notes:
Screenshot not able to be placed in text document
However, the screenshot showed the 'Request submitted.' message next to the Submit request button. The Stats tile counts were updated and the request list with the initial and added data showed correctly.
=======================================================

Issue #2: Data not saved
Date: 11/18/2026
Status: Fixed
Found during:
X Valid-entry test
☐ Empty-form test
☐ Duplicate test
☐ Unrealistic-value test
☐ Math check
☐ Other:_________

**Symptom**
What did you do?
Entered New Request and clicked Submit Request
What did you expect?
Expected the request to be submitted, saved and Stat tiles updated
What happened instead?
Data was not saved and Stat tiles not updated after refreshing web page

**What I asked Claude:**
I entered a New Request and clicked Submit Request
I expected the request to be submitted, saved and Stat tiles updated
The data was not saved and Stat tiles not updated after refreshing web page

**Root cause**
The data is only saved in memory and Netlify memory doesn’t persist.

**Fix**
Need a backend database to save data to storage and not just memory
Create a Subabase project, create an SQL request table, set access rules.

**Verification**
How did you test the fix?
I worked through the Playbook to create a database, uploaded the existing data and entered new data.
What happened after the fix?
All the data was preserved; it survived a brower webpage refresh and a closing and opening of the browser session for the web application URL.
Evidence or notes:
Screenshot not able to be placed in text document
However, the screenshot showed the updated Stats tile counts and request list with the added data.
=======================================================

## Test pass results

*Run all five checks against your live site and record what happened. "Result" is pass or fail plus what you actually saw. "Fix made" is what you changed, or "None needed."*

| # | Check | What I did | Result | Fix made |
|---|---|---|---|---|
| 1 | Valid entry | Entered valid data for John Doe request | Passed:The data was saved in the list and database | None needed |
| 2 | Empty form | Submitted form with no data entered | Passed:Requester name is required. | None needed |
| 3 | Duplicate-ish | Entered valid data for same John Doe request | Passed:I determined that such a duplicate cannot be unambiguously determined that it is not truly a duplicate. The problem could be fixed but re-occur for the same person, location, date. Since I work in IT I know this happens. | None needed |
| 4 | Absurd values | Since the Morrowlane front-end only has description as freeform there is no place to enter absurd data | No place to enter absurd data | None needed |
| 5 | Hand-checked tile math | After submitting new request I used the list and DB records to count the stats manually and made sure they matched the Stats tiles on the web page | Stats matched it tiles, list and DB | None needed |

## Known limitations

*Be honest. List 3–5 things your app can't do or doesn't protect against, one bullet each — the things you'd want a real user to know before trusting it.*

- A truly duplicate record can't be unambiguously determined so a duplicate record could be entered
- Not able to edit records other than their Status
- Web front-end has no sorting or filtering capabilities for the request list

## Assessment

*Around 250 words, first person. Where did AI move fast for you? Describe one genuine almost-right moment — something that looked correct and wasn't — and how you caught it. What would you prompt differently next time?*

AI moved fast in doing all the setup to get the web application front-end into GitHub are ready for deploy. It updated several files in the GitHub project that I wouldn't know to do. While AI moved fast here, it was very useful to do steps that if I had to do manually would take a lot longer and likely I would have more problems to debug. There were manual steps AI told me to do to copy and paste things into Netlify and Supabase. AI did not give correct exact location of where to make the changes since Netlify and Supabase has made updates to change the exact location and wording. I prompted AI about not finding the locations for the pasting and it responded about the change in the locations and provided correct locations. When I first started on the project using a Terminal session in Windows I was in the wrong directory so the git cloned led to a permission denied issue. I didn't realize that would be a problem so it seemed correct at the time. A better AI prompt would have asked in more detail about doing the git clone step to ensure I was in the right location doing the right thing. Since I’m not a GitHub user or a web programmer there were many steps that AI did and provided feedback to explain that took a while to understand.
