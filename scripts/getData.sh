#!/bin/bash

flag=false

getData() {
    TRAIN_NO=$1
    API_KEY=$2
    query="wget -q http://api.railwayapi.com/route/train/$TRAIN_NO/apikey/$API_KEY/"
    $query
    mv index.html ../results/$TRAIN_NO
    response=$(cat ../results/$TRAIN_NO)
    if [[ ! $response =~ \"response_code\":\ 20 ]]; then
        echo $response
        flag=false
        return
    fi
    echo Data successfully fetched for Train No: $TRAIN_NO
    flag=true
    return
}

LIST=$(cat KeyList)
# TRAIN_LIST=$(cat AbsentFiles)

mkdir -p ../results

read Train

for API_KEY in $LIST; do
    echo $API_KEY
    getData $Train $API_KEY
    while [ $flag == true ]; do
        read Train
        getData $Train $API_KEY
    done
done

rm -f index.html
