# Google Assistant API for Liquid-Galaxy

![npm](https://img.shields.io/npm/dm/google-assistant-api-for-liquid-galaxy.svg)
![NPM](https://img.shields.io/npm/l/google-assistant-api-for-liquid-galaxy.svg)
![GitHub stars](https://img.shields.io/github/stars/xemyst/Google-Assistant-API-for-liquid-Galaxy.svg?style=social)

----

**GSOC 2019 project**


install:
> npm i google-assistant-api-for-liquid-galaxy

Dependences:
1. DialogFlow
1. NodeJS


## Use of ngrok for the webhook


```bash


sudo apt install -y jq wget

wget "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip"
unzip ngrok-stable-linux-amd64.zip
./ngrok authtoken $AUTH_TOKEN
nohup ./ngrok http 8080 &
curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'
```
