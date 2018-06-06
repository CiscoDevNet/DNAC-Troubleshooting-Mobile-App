/*
* Copyright (c) 2018 Cisco and/or its affiliates.
* 
* This software is licensed to you under the terms of the Cisco Sample
* Code License, Version 1.0 (the "License"). You may obtain a copy of the
* License at
* 
*                https://developer.cisco.com/docs/licenses
* 
* All use of the material herein must be in accordance with the terms of
* the License. All rights not expressly granted by the License are
* reserved. Unless required by applicable law or agreed to separately in
* writing, software distributed under the License is distributed on an "AS
* IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express
* or implied.
*/

export default [
  {
    name: "ap-led-disable",
    description: "Disable LED for an AP",
    deviceTypes: [
      {
        productFamily: "Wireless Controller",
        productSeries:"Cisco 5500 Series Wireless LAN Controllers",
        productType:"Cisco 5520 Series Wireless Controllers"
      },
    ],
    softwareType: "Cisco Controller",
    composite: false,
    templateContent: "config ap led-state disable $apname",
    templateParams: [
      {
        parameterName: "apname",
        notParam: false,
        dataType: "STRING",
        defaultValue: "",
        required: true,
        order: 1,
        binding: ""
      }
    ]
  },
  {
    name: "ap-led-start-blink",
    description: "Blink LED an AP for specified duration",
    deviceTypes: [
      {
        productFamily: "Wireless Controller",
        productSeries:"Cisco 5500 Series Wireless LAN Controllers",
        productType:"Cisco 5520 Series Wireless Controllers"
      }
    ],
    softwareType: "Cisco Controller",
    composite: false,
    templateContent: "config ap led-state enable $apname\nconfig ap led-state flash $duration",
    templateParams: [
      {
        parameterName: "apname",
        notParam: false,
        dataType: "STRING",
        defaultValue: "",
        required: true,
        order: 1,
        binding: ""
      },
      {
        parameterName: "duration",
        notParam: false,
        dataType: "STRING",
        defaultValue: "0",
        required: true,
        order: 2,
        binding: ""
      }
    ]
  },
  {
    name: "ap-txpower",
    description: "Change AP transmission power setting",
    deviceTypes: [
      {
        productFamily: "Wireless Controller",
        productSeries:"Cisco 5500 Series Wireless LAN Controllers",
        productType:"Cisco 5520 Series Wireless Controllers"
      }
    ],
    softwareType: "Cisco Controller",
    composite: false,
    templateContent: "config $band disable $apname\nconfig $band txPower ap $apname $txpowerlevel\nconfig $band enable $apname",
    templateParams: [
      {
        parameterName: "band",
        notParam: false,
        dataType: "STRING",
        defaultValue: "",
        required: true,
        order: 1,
        binding: ""
      },
      {
        parameterName: "apname",
        notParam: false,
        dataType: "STRING",
        defaultValue: "",
        required: true,
        order: 1,
        binding: ""
      },
      {
        parameterName: "txpowerlevel",
        notParam: false,
        dataType: "STRING",
        defaultValue: "0",
        required: true,
        order: 2,
        binding:""
      }
    ]
  },
  {
    name: "ap-sensor-mode-enable",
    description: "Enable \"sensor mode\" for an AP, for running tests",
    deviceTypes: [
      {
        productFamily: "Wireless Controller",
        productSeries:"Cisco 5500 Series Wireless LAN Controllers",
        productType:"Cisco 5520 Series Wireless Controllers"
      }
    ],
    softwareType: "Cisco Controller",
    composite: false,
    templateContent: "config ap mode sensor $apname <IQ>y/n<R>y",
    templateParams: [
      {
        parameterName: "apname",
        notParam: false,
        dataType: "STRING",
        defaultValue: "",
        required: true,
        order: 1,
        binding: ""
      }
    ]
  },
  {
    name: "ap-restart",
    description: "Restart the AP",
    deviceTypes: [
      {
        productFamily: "Wireless Controller",
        productSeries:"Cisco 5500 Series Wireless LAN Controllers",
        productType:"Cisco 5520 Series Wireless Controllers"
      }
    ],
    softwareType: "Cisco Controller",
    composite: false,
    templateContent: "config ap reset $apname",
    templateParams: [
      {
        parameterName: "apname",
        notParam: false,
        dataType: "STRING",
        defaultValue: "",
        required: true,
        order: 1,
        binding: ""
      }
    ]
  }
];