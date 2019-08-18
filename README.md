# Google Assistant API for Liquid-Galaxy

![GitHub stars](https://img.shields.io/github/stars/ivancolomer/Google-Assistant-API-for-liquid-Galaxy.svg?style=social)

----

**GSOC 2019 project**


install:
```bash
cd ~
sudo apt update
sudo apt-get install -y curl git jq wget
curl -sL https://deb.nodesource.com/setup_10.x | sudo -E bash -
git clone https://github.com/ivancolomer/Google-Assistant-API-for-liquid-Galaxy/
wget "https://bin.equinox.io/c/4VmDzA7iaHb/ngrok-stable-linux-amd64.zip"
unzip ngrok-stable-linux-amd64.zip
```


## Use of ngrok for the webhook
```bash
./ngrok authtoken $AUTH_TOKEN
nohup ./ngrok http 8080 &
curl -s http://localhost:4040/api/tunnels | jq -r '.tunnels[0].public_url'
```
Where $AUTH_TOKEN is the token from your ngrok account. The ip address that is printed should be put to your DialogFlow project (in fulfillment).

## Run API
```bash
nohup node ~/Google-Assistant-API-for-liquid-Galaxy/index.js &
```
