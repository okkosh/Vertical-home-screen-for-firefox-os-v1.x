# Firefox OS Vertical Homescreen for v1.x

Prototype of a firefox OS v2.0 Vertical Homescreen for  Firefox OS v1.2, 1.3 and 1.4 Tarako (Low-RAM) Devices.
(Modified version of Gaia Homescreen 2.0 )

![2015-01-26-17-21-10](https://cloud.githubusercontent.com/assets/8279954/5899374/195e2c82-a580-11e4-9135-14bef3f5039d.png)
![2015-01-26-17-21-20](https://cloud.githubusercontent.com/assets/8279954/5899375/1963f32e-a580-11e4-8e91-ee8970d64b05.png)
![2015-01-26-17-21-27](https://cloud.githubusercontent.com/assets/8279954/5899376/196dc5c0-a580-11e4-95b9-bf7aeeb3ab76.png)
![2015-01-26-17-21-33](https://cloud.githubusercontent.com/assets/8279954/5899377/1971b8a6-a580-11e4-9021-6937c8173582.png)
## Installation

Homescreens are certified apps, so you will need to either build FirefoxOS or Install it through App manager/ Web IDE.

Steps For Building :-

1 - Clone this repo branch Tarako-devices into your gaia checkout:

git clone -b tarako-devices https://github.com/ErEXON/Vertical-home-screen-for-firefox-os-v1.x.git apps/my-homescreen

2 - Reset your device to install the homescreen:

PRODUCTION=1 make reset-gaia

3 - Enable it!

Open the Settings app and navigate to Homescreens -> My HomeScreen.


Best Part :-

It is also Removeable from App Permission -> My HomeScreen -> Uninstall.


