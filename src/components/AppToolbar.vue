<template>
    <v-app-bar color="primary" fixed dark app>
        <v-toolbar-title>
            <v-app-bar-nav-icon @click="handleDrawerToggle"></v-app-bar-nav-icon>
        </v-toolbar-title>
        <!-- <v-text-field flat solo prepend-inner-icon="search" label="搜索" clearable class="search"></v-text-field> -->
        <v-spacer></v-spacer>
        <v-toolbar-items>
            <v-btn icon @click="handleFullScreen()">
                <v-icon>fullscreen</v-icon>
            </v-btn>
            <v-menu offset-y origin="center center" class="elelvation-1" :nudge-bottom="14"
                transition="scale-transition">
                <template v-slot:activator="{ on }">
                    <v-btn icon text v-on="on">
                        <v-badge color="red" overlap>
                            <span slot="badge">3</span>
                            <v-icon medium>notifications</v-icon>
                        </v-badge>
                    </v-btn>
                </template>

                <notification-list></notification-list>
            </v-menu>
            <v-menu offset-y origin="center center" :nudge-bottom="10" transition="scale-transition">
                <template v-slot:activator="{ on }">
                    <v-btn icon large text v-on="on">
                        <v-avatar size="30px">
                            <img src="../../static/avatar/man_4.jpg" alt="" />
                        </v-avatar>
                    </v-btn>
                </template>

                <v-list class="pa-0">
                    <v-list-item v-for="(item, index) in items" :to="!item.href ? { name: item.name } : null"
                        :href="item.href" @click="item.click" ripple="ripple" :disabled="item.disabled"
                        :target="item.target" rel="noopener" :key="index">
                        <v-list-item-action v-if="item.icon">
                            <v-icon>{{ item.icon }}</v-icon>
                        </v-list-item-action>
                        <v-list-item-content>
                            <v-list-item-title>{{ item.title }}</v-list-item-title>
                        </v-list-item-content>
                    </v-list-item>
                </v-list>
            </v-menu>
        </v-toolbar-items>
    </v-app-bar>
</template>
<script>
    import NotificationList from "@/components/widgets/list/NotificationList"
    import Util from "@/util"
    export default {
        name: "AppToolbar",
        components: {
            NotificationList
        },
        data() {
            return {
                items: [
                    {
                        icon: "account_circle",
                        href: "#",
                        //title: this.$t('toobar.profile'),
                        title: '个人中心',
                        click: this.handleProfile
                    },
                    {
                        icon: "settings",
                        href: "#",
                        title: '设置',
                        click: this.handleSetting
                    },
                    {
                        icon: "fullscreen_exit",
                        href: "#",
                        title: '登出',
                        click: this.handleLogut
                    }
                ],

            }
        },
        computed: {
            toolbarColor() {
                return this.$vuetify.options.extra.mainNav
            }
        },
        methods: {
            handleDrawerToggle() {
                this.$emit("side-icon-click")
            },
            handleFullScreen() {
                Util.toggleFullScreen()
            },
            handleLogut() {
                //handle logout
                this.$router.push('/logout')
            },
            handleSetting() {

            },
            handleProfile() {

            }
        }
    }
</script>

<style scoped>

</style>