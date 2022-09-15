#!/bin/bash -e

# 10 mins
MAX_SECONDES=600
TIME_CICLE=10

i=0

function timeoutCheck() {
    if [[ "$i" -ge "$MAX_SECONDES" ]]; then
        echo "\!/ Timeout \!/ after $i secondes"
        exit 1
    fi
}

while ! docker container inspect front api postgreSQL pgAdmin &> /dev/null;
do
    echo "Waiting for containers to be create ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done

while ! docker-compose logs front | grep -q "ready in";
do
    echo "Waiting for Front to end ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done
echo "Front finish !"

while ! docker-compose logs postgreSQL | grep -q "database system is ready to accept connections";
do
    echo "Waiting for postgreSQL to end ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done
echo "postgreSQL finish !"

while ! docker-compose logs api | grep -q "Nest application successfully started";
do
    echo "Waiting for API to end ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done
echo "API finish !"

while ! docker-compose logs pgAdmin | grep -q "Listening at";
do
    echo "Waiting for pgAdmin to end ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done
echo "pgAdmin finish !"

echo "Now close all containers"
docker-compose stop
