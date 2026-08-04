# AI Interview Coach

I am uploading an existing AI Interview / Mock Interview project.

Your task is to inspect the COMPLETE project, understand the current architecture, fix broken parts, and make it a genuinely runnable application.

IMPORTANT: Do NOT rebuild the project from scratch unless absolutely necessary. Preserve the existing features and UI where possible, but fix the architecture, dependencies, configuration, APIs, and code required to make everything work.

MAIN REQUIREMENT

The application MUST NOT work only inside Lovable preview, Google AI Studio/CLI preview, or any special hosted preview environment.

It must work as a normal standalone project after downloading/cloning it and opening it in VS Code.

A developer should be able to:

Download or clone the project.

Open the project folder in VS Code.

Install dependencies.

Create/configure the required .env file.

Run the documented development command(s).

Open localhost in a browser.

Use the complete AI Interview application.

There must be NO dependency on Lovable preview, Google preview, temporary preview URLs, hidden environment variables, or platform-specific APIs that are unavailable locally.

1. AUDIT THE EXISTING PROJECT FIRST

Before making major changes, inspect:

package.json

frontend structure

backend/server structure

API routes

environment variables

authentication

database configuration

AI API integration

microphone/speech functionality

dependencies

imports

build configuration

TypeScript configuration

Vite/Next.js configuration

CORS configuration

hardcoded URLs

preview-specific code

Google-specific code

missing files

broken routes

deprecated libraries

dependency/version conflicts

Identify anything that could cause the downloaded project to fail in VS Code.

Then FIX those problems.

Do not only tell me what is wrong. Modify the project.

2. REMOVE PREVIEW-ONLY DEPENDENCIES

Search the entire codebase for anything that depends on:

Lovable preview

Google AI Studio preview

Google CLI preview

temporary preview domains

sandbox-only APIs

hardcoded localhost ports

hardcoded production URLs

hidden environment variables

platform-specific runtime behavior

Replace these with normal portable configuration.

Use environment variables where appropriate.

For example:

VITE_API_URL=
DATABASE_URL=
AI_API_KEY=

Use the correct variable naming convention for the framework already used by this project.

Create:

.env.example

Never expose secret API keys in frontend/browser code.

If an AI provider requires a secret API key, calls using that secret MUST go through the backend/server.

3. MAKE LOCAL VS CODE EXECUTION RELIABLE

Configure the project so it can be run locally from VS Code.

Make sure:

npm install works

development scripts work

frontend starts correctly

backend starts correctly

all required packages are listed in package.json

there are no missing imports

there are no unresolved modules

there are no broken aliases

environment variables load correctly

API requests point to the correct server

CORS works during local development

routing works after refreshing pages

static assets load correctly

If frontend and backend are separate, provide clear scripts for both.

If practical, add a root command such as:

npm run dev

that starts everything required for development.

Do not unnecessarily change the existing stack just to accomplish this.

4. AI INTERVIEW FUNCTIONALITY

Make the core interview flow actually work.

Expected flow:

Home/Dashboard
→ Create Interview
→ Select job role
→ Select interview type
→ Select difficulty
→ Start Interview
→ AI asks question
→ Candidate answers
→ Next question
→ Interview completes
→ AI evaluates answers
→ Results page

The AI interviewer should generate appropriate questions based on:

selected role

interview type

difficulty

previous answers when useful

Interview types can include:

HR

Technical

Behavioral

Coding

Mixed

Difficulty:

Easy

Medium

Hard

Do not use fake AI responses if a real AI integration already exists and can be repaired.

5. VOICE INTERVIEW

Check the existing microphone and speech implementation.

Make sure the browser can request microphone permission normally.

Required functionality:

Start recording
→ capture candidate speech
→ convert speech to text if supported
→ display transcript
→ allow editing when appropriate
→ submit answer

Handle:

microphone permission denied

browser doesn't support required speech API

empty recording

speech recognition failure

microphone unavailable

Provide a text-answer fallback so the interview is still usable without voice.

Do not depend on preview-specific microphone functionality.

6. INTERVIEW FEEDBACK

After completing the interview, generate useful feedback.

Show:

overall score

communication score

technical score

answer quality

strengths

weaknesses

improvement suggestions

For each question, where possible show:

Question

Candidate Answer

AI Feedback

Better Answer / Suggested Answer

Score

Avoid fake/random scores. Base evaluation on the candidate's actual answers.

7. CODING INTERVIEW

