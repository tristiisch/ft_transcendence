#!/bin/bash -e

# 10 mins
MAX_SECONDES=140
TIME_CICLE=10

AUTODOCKER_PIDS=$(ps -e | grep autodocker.sh | awk '{print $1;}')

if [ -z "$AUTODOCKER_PIDS" ] && [ "$AUTODOCKER_PIDS" != "$BASHPID" ]; then
    echo "$0 is already running $AUTODOCKER_PIDS"
    kill -9 $AUTODOCKER_PIDS
fi

i=0
function timeoutCheck() {
    if [[ "$i" -ge "$MAX_SECONDES" ]]; then
        echo "\!/ Timeout \!/ after $i secondes"
        docker-compose down
        exit 1
    fi
}

function errorContainer() {
    echo "\!/ ERROR service $1 \!/"
    docker-compose down
    exit 1
}

while ! docker container inspect front api postgreSQL pgAdmin &> /dev/null; do
    echo "Waiting for containers to be create ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done

while ! docker-compose logs front | grep -q "ready in"; do
    echo "Waiting for Front to end ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done
echo "Front finish !"

while ! docker-compose logs postgreSQL | grep -q "database system is ready to accept connections"; do
    echo "Waiting for postgreSQL to end ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done
echo "postgreSQL finish !"

while ! docker-compose logs pgAdmin | grep -q "Listening at"; do
    echo "Waiting for pgAdmin to end ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done
echo "pgAdmin finish !"

while ! docker-compose logs api | grep -q "Nest application successfully started"; do
    if docker-compose logs api | grep -q "errors. Watching for file changes."; then
        errorContainer API
    fi
    echo "Waiting for API to end ... $i secondes"
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
    timeoutCheck
done
echo "API finish !"


echo "All services finish in $i secondes"

if command -v jq &> /dev/null; then
    curl http://localhost:3000/api | jq
else 
    curl http://localhost:3000/api
fi
curl http://localhost:8001

end=0
while [[ "$i" -lt "$MAX_SECONDES" ]]; do
	let "end = $MAX_SECONDES - $i"
    echo "Waiting $end secondes before down containers."
    sleep $TIME_CICLE
	let "i = i + $TIME_CICLE"
done

echo "Now down containers"
docker-compose down --volumes --remove-orphans
echo "Done !"
