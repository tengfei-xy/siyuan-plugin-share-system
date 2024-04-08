<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import Item from "./item.svelte";

    export let group: string;
    export let Items: ISettingItem[];
    export let display: boolean = true;

    const dispatch = createEventDispatcher();

    function onClick( {detail}) {
        dispatch("click", { key: detail.key });
    }
    function onChanged( {detail}) {
        dispatch("changed", {group: group, ...detail});
    }

    $: fn__none = display ? "" : "fn__none";

</script>

<div class="config__tab-container {fn__none}" data-name={group}>
    <slot />
    {#each Items as item (item.key)}
        <Item
            type={item.type}
            title={item.title}
            description={item.description}
            settingKey={item.key}
            settingValue={item.value}
            placeholder={item?.placeholder}
            options={item?.options}
            slider={item?.slider}
            callback={item?.button?.callback}
            
            on:click={onClick}
            on:changed={onChanged}
            
        />
    {/each}
</div>