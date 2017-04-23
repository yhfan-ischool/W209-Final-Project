#!/bin/bash

cd $HOME/public_html/W209-Final-Project
n=`ps -ef | grep -v grep | grep 'python panama_papers_restful_API.py' | wc -l`
if [ $n -gt 0 ]; then
  ps -ef | grep -v grep | grep 'python panama_papers_restful_API.py' | awk '{ print $2 }' | xargs kill -9
fi

nohup python panama_papers_restful_API.py > /dev/null 2>&1 &

