DNAC-Troubleshooting-Mobile-App
===============================


Description
-----------

The App will allow users to configure a couple settings on an AP, including the LED state, and transmission power levels.

Problem
-------
During the Fabric deployment of sites - floor, we noticed lots of APs not part of Fabric domain and it's difficult for network admin to find the problematic AP's on the floor and ask contractor to replace it or shut it down
       
Solution
--------
This App will allow the users to configure various settings on the AP,including enabling LED flash and changing tx power.


App Domain/APIs Used
--------------------

Inventory API - Get list of devices with device info

TemplateProgrammer API - deploy and deploystatus API


How will the APP be Packaged? 
-----------------------------

It will be packaged a mobile app, initially as an apk for android

Prerequisites:
--------------

npm

Cluster with valid (not self-signed) SSL Certificate
(add cluster in cluster.js)

Lab Devices
----------- 
Android or iOS mobile device

Cisco WLC Controller 55xx/35xx/85xx

Cisco APs

Running the App
---------------
See [README-react-native.md](README-react-native.md)

Building the App
----------------
Android: See https://facebook.github.io/react-native/docs/signed-apk-android.html
