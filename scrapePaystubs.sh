#!/bin/bash

START_DATE="2026-04-26"
END_DATE=$(date +%Y-%m-%d)

current=$START_DATE

while [[ "$current" < "$END_DATE" || "$current" == "$END_DATE" ]]; do
    week_start=$current
    week_end=$(date -d "$current + 6 days" +%Y-%m-%d)

    echo "Processing week: $week_start -> $week_end"

    greenshades paystubs list -s "$week_start" -e "$week_end" -o json

    current=$(date -d "$current + 7 days" +%Y-%m-%d)
done

echo "Done."