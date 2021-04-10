#!/bin/bash

find_git_branch() {
    # Based on: http://stackoverflow.com/a/13003854/170413
    local branch
    if branch=$(git rev-parse --abbrev-ref HEAD 2> /dev/null); then
        if [[ "$branch" == "HEAD" ]]; then
            branch='detached*'
        fi
        git_branch="($branch)"
    else
        git_branch=""
    fi
}

find_git_dirty() {
    local status=$(git status --porcelain 2> /dev/null | pcregrep -v "^\?\? ")
    if [[ "$status" != "" ]]; then
        git_dirty='*!*'
    else
        git_dirty=''
    fi
}

checkdir() {
    local DIR=$1

    cd $DIR
    find_git_branch
    find_git_dirty

    RED='\033[0;31m'
    BLUE='\033[0;34m'
    NC='\033[0m' # No Color
    echo -e "${DIR}${BLUE}${git_branch}${RED}$git_dirty${NC}"
}

for dir in $(find . -type d -name ".git")
do
    dir=${dir%.git}
    (
        checkdir $dir
    )
done

