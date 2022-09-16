#!/bin/bash

ENV=.env
ENV_LOCAL=local.env

UID_NAME=FT_UID
SECRET_NAME=FT_SECRET
HOSTNAME_NAME=LOCAL_HOSTNAME

APP_URL="https://profile.intra.42.fr/oauth/applications"

REAL_HOSTNAME=$(hostname -I | cut -d' ' -f1)
UID_LINE=$(cat .env 2> /dev/null | grep $UID_NAME)
SECRET_LINE=$(cat .env 2> /dev/null | grep $SECRET_NAME)
HOSTNAME_LINE=$(cat .env 2> /dev/null | grep $HOSTNAME_NAME)

FT_UID=${UID_LINE#*=}
FT_SECRET=${SECRET_LINE#*=}
LOCAL_HOSTNAME=${HOSTNAME_LINE#*=}

function printJSON() {
    if command -v jq &> /dev/null; then
        echo $1 | jq
    else
        echo -e "$1\n"
    fi
    echo -e "$1\n"
}

function updateEnv() {
    if test -f "$ENV"; then
        mv $ENV outdated.env
    fi
    cp $ENV_LOCAL $ENV
    sed -i "s/$HOSTNAME_NAME=/$HOSTNAME_NAME=$REAL_HOSTNAME/g" $ENV
    sed -i "s/$UID_NAME=/$UID_NAME=$FT_UID/g" $ENV
    sed -i "s/$SECRET_NAME=/$SECRET_NAME=$FT_SECRET/g" $ENV
    echo -e "\033[0;32mYour $ENV as been updated.\033[0m"
}

function askCredentials() {
    if [ -z "$2" ]; then
        while [ -z "$R_FT_UID" ]; do
            read -p "UID ? " -r R_FT_UID
        done
        while [ -z "$R_FT_SECRET" ]; do
            read -p "SECRET ? " -r R_FT_SECRET
        done
    else
        R_FT_UID=$1
        R_FT_SECRET=$2
    fi
    echo "Now we will check them. FT_UID: $R_FT_UID FT_SECRET: ****"
    FT_UID=$R_FT_UID
    FT_SECRET=$R_FT_SECRET
    updateEnv
}


if ! test -f "$ENV"; then
    echo -e "\033[1;34mYou need to create .env file. Give me your 42API credentials from $APP_URL\033[0m"
    askCredentials $@
elif [ -z "$FT_UID" ] || [ -z "$FT_SECRET" ]; then
    echo -e "\033[1;34mYou didn't add your 42API credentials. Get it from $APP_URL\033[0m"
    askCredentials $@
elif [ `cat $ENV | wc -l` -ne `cat $ENV_LOCAL | wc -l` ] || [ $LOCAL_HOSTNAME != $REAL_HOSTNAME ]; then
    echo -e "\033[1;33mYou need to update your .env.\033[0m"
    diff $ENV $ENV_LOCAL
    read -p $'\e[1;92mYour credentials will be preserve. Update .env ? (y/N)'$'\033[0m' -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        updateEnv
    else
        echo -e "\033[1;33mYour .env is outdated.\033[0m"
    fi
else
    echo -e "\033[0;32mYour .env is up to date.\033[0m"
fi

source $ENV

APP42_UID=$FT_UID
APP42_SECRET=$FT_SECRET
APP42_API="https://api.intra.42.fr/oauth/token"

function removeHttpCode() {
   echo "${@:1:$#-1}";
}

RESPONSE=$(curl --write-out " %{http_code}" --data "grant_type=client_credentials&client_id=$APP42_UID&client_secret=$APP42_SECRET" $APP42_API -s)
HTTP_CODE=$(echo $RESPONSE | awk '{print $NF}')
PAYLOAD=$(removeHttpCode $RESPONSE)

if [ $HTTP_CODE == 200 ]; then
    echo -e "\033[0;32m42API connection is working. Nice !\033[0m"
    # printJSON $PAYLOAD
else
    echo -e "\033[0;31m42API connection is not working (Error $HTTP_CODE). Check 42API credentials in .env files.\033[0m"
    echo -e "\033[0;31mYou can create an application for 42APi at https://profile.intra.42.fr/oauth/applications with $FT_OAUTH_REDIRECT as redirect URI.\033[0m"
    printJSON $PAYLOAD
    exit $HTTP_CODE;
fi

# TOKEN42=$(echo $PAYLOAD | jq -r '.access_token')

# TOKEN_INFO=$(curl -H "Authorization: Bearer $TOKEN42" https://api.intra.42.fr/oauth/token/info -s)
# echo $TOKEN42
# curl -H "Authorization: Bearer $TOKEN42" "https://api.intra.42.fr/v2/me"
# USER_ID=$(curl --write-out " %{http_code}" -H "Authorization: Bearer $TOKEN42" "https://api.intra.42.fr/v2/me" -s)

# APP42_INFO=$(curl --write-out " %{http_code}" -H "Authorization: Bearer $TOKEN42" "https://api.intra.42.fr/v2/users/$USER_ID" -s)

# echo "TOKEN_INFO"
# echo $TOKEN_INFO | jq
# echo "APP42_INFO"
# echo $USER_ID
