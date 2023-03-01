This is barebones version of https://github.com/fscarmen2/Argo-Xray-JS-PaaS without CF Argo, Nezha and other bells and whistles, as I don't need that. \
Also added SERVICE_URL environment variable for ease of deploying between various services, which have each own variable for external url, and you don't need to remember them.\
You can change UUID, WSPATH and PORT via variables like in original project, but if you just want to deploy and test this, you can leave it like that.

Tested on Glitch and Render so far.
