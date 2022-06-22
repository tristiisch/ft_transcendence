FROM debian:buster

# Install dependencies
RUN apt-get update
RUN apt-get full-upgrade
RUN	apt-get install postgresql postgresql-client

COPY tools/ /tools/
COPY conf/ /etc/mysql/mariadb.conf.d/


CMD	"./tools/run.sh"
