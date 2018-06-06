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

import { fetchWithAuth } from './Auth.js';
import templatesData from './templateData';

// How templateProgrammer is being used:
// We first create a project, a project is just a named collection of templates
// We then add templates to the project, and "commit" each template
// Then we can use the templates, by "deploying" them, with params

const projectName = "map-based-configuration-test-1";

let project = null;
let templates = {};

const jsonHeaders = {
  Accept: 'application/json',
  'Content-Type': 'application/json'
};

// See if there is already a project that suits our needs
const isCorrectProject = project => {
  const knownTemplates = ["ap-txpower", "ap-led-disable", "ap-led-start-blink"/*, "ap-sensor-mode", "ap-restart"*/];
  const projectTemplates = project.templates.map(p => p.name);
  return project.name === projectName &&
    knownTemplates.reduce((p, c) => p && (projectTemplates.indexOf(c) >= 0), true);
}

// This actually polls two different APIs, but uses mostly the same logic
// It polls the task api to get the result of any POST to templateProgrammer other than deploy
// For deploy, there is a special deploy status api it polls
const pollTask = (taskId, isDeployment=false) => new Promise((resolve, reject) => {
  const url = isDeployment ?
    `/api/v1/template-programmer/template/deploy/status/${taskId}` : `/api/v1/task/${taskId}`;
  const _poll = () => fetchWithAuth(url)
    .then(resp => resp.json())
    .then(resp => resp.response || resp)
    .then(resp => {
      if (resp.isError) {
        reject("Task failed");
      } else if (resp.endTime) {
        resolve(resp.data);
      } else {
        setTimeout(_poll, 800);
      }
    });
  _poll();
});

// Just create a project
const createProject = () =>
  fetchWithAuth('/api/v1/template-programmer/project', {
    method: 'POST',
    body: JSON.stringify({
      name: projectName,
      description: "Collection of templates for configuring APs"
    }),
    headers: jsonHeaders
  })
  .then(resp => resp.json())
  .then(resp => resp.response);

// For committing templates.  Since this is an automated process here
// I just hard-coded a message
const commitTemplate = (templateId, comments) =>
  fetchWithAuth('/api/v1/template-programmer/template/version', {
    method: 'POST',
    headers: jsonHeaders,
    body: JSON.stringify({templateId, comments})
  })
  .then(resp => resp.json())
  .then(resp => resp.response)
  .then(resp => pollTask(resp.taskId));

// Create templates
// Return project id so we can chain it and get the project, with all its templates
const createTemplates = (projectId, existingTemplates = []) => Promise.all(
  templatesData.filter(t => existingTemplates.indexOf(t.name) < 0).map(t =>
    fetchWithAuth(`/api/v1/template-programmer/project/${projectId}/template`, {
      method: 'POST',
      body: JSON.stringify(t),
      headers: jsonHeaders
    })
    .then(resp => resp.json())
    .then(resp => resp.response)
    .then(resp => pollTask(resp.taskId))
    .then(id => commitTemplate(id, "Hi"))
)).then(() => projectId);

// Fetch an existing project
// This retrieves template ids, but not commit ids, so we need to use separate API for that.
const getProject = projectId =>
  fetchWithAuth(`/api/v1/template-programmer/project/${projectId}`)
  .then(resp => resp.json());

// This one loads commit ids, for each template
const loadTemplateVersions = projectId =>
  fetchWithAuth('/api/v1/template-programmer/template')
  .then(resp => resp.json())
  .then(allTemplates => allTemplates.filter(t => t.projectId === projectId));

// Load all templates, handle cases where we've already loaded them
const loadTemplates = () => new Promise((resolve, reject) =>
  fetchWithAuth('/api/v1/template-programmer/project')
  .then(resp => resp.json())
  .then(resp => {
    const validProjects = resp.filter(p => isCorrectProject(p));
    if (validProjects.length > 0) {
      console.log("Project already loaded")
      project = validProjects[0];
      loadTemplateVersions(project.id)
      .then(templs => {
        templates = templs.reduce((p, c) => ({...p, [c.name]: c}), {});
        resolve(templs);
      })
      .catch(err => reject(err));
    } else {
      const conflictingProjects = resp.filter(p => p.name === projectName);
      if (conflictingProjects.length > 0) {
        console.log("Using existing project")
        createTemplates(conflictingProjects[0].id, conflictingProjects[0].templates.map(t => t.name))
        .then(projectId => getProject(projectId))
        .then(proj => {
          project = proj;
          return proj;
        })
        .then(proj => loadTemplateVersions(proj.id))
        .then(templs => {
          templates = templs.reduce((p, c) => ({...p, [c.name]: c}), {});
          resolve(templs);
        })
        .catch(err => reject(err));
      } else {
        console.log("Creating new project")
        createProject()
        .then(resp => pollTask(resp.taskId))
        .then(projectId => createTemplates(projectId))
        .then(projectId => getProject(projectId))
        .then(proj => {
          project = proj;
          return proj;
        })
        .then(proj => loadTemplateVersions(proj.id))
        .then(templs => {
          templates = templs.reduce((p, c) => ({...p, [c.name]: c}), {});
          resolve(templs);
        })
        .catch(err => reject(err));
      }
    }
  })
);

// Execute a template
// This also lazily loads/creates templates
const executeTemplate = (ip, templateName, params) => new Promise((resolve, reject) => {
  // Grab the latest commit for the specified template
  const latestVersion = () => templates[templateName].versionsInfo.reduce((p, c) => {
    return parseInt(c.version) > parseInt(p.version) ? c : p;
  }, {version: "-1"});

  const templateBody = () => ({
    templateId: latestVersion().id,
    targetInfo: [
      {
        params,
        type: "MANAGED_DEVICE_IP",
        id: ip,
      }
    ],
    isComposite: false
  });

  if (project != null) {
    fetchWithAuth('/api/v1/template-programmer/template/deploy', {
      method: 'POST',
      headers: jsonHeaders,
      body: JSON.stringify(templateBody())
    })
    .then(resp => resp.json())
    .then(resp => pollTask(resp.deploymentId, true))
    .then(resp => resolve(true))
    .catch(err => resolve(false));
  } else {
    loadTemplates()
    .then(() => {
      fetchWithAuth('/api/v1/template-programmer/template/deploy', {
        method: 'POST',
        headers: jsonHeaders,
        body: JSON.stringify(templateBody())
      })
      .then(resp => resp.json())
      .then(resp => pollTask(resp.deploymentId, true))
      .then(resp => resolve(true));
    })
    .catch(err => resolve(false));
  }
});

export const setAPLED = (ip, apname, duration, enabled) => enabled ?
  executeTemplate(ip, 'ap-led-start-blink', {apname, duration: String(duration)}) :
  executeTemplate(ip, 'ap-led-disable', {apname});
export const setTxPowerLevel = (ip, apname, band, powerlevel) => executeTemplate(ip, 'ap-txpower', {
  apname,
  band,
  txpowerlevel: String(powerlevel)
});

// Not currently used, APs don't reconnect by default so this is a bit dangerous
export const restartAP = (ip, apname) => executeTemplate(ip, 'ap-restart', {apname});