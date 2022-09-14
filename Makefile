all: setup build logs

setup:
	mkdir -p ${HOME}/ft_transcendence_volumes/postgres_data
	mkdir -p ${HOME}/ft_transcendence_volumes/pgadmin_data
#	chmod -R 777 ${HOME}/ft_transcendence_volumes

build:
	docker-compose up --detach --build

stop:
	docker-compose stop

start:
	docker-compose start

clean:
	docker-compose down --volumes --remove-orphans

fclean: clean
	rm -rf ${HOME}/ft_transcendence_volumes

logs:
	docker-compose logs --follow

re: clean all
