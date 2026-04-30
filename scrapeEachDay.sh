#!/bin/bash

# Script to run greenshades paystubs command for each day in  MM and YYYY

for day in $(seq 01 31); do
    # Format day with leading zero
    day_padded=$(printf "%02d" $day)
    date="2026-04-$day_padded"

    echo "Processing $date..."
    greenshades paystubs list -s $date -e $date -o json
done

