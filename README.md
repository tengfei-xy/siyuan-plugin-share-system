# Siyuan Notes’ sharing note-taking tool

[中文](./README_zh_CN.md)

## Note before use

1. [The current version](https://github.com/tengfei-xy/siyuan-plugin-share-system/releases) of this plug-in is a beta version, unstable, and suitable for small scenes. Welcome to add [issues](https://github.com/tengfei-xy/siyuan-plugin-share-system/issues)
2. The public network server currently used is provided by the author, and everyone is welcome to build it by themselves (this way, I don’t have to do it myself hahaha)
3. The link currently has no expiration date, but may be deleted. The linked content will not be deleted when the note is deleted.
4. WeChat contact information: uBpHJlVdn5k15G3dhLh1

## Instructions for use

**scenes to be used**

Currently only sharing links from the computer side is supported. The reason is that there is a `TypeError: fs.readdirSync is not a function. (In 'fs.readdirSync(directoryPath` error on the webpage, but the author cannot solve it for the time being. It is not something that the general webpage cannot do. Export issues.

**Button introduction**

Create button, suitable for first creation and subsequent update pages. An updated page indicates a change in content or theme.

**Cross domain instructions**

Other web pages will be gradually supported after the web page problems are fixed.

**Log description**

When debugging, please adjust the log level to "all levels" in the console.

## Principle

Export the html file and upload it to the web server. The web server also generates the corresponding index.html as the homepage.



## Release Notes

- v0.0.3: which solves the problem of compressed resource files on the Windows client.

- v0.0.2: Fixed the problem that the client could not upload due to cache directory error

- v0.0.1: Has basic functions of creating shares and deleting shares

