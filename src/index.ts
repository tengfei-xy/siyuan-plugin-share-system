import {
    Plugin,
    showMessage,
    // Dialog,
    Menu,
    getFrontend,
    Constants,
    ICommandOption,
} from "siyuan";
import "@/index.scss";

import axios from 'axios';
const axios_plus = axios.create({
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});
import { SettingUtils } from "./libs/setting-utils";
import { pushErrMsg, pushMsg } from "./api";

const STORAGE_NAME = "menu-config";

const tmp_dir = "temp/plugin/share-note"
interface Children {
    active: boolean;
    children: Children;
    docIcon: string;
    instance: string;
    pin: boolean;
    title: string;
    action: string;
    blockId: string;
    mode: string;
    notebookId: string;
    rootId: string;
}
interface IConfActivePage {
    children: Children[];
    height: string;
    instance: string;
    width: string;
}
interface exportHtmlData {
    content: string;
    id: string;
    name: string;
}

interface exportHtmlRootObject {
    code: number;
    msg: string;
    data: exportHtmlData;
}
interface IUploadArgsReq {
    appid: string;
    docid: string;
    content: string;
    version: string;
    theme: string;
    title: string;
    hide_version: boolean;
    plugin_version: string;
    exist_link_create: boolean;
    page_wide: string;
    access_key: string;
    access_key_enable: boolean;
}
interface IGetLinkReq {
    appid: string;
    docid: string;
    plugin_version: string
}
interface IAccessKeyReq {
    appid: string;
    docid: string;
    accesskey: string;
    plugin_version: string
}
interface IAppearance {
    mode: number;
    modeOS: boolean;
    darkThemes: string[];
    lightThemes: string[];
    themeDark: string;
    themeLight: string;
    themeVer: string;
    icons: string[];
    icon: string;
    iconVer: string;
    codeBlockThemeLight: string;
    codeBlockThemeDark: string;
    lang: string;
    themeJS: boolean;
    closeButtonBehavior: number;
    hideStatusBar: boolean;
}
interface IConfSystem {
    id: string;
    name: string;
    kernelVersion: string;
    os: string;
    osPlatform: string;
    container: string;
    isMicrosoftStore: boolean;
    isInsider: boolean;
    homeDir: string;
    workspaceDir: string;
    appDir: string;
    confDir: string;
    dataDir: string;
    networkServe: boolean;
    networkProxy: INetworkProxy;
    uploadErrLog: boolean;
    disableGoogleAnalytics: boolean;
    downloadInstallPkg: boolean;
    autoLaunch: boolean;
    lockScreenMode: number;
}
interface INetworkProxy {
    scheme: string;
    host: string;
    port: string;
}
interface Ial {
    id: string;
    title: string;
    type: string;
    updated: string;
}

interface AttrView {
    id: string;
    name: string;
}

interface IgetDocResData {
    id: string;
    rootID: string;
    name: string;
    refCount: number;
    subFileCount: number;
    refIDs: any[];
    ial: Ial;
    icon: string;
    attrViews: AttrView[];
}

interface IgetDocRes {
    code: number;
    msg: string;
    data: IgetDocResData;
}
interface IRes {
    err: number;
    msg: string;
    data: string;
}
interface IFuncData {
    err: boolean,
    data: string,
    fdata?: any
}

export default class PluginSample extends Plugin {

