all: setup build logs

setup:
	@mkdir -p ${HOME}/ft_transcendence_volumes/db_postgres ; mkdir -p ${HOME}/ft_transcendence_volumes/db_pgadmin
	@chmod -R 777 ${HOME}/ft_transcendence_volumes

build:
	@docker-compose up --detach --build

stop:
	@docker-compose stop

start:
	@docker-compose start

clean:
	@docker-compose down
	@docker volume rm backend_db_postgres backend_db_pgadmin

fclean: clean
	@rm -rf ${HOME}/ft_transcendence_volumes

logs:
	@docker-compose logs --follow

re: clean all
