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
import { StyleSheet, Text, View, Modal, TextInput, Button } from 'react-native';
import { doAuth } from './Auth.js';
import Home from "./Home.js"

// This just switches between a "login" screen and a "home" screen,
// depending on whether or not we have a valid session token
class App extends React.Component {
  constructor() {
    super();

    this.state = {
      authenticated: false,
      username: "",
      password: "",
      token: null,
      error: null
    };
  
    this.handleChangeForUsername = this.handleChangeForUsername.bind(this);
    this.handleChangeForPassword = this.handleChangeForPassword.bind(this);
    this.handleClickForAuthenticate = this.handleClickForAuthenticate.bind(this);
  }

  handleChangeForUsername(username) {
    this.setState({username});
  }

  handleChangeForPassword(password) {
    this.setState({password});
  }

  handleClickForAuthenticate() {
    // Don't allow the user to submit empty username/password
    if (this.state.username.length > 0 && this.state.password.length > 0) {
      // Authenticate, then set authenticated to true so our modal closes
      // and we can see the home screen.
      doAuth(this.state.username, this.state.password)
      .then(token => this.setState({authenticated: true, token}))
      .catch(error => this.setState({error: String(error)}));
    } else {
      this.setState({error: "Username and password are required."});
    }
  }

  render() {
    return (
      <View style={styles.container}>
        <Modal
          visible={!this.state.authenticated}
          onRequestClose={() => {}}
        >
          <View style={{flex: 1}}>
            <TextInput style={{marginTop: 10, padding: 10, fontSize: 22}} onChangeText={this.handleChangeForUsername} value={this.state.username} placeholder="Username" />
            <TextInput style={{marginTop: 10, padding: 10, fontSize: 22}} onChangeText={this.handleChangeForPassword} value={this.state.password} placeholder="Password" secureTextEntry/>
            <Button onPress={this.handleClickForAuthenticate} title="Log In" />
            {this.state.error && <Text style={{color: '#f00'}}>{this.state.error}</Text>}
          </View>
        </Modal>
        {this.state.authenticated && <Home />}
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});


export default App;