#!/usr/bin/env python3
"""
Global Game Jam 2018 Autocommit Script
Joshua Scarsbrook
"""

import datetime
import time
from subprocess import check_call, CalledProcessError

if __name__ == "__main__":
    while True:
        line_one = "============================================================="
        line_two = "===== NEXT COMMIT IN %s SECONDS ============================"
        print(line_one)
        date_string = str(datetime.datetime.now())
        check_call(["git", "add", "."])
        try:
            check_call(["git", "commit", "-m", "Commit on %s" %
                        (date_string, )])
            check_call(["git", "push"])
        except CalledProcessError:
            pass

        for x in range(0, 300):
            b = line_two % (str(300 - x).zfill(3), )
            print(b, end="\r")
            time.sleep(1)

        print(line_one)
        print("")