    // private isMobile: boolean;
    private plugin_version: string = "1.3.0";
    settingUtils: SettingUtils;
    async onload() {
        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };
        console.debug("loading plugin-sample", this.i18n);
        // this.commands.
        // const frontEnd = getFrontend();
        // this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        // 在mac 上使用SF symbol生成
        this.addIcons(`<symbol id="iconFace" viewBox="0 0 32 32">
        <g>
        <rect height="37.0645" opacity="0" width="24.623" x="0" y="0"/>
        <path d="M24.2676 15.0664L24.2676 28.7109C24.2676 31.5273 22.832 32.9492 19.9746 32.9492L4.29297 32.9492C1.43555 32.9492 0 31.5273 0 28.7109L0 15.0664C0 12.25 1.43555 10.8281 4.29297 10.8281L8.4082 10.8281L8.4082 13.0293L4.32031 13.0293C2.95312 13.0293 2.20117 13.7676 2.20117 15.1895L2.20117 28.5879C2.20117 30.0098 2.95312 30.748 4.32031 30.748L19.9336 30.748C21.2871 30.748 22.0664 30.0098 22.0664 28.5879L22.0664 15.1895C22.0664 13.7676 21.2871 13.0293 19.9336 13.0293L15.8594 13.0293L15.8594 10.8281L19.9746 10.8281C22.832 10.8281 24.2676 12.25 24.2676 15.0664Z" fill="#000000" fill-opacity="0.85"/>
        <path d="M12.127 22.2441C12.7148 22.2441 13.2207 21.752 13.2207 21.1777L13.2207 7.13672L13.1387 5.08594L14.0547 6.05664L16.1328 8.27148C16.3242 8.49023 16.5977 8.59961 16.8711 8.59961C17.4316 8.59961 17.8691 8.18945 17.8691 7.62891C17.8691 7.3418 17.7461 7.12305 17.541 6.91797L12.9199 2.46094C12.6465 2.1875 12.4141 2.0918 12.127 2.0918C11.8535 2.0918 11.6211 2.1875 11.334 2.46094L6.71289 6.91797C6.50781 7.12305 6.39844 7.3418 6.39844 7.62891C6.39844 8.18945 6.80859 8.59961 7.38281 8.59961C7.64258 8.59961 7.94336 8.49023 8.13477 8.27148L10.1992 6.05664L11.1289 5.08594L11.0469 7.13672L11.0469 21.1777C11.0469 21.752 11.5391 22.2441 12.127 22.2441Z" fill="#000000" fill-opacity="0.85"/>
       </g>
        </symbol>
<symbol id="iconSaving" viewBox="0 0 32 32">
<path d="M224.653061 642.612245c-72.097959 0-130.612245-58.514286-130.612245-130.612245s58.514286-130.612245 130.612245-130.612245 130.612245 58.514286 130.612245 130.612245-58.514286 130.612245-130.612245 130.612245z m0-219.428572c-49.110204 0-88.816327 39.706122-88.816326 88.816327s39.706122 88.816327 88.816326 88.816327 88.816327-39.706122 88.816327-88.816327-40.228571-88.816327-88.816327-88.816327zM580.440816 355.265306c-72.097959 0-130.612245-58.514286-130.612245-130.612245s58.514286-130.612245 130.612245-130.612245 130.612245 58.514286 130.612245 130.612245-59.036735 130.612245-130.612245 130.612245z m0-219.428571c-49.110204 0-88.816327 39.706122-88.816326 88.816326s39.706122 88.816327 88.816326 88.816327 88.816327-39.706122 88.816327-88.816327-40.228571-88.816327-88.816327-88.816326zM799.346939 929.959184c-72.097959 0-130.612245-58.514286-130.612245-130.612245s58.514286-130.612245 130.612245-130.612245 130.612245 58.514286 130.612245 130.612245-58.514286 130.612245-130.612245 130.612245z m0-219.428572c-49.110204 0-88.816327 39.706122-88.816327 88.816327s39.706122 88.816327 88.816327 88.816326 88.816327-39.706122 88.816326-88.816326-39.706122-88.816327-88.816326-88.816327z" fill="#13227a" p-id="4434"></path><path d="M301.453061 454.530612c-6.791837 0-13.583673-3.134694-17.763265-9.404081-6.269388-9.926531-3.657143-22.465306 6.269388-28.734694l201.665306-131.657143c9.926531-6.269388 22.465306-3.657143 28.734694 6.269388s3.657143 22.465306-6.269388 28.734694L312.42449 451.395918c-3.134694 2.089796-7.314286 3.134694-10.971429 3.134694zM699.036735 775.836735c-3.134694 0-6.791837-0.522449-9.404082-2.612245l-376.163265-195.395919c-10.44898-5.22449-14.106122-17.763265-8.881633-28.212244 5.22449-10.44898 17.763265-14.106122 28.212245-8.881633l376.163265 195.395918c10.44898 5.22449 14.106122 17.763265 8.881633 28.212245-3.657143 7.314286-10.971429 11.493878-18.808163 11.493878z" fill="#13227a" p-id="4435"></path><</symbol>`);

        // 添加顶部菜单
        this.addTopBar({
            icon: "iconFace",
            title: this.i18n.topBarTitle,
            position: "right",
            callback: async () => {
                let docid = await this.getActivePage()
                if (!docid) {
                    pushErrMsg("未打开文档页面", 7000)
                    return
                }
                try {
                    await this.getLink()

                } catch (error) {
                    pushErrMsg(error.message, 7000)
                }
                this.openSetting();
            }
        });

        // 当onLayoutReady()执行时，this.settingUtils被载入
        this.settingUtils = new SettingUtils(this, STORAGE_NAME);

        // 输入框-分享地址
        this.settingUtils.addItem({
            key: "share_link",
            value: "",
            type: "textinput",
            title: this.i18n.menu_share_link_title,
            description: "",
        });

