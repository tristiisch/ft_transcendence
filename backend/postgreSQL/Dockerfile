FROM debian:buster
#FROM postgres:latest

# Install dependencies
RUN apt update
RUN	apt install postgresql postgresql-client

COPY tools/ /tools/
COPY conf/ /etc/mysql/mariadb.conf.d/


CMD	"./tools/run.sh"
