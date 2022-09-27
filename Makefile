all: setup up logs

setup:
	mkdir -p ${HOME}/ft_transcendence_volumes/postgres_data
	mkdir -p ${HOME}/ft_transcendence_volumes/pgadmin_data
#	chmod -R 777 ${HOME}/ft_transcendence_volumes

init:
	./credentials42.sh

test: init
	docker-compose up --build --force-recreate

build: init
	docker-compose up --detach --build --force-recreate

up: init
	docker-compose up --detach

stop:
	docker-compose stop

start:
	docker-compose start

clean:
	docker-compose down --volumes --remove-orphans

fclean: clean
	docker-compose down --rmi all
	rm -rf ${HOME}/ft_transcendence_volumes

purge:
	docker system prune --all --volumes

logs:
	docker-compose logs --follow api front postgreSQL

re: clean all

.PHONY: setup init test build up stop start fclean purge logs re