If the existing project contains a coding interview/editor, repair it.

The coding section should support at least the languages already implemented by the project.

Do NOT pretend arbitrary code execution is secure in the browser.

If the existing project relies on an external code-execution service, configure it properly through environment variables/API routes.

If safe code execution is not currently implemented, keep the editor functional and clearly separate code editing from actual execution instead of creating fake execution results.

8. DATABASE AND AUTHENTICATION

Inspect whether the existing application uses authentication/database storage.

If authentication already exists, make it functional.

If Supabase is already being used, keep it unless there is a strong technical reason to replace it.

Store useful information such as:

users

interviews

interview settings

questions

answers

scores

feedback

interview history

Do not introduce a complicated database architecture if the existing application doesn't require it.

The project should also fail gracefully if required credentials have not yet been configured.

9. ERROR HANDLING

Do not leave blank screens when something fails.

Handle cases including:

AI API unavailable

invalid/missing API key

API quota exceeded

network failure

microphone denied

speech recognition failure

database unavailable

authentication failure

missing environment variable

malformed AI response

Show useful user-facing messages and useful developer console/server logs without exposing secrets.

10. UI

Preserve the existing UI if it is already good.

Improve only where needed.

The application should be:

responsive

clean

professional

suitable for a final-year engineering project/demo

usable on desktop

reasonably usable on mobile

Important pages should include, where relevant:

Dashboard
Create Interview
Interview Room
Coding Interview
Results
Interview History
Profile/Settings

Do not spend all your effort redesigning the UI while leaving backend functionality broken.

FUNCTIONALITY IS THE PRIORITY.

11. REMOVE FAKE FUNCTIONALITY

Inspect buttons and UI controls.

Every important visible button should either work or be removed/disabled with a clear explanation.

Check:

Start Interview

Submit Answer

Next Question

Finish Interview

Start Recording

Stop Recording

Run Code

Login

Signup

Logout

View Results

Interview History

Remove mock/demo data from production flows where real data should be used.

12. ENVIRONMENT CONFIGURATION

Create a complete:

.env.example

Include every required variable but NEVER include real secrets.

Example:

AI_API_KEY=your_api_key_here
DATABASE_URL=your_database_url_here

Use the appropriate names for the actual technologies in this project.

Also ensure .env is included in .gitignore.

13. README — VERY IMPORTANT

Create/update README.md with exact instructions for running the downloaded project in VS Code.

Include:

Prerequisites

Required Node.js version and any other software.

Installation

Exact commands.

Environment Setup

Explain:

Copy .env.example to .env

Which values are required

Where each credential comes from

Running Locally

Provide the exact commands.

For example:

npm install

npm run dev

If frontend/backend require separate terminals, explicitly document that.

URLs

Document the normal local URLs, such as frontend and backend ports.

Troubleshooting

Include common problems:

port already in use

missing environment variable

API key invalid

dependency installation failure

microphone permission denied

database connection failure

CORS errors

14. VERIFY BEFORE FINISHING

Do NOT stop after editing the code.

Run the available checks and fix errors.

At minimum, where supported by the project:

install dependencies

type check

lint

build

Run the production build command.

There should be no critical TypeScript/compiler errors.

Also inspect the browser/server console for obvious runtime failures.

Test the main flow:

Launch application
→ Dashboard loads
→ Create interview
→ Start interview
→ Question appears
→ Submit answer
→ Continue interview
→ Complete interview
→ Results generated
→ Results displayed

Also verify that refreshing important routes does not break the application.

15. FINAL REPORT

After completing the modifications, give me a concise report containing:

Problems you found

Files you changed

Features you repaired

Features that are fully working

Features that still require external credentials/services

Environment variables I must configure

Exact commands I should run in VS Code

Local URL I should open

Any remaining limitations

IMPORTANT:

Do not claim something is working unless you actually verified it as far as your environment allows.

Do not tell me that something "should work" without checking the build/configuration.

The final goal is:

UPLOAD/EDIT IN LOVABLE
→ DOWNLOAD PROJECT
→ OPEN IN VS CODE
→ npm install
→ configure .env
→ npm run dev
→ APPLICATION WORKS LOCALLY

Prioritize a stable, demo-able AI Interview application over adding unnecessary features.

This project was built with [Lovable](https://lovable.dev).

## Build with Lovable

Continue developing this project in the [Lovable editor](https://lovable.dev/projects/8440a4f2-8bb3-4853-b569-f30ed5d173c7).

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```
