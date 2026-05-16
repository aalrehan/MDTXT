#!/bin/bash
sed -i 's|Exec=/opt/md-txt-browser/md-txt-browser %U|Exec=/opt/MDTXT/MDTXT --no-sandbox %U|' /usr/share/applications/mdtxt.desktop || true
sed -i 's|/opt/md-txt-browser/md-txt-browser|/opt/MDTXT/MDTXT|g' /usr/share/applications/mdtxt.desktop 2>/dev/null || true