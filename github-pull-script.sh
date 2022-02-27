#!/bin/bash

cd /var/www/github/HogWaler
git reset --hard # this prevents 'merge' error but wont save server git changes
git pull origin main

sudo /bin/systemctl restart hogwaler.service

echo "done"
exit 0