        // 按钮-创建分享
        this.settingUtils.addItem({
            key: "create_share",
            value: "",
            type: "button",
            title: this.i18n.menu_create_share_title,
            description: this.i18n.menu_create_share_desc,
            button: {
                label: this.i18n.menu_create_share_label,
                callback: async () => {
                    this.settingUtils.disable("create_share")

                    let g = await this.createLink()
                    if (g.err == false) {
                        this.settingUtils.set("share_link", g.data)
                        this.settingUtils.enable("delete_share",)
                        pushMsg("创建成功", 7000)
                    } else {
                        pushErrMsg(g.data, 7000)
                    }
                    this.settingUtils.enable("create_share")

                }
            }
        });


        // 按钮-删除分享
        this.settingUtils.addItem({
            key: "delete_share",
            value: "",
            type: "button",
            title: this.i18n.menu_delete_share_title,
            description: this.i18n.menu_delete_share_desc,
            button: {
                label: this.i18n.menu_delete_share_label,
                callback: async () => {
                    let g = await this.deleteLink()
                    if (g.err == false) {
                        this.settingUtils.set("share_link", "");
                        pushMsg("删除成功", 7000)
                        this.settingUtils.disable("delete_share")
                        this.settingUtils.disable("access_key_enable")

                    } else {
                        pushErrMsg(g.data, 7000)
                    }

                }
            }
        });

        // 按钮-复制链接
        this.settingUtils.addItem({
            key: "copy_link",
            value: "",
            type: "button",
            title: this.i18n.menu_copy_link_title,
            description: this.i18n.menu_copy_link_desc,
            button: {
                label: this.i18n.menu_copy_link_title,
                callback: async () => {
                    let content = await this.settingUtils.get("share_link")
                    // navigator clipboard 需要https等安全上下文
                    if (navigator.clipboard && window.isSecureContext) {
                        // navigator clipboard 向剪贴板写文本
                        navigator.clipboard.writeText(content);
                    } else {
                        let textArea = document.createElement("textarea");
                        textArea.value = content;
                        // 使text area不在viewport，同时设置不可见
                        textArea.style.position = "absolute";
                        textArea.style.opacity = "0";
                        textArea.style.left = "-999999px";
                        textArea.style.top = "-999999px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand('copy');
                        textArea.remove();

                    }

                }
            }
        });

        // 按钮-复制链接(含标题和访问码)
        this.settingUtils.addItem({
            key: "copy_link_full",
            value: "",
            type: "button",
            title: this.i18n.menu_copy_link_full_title,
            description: this.i18n.menu_copy_link_full_desc,
            button: {
                label: this.i18n.menu_copy_link_full_title,
                callback: async () => {
                    let share_link = await this.settingUtils.get("share_link")
                    let content = await this.settingUtils.get("share_link")
                    let title = await this.getDocTitle( await this.getActivePage())
                    let access_key_enable = await this.settingUtils.get("access_key_enable") as boolean
                    console.log(access_key_enable)
                    if (access_key_enable) {
                        let access_key = await this.settingUtils.get("access_key") as string
                        content=`通过思源笔记分享文档: ${title} 链接: ${share_link} 访问码: ${access_key}`
                    }else{

                        content=`通过思源笔记分享文档: ${title} 链接: ${share_link}`
                    }
                    // navigator clipboard 需要https等安全上下文
                    if (navigator.clipboard && window.isSecureContext) {
                        // navigator clipboard 向剪贴板写文本
                        navigator.clipboard.writeText(content);
                    } else {
                        let textArea = document.createElement("textarea");
                        textArea.value = content;
                        // 使text area不在viewport，同时设置不可见
                        textArea.style.position = "absolute";
                        textArea.style.opacity = "0";
                        textArea.style.left = "-999999px";
                        textArea.style.top = "-999999px";
                        document.body.appendChild(textArea);
                        textArea.focus();
                        textArea.select();
                        document.execCommand('copy');
                        textArea.remove();

                    }

                }
            }
        });
                
        // 按钮-服务器地址
        this.settingUtils.addItem({
            key: "address",
            value: "http://124.223.15.220",
            type: "textinput",
            title: this.i18n.menu_address_title,
            description: this.i18n.menu_address_desc,
            action: {
                callback: async () => {
                    this.settingUtils.takeAndSave("address")
                }
            }
        });

        // 输入框-访问码
        this.settingUtils.addItem({
            key: "access_code",
            value: "",
            type: "textinput",
            title: this.i18n.menu_access_code_title,
            description: this.i18n.menu_access_code_desc,
            action: {
                callback: async () => {
                    this.settingUtils.takeAndSave("access_code")
                }
            }

        });
        // 输入框-访问密码
        this.settingUtils.addItem({
            key: "access_key",
            value: "",
            type: "textinput",
            title: this.i18n.menu_access_key_title,
            description: this.i18n.menu_access_key_desc,
            action: {
                callback: async () => {
                    this.settingUtils.takeAndSave("access_key")
                }
            }

        });

