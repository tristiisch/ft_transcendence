#/bin/bash -e
GITHUB_REPO=cli/cli
GITHUB_URL_API=https://api.github.com/repos/$GITHUB_REPO/releases

ASSETS_URL=$(curl -LJsS "$GITHUB_URL_API" | jq '.[0].assets[] | select(.name | endswith("linux_amd64.deb")).browser_download_url')

echo $ASSETS_URL