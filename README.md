# Siyuan Notes’ sharing note-taking tool

[中文](./README_zh_CN.md)

# Usage

1. Search for "Share Notes" in the Siyuan Notes Marketplace and install it. Open location: icon in the upper right corner of the software.
2. Open the page you want to share
3. Open the settings page of this plugin and confirm the background address (including the default address)
4. Click the "Create/Update button"

# Note

1. The [current version](https://github.com/tengfei-xy/siyuan-plugin-share-system/releases) of this plugin is a stable version, and everyone is welcome to submit issues
2. The [public network server](https://github.com/tengfei-xy/siyuan-plugin-share-system-engine) currently used is provided by the author, and hands-on partners are welcome to [build it yourself](https://github.com/tengfei-xy/siyuan-plugin-share-system-engine)
3. The link currently has no expiration time, and the content of the link will not be deleted when the note is deleted.
4. When debugging, please adjust the log level to "all levels" in the developer tools/console
5. Plugin v1.3.0 and earlier need to correspond to server version v1.3.2; **Plugin version v2.0 and later need to correspond to server version v2.0. **
6. WeChat: uBpHJlVdn5k15G3dhLh1, QQ: 1765552388

# Principle

Export html files and other resource files and upload them to the server. The server will also generate the corresponding index.htm as the homepage.

# Version description

- **v2.0.0: Support one-click copy address, share page supports access password**
- v1.3.0: Support docker as backend
- v1.2.1: Modify the default page width 500px to 800px
- v1.2.0: Add button, set page width
- v1.1.0: Add button, can generate or retain link when link exists
- v1.0.0: Functional stable version, support real-time saving of setting page parameters, update description document
- v0.0.9: No update (re-upload)
- v0.0.8: No update (re-upload)
- v0.0.7: Modify the timeout of opening settings to obtain connection to 3 seconds
- v0.0.6: Support hiding the version number of the export page
- v0.0.5: Update text description, update button availability or unavailability at different times
- v0.0.4: Support export from browser, log and message prompt optimization
- v0.0.3: Solve the problem of compressing resource files on Windows client
- v0.0.2: Fix the problem of being unable to upload due to cache directory errors on the client
- v0.0.1: Has basic functions of creating and deleting shares