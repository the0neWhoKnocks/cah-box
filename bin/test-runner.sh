#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" > /dev/null 2>&1; pwd -P)"
[[ "$1" == "watch" ]] && WATCH_MODE=true || WATCH_MODE=false

isWSL=false
isOSX=false

# Linux env
if [ -f "/proc/version" ]; then
  isWSL=$(grep -qE "(Microsoft|WSL)" /proc/version &> /dev/null)
else
  isOSX=$(uname | grep -qi "darwin" &> /dev/null)
fi

cypressCmd="docker-compose run e2e-cypress"
xlaunchPath="${SCRIPT_DIR}/XServer.xlaunch"

# When watching for test changes, `open` (instead of `run`) Cypress so that the
# Dev can use the GUI for an easy test writing experience.
if $WATCH_MODE; then
  if $isWSL; then
    display="$(hostname):0.0"
    xlaunchBinary="/c/Program Files/VcXsrv/xlaunch.exe"
    xlaunchPath=$(wslpath -w "${SCRIPT_DIR}/XServer.xlaunch")
    xlaunchKillCmd="/c/Windows/System32/taskkill.exe /IM \"vcxsrv.exe\" /F"
    SERVER_IS_RUNNING=$(/c/Windows/System32/tasklist.exe | grep -q vcxsrv && true || false)
    
    # If previous Server session wasn't terminated, kill it
    if $SERVER_IS_RUNNING; then
      echo;
      echo "[KILL] Previously running XServer session"
      eval "$xlaunchKillCmd"
    fi
  elif $isOSX; then
    xquartzBinary=$(which xquartz)
    xquartzKillCmd="osascript -e 'quit app \"xquartz\"'"
    IP=$(ifconfig en0 | grep inet | awk '$1=="inet" {print $2}')
    display="$IP:0"
  fi

  if [[ "$display" != "" ]]; then
    cypressCmd="docker-compose run -e DISPLAY=$display --entrypoint cypress e2e-cypress open --project ."
    
    if [[ "$xlaunchBinary" != "" ]] && [ -f "$xlaunchBinary" ]; then
      echo;
      echo "[START] XServer"
      "$xlaunchBinary" -run "$xlaunchPath"
    elif [[ "$xquartzBinary" != "" ]] && [ -f "$xquartzBinary" ]; then
      echo;
      echo "[START] XServer"
      xhost + $IP
    else
      echo "[ERROR] The XServer binary could not be located. Follow the instructions in the README to get it installed."
      echo;
      exit 1
    fi
  else
    echo;
    echo "[ERROR] You're trying to run watch mode but no \`DISPLAY\` was set for your OS, and one could not be determined."
    echo;
    exit 1
  fi
fi

echo;
echo "[START] Tests"
echo;
npm run build && concurrently --kill-others -p "[ {name} ]" -n SERVER,TESTS -c black.bgGreen,black.bgCyan "npm run start" "${cypressCmd}"

if [[ "$xlaunchKillCmd" != "" ]]; then
  echo;
  echo "[KILL] XServer"
  eval "$xlaunchKillCmd"
elif [[ "$xquartzKillCmd" != "" ]]; then
  echo;
  echo "[KILL] XServer"
  eval "$xquartzKillCmd"
fi
