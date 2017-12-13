#!/bin/sh
# create a local port for an ec2 machine metadata server. useful for development
ssh -f ec2-user@$host -L 8080:169.254.169.254:80 -N