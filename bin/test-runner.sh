#!/bin/bash

SCRIPT_DIR="$(cd "$(dirname "$0")" > /dev/null 2>&1; pwd -P)"
IS_WSL=$(grep -qE "(Microsoft|WSL)" /proc/version &> /dev/null)
[[ "$1" == "watch" ]] && WATCH_MODE=true || WATCH_MODE=false

cypressCmd="docker-compose run e2e-cypress"
xlaunchPath="${SCRIPT_DIR}/XServer.xlaunch"

# When watching for test changes, `open` (instead of `run`) Cypress so that the
# Dev can use the GUI for an easy test writing experience.
if $WATCH_MODE; then
  # Making the assumption that if a Dev has DISPLAY set, they either already
  # have an XServer running, or know that they'll need to start one.
  if [[ "$DISPLAY" == "" ]]; then
    if $IS_WSL; then
      display=$(hostname):0.0
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
    fi
  else
    display="$DISPLAY"
  fi

  if [[ "$display" != "" ]]; then
    cypressCmd="docker-compose run -e DISPLAY=$display --entrypoint cypress e2e-cypress open --project ."
    
    if [[ "$xlaunchBinary" != "" ]] && [ -f "$xlaunchBinary" ]; then
      echo;
      echo "[START] XServer"
      "$xlaunchBinary" -run "$xlaunchPath"
    else
      echo "[ERROR] The XServer binary could not be located. Follow the instructions in the README to get it installed."
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
fi

# TODO
# - docker-compose tips near bottom https://www.cypress.io/blog/2019/05/02/run-cypress-with-a-single-docker-command/

