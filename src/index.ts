import {
    Plugin,
    showMessage,
    getFrontend,
    Constants,
} from "siyuan";
import "@/index.scss";
import { Dialog } from 'siyuan';
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
interface PageManagerTableData {
    link: string // 链接
    title: string // 文档名
    docid: string// 思源的页面ID
    access_key: string // 状态码
    access_key_enable: string // 状态码启用

}
class PageManagerHtml {
    tbl_title_name: string
    tbl_title_access_key: string
    btn_copy_link: string
    btn_copy_full_link: string
    btn_delete: string
    data: PageManagerTableData[]

    html: string = ""
    tbody: string

    constructor(ld: string[], g: PageManagerTableData[]) {
        this.tbl_title_name = ld[0]
        this.tbl_title_access_key = ld[1]
        this.btn_copy_link = ld[2]
        this.btn_copy_full_link = ld[3]
        this.btn_delete = ld[4]
        this.data = g;
    }


    createTableHtml() {
        this.tbody = ""
        for (let i = 0; i < this.data.length; i++) {
            this.tbody += `<tr data-idx=${i}>
            <td>${this.data[i].title}</td>
            <td>${this.data[i].access_key}</td>
            </tr>`
        }
    }
    createHtml() {
        this.createTableHtml()

        this.html = `
            <div class="b3-dialog__content" style="width: 600px;height: 500px;">
                <div class="table-container">
                    <table id="dataTable" style="width: 100%;">
                        <thead>
                            <tr>
                                <th>${this.tbl_title_name}</th>
                                <th>${this.tbl_title_access_key}</th>
                            </tr>
                        </thead>
                        <tbody id="tbl_body">
                            ${this.tbody}
                            </tbody>
                    </table>
                </div>
                <div class="btn-group" style="text-align: center;">
                    <button type="button" class="b3-button b3-button--outline b3-button--primary" id="btn_copy_link">${this.btn_copy_link}</button>
                    <button type="button" class="b3-button b3-button--outline b3-button--primary" id="btn_copy_full_link">${this.btn_copy_full_link}</button>
                    <button type="button" class="b3-button b3-button--outline b3-button--primary" id="btn_delete">${this.btn_delete}</button>
                </div>
            </div>
        `;
        return this.html;
    }
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
    mini_menu: boolean;
    title_image_height: string
    custom_css: string
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

const result: string[][] = [
    ["处理完成", "json解析错误", "系统错误", "此页面没有共享", "错误请求地址"],
    ["Processing completed", "json parsing error", "system error", "this page is not shared", "error request address"]
];
export default class PluginSample extends Plugin {

    // private isMobile: boolean;
    private plugin_version: string = "2.0.0";
    settingUtils: SettingUtils;
    private lang: string;