        // 按钮-启动访问密码
        this.settingUtils.addItem({
            key: "access_key_enable",
            value: false,
            type: "checkbox",
            title: this.i18n.menu_access_key_enable_title,
            description: this.i18n.menu_access_key_enable_desc,
            action: {
                callback: async () => {
                    const new_value = !this.settingUtils.get("access_key_enable")
                    if (new_value) {
                        this.settingUtils.enable("access_key")
                    } else {
                        this.settingUtils.disable("access_key")

                    }
                    this.settingUtils.set("access_key_enable", new_value)
                    this.settingUtils.save()
                    if (new_value) {
                        this.access_key_enable()
                    } else {
                        this.access_key_disable()
                    }

                }
            }
        });

        // 复选框-启用浏览器
        this.settingUtils.addItem({
            key: "enable_browser",
            value: false,
            type: "checkbox",
            title: this.i18n.menu_enable_browser_title,
            description: this.i18n.menu_enable_browser_desc,
            action: {
                callback: async () => {
                    const new_value = !this.settingUtils.get("enable_browser")
                    this.settingUtils.set("enable_browser", new_value)
                    this.settingUtils.save()
                }
            }
        });

        // 复选框-重新生成链接
        this.settingUtils.addItem({
            key: "exist_link_create",
            value: false,
            type: "checkbox",
            title: this.i18n.menu_exist_link_create_title,
            description: this.i18n.menu_exist_link_create_desc,
            action: {
                callback: async () => {
                    const new_value = !this.settingUtils.get("exist_link_create")
                    console.debug(new_value)
                    this.settingUtils.set("exist_link_create", new_value)
                    this.settingUtils.save()
                }
            }
        });

        // 输入框-分享地址
        this.settingUtils.addItem({
            key: "page_wide",
            value: "800px",
            type: "textinput",
            title: this.i18n.menu_page_wide_title,
            description: this.i18n.menu_page_wide_desc,
            action: {
                callback: async () => {
                    let page_wide = this.settingUtils.take("page_wide")
                    if (page_wide.endsWith("%")) {
                        let num = parseInt(page_wide)
                        if (num > 100 || num < 0) {
                            pushErrMsg("请输入正确的百分比，如100%或者0%", 8000)
                            this.settingUtils.set("page_wide", "800px")
                            return
                        }

                    } else if (page_wide.endsWith("px")) {
                        let num = parseInt(page_wide)
                        if (num < 0) {
                            pushErrMsg("请输入正确的像素值，如800px", 8000)
                            this.settingUtils.set("page_wide", "800px")
                            return
                        }
                    } else {
                        pushErrMsg("请输入正确的格式，如800px或者100%", 8000)
                        this.settingUtils.set("page_wide", "800px")
                        return
                    }
                    this.settingUtils.save()
                }
            }
        });

        // 复选框-隐藏版本
        this.settingUtils.addItem({
            key: "hide_version",
            value: true,
            type: "checkbox",
            title: this.i18n.menu_hide_version_title,
            description: this.i18n.menu_hide_version_desc,
            action: {
                callback: async () => {
                    const new_value = !this.settingUtils.get("hide_version")
                    this.settingUtils.set("hide_version", new_value)
                    this.settingUtils.save()
                }
            }
        });

        // 提示
        this.settingUtils.addItem({
            key: "Hint",
            value: "",
            type: "hint",
            title: this.i18n.hintTitle,
            description: this.i18n.hintDesc,
        });

