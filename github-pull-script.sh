#!/bin/bash

cd /var/www/github/HogWaler
git reset --hard # this prevents 'merge' error but wont save server git changes
git pull origin master

sudo /bin/systemctl restart HogWaler.service

echo "done"
exit 0

