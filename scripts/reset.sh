#!/usr/bin/env bash

GREEN=$(tput -Txterm setaf 2)
YELLOW=$(tput -Txterm setaf 3)
WHITE=$(tput -Txterm setaf 7)
RESET=$(tput -Txterm sgr0)


function ask_yes_or_no_default_yes() {
    read -r -p "${GREEN}$1${RESET} ${WHITE}(Y/n)${RESET}${GREEN}?${RESET} " response
    readonly response=`echo "$response" | tr '[:upper:]' '[:lower:]'` # to lowercase
    if [[ $response =~ ^(yes|y| ) ]] || [[ -z $response ]]; then
        echo "yes"
    else
        echo "no"
    fi
}


if [[ "no" = $(ask_yes_or_no_default_yes "Are you sure? This will delete all git ignored files and docker volumes and images.") ]]; then
    echo "Reset aborted."
else
    echo "Bringing down docker compose ..."
    docker-compose down

    echo "Removing files ignored by git ..."
    git clean -xdf

    echo "Removing docker volumes created by the project ..."
    docker volume ls | grep hybrid | awk '{print $2}' | xargs docker volume rm

    echo "Removing docker images"
    docker rmi canopy/hybrid-form-example:latest

    echo "Creating a new .env"
    ./scripts/create_env.py

    echo 'Done! 🎉 You should be able to run "docker-compose up" now to bring up a fresh project.'
fi