        console.debug(this.i18n.helloPlugin);

    }

    onLayoutReady() {
        console.debug("加载插件")
        this.settingUtils.load();
    }

    async onunload() {

        console.debug(this.i18n.byePlugin);
        await this.settingUtils.save();
        showMessage("Goodbye SiYuan Plugin");
        console.debug("onunload");
    }

    uninstall() {
        console.debug("uninstall");
    }
    // openDIYSetting(): void {
    //     let dialog = new Dialog({
    //         title: "SettingPannel",
    //         content: `<div id="SettingPanel" style="height: 100%;"></div>`,
    //         width: "600px",
    //         destroyCallback: (options) => {
    //             console.log("destroyCallback", options);
    //             //You'd better destroy the component when the dialog is closed
    //             pannel.$destroy();
    //         }
    //     });
    //     let pannel = new SettingExample({
    //         target: dialog.element.querySelector("#SettingPanel"),
    //     });
    // }

    async getsystemInfo() {
        // 获取当前页的ID
        const url = "api/system/getConf"

        let data = "{}"
        let config_system: IConfSystem = {
            id: "",
            name: "",
            kernelVersion: "",
            os: "",
            osPlatform: "",
            container: "",
            isMicrosoftStore: false,
            isInsider: false,
            homeDir: "",
            workspaceDir: "",
            appDir: "",
            confDir: "",
            dataDir: "",
            networkServe: false,
            networkProxy: {
                scheme: "",
                host: "",
                port: ""
            },
            uploadErrLog: false,
            disableGoogleAnalytics: false,
            downloadInstallPkg: false,
            autoLaunch: false,
            lockScreenMode: 0
        }

        // 设置handle
        let headers = {}
        const access_code = this.settingUtils.get("access_code")
        headers['Content-Type'] = 'application/json'
        if (access_code != "") {
            headers['Authorization'] = ' Token ' + access_code
        }

        return axios.post(url, data, headers)
            .then(function (response) {
                config_system = response.data.data.conf.system
                return config_system

            })
            .catch(function (error) {

                console.error(error);
                return config_system
            });
    }
    async getSystemID() {
        let system_info = await this.getsystemInfo()
        return system_info.id
    }
    async getDocTitle(id) {
        const url = "api/block/getDocInfo"
        let data = {
            id: id
        }
        let res: IgetDocRes = {
            code: 0,
            msg: "",
            data: {
                id: "",
                rootID: "",
                name: "",
                refCount: 0,
                subFileCount: 0,
                refIDs: [],
                ial: {
                    id: "",
                    title: "",
                    type: "",
                    updated: ""
                },
                icon: "",
                attrViews: []
            }
        }

        // 设置headers
        let headers = {}
        const access_code = this.settingUtils.get("access_code")
        headers['Content-Type'] = 'application/json'
        if (access_code != "") {
            headers['Authorization'] = ' Token ' + access_code
        }


        return axios_plus.post(url, data, headers)
            .then(function (response) {
                res = response.data
                return res.data.name

            })
            .catch(function (error) {
                console.error(error);
                return ""
            });

    }
    async getActivePage() {
        // 获取当前页的ID
        const url = "api/system/getConf"

        let data = "{}"
        let active_page_list: IConfActivePage = {
            children: [],
            height: "",
            instance: "",
            width: ""
        }
        // 设置headers
        let headers = {}
        const access_code = this.settingUtils.get("access_code")
        headers['Content-Type'] = 'application/json'
        if (access_code != "") {
            headers['Authorization'] = ' Token ' + access_code
        }

        return axios_plus.post(url, data, headers)
            .then(function (response) {
                active_page_list = response.data.data.conf.uiLayout.layout.children[0].children[1].children[0]

                for (let i = 0; i < active_page_list.children.length; i++) {
                    if (active_page_list.children[i].active == true) {
                        return active_page_list.children[i].children.blockId
                    }
                }

            })
            .catch(function (error) {

                console.error(error);
                return ""
            });
    }
    async getTheme() {
        const url = "api/system/getConf"

        let data = "{}"
        let res_data: IAppearance = {
            mode: 0,
            modeOS: false,
            darkThemes: [],
            lightThemes: [],
            themeDark: "",
            themeLight: "",
            themeVer: "",
            icons: [],
            icon: "",
            iconVer: "",
            codeBlockThemeLight: "",
            codeBlockThemeDark: "",
            lang: "",
            themeJS: false,
            closeButtonBehavior: 0,
            hideStatusBar: false
        }

        // 设置headers
        let headers = {}
        const access_code = this.settingUtils.get("access_code")
        headers['Content-Type'] = 'application/json'
        if (access_code != "") {
            headers['Authorization'] = ' Token ' + access_code
        }

        return axios_plus.post(url, data, headers)
            .then(function (response) {
                res_data = response.data.data.conf.appearance
                if (res_data.mode == 0) {
                    return res_data.themeLight

                } else {
                    return res_data.themeDark
                }

            })
            .catch(function (error) {
                console.error(error);
                return ""
            });
    }

    // 功能: 导出html
    // 输入: 页面ID
    // 输入: 保存路径
    async exportHtml(id) {
        let savePath = await this.get_temp_dir()

        await this.rmdir_temp_dir()
        await this.mkdir_temp_dir()
        let url = "api/export/exportHTML"
        let data = {
            id: id,
            pdf: false,
            savePath: savePath
        }
        let res_data: exportHtmlRootObject = {
            code: 0,
            msg: "",
            data: {
                content: "",
                id: "",
                name: ""
            }
        }
        // 设置headers
        let headers = {}
        const access_code = this.settingUtils.get("access_code")
        if (access_code == "") {
            headers = {
                'Content-Type': 'application/json'
            };
        } else {
            headers = {
                'Authorization': 'Token ' + access_code,
                'Content-Type': 'application/json'
            };
        }
        return axios_plus.post(url, data, headers)
            .then(function (response) {
                res_data = response.data
                if (res_data.code == 0 && res_data.data.id == id) {
                    console.debug("导出资源文件夹成功")
                    return res_data.data.content
                } else {
                    return ""
                }
            })
            .catch(function (error) {
                console.error(error);
                return ""

            });

    }
    // 功能: 使用思源笔记内部API来压缩资源文件
    // 输出: 取决于API的返回参数
    async exportResource() {
        const export_zip_filename = "resources"

        let g: IFuncData = {
            err: true,
            data: ""
        }

        const data = {
            paths: [tmp_dir],
            name: export_zip_filename
        }
        const headers = {
            'Content-Type': 'application/json'
        }
        await axios.post("/api/export/exportResources", data, { headers })
            .then(function (response) {
                if (response.data.code == 0) {
                    g.err = false
                }
                g.data = response.data.data.path
                console.debug(`导出资源压缩包成功：${g.data}`)
            })
            .catch(function (error) {
                g.data = error.message
            })
        return g
    }

    // 获取绝对路径的缓存地址
    async get_temp_dir() {
        let savePath: string
        let system_info = await this.getsystemInfo()

        // 如果是mac
        if (system_info.os == "darwin") {
            savePath = system_info.workspaceDir + "/" + tmp_dir
        } else if (system_info.os == "windows") {
            savePath = system_info.workspaceDir + "\\" + tmp_dir
        } else {
            savePath = system_info.workspaceDir + "/" + tmp_dir
        }

        return savePath
    }
    async mkdir_temp_dir() {
        let g: IFuncData = {
            err: true,
            data: ""
        }

        const headers = {
            'Content-Type': 'multipart/form-data',
        }
        // 创建文件夹
        const data = {
            path: tmp_dir,
            isDir: "true",
            // 获取当前时间戳
            modTime: new Date().getTime(),
        }
        await axios.post("/api/file/putFile", data, { headers })
            .then(function (response) {
                if (response.data.code == 0) {
                    g.err = false
                }
                g.data = data.path
            })
            .catch(function (error) {
                console.error(`创建缓存目录${error}`)
                g.data = error.message
            })
        return g
    }
    async rmdir_temp_dir() {

        // 创建文件夹
        const data = {
            path: tmp_dir,
        }
        await axios.post("/api/file/removeFile", data)
            .then(function () {
            })
            .catch(function (error) {
                console.error(`删除缓存目录${error}`)
            })
    }
    async getFile(path) {
        let g: IFuncData = {
            err: true,
            data: ""
        }
        const access_code = this.settingUtils.get("access_code")
        let headers = {}
        if (access_code != "") {
            headers = {
                'Accept': 'application/zip',
                'Content-Type': 'application/json',
                'Authorization': 'Token ' + access_code
            }
        } else {
            headers = {
                'Accept': 'application/zip',
                'Content-Type': 'application/json',
            }
        }
        headers = {
            'Accept': 'application/zip',
            'Content-Type': 'application/json',
        }
        // 创建文件夹
        const data = {
            path: path,
        }
        return await axios.post("/api/file/getFile", data, { headers, responseType: 'blob' })
            .then(function (response) {
                g.err = false
                g.fdata = response.data
                return g
            })
            .catch(function (error) {
                console.error("获取文件", error)
                g.data = error.message
                return g

            })
    }
    async uploadFile(serverAddress) {
        let appid = await this.getSystemID()
        let docid = await this.getActivePage()


        let g: IFuncData = {
            err: true,
            data: ""
        }

        let content = await this.exportHtml(docid)
        if (content == "") {
            return
        }
        g = await this.exportResource()
        if (g.err == true) {
            return g
        }

        g = await this.getFile(g.data)
        if (g.err == true) {
            return g
        }
        if (g.fdata == undefined) {
            g.err = true
            g.data = "获取文件失败"
            return g
        }
        const formData = new FormData();
        const blob = new Blob([g.fdata], { type: "application/zip" });
        formData.append('file', blob);

        const enable_browser = this.settingUtils.get("enable_browser")

        let headers = {}
        if (enable_browser) {
            headers = {
                'Content-Type': 'multipart/form-data',
                "cros-status": enable_browser,
            }
        } else {
            headers = {
                'Content-Type': 'multipart/form-data',
            }
        }
        const ft = getFrontend()

        // 发送请求  
        serverAddress = serverAddress + '/api/upload_file' + `?appid=${appid}&docid=${docid}&type=${ft}`

        return await axios.post(serverAddress, formData, { headers, timeout: 300000 })
            .then(function (response) {
                let data: IRes = response.data
                console.debug("上传文件", response.data)
                if (data.err == 0) {
                    g.err = false
                    g.data = content
                    return g
                } else {
                    g.data = data.msg
                    return g
                }
            })
            .catch(function (error) {
                g.err = true
                g.data = error.message
                console.error(error)
                return g
            })
    }


    // 功能: 上传分享文档的参数到分享服务器
    // 返回参数: IFuncData.err 表示请求是否成功
    // 返回参数: IFuncData.data 表示返回链接
    async uploadArgs(server_address: string, content: string) {
        let access_key = this.settingUtils.get("access_key") as string

        let docid = await this.getActivePage()
        let data: IUploadArgsReq = {
            appid: await this.getSystemID(),
            docid: docid,
            content: content,
            version: Constants.SIYUAN_VERSION,
            theme: await this.getTheme(),
            title: await this.getDocTitle(docid),
            hide_version: this.settingUtils.get("hide_version"),
            plugin_version: this.plugin_version,
            exist_link_create: this.settingUtils.get("exist_link_create"),
            page_wide: this.settingUtils.get("page_wide"),
            access_key_enable: this.settingUtils.get("access_key_enable"),
            access_key: access_key.length != 0 ? access_key : "",
        };

        let url = server_address + "/api/upload_args"

        let headers = {}
        const utils = this.settingUtils
        const enable_browser = utils.get("enable_browser")
        if (enable_browser) {
            headers['Content-Type'] = 'application/json'
            headers['cros-status'] = enable_browser
        } else {
            headers['Content-Type'] = 'text/plain'
        }

        let g: IFuncData = {
            err: true,
            data: ""
        }
        return axios.post(url, data, { headers })
            .then(function (response) {
                let data: IRes = response.data
                g.err = false
                g.data = data.data
                console.debug("上传参数", data)
                if (data.err == 0) {
                    utils.enable("copy_link")
                    utils.enable("copy_link_full")
                    return g
                } else {
                    pushErrMsg(data.msg, 7000)
                    return g
                }
            })
            .catch(function (error) {
                console.error(error)
                g.data = error.message
                g.err = true
                return g
            })
    }

    // 功能: 获取分享链接
    // 返回参数: IFuncData.err 表示请求是否成功
    // 返回参数: IFuncData.data 表示返回链接
    async createLink() {
        let g: IFuncData = {
            err: true,
            data: ""
        }
        let server_address = this.settingUtils.get("address");
        g = await this.uploadFile(server_address)
        if (g.err == true) {
            pushErrMsg(g.data, 7000)
            return g
        }
        return await this.uploadArgs(server_address, g.data)
    }

    // 功能: 获取分享链接
    // 返回: IFuncData结构体，包含err和data，
    // 返回参数: err 表示请求是否成功
    // 返回参数: data 表示返回链接
    async getLink() {
        let g: IFuncData = {
            err: true,
            data: ""
        }

        const data: IGetLinkReq = {
            appid: await this.getSystemID(),
            docid: await this.getActivePage(),
            plugin_version: this.plugin_version

        };
        let utils = this.settingUtils
        const url = utils.get("address") + "/api/getlink"

        let headers = {}
        const enable_browser = utils.get("enable_browser")
        if (enable_browser) {
            headers['Content-Type'] = 'application/json'
            headers['cros-status'] = enable_browser
        } else {
            headers['Content-Type'] = 'text/plain'
        }

        utils.enable("create_share")
        utils.disable("delete_share")
        utils.disable("copy_link")
        utils.disable("copy_link_full")

        utils.set("share_link", "")


        let ret = false
        await axios.post(url, data, { headers, timeout: 3000 })
            .then(function (response) {
                let data: IRes = response.data
                switch (data.err) {
                    case 0:
                        g.err = false
                        g.data = data.data
                        utils.enable("delete_share")
                        utils.set("share_link", g.data)
                        utils.enable("copy_link")
                        utils.enable("copy_link_full")

                        ret = true
                        console.log(ret)
                        break
                    case 3:
                        g.err = false
                        ret = true
                        break
                    default:
                        g.err = true
                        pushErrMsg(g.data, 7000)
                        break
                }
                return g

            })
            .catch(function (error) {
                utils.disable("create_share")
                console.error(error)
                g.data = error.message
                return g
            })
        if (!ret) {
            pushErrMsg("后台访问失败")
            console.error("获取链接失败，停止获取访问密钥")
            return
        }
        this.access_key_get()


    }

    // 功能: 删除分享链接
    // 返回: IFuncData结构体，包含err和data，
    // 返回参数: err 表示请求是否成功
    async deleteLink() {
        let g: IFuncData = {
            err: true,
            data: "",
        }


        const data: IGetLinkReq = {
            appid: await this.getSystemID(),
            docid: await this.getActivePage(),
            plugin_version: this.plugin_version

        };
        const utils = this.settingUtils
        const url = utils.get("address") + "/api/deletelink"

        let headers = {}
        const enable_browser = utils.get("enable_browser")
        if (enable_browser) {
            headers['Content-Type'] = 'application/json'
            headers['cros-status'] = enable_browser
        } else {
            headers['Content-Type'] = 'text/plain'
        }

        return axios.post(url, data, { headers })
            .then(function (response) {
                let data: IRes = response.data
                console.debug("删除链接", data)
                if (data.err == 0 || data.err == 3) {
                utils.disable("copy_link")
                utils.disable("copy_link_full")

                utils.disable("access_key")
                utils.set("access_key","")
                utils.set("access_key_enable",false)
                    g.err = false
                } else {
                    g.err = true
                }
                g.data = data.data
                return g

            })
            .catch(function (error) {
                console.error(error)
                g.data = error.message
                return g
            })
    }

    // 功能: 访问密钥的 API
    // 返回: IFuncData结构体，包含err和data，
    // 返回参数: err 表示请求是否成功
    async access_key_enable() {
        let g: IFuncData = {
            err: true,
            data: "",
        }

        const data: IAccessKeyReq = {
            appid: await this.getSystemID(),
            docid: await this.getActivePage(),
            accesskey: this.settingUtils.get("access_key"),
            plugin_version: this.plugin_version

        };
        let utils = this.settingUtils
        const url = utils.get("address") + "/api/key?action=enable"

        let headers = {}
        const enable_browser = utils.get("enable_browser")
        if (enable_browser) {
            headers['Content-Type'] = 'application/json'
            headers['cros-status'] = enable_browser
        } else {
            headers['Content-Type'] = 'text/plain'
        }

        return axios({
            method: "POST",
            url: url,
            data: data,
        }).then(function (response) {
            let data = response.data;

            // 根据你的逻辑处理响应数据
            if (data.err == 0) {
                g.err = false;
                utils.set("access_key", data.data)
                pushMsg("访问密钥已启动")
            } else {
                g.err = true;
            }
            g.data = data.data;

            return g;
        })
            .catch(function (error) {
                console.error(error);
                // 处理错误
                g.data = error.message;
                return g;
            });

    }

    async access_key_disable() {
        let g: IFuncData = {
            err: true,
            data: "",
        }

        const data: IAccessKeyReq = {
            appid: await this.getSystemID(),
            docid: await this.getActivePage(),
            accesskey: "",
            plugin_version: this.plugin_version

        };

        const url = this.settingUtils.get("address") + "/api/key?action=disable"

        let headers = {}
        const enable_browser = this.settingUtils.get("enable_browser")
        if (enable_browser) {
            headers['Content-Type'] = 'application/json'
            headers['cros-status'] = enable_browser
        } else {
            headers['Content-Type'] = 'text/plain'
        }

        return axios({
            method: "POST",
            url: url,
            data: data,
        }).then(function (response) {
            let data = response.data;

            // 根据你的逻辑处理响应数据
            if (data.err == 0 || data.err == 3) {
                g.err = false;
                pushMsg("访问密钥已关闭")

            } else {
                g.err = true;
            }
            g.data = data.data;

            return g;
        })
            .catch(function (error) {
                console.error(error);
                // 处理错误
                g.data = error.message;
                return g;
            });

    }
    async access_key_get() {

        let appid = await this.getSystemID()
        let docid = await this.getActivePage()

        const utils = this.settingUtils
        const url = utils.get("address") + "/api/key?" + "appid=" + appid + "&docid=" + docid

        let headers = {}
        const enable_browser = utils.get("enable_browser")
        if (enable_browser) {
            headers['Content-Type'] = 'application/json'
            headers['cros-status'] = enable_browser
        } else {
            headers['Content-Type'] = 'text/plain'
        }

        axios({
            method: "GET",
            url: url,
        }).then(function (response) {
            let data = response.data;

            if (data.err == 0) {
                let access_key = data.data.access_key
                let access_key_enable: boolean = data.data.access_key_enable
                utils.set("access_key", access_key)
                utils.set("access_key_enable", access_key_enable)
            } else {
                pushErrMsg(data.msg)
            }

        })
            .catch(function (error) {
                console.error(error);
                return;
            });

    }
}
