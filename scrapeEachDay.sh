#!/bin/bash

# Script to run greenshades paystubs command for each day in  Jan 2026

for day in $(seq 01 31); do
    # Format day with leading zero
    day_padded=$(printf "%02d" $day)
    date="2026-01-$day_padded"

    echo "Processing $date..."
    greenshades paystubs list -s $date -e $date -o json
done

