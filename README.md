# OPAL Node-RED

[![Build Status](https://travis-ci.org/parodotdev/orpa-node-red.svg?branch=master)](https://travis-ci.org/parodotdev/orpa-node-red)

## Getting started
Refer to  [orpa-setup](https://github.com/parodotdev/orpa-setup) project for more details.

## Development setup

### Requirements
**node**: v8.9.x LTS  
**npm**: 5.5.1

**Note**: The development should be fine with nodejs versions 6,9 as well. Although, this is not actively tested.
### Setup orpa-node-red
* Create a working directory for OPAL node-red & nodes
```
mkdir <WORKING_DIR>
```
* Execute the below from the working directory
```
cd <WORKING_DIR>
git clone https://github.com/parodotdev/orpa-node-red.git
cd orpa-node-red
npm install
npm run build
# Install any required OPAL nodes as shown in the setup  
# OPAL nodes section before starting the node-red instance
npm run start
```
### Setup OPAL nodes
```
cd <WORKING_DIR>
git clone https://github.com/parodotdev/orpa-nodes.git
```
#### Install the nodes
##### orpa-node-control-flow
```
cd <WORKING_DIR>/orpa-nodes/packages/orpa-node-control-flow
npm link
```
* Assuming that the `orpa-node-red` in the same working directory as `orpa-nodes`
```
cd <WORKING_DIR>/orpa-node-red
npm link @torpadev/orpa-node-control-flow
```
##### orpa-node-database
```
cd <WORKING_DIR>/orpa-nodes/packages/orpa-node-database
npm link
```
* Assuming that the `orpa-node-red` in the same working directory as `orpa-nodes`
```
cd <WORKING_DIR>/orpa-node-red
npm link @torpadev/orpa-node-database
```
##### orpa-node-email
```
cd <WORKING_DIR>/orpa-nodes/packages/orpa-node-email
npm link
```
* Assuming that the `orpa-node-red` in the same working directory as `orpa-nodes`
```
cd <WORKING_DIR>/orpa-node-red
npm link @torpadev/orpa-node-email
```
##### orpa-node-ftp
```
cd <WORKING_DIR>/orpa-nodes/packages/orpa-node-ftp
npm link
```
* Assuming that the `orpa-node-red` in the same working directory as `orpa-nodes`
```
cd <WORKING_DIR>/orpa-node-red
npm link @torpadev/orpa-node-ftp
```
##### orpa-node-msexcel
```
cd <WORKING_DIR>/orpa-nodes/packages/orpa-node-msexcel
npm link
```
* Assuming that the `orpa-node-red` in the same working directory as `orpa-nodes`
```
cd <WORKING_DIR>/orpa-node-red
npm link @torpadev/orpa-node-msexcel
```
##### orpa-node-selenium-webdriver
```
cd <WORKING_DIR>/orpa-nodes/packages/orpa-node-selenium-webdriver
npm link
```
* Assuming that the `orpa-node-red` in the same working directory as `orpa-nodes`
```
cd <WORKING_DIR>/orpa-node-red
npm link @torpadev/orpa-node-selenium-webdriver
```
##### orpa-node-soap
```
cd <WORKING_DIR>/orpa-nodes/packages/orpa-node-soap
npm link
```
* Assuming that the `orpa-node-red` in the same working directory as `orpa-nodes`
```
cd <WORKING_DIR>/orpa-node-red
npm link @torpadev/orpa-node-soap
```
## Developers


## Contributing

## Authors

ORPA-Node-RED is a fork of Node-RED for the OPAL framework

The OPAL Node-RED fork is maintained by Telligro Pte Ltd  
The OPAL Nodes are created and mantained by Telligro Pte Ltd

Node-RED is a project of the [JS Foundation](http://js.foundation).

It was created by [IBM Emerging Technology](https://www.ibm.com/blogs/emerging-technology/).

* Nick O'Leary [@knolleary](http://twitter.com/knolleary)
* Dave Conway-Jones [@ceejay](http://twitter.com/ceejay)

For more details about Node-RED visit [Node_RED](https://www.nodered.org)


## Copyright and license

Copyright Telligro Pte Ltd 2017, licensed under [the GPL v3 license](LICENSE).  
Copyright JS Foundation and other contributors, http://js.foundation under [the Apache 2.0 license](APACHEv2-LICENSE).
