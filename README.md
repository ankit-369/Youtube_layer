
# **Youtube Layer**


# Connect with me: 
Feel free to reach out on [Twitter](https://twitter.com/_x_ankit)

## Description
This project serves as a layer between YouTube and the user. It allows editors to upload videos to a server where YouTubers can watch these videos, along with their titles and descriptions. The YouTuber can then upload the video directly to YouTube without needing to download it.


## Installation

1. **Clone the repository:**
   ```bash
   https://github.com/Your_username/Youtube_layer1.git
   cd Youtube_layer1

2. **Set-up:**

  **->**  Copy ( .env.example and example_config.js ) and make .env and config.js file 

  **->** Make project & Create credentials by Oauth Client id in https://console.cloud.google.com/ and copy that

**->** Create **client_secret.json** and paste that credentials it should look like this 
  ```bash
 {
    "installed": {
        "client_id": "",
        "project_id": "",
        "auth_uri": "",
        "token_uri": "",
        "auth_provider_x509_cert_url": "",
        "client_secret": "",
        "redirect_uris": [
            "http://localhost:3000/api/v1/auth/google/callback",
            "http://localhost:5173",
            "http://localhost:3000"
        ],
        "javascript_origins": [
            "http://localhost:3000"
        ]
    }
  }
  ```
**Only the first redirect URL is required; if it doesn't work, try all the URLs.**

3. **Start backend**
  ```bash
    cd backend
    npm install
    node index.js
   ```

4. **Start Front-end**
  ```bash
    cd frontend
    npm install
    npm run dev
