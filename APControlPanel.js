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
import { View, Text, Switch, Slider, ScrollView } from 'react-native';

class APControlPanel extends React.Component {
  render() {
    const apControlPanelRowStyle = {flexDirection: "row", alignItems: "center"};
    const apControlPanelLabelStyle = {fontSize: 20, paddingRight: 20};

    return (
      <View>
        <View style={apControlPanelRowStyle}>
          <Text style={apControlPanelLabelStyle}>Enable LED</Text>
          <View>
            <Switch onValueChange={this.props.onChangeLED} value={this.props.LED} />
          </View>
        </View>
        <View style={{...apControlPanelRowStyle, justifyContent: 'space-between'}}>
          <Text style={apControlPanelLabelStyle}>Tx Power 5 GHz</Text>
          <Slider minimumValue={1} maximumValue={8} step={1} value={this.props.power5GHz} style={{width: 200}} onValueChange={this.props.onChange5GHz} />
        </View>
        <View style={{...apControlPanelRowStyle, justifyContent: 'space-between'}}>
          <Text style={apControlPanelLabelStyle}>Tx Power 2.4 GHz</Text>
          <Slider minimumValue={1} maximumValue={8} step={1} value={this.props.power24GHz} style={{width: 200}} onValueChange={this.props.onChange24GHz} />
        </View>
        <Text>Logs</Text>
        <ScrollView contentContainerStyle={{...apControlPanelRowStyle, flexGrow: 1, padding: 20, marginBottom: 40, alignItems: 'flex-start', backgroundColor: '#eed'}}>
          <Text>{this.props.log.join('\n')}</Text>
        </ScrollView>
      </View>
    );
  }
}

export default APControlPanel;