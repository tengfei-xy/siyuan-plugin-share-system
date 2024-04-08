<script lang="ts">
    import Panel from "./panel.svelte";
    // 设置面板的左侧选项
    let groups: string[] = ["活动页"];
    let focusGroup = groups[0];

    const Items: ISettingItem[] = [
        {
            key: "share_link",
            value: "",
            type: "textinput",
            title: "分享链接",
            description: "",
        },
        {
            key: "create_share",
            value: "上传",
            type: "button",
            // title: this.i18n.menu_create_share_title,
            title: "创建/更新链接",
            description: "description",
            // description: this.i18n.menu_create_share_desc,
                // label: this.i18n.menu_create_share_label,
        
            button: {
                label: "ff",
                callback: async () => {
                }
            }
        }
        
        
    ];

    /********** Events **********/
    interface ChangeEvent {
        group: string;
        key: string;
        value: any;
    }

    const onChanged = ({ detail }: CustomEvent<ChangeEvent>) => {
        if (detail.group === groups[0]) {
            // setting.set(detail.key, detail.value);
        }
    };
</script>

<div class="fn__flex-1 fn__flex config__panel">
    <ul class="b3-tab-bar b3-list b3-list--background">
        {#each groups as group}
            <li
                data-name="editor"
                class:b3-list-item--focus={group === focusGroup}
                class="b3-list-item"
                on:click={() => {
                    focusGroup = group;
                }}
                on:keydown={() => {}}
            >
                <span class="b3-list-item__text">{group}</span>
            </li>
        {/each}
    </ul>
    <div class="config__tab-wrap">
        <Panel
            group={groups[0]}
            {Items}
            display={focusGroup === groups[0]}
            on:changed={onChanged}
        ></Panel>
    </div>
</div>

<style lang="scss">
    .config__panel {
        height: 100%;
    }
    .config__panel > ul > li {
        padding-left: 1rem;
    }
</style>
