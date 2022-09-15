#/bin/bash -e

while docker-compose logs postgreSQL | grep -q "ready in";
do
    echo "Waiting for Front to end"
    sleep 10
done
echo "Front finish !"

while docker-compose logs postgreSQL | grep -q "database system is ready to accept connections";
do
    echo "Waiting for postgreSQL to end"
    sleep 10
done
echo "postgreSQL finish !"

while docker-compose logs api | grep -q "Nest application successfully started";
do
    echo "Waiting for API to end"
    sleep 10
done
echo "API finish !"
