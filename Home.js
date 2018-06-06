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

import React from 'react';
import { StyleSheet, Text, View, Picker, Dimensions, Switch, Slider, ScrollView, Modal, TouchableHighlight } from 'react-native';
import { fetchWithAuth } from "./Auth";
import { setAPLED, setTxPowerLevel } from './Templates';
import APControlPanel from './APControlPanel';

export default class Home extends React.Component {
  constructor() {
    super();

    this.state = {
      loadingDevices: true,
      devices: {}, // Mapping ip address to device
      selectedDevice: null,
      showModal: false,
      settings: {} // Settings per device
    };

    // Our event handlers
    // These won't have the right "this" if we don't bind them here
    this.handleChangeForDevice = this.handleChangeForDevice.bind(this);
    this.handleChangeForSetting = this.handleChangeForSetting.bind(this);
    this.handleChangeForLED = this.handleChangeForLED.bind(this);
    this.handleCloseForModal = this.handleCloseForModal.bind(this);
    this.handleChangeFor24GHz = this.handleChangeFor24GHz.bind(this);
    this.handleChangeFor5GHz = this.handleChangeFor5GHz.bind(this);

    // Get all network devices
    // Filter out devices that aren't APs
    // We store them in an object with the managementIpAddress as the key
    // We then clear the loadingDevices state and store the devices object
    fetchWithAuth('/api/v1/network-device')
    .then(resp => resp.json())
    .then(resp => resp.response)
    .then(resp => resp.filter(i => i.family === "Unified AP" && i.hostname != null))
    .then(resp => resp.reduce((p, c) => ({...p, [c.managementIpAddress]: c}), {}))
    .then(resp => this.setState({
      loadingDevices: false,
      devices: resp
    })).catch(err => console.error("Unable to retrieve device list", err));
  }

  // Catch-all for changing settings
  // setting is the name of the setting we want to change,
  // newValue is its new value
  // getSettingPromise executes the template for that setting and returns the promise for the task
  // startLog displays the initial log for the setting,
  // endLogCb takes a success status and returns the appropriate log, which we then display
  handleChangeForSetting(setting, newValue, getSettingPromise, startLog, endLogCb) {
    const selectedDevice = this.state.selectedDevice;
    // Get all the info we have on the currently selected device
    const attributes = this.state.devices[selectedDevice];
    // Get the name of the ap since the templates all require that
    const apname = (attributes || {}).hostname;

    // Function to update setting
    const updateSettings = settings => this.setState({
      settings: {
        ...this.state.settings,
        [selectedDevice]: {
          ...this.state.settings[selectedDevice],
          ...settings
        }
      }
    });

    // Show the starting log
    updateSettings({log: [...this.state.settings[selectedDevice].log, startLog]});

    // Apply the setting and log the result
    getSettingPromise(attributes.associatedWlcIp, apname)
    .then(success => 
      updateSettings({
        [setting]: newValue,
        log: [...this.state.settings[selectedDevice].log, endLogCb(success)]
      })
    );
  }

  handleChangeForLED(newValue) {
    const startLog = `${newValue ? "Enabling" : "Disabling"} LED...`;
    const endLogCb = success => success ? `LED ${newValue ? "enabled" : "disabled"} (success)` : `Failed to ${newValue ? "enable" : "disable"} LED`;
    const settingPromise = (wlcIp, apname) => setAPLED(wlcIp, apname, 60, newValue);
    this.handleChangeForSetting("LED", newValue, settingPromise, startLog, endLogCb);
  }

  handleChangeFor5GHz(newValue) {
    const startLog = `Setting 5GHz power level to ${newValue}`;
    const endLogCb = success => success ? `5GHz Power level set to ${newValue}` : `Failed to set power level`;
    const settingPromise = (wlcIp, apname) => setTxPowerLevel(wlcIp, apname, '802.11a', newValue);
    this.handleChangeForSetting("power5GHz", newValue, settingPromise, startLog, endLogCb);
  }

  handleChangeFor24GHz(newValue) {
    const startLog = `Setting 2.4GHz power level to ${newValue}`;
    const endLogCb = success => success ? `2.4GHz Power level set to ${newValue}` : `Failed to set power level`;
    const settingPromise = (wlcIp, apname) => setTxPowerLevel(wlcIp, apname, '802.11b', newValue);
    this.handleChangeForSetting("power24GHz", newValue, settingPromise, startLog, endLogCb);
  }

  // Set the currently selected device, set any initial values if we need to
  handleChangeForDevice(newValue) {
    this.setState({
      selectedDevice: newValue,
      showModal: true,
      settings: {
        ...this.state.settings,
        [newValue]: this.state.settings[newValue] || {
          log: [],
          LED: false,
          power24GHz: 1,
          power5GHz: 1
        }
      }
    });
  }

  handleCloseForModal() {
    this.setState({showModal: false});
  }

  render() {
    const fullWidth = Dimensions.get('window').width;

    const selectedDevice = this.state.selectedDevice;
    const deviceSettings = this.state.settings[selectedDevice] || {};

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>DNA Torch</Text>
        </View>
        <View style={styles.body}>
          {this.state.loadingDevices ?
            <Text>Loading devices...</Text> :
            <Picker
              style={{width: fullWidth}}
              selectedValue={this.state.selectedDevice}
              onValueChange={this.handleChangeForDevice}
            >
              {Object.keys(this.state.devices).map(d =>
                <Picker.Item key={d} label={this.state.devices[d].hostname} value={d}/>)
              }
            </Picker>
          }
          <Modal
            onRequestClose={this.handleCloseForModal}
            visible={this.state.showModal}
          >
            <View style={styles.header}>
              <View style={{position: 'absolute', left: 0, paddingLeft: 10}}>
                <TouchableHighlight onPress={this.handleCloseForModal}>
                  <Text style={{color: 'white', fontSize: 24}}>&lt; Back</Text>
                </TouchableHighlight>
              </View>
              <Text style={styles.title}>{this.state.showModal ? this.state.devices[this.state.selectedDevice].hostname : ""}</Text>
            </View>
            <View style={styles.container}>
              {this.state.selectedDevice &&
                <APControlPanel
                  {...deviceSettings}
                  onChangeLED={this.handleChangeForLED}
                  onChange5GHz={this.handleChangeFor5GHz}
                  onChange24GHz={this.handleChangeFor24GHz}
                />
              }
            </View>
          </Modal>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  body: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    maxHeight: 60,
    backgroundColor: "#049fd9"
  },
  title: {
    color: "white",
    fontWeight: "bold",
    fontSize: 28
  }
});
