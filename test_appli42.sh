#!/bin/bash -e

source .env

APP42_UID=$FT_UID
APP42_SECRET=$FT_SECRET
APP42_API="https://api.intra.42.fr/oauth/token"

function removeHttpCode() {
   echo "${@:1:$#-1}";
}

RESPONSE=$(curl --write-out " %{http_code}" --data "grant_type=client_credentials&client_id=$APP42_UID&client_secret=$APP42_SECRET" $APP42_API -s)
HTTP_CODE=$(echo $RESPONSE | awk '{print $NF}')
PAYLOAD=$(removeHttpCode $RESPONSE)

# if command -v jq &> /dev/null; then
#     echo -e "Code: $HTTP_CODE"
#     echo $PAYLOAD | jq
# else
#     echo -e "Code : $HTTP_CODE\n$PAYLOAD"
# fi

if [ $HTTP_CODE == 200 ]; then
    echo -e "\033[0;32m42API connection is working. Nice !\033[0m"
else
    echo -e "\033[0;31m42API connection is not working. Check 42API credentials in .env files. You can create an application for 42APi at https://profile.intra.42.fr/oauth/applications with $VITE_OAUTH_REDIRECT as redirect URI.\033[0m"
    exit $HTTP_CODE;
fi

# TOKEN42=$(echo $PAYLOAD | jq -r '.access_token')

# TOKEN_INFO=$(curl -H "Authorization: Bearer $TOKEN42" https://api.intra.42.fr/oauth/token/info -s)
# APP42_INFO=$(curl --write-out " %{http_code}" -H "Authorization: Bearer $TOKEN42" "https://api.intra.42.fr/v2/apps/9804" -s)

# echo "TOKEN_INFO"
# echo $TOKEN_INFO | jq
# echo "APP42_INFO"
# echo $APP42_INFO | jq
