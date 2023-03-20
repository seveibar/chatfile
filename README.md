# Chatfile

A Chatfile is similar to a Dockerfile, but is used for automatically constructing
ChatGPT prompts using reference content and summarization.

Here's an example of a chatfile:

```txt
OBJECTIVE_PROMPT
"""
Introduce new API endpoints that allow users to sign up. It should take an email
and send a code to the email address. The email allows a link to be clicked to
sign in.
"""
ENGINE gpt-3.5-turbo
TOKEN_LIMIT 4000

FILE_CHECKER 'tsc --noEmit'
RESPONSE_FORMATTER 'prettier'

BREAKDOWN_TASK

SUMMARIZE_FILES ./src /prompt/relevant-files

ENGINE gpt-4
TOKEN_LIMIT 8000

# For debugging
# PRINT_PROMPT /prompt

EDIT_DIRECTORY /prompt ./src
```

## Usage

### With Github

You should always create a default chatfile for a Github Repository. This
chatfile is used as the foundation/cache for any feature requests or bug
reports that the AI will be asked to fix.

Here's an example of a default Chatfile:

```
ENGINE gpt-3.5-turbo
TOKEN_LIMIT 4000

LOAD_DIRECTORY ./src /src

SUMMARIZE_DIRECTORY /src /prompt/directory-summary 1000tk

FIND_RELEVANT_FILES /prompt/directory-summary /relevant-files

LOAD_FILES /relevant-files /prompt/relevant-files-loaded 4000tk

ENGINE gpt-4
TOKEN_LIMIT 8000
```
