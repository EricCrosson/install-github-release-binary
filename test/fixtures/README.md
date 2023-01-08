To generate the fixtures in

- tags.json, I ran `curl \    
-H "Accept: application/vnd.github+json" \
-H "Authorization: Bearer $GITHUB_TOKEN"\
-H "X-GitHub-Api-Version: 2022-11-28" \
https://api.github.com/repos/$owner/$repo/tags > tags`
