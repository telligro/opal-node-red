# OPAL Node-RED

[![Build Status](https://travis-ci.org/telligro/orpa-node-red.svg?branch=master)](https://travis-ci.org/telligro/orpa-node-red) [![npm (scoped)](https://img.shields.io/npm/v/@torpadev/orpa-node-red.svg)](https://www.npmjs.com/package/@torpadev/orpa-node-red)

## Getting started
This readme is for setting up the development environment.
Refer to  [orpa-setup](https://github.com/telligro/orpa-setup) project for getting started instructions.

## Development setup

### Requirements
**node**: v8.9.x LTS  
**npm**: 5.5.1
**Git**: 1.8+

**Notes**: 
The current release requires Git to be available on your environment path. Please refer to the Git Setup section.
The development should be fine with nodejs versions 6,9 as well. Although, this is not actively tested.
#### Git Setup

For instructioons on setting up git on (Windows/Linux/Mac OSX) refer to link below    
[Installing Git](https://git-scm.com/book/en/v2/Getting-Started-Installing-Git)

On Windows, you can use a portable version of git available from
https://git-scm.com/download/win  
If portable git used ensure that git.exe is available on your path.

### Setup orpa-node-red
* Create a working directory for OPAL node-red & nodes
```sh
mkdir <WORKING_DIR>
```
* Execute the below from the working directory
```sh
cd <WORKING_DIR>
git clone https://github.com/telligro/orpa-node-red.git
cd orpa-node-red
npm install
npm run build
# Install any required OPAL nodes as shown in the setup  
# OPAL nodes section before starting the node-red instance
npm run start
```
### Setup OPAL nodes
```sh
cd <WORKING_DIR>
git clone https://github.com/telligro/orpa-nodes.git
```
#### Install the nodes
##### Generic Node Installation
```sh
cd <WORKING_DIR>/orpa-nodes/packages/<NODE_NAME>
npm link
```
* Assuming that the `orpa-node-red` in the same working directory as `orpa-nodes`
```sh
cd <WORKING_DIR>/orpa-node-red
npm link @torpadev/<NODE_NAME>
```
The following nodes are available for OPAL
* [orpa-node-control-flow](https://github.com/telligro/orpa-nodes/tree/master/packages/orpa-node-control-flow)
* [orpa-node-database](https://github.com/telligro/orpa-nodes/tree/master/packages/orpa-node-database)
* [orpa-node-email](https://github.com/telligro/orpa-nodes/tree/master/packages/orpa-node-email)
* [orpa-node-ftp](https://github.com/telligro/orpa-nodes/tree/master/packages/orpa-node-ftp)
* [orpa-node-msexcel](https://github.com/telligro/orpa-nodes/tree/master/packages/orpa-node-msexcel)
* [orpa-node-selenium-webdriver](https://github.com/telligro/orpa-nodes/tree/master/packages/orpa-node-control-flow)
* [orpa-node-soap](https://github.com/telligro/orpa-nodes/tree/master/packages/orpa-node-control-flow)
## Contributing
Contact support@telligro.com
## Authors

ORPA-Node-RED is a fork of Node-RED for the [OPAL Framework](https://www.telligro.com)

The OPAL Node-RED fork is maintained by [Telligro Pte Ltd](https://www.telligro.com)  
The OPAL Nodes are created and mantained by [Telligro Pte Ltd](https://www.telligro.com)

Node-RED is a project of the [JS Foundation](http://js.foundation).

It was created by [IBM Emerging Technology](https://www.ibm.com/blogs/emerging-technology/).

* Nick O'Leary [@knolleary](http://twitter.com/knolleary)
* Dave Conway-Jones [@ceejay](http://twitter.com/ceejay)

For more details about Node-RED visit [Node_RED](https://www.nodered.org)


## Copyright and license

Copyright Telligro Pte Ltd 2017, licensed under [the GPL v3 license](LICENSE).  
Copyright JS Foundation and other contributors, http://js.foundation under [the Apache 2.0 license](APACHEv2-LICENSE).
