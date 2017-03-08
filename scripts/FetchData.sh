#!/bin/bash

LIST=$(cat KeyList)

mkdir -p ../results
TRAIN_NO=$1

for API_KEY in $LIST; do
    echo $API_KEY
    while [ $TRAIN_NO -lt 19900 ]; do
        query="curl -s http://api.railwayapi.com/route/train/$TRAIN_NO/apikey/$API_KEY/"
        $query > ../results/$TRAIN_NO
        response=$(cat ../results/$TRAIN_NO)
        if [[ ! $response =~ \"response_code\":\ 20 ]]; then
            echo $response
            break
        fi
        echo Data successfully fetched for Train No: $TRAIN_NO
        let TRAIN_NO=$TRAIN_NO+1
    done
done
