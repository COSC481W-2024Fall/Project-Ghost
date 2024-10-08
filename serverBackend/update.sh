#!/usr/bin/env bash
sudo systemctl stop ghost-netrequest.service
cd ~/Project-Ghost/
git fetch
git pull
git fetch
git pull
sudo systemctl start ghost-netrequest.service
