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

import base64 from 'base-64';
import cluster from './cluster'

let token = "";

// This also stores the token for future calls to fetchWithAuth
// The current auth api uses Basic Auth, so we base-64 encode a
// username:password pair, then pass it in the "Authorization" header
export function doAuth(username, password) {
  return fetch(`${cluster}/api/system/v1/auth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${base64.encode(`${username}:${password}`)}`
      }
    }).then(resp => resp.json()).then(resp => {
      token = resp.Token;
      return token;
    });
}

// We need to call this after getting a session token
// it wraps each request, injecting a header for the session token,
// it passes along all other options and headers untouched
export function fetchWithAuth(urlPath, options={}) {
  return fetch(`${cluster}${urlPath}`, {
    ...options,
    headers: {
      ...(options.headers || {}),
      "X-AUTH-TOKEN": token
    }
  });
}
