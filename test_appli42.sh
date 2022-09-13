#!/bin/bash -e

APP42_UID=""
APP42_SECRET=""
APP42_API="https://api.intra.42.fr/oauth/token"

function removeHttpCode() {
   echo "${@:1:$#-1}";
}


RESPONSE=$(curl --write-out " %{http_code}" --data "grant_type=client_credentials&client_id=$APP42_UID&client_secret=$APP42_SECRET" $APP42_API -s)
HTTP_CODE=$(echo $RESPONSE | awk '{print $NF}')
PAYLOAD=$(removeHttpCode $RESPONSE)

if command -v jq &> /dev/null; then
    echo -e "Code : $HTTP_CODE"
    echo $PAYLOAD | jq
else
    echo -e "Code : $HTTP_CODE\n$PAYLOAD"
fi

if [ $HTTP_CODE != 200 ]; then
    exit $HTTP_CODE;
fi

TOKEN42=$(echo $PAYLOAD | jq -r '.access_token')

# TOKEN_INFO=$(curl -H "Authorization: Bearer $TOKEN42" https://api.intra.42.fr/oauth/token/info -s)
# APP42_INFO=$(curl --write-out " %{http_code}" -H "Authorization: Bearer $TOKEN42" "https://api.intra.42.fr/v2/apps/9804" -s)

# echo "TOKEN_INFO"
# echo $TOKEN_INFO | jq
# echo "APP42_INFO"
# echo $APP42_INFO | jq
