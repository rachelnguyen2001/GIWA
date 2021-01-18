# GIWA
A Google Drive integrated web app

## Setup
### Google authorization for login
1. Go to [Credentials page](https://console.developers.google.com/apis/credentials)
2. Click `Create Credentials` &rightarrow; `Create OAuth client ID`
3. Select `Web application` in `Application type`
4. Add name of the web application (i.e. `GIWA`) in `Name`
5. Add `http://localhost:8080` in `Authorized Javascript origins`
6. Add `http://localhost:8080` in `Authorized redirect URIs`
7. Click `Create` and save the `Client ID` and `Client secret` for future access
