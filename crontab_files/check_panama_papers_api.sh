#!/bin/bash

cd $HOME/public_html/W209-Final-Project
n=`ps -ef | grep -v grep | grep 'python panama_papers_restful_API.py' | wc -l`
if [ $n -lt 2  ]; then
  nohup python panama_papers_restful_API.py > /dev/null 2>&1 &
fi

