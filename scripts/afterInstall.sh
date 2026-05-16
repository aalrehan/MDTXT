#!/bin/bash
sed -i 's|Exec=/opt/md-txt-browser/md-txt-browser %U|Exec=/opt/md-txt-browser/md-txt-browser --no-sandbox %U|' /usr/share/applications/md-txt-browser.desktop || true
