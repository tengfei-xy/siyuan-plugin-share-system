# Siyuan Notes’ sharing note-taking tool

[中文](./README_zh_CN.md)

## Note before use

1. This plug-in [current version] (https://github.com/tengfei-xy/siyuan-plugin-share-system/releases) is a stable version. You are welcome to submit questions.
2. The public network server currently used is provided by the author. Hands-on partners are welcome to build it themselves through [docker](https://github.com/tengfei-xy/siyuan-plugin-share-system-engine)
3. The link currently has no expiration time, and the content of the link will not be deleted when the note is deleted.
4. WeChat: uBpHJlVdn5k15G3dhLh1, QQ: 1765552388

## Instructions for use

**scenes to be used**

Supports exporting from desktop and desktop browsers

**Button introduction**

Create button, suitable for first creation and subsequent update pages. An updated page indicates a change in content or theme.

**Log description**

When debugging, please adjust the log level to "all levels" in the console.

## Principle

Export the html file and upload it to the web server. The web server also generates the corresponding index.html as the homepage.



## Release Notes

- v1.2.1: Modify the default page width of 500px to 800px

- v1.2.0: Add button to set page width

- v1.1.0: Add button that can generate or preserve the link when it exists

- v1.0.0: functional stable version, The settings page supports real-time saving, updated documentation

- v0.0.9: No update (reupload)

- v0.0.8: No update (reupload)

- v0.0.7: Modify the open setting to get the connection timeout to 3 seconds

- v0.0.6: Support hiding the version number of the export page

- v0.0.5: Update text description, update button is available or unavailable at different times

- v0.0.4: Support export from browser, log and message prompt optimization

- v0.0.3: Solve the problem of compressed resource files on Windows client

- v0.0.2: Fixed the problem that the client could not upload due to cache directory error

- v0.0.1: Has basic functions of creating shares and deleting shares