    async onload() {
        const i18n = this.i18n

        this.data[STORAGE_NAME] = { readonlyText: "Readonly" };
        console.debug("loading plugin-sample", this.i18n);
        // this.commands.
        // const frontEnd = getFrontend();
        // this.isMobile = frontEnd === "mobile" || frontEnd === "browser-mobile";

        this.addIcons(`<symbol id="iconFace" viewBox="0 0 1024 1024">
        <g>
<path d="M220.525714 521.508571m-180.845714 0a180.845714 180.845714 0 1 0 361.691429 0 180.845714 180.845714 0 1 0-361.691429 0Z" fill="#333333" p-id="6573"></path><path d="M751.36 883.2m-140.8 0a140.8 140.8 0 1 0 281.6 0 140.8 140.8 0 1 0-281.6 0Z" fill="#333333" p-id="6574"></path><path d="M843.702857 140.8m-140.8 0a140.8 140.8 0 1 0 281.6 0 140.8 140.8 0 1 0-281.6 0Z" fill="#333333" p-id="6575"></path><path d="M282.477714 654.939429l40.228572-69.668572L711.314286 809.618286l-40.228572 69.668571zM293.485714 419.675429L731.666286 166.692571l40.228571 69.668572L333.714286 489.380571z" fill="#333333" p-id="6576"></path>
       </g>
       `);

        // 添加顶部菜单
        this.addTopBar({
            icon: "iconFace",
            title: this.i18n.topBarTitle,
            position: "right",
            callback: async () => {
                let docid = await this.getActivePage()
                if (!docid) {
                    this.pushErrMsgLang(i18n.result_no_open_page)
                    return
                }
                try {
                    await this.getLink()

                } catch (error) {
                    console.error(error)
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
                callback: () => {
                    this.createLink()
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
                    if (g.err) {
                        this.pushErrMsgLang(g.err)
                        return
                    }

                    this.settingUtils.set("access_key", "")
                    this.settingUtils.set("access_key_enable", false)
                    this.settingUtils.set("share_link", "");
                    this.settingUtils.disable("copy_link")
                    this.settingUtils.disable("copy_link_full")
                    this.settingUtils.disable("access_key")
                    this.settingUtils.disable("delete_share")
                    this.settingUtils.disable("access_key_enable")
                    pushMsg(this.i18n.result_delete_ok)

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
                    this.copy_link(content)
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
                    let title = await this.getDocTitle(await this.getActivePage())
                    let access_key_enable = await this.settingUtils.get("access_key_enable") as boolean

                    if (access_key_enable) {
                        let access_key = await this.settingUtils.get("access_key") as string
                        content = `${this.i18n.result_copy_desc_by}: ${title} ${this.i18n.result_copy_desc_link}: ${share_link} ${this.i18n.result_copy_desc_access}: ${access_key}`
                    } else {
                        content = `${this.i18n.result_copy_desc_by} ${title} ${this.i18n.result_copy_desc_link}: ${share_link}`
                    }

                    this.copy_link(content)
                }
            }
        });

        // 按钮-打开分享页面管理
        this.settingUtils.addItem({
            key: "page_manager",
            value: "",
            type: "button",
            title: this.i18n.menu_open_page_manager_title,
            description: this.i18n.menu_open_page_manager_desc,
            button: {
                label: this.i18n.menu_open_page_manager_title,
                callback: async () => {
                    this.pageManager();
                }
            }
        });

        // 输入框-服务器地址
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
            description: this.i18n.menu_access_key_enable_title_desc,
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

        // 输入框-页宽
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
                            pushErrMsg(this.i18n.result_intput_percentage)
                            this.settingUtils.set("page_wide", "800px")
                            return
                        }

                    } else if (page_wide.endsWith("px")) {
                        let num = parseInt(page_wide)
                        if (num < 0) {
                            pushErrMsg(this.i18n.result_intput_pixel)

                            this.settingUtils.set("page_wide", "800px")
                            return
                        }
                    } else {
                        pushErrMsg(this.i18n.result_intput_percentage)
                        this.settingUtils.set("page_wide", "800px")
                        return
                    }
                    this.settingUtils.save()
                }
            }
        });

        // 复选框-导航菜单
        this.settingUtils.addItem({
            key: "mini_menu",
            value: true,
            type: "checkbox",
            title: this.i18n.menu_mini_menu_title,
            description: this.i18n.menu_mini_menu_desc,
            action: {
                callback: async () => {
                    const new_value = !this.settingUtils.get("mini_menu")
                    this.settingUtils.set("mini_menu", new_value)
                    this.settingUtils.save()
                }
            }
        });

        // 文本框-导航菜单
        this.settingUtils.addItem({
            key: "custom_css",
            value: "",
            type: "textarea",
            title: this.i18n.menu_custom_css_title,
            description: this.i18n.menu_custom_css_desc,
            action: {
                callback: async () => {
                    const new_value = this.settingUtils.take("custom_css")
                    this.settingUtils.setAndSave("custom_css", new_value)
                }
            }
        });

        // 输入框-题头图高度
        this.settingUtils.addItem({
            key: "title_image_height",
            value: 30,
            type: "textinput",
            title: this.i18n.menu_title_image_height_title,
            description: this.i18n.menu_title_image_height_desc,
            action: {
                callback: async () => {
                    let value = this.settingUtils.get("title_image_height")
                    if (typeof value === 'string') {
                        value = parseInt(value);
                        if (isNaN(value) || value < 0) {
                            value = 30;
                        }
                    } else if (typeof value === 'number') {
                        if (value < 0) {
                            value = 30;
                        }
                    } else {
                        value = 30;
                    }

                    this.settingUtils.set("title_image_height", value)
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
        this.lang = await this.getlang()

        console.debug(this.i18n.helloPlugin);

    }

    onLayoutReady() {
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
    async getlang() {
        // 获取当前页的ID
        const url = "api/system/getConf"

        let data = "{}"

        // 设置handle
        let headers = {}
        const access_code = this.settingUtils.get("access_code")
        headers['Content-Type'] = 'application/json'
        if (access_code != "") {
            headers['Authorization'] = ' Token ' + access_code
        }

        return axios.post(url, data, headers)
            .then(function (response) {
                return String(response.data.data.conf.lang)
            })
            .catch(function (error) {
                console.error(error);
                return "en_US"
            });
    }
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
        const i18n = this.i18n;
        return axios_plus.post(url, data, headers)
            .then(function (response) {
                res_data = response.data
                if (res_data.code == 0 && res_data.data.id == id) {
                    console.debug(i18n.result_export_resources_ok)
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
        const i18n = this.i18n;

        await axios.post("/api/export/exportResources", data, { headers })
            .then(function (response) {
                if (response.data.code == 0) {
                    g.err = false
                }
                g.data = response.data.data.path
                console.debug(`${i18n.result_export_zip_ok}：${g.data}`)
            })
            .catch(function (error) {
                g.data = error.message
            })
        return g
    }

    async pageManager() {
        let language: string[] = [this.i18n.pm_tbl_title_name, this.i18n.pm_tbl_title_access_key, this.i18n.pm_btn_copy_link, this.i18n.pm_btn_copy_full_link, this.i18n.pm_btn_delete]

        let tableData = await this.getUrlList()
        let pageData = new PageManagerHtml(language, tableData);
        const dialog = new Dialog({
            title: this.i18n.menu_pag_manager_title,
            content: pageData.createHtml(),
        });

        // 数据操作
        const tr = dialog.element.querySelector('#tbl_body');
        tr.addEventListener('click', (e) => {
            // 将 e.target 转换为 Element 类型
            const target = e.target as Element;

            // 获取所有 tr 元素
            const allTrs = tr.querySelectorAll('tr');

            // 清空所有 tr 的背景颜色
            allTrs.forEach(tr => {
                tr.style.backgroundColor = '';
                tr.closest('tr').dataset.selected = undefined;

            });

            // 将点击的 tr 设置为灰色
            target.closest('tr').style.backgroundColor = '#dfdfdf';
            target.closest('tr').dataset.selected = "true";
        });


        // 复制链接
        dialog.element.querySelector('#btn_copy_link').addEventListener('click', () => {
            const selectedRow = document.querySelector('tr[data-selected="true"]');
            if (!selectedRow) {
                pushErrMsg(this.i18n.result_choose)
                return
            }
            let idx = selectedRow.getAttribute("data-idx")
            let content = pageData.data[idx].link;
            this.copy_link(content)

        })
        // 复制完整链接
        dialog.element.querySelector('#btn_copy_full_link').addEventListener('click', () => {
            const selectedRow = document.querySelector('tr[data-selected="true"]');
            if (!selectedRow) {
                pushErrMsg(this.i18n.result_choose)
                return
            }
            let idx = selectedRow.getAttribute("data-idx")
            let share_link = pageData.data[idx].link;
            let title = pageData.data[idx].title;
            let access_key_enable = pageData.data[idx].access_key_enable;
            let content = `${this.i18n.result_copy_desc_by} ${title} ${this.i18n.result_copy_desc_link}: ${share_link}`

            if (access_key_enable) {
                let access_key = pageData.data[idx].access_key;
                content = `${this.i18n.result_copy_desc_by}: ${title} ${this.i18n.result_copy_desc_link}: ${share_link} ${this.i18n.result_copy_desc_access}: ${access_key}`
            }

            this.copy_link(content)

        })
        // 删除
        dialog.element.querySelector('#btn_delete').addEventListener('click', async () => {
            const selectedRow = document.querySelector('tr[data-selected="true"]');
            let idx = selectedRow.getAttribute("data-idx")
            if (!selectedRow) {
                pushErrMsg(this.i18n.result_choose)
                return
            }
            let g = await this.deleteLink(pageData.data[idx].docid)
            if (g.err) {
                this.pushErrMsgLang(g.err)
                return
            }

            pageData.data.splice(Number(idx), 1);
            const parentElement = selectedRow.parentNode;
            parentElement.removeChild(selectedRow);
        })


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
        const i18n = this.i18n;

        await axios.post("/api/file/putFile", data, { headers })
            .then(function (response) {
                if (response.data.code == 0) {
                    g.err = false
                }
                g.data = data.path
            })
            .catch(function (error) {
                console.error(`${i18n.result_create_tmp}:${error}`)
                g.data = error.message
            })
        return g
    }
    async rmdir_temp_dir() {
        const i18n = this.i18n;

        // 创建文件夹
        const data = {
            path: tmp_dir,
        }
        await axios.post("/api/file/removeFile", data)
            .then(function () {
            })
            .catch(function (error) {
                console.error(`${i18n.result_rm_tmp}${error}`)
            })
    }
    async getFile(path) {
        const i18n = this.i18n;

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
                console.error(i18n.result_get_file, error)
                g.data = error.message
                return g

            })
    }
    async uploadFile(serverAddress) {
        let appid = await this.getSystemID()
        let docid = await this.getActivePage()
        const i18n = this.i18n;


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
                console.debug(i18n.result_upload_file, response.data)
                if (data.err == 0) {
                    g.err = false
                    g.data = content
                    return g
                } else {
                    g.data = data.msg
                    g.err = true
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
        const i18n = this.i18n;

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
            mini_menu: this.settingUtils.get("mini_menu"),
            title_image_height: this.settingUtils.get("title_image_height"),
            custom_css: this.settingUtils.take("custom_css"),
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
                console.debug(i18n.result_upload_args, data)
                if (data.err == 0) {
                    utils.enable("copy_link")
                    utils.enable("copy_link_full")
                    return g
                } else {
                    g.err = true
                    g.data = data.data
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
        this.settingUtils.disable("create_share")

        let g: IFuncData = {
            err: true,
            data: ""
        }
        let server_address = this.settingUtils.get("address");
        g = await this.uploadFile(server_address)
        if (g.err == true) {
            this.pushErrMsgLang(g.err)
            return g
        }

        g = await this.uploadArgs(server_address, g.data)

        if (g.err == true) {
            this.pushErrMsgLang(g.err)
            return
        }

        this.settingUtils.set("share_link", g.data)
        this.settingUtils.enable("delete_share",)
        this.settingUtils.enable("create_share")
        this.settingUtils.enable("access_key")
        this.settingUtils.enable("access_key_enable")

        pushMsg(this.i18n.result_create_ok)
        console.log(this.i18n.result_create_ok, "233")

    }

    pushErrMsgLang(seq) {
        switch (this.lang) {
            case "zh_CN":
                pushErrMsg(result[0][seq])
                break
            case "en_US":
                pushErrMsg(result[1][seq])
                break
            default:
                pushErrMsg(result[1][seq])
                break
        }
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
        utils.disable("access_key_enable")
        utils.disable("access_key")



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

                        utils.enable("access_key_enable")
                        utils.enable("access_key")
                        ret = true
                        console.log(ret)
                        break
                    case 3:
                        g.err = false
                        ret = true
                        break
                    default:
                        g.err = true
                        this.pushErrMsgLang(g.err)
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
            pushErrMsg(this.i18n.result_system_access_failed)
            return
        }
        this.access_key_get()


    }

    // 功能: 删除分享链接
    // 返回: IFuncData结构体，包含err和data，
    // 返回参数: err 表示请求是否成功
    async deleteLink(docid?: string) {
        const i18n = this.i18n;
        let g: IFuncData = {
            err: true,
            data: "",
        }

        docid = docid ?? await this.getActivePage()

        const data: IGetLinkReq = {
            appid: await this.getSystemID(),
            docid: docid,
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
                console.debug(i18n.result_delete_link, data)
                if (data.err == 0 || data.err == 3) {
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
        const i18n = this.i18n
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
                pushMsg(i18n.result_access_key_startup)

            } else {
                g.err = true;
            }
            g.data = data.data;

            return g;
        }.bind(this))
            .catch(function (error) {
                console.error(error);
                // 处理错误
                g.data = error.message;
                return g;
            });

    }

    async access_key_disable() {
        const i18n = this.i18n

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
                pushMsg(i18n.result_access_key_disable)

            } else {
                g.err = true;
            }
            g.data = data.data;

            return g;
        }.bind(this))
            .catch(function (error) {
                console.error(error);
                // 处理错误
                g.data = error.message;
                return g;
            });

    }
    async access_key_get() {
        const utils = this.settingUtils

        utils.set("access_key_enable", false)
        utils.set("access_key", "")

        let appid = await this.getSystemID()
        let docid = await this.getActivePage()

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
    copy_link(content: string) {
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
    async getUrlList() {
        let appid = await this.getSystemID();
        let server_address = this.settingUtils.get("address");
        const url = server_address + "/api/getlinkall?appid=" + appid

        let headers = {}
        const utils = this.settingUtils
        const enable_browser = utils.get("enable_browser")
        if (enable_browser) {
            headers['Content-Type'] = 'application/json'
            headers['cros-status'] = enable_browser
        } else {
            headers['Content-Type'] = 'text/plain'
        }

        let ret: PageManagerTableData[]
        ret = await axios.get(url, { headers })
            .then(function (response) {
                let data: PageManagerTableData[] = response.data.data
                return data
            })
            .catch(function (error) {
                console.error(error)
                pushErrMsg(error)
                return ret
            })

        return ret
    }
}