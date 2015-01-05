# Cartoon Service
I am creating a cartoon service that I want to deploy to my Raspberry Pi which will on given intervals download todays cartoon strips. Currently I am only interested in Lunch, a popular norwegian cartoon that I have heard are also release in a number of other countries as well.

## How to fetch a lunch cartoon
* Todays time in unix time and devide by 1000
* Name of the cartoon ('lunch')
* The url for the php script

Example: http://www.dagbladet.no/tegneserie/pondusarkiv/serveconfig.php?date=1420481375&strip=lunch

## What we neeed
* Some schedule service (raspbian comes with 'cron' so we can simply use that)

## How do we want to save it
In my opinion this isn't all that important as long as they are in the correct order. To make it easy to understan I propose a simple date as the filename in the first iteration of this cartoon fetch script.

Example: 2015.01.15.png