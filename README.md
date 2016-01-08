# phpstorm-eap-installer

NodeJS based installer for PhpStorm EAP (for Linux).

## Features
- automatically fetch the latest PhpStorm EAP
- renew the PhpStorm EAP license

## Install
You need NodeJS 4.0 or later and npm (the Node Package Manager).

Clone the project and:
```
cd phpstorm-eap-installer
npm install
```

## Usage
You can execute the script with the node command (`node install.js`) or add a bash command by adding `source _path_to_your_local_copy/phpstorm-eap-installer` in your `~/.bashrc`.

`phpstorm-eap-installer` will install the latest PhpStorm EAP into your home directory, and create a shortcut on your desktop.
`phpstorm-eap-installer --renew` will renew the license.
Run `phpstorm-eap-installer --help` for help.

## Disclaimer
This script aims at simplifying the installation of PhpStorm EAP. You must purchase a license if you plan to use PhpStorm.
