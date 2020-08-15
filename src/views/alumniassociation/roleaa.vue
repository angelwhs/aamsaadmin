<template>
    <div id="pageRole" class="page-wrapper">
        <v-container grid-list-xl fluid>
            <!--查询条件-->
            <div>
                <v-card class="mx-auto">
                    <v-row class="mx-auto ">
                        <v-col cols="12" md="10" class="d-flex justify-center align-center">
                            <v-text-field class="subtitle-2 ml-4" v-model="searchModel.searchName" label="搜索条件">
                            </v-text-field>
                        </v-col>
                        <v-col cols="12" md="2" class="d-flex justify-center align-center">
                            <v-btn class="align-center" @click="search(0)">搜索</v-btn>
                        </v-col>
                    </v-row>
                </v-card>
            </div>

            <!--查询结果-->
            <div class="my-auto">
                <div class="mx-auto mt-4">
                    <!--标题-->
                    <v-toolbar flat color="white">
                        <v-toolbar-title>查询结果</v-toolbar-title>
                        <v-divider class="mx-4" inset vertical></v-divider>
                        <v-btn color="primary" dark class="mb-2" @click="openCreate">新建</v-btn>
                        <v-spacer></v-spacer>
                    </v-toolbar>

                    <!--结果表格-->
                    <div class="mt-4" id="searchResultTable">
                        <v-simple-table fixed-header class="pl-4 pr-4">
                            <thead>
                                <tr>
                                    <th class="text-left">Id</th>
                                    <th class="text-left">标题</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ item.Title }}</td>
                                        <td>
                                            <v-icon size="20" v-if="!item.Enable" @click="confirmSetEnable(item)"
                                                color="red lighten-2">
                                                mdi-cancel
                                            </v-icon>
                                            <v-icon size="20" v-else @click="confirmSetEnable(item)"
                                                color="green lighten-2">
                                                mdi-checkbox-marked-circle
                                            </v-icon>
                                        </td>
                                        <td>
                                            <v-icon size="20" class="mr-4" @click="openEdit(item)">edit</v-icon>
                                            <v-icon size="20" color="deep-orange" @click="confirmDelete(item)">
                                                mdi-delete-forever</v-icon>
                                            <v-btn small outlined text color="primary" class="ml-4"
                                                @click="getRoleItemModules(item)" :loading="getModulesLoading"
                                                :disabled="getModulesLoading">
                                                设置功能
                                            </v-btn>
                                        </td>
                                    </tr>
                                </template>
                            </tbody>
                        </v-simple-table>
                    </div>

                    <!--分页控件-->
                    <div class="pa-4">
                        <v-pagination v-model="pageSetting.page" :circle="pageSetting.circle"
                            :disabled="pageSetting.disabled" :length="pageSetting.length"
                            :next-icon="pageSetting.nextIcon" :prev-icon="pageSetting.prevIcon" :page="pageSetting.page"
                            :total-visible="pageSetting.totalVisible" v-on:input="search(pageSetting.page - 1)"
                            v-on:previous="search(pageSetting.page - 1)" v-on:Value="search(pageSetting.page - 1)">
                        </v-pagination>
                    </div>
                </div>
            </div>

            <!--创建/更新-->
            <v-dialog v-model="editDialog.isShow" max-width="500px" persistent :disabled="saveRoleLoading">
                <v-card ref="form">
                    <v-card-title>
                        <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span><span>角色</span>
                    </v-card-title>

                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-text-field v-model="updateItem.Title" label="标题"
                                    :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                    ref="Title">
                                </v-text-field>
                            </v-row>
                            <v-row>
                                <v-text-field v-model="updateItem.Name" label="名称"
                                    :rules="[() => !!updateItem.Name || '不能为空.']" :error-messages="errorMessages"
                                    ref="Name">
                                </v-text-field>
                            </v-row>
                            <v-row>
                                <v-text-field v-model="updateItem.Sort" label="序号" ref="Sort"
                                    :error-messages="errorMessages" :rules="[() => !!updateItem.Sort || '不能为空.']">
                                </v-text-field>
                            </v-row>
                            <v-row>
                                <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                            </v-row>
                            <v-row>

                            </v-row>
                        </v-container>
                    </v-card-text>

                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="blue darken-1" text @click="closeEdit" :disabled="saveRoleLoading">取消
                        </v-btn>
                        <v-btn color="primary" @click="saveEdit" :loading="saveRoleLoading" :disabled="saveRoleLoading">
                            保存</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!--分配模块-->
            <v-dialog v-model="setModuleDialog.isShow" fullscreen hide-overlay transition="dialog-bottom-transition">
                <v-card>
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="setModuleDialog.isShow = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title>设置菜单</v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveModules">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>
                    <v-card-title>
                        <span class="title">当前角色：</span>
                        <span v-if="updateItem && updateItem.Id > 0">{{updateItem.Title}}</span>
                    </v-card-title>

                    <v-divider class="ml-5 mr-5"></v-divider>

                    <template v-if="updateItem.Modules && updateItem.Modules.length > 0">
                        <div class="ma-5">
                            <el-tree ref="moduletree" show-checkbox node-key="Id" :props="defaultProps"
                                :data="updateItem.Modules" >
                                <!-- <span class="custom-tree-node" slot-scope="{ node, data }">
                                    <span class="body-2">{{ node.label }}</span>
                                    <span>
                                        <template v-if="data.Childs && data.Childs.length > 0">
                                            <div class="d-flex flex-row-reverse">
                                                <template v-for="subitem in data.Childs">
                                                    <v-checkbox dense class="caption mr-4 mt-6"
                                                        v-model="subitem.IsSelected" error-count="0">
                                                        <template v-slot:label>
                                                            <span class="caption">
                                                                {{subitem.Title}}
                                                            </span>
                                                        </template>
                                                    </v-checkbox>
                                                </template>
                                            </div>
                                        </template>
                                    </span>
                                </span> -->
                            </el-tree>
                        </div>
                    </template>
                    <template v-else>
                        <v-card-text>
                            <v-alert dense outlined type="error">
                                请先添加菜单
                            </v-alert>
                        </v-card-text>
                    </template>
                </v-card>
            </v-dialog>            

            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">名称：{{updateItem.Name}}</p>
                        <p class="mb-1">标题：{{updateItem.Title}}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="deleteDialog = false">取消</v-btn>
                        <v-btn color="primary" @click="saveDelete()">确定</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!--禁用启用-->
            <v-dialog v-model="setEnableDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline">提示</v-card-title>
                    <v-card-text>
                        <p v-if="updateItem.Enable" class="mb-1 subtitle-1 font-weight-bold">是否禁用该项目?</p>
                        <p v-else class="mb-1 subtitle-1 font-weight-bold">是否启用该项目?</p>
                        <p class="mb-1">名称：{{updateItem.Name}}</p>
                        <p class="mb-1">标题：{{updateItem.Title}}</p>
                    </v-card-text>
                    <v-card-actions>
                        <v-spacer></v-spacer>
                        <v-btn color="primary" text @click="setEnableDialog = false">取消</v-btn>
                        <v-btn color="primary" @click="saveSetEnable()">确定</v-btn>
                    </v-card-actions>
                </v-card>
            </v-dialog>

            <!--loading-->
            <v-dialog v-model="loadingDialog.isShow" hide-overlay persistent width="300">
                <v-card color="primary pa-3" dark>
                    <v-card-text>
                        <div class="subtitle-1 mb-3">
                            {{loadingDialog.message}}
                        </div>
                        <v-progress-linear indeterminate color="white" class="mb-0"></v-progress-linear>
                    </v-card-text>
                </v-card>
            </v-dialog>

        </v-container>
    </div>
</template>

<script>
    export default {
        data: () => ({
            searchModel: {
                searchName: '',
            },

            searchResult: {
                totalCount: 2,
                pageSize: 10,
                list: [],
            },

            pageSetting: {
                circle: false,
                disabled: false,
                length: 1, //总共有几页
                nextIcon: 'mdi-menu-right',
                nextIcons: ['mdi-chevron-right', 'mdi-arrow-right', 'mdi-menu-right'],
                prevIcon: 'mdi-menu-left',
                prevIcons: ['mdi-chevron-left', 'mdi-arrow-left', 'mdi-menu-left'],
                page: 1, //当前页面
                totalVisible: 10, //最多显示几页按钮
            },

            editDialog: {
                isShow: false,
            },

            setModuleDialog: {
                isShow: false,
            },

            saveRoleDialog: {
                isShow: false,
            },

            saveModulesDialog: {
                isShow: false,
            },

            updateItem: {
                Id: 0,
                Name: '',
                Title: '',
                Enable: true,
                Sort: 1,
                Modules: null,
                item: null,
            },

            getModulesLoading: false,
            saveRoleLoading: false,
            formHasErrors: false,
            errorMessages: '',

            loadingDialog: {
                isShow: false,
                message: '数据加载中,请稍后...',
            },

            deleteDialog: false,
            setEnableDialog: false,
            setAPIListDialog: false,
            defaultProps: {
                children: 'Childs',
                label: 'Title'
            },
            isInitTree: false,
        }),

        created() {
            this.search(0);
        },

        computed: {
            //获取模块中已经被选择的Id
            getSelectedItem: function (modules) {
                let selectedItems = new Array();

                this.getSelectedItemFromModules(selectedItems, this.updateItem.Modules)

                return selectedItems;
            },

            form() {
                return {
                    Name: this.updateItem.Name,
                    Title: this.updateItem.Title,
                    Sort: this.updateItem.Sort,
                }
            },
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.searchResult.list = [];

                this.getAxios('/api/aa/backend/roleaa/list', {
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchResult.pageSize,
                }).then((data) => {
                    //console.log(data);
                    if (data.errorcode === 0 && data.result) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchResult.totalCount = data.result.TotalCount;

                        this.searchResult.list = data.result.Data;
                    }
                    this.loadingDialog.isShow = false;

                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                });
            },

            prepareUpdateItem: function (item) {
                this.updateItem.Id = item.Id;
                this.updateItem.Name = item.Name;
                this.updateItem.Title = item.Title;
                this.updateItem.Enable = item.Enable;
                this.updateItem.Sort = item.Sort;
                this.updateItem.Modules = null;
                this.updateItem.item = item;
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Title = '';
                this.updateItem.Enable = true;
                this.updateItem.Sort = 1;
                this.updateItem.Modules = null;
                this.updateItem.item = null;

                this.editDialog.isShow = true;
            },

            openEdit: function (item) {
                this.prepareUpdateItem(item);

                this.editDialog.isShow = true;
            },

            closeEdit: function () {
                this.editDialog.isShow = false;
            },

            saveEdit: function () {
                //验证数据
                this.formHasErrors = false;
                Object.keys(this.form).forEach(f => {
                    if (!this.form[f]) this.formHasErrors = true
                    this.$refs[f].validate(true)
                });

                if (this.formHasErrors)
                    return;

                this.saveRoleLoading = true;

                if (this.updateItem.Id === 0) {
                    //创建
                    this.postAxios('/api/aa/backend/roleaa/Create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {

                            this.$toast.success('创建角色成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });

                            this.saveRoleLoading = false;
                            this.editDialog.isShow = false;

                            this.search(0);
                        } else {
                            this.saveRoleLoading = false;
                        }
                    }).catch((error) => {
                        this.saveRoleLoading = false;
                    });
                } else if (this.updateItem.Id > 0) {
                    //更新
                    this.postAxios('/api/aa/backend/roleaa/Edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.$toast.success('更新角色成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });

                            this.saveRoleLoading = false;
                            this.editDialog.isShow = false;

                            this.search(0);
                        } else {
                            this.saveRoleLoading = false;
                        }
                    }).catch((error) => {
                        this.saveRoleLoading = false;
                    });
                } else {
                    this.saveRoleLoading = false;
                }



            },

            openModules: function () {
                this.setModuleDialog.isShow = true;
            },

            closeModules: function () {
                this.setModuleDialog.isShow = false;
            },

            getRoleItemModules: function (item) {
                this.getModulesLoading = true;
                this.prepareUpdateItem(item);

                this.getAxios('/api/aa/backend/roleaa/GetRoleModules', {
                    id: item.Id,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.isInitTree = true;
                        this.updateItem.Modules = data.result.Data;
                        //console.log(data.result);
                        this.getModulesLoading = false;

                        setTimeout(() => {
                            this.getSelectedItem.forEach((currentValue) => {
                                //console.log(currentValue);
                                if (currentValue.Childs && currentValue.Childs.length > 0) {

                                }
                                else {
                                    this.$refs.moduletree.setChecked(currentValue, currentValue.IsSelected, false);
                                }
                            });
                            //this.$refs.moduletree.setCheckedKeys(this.getSelectedItem, true);
                        }, 200);

                        this.openModules();
                        setTimeout(() => { this.isInitTree = false; }, 300);
                    }
                    else {
                        this.getModulesLoading = false;
                    }
                }).catch((error) => {
                    this.getModulesLoading = false;
                });
            },

            saveModules: function () {
                this.loadingDialog.message = '数据提交中...';
                this.loadingDialog.isShow = true;
                let arr = this.$refs.moduletree.getCheckedNodes(false, true);
                //console.log(arr);

                this.postAxios('/api/aa/backend/roleaa/SaveRoleModules?id=' + this.updateItem.Id, JSON.stringify(arr)).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.$toast.success('保存成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                        this.setModuleDialog.isShow = false;
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.success('保存失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error('保存失败,请重新提交.</br>' + error.message, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                });

                //this.setModuleDialog.isShow = false;
            },

            confirmDelete: function (item) {
                this.prepareUpdateItem(item);
                this.deleteDialog = true;
            },

            saveDelete: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.getAxios('/api/aa/backend/roleaa/delete', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.deleteDialog = false;
                        this.$toast.success('删除成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('删除失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error('删除失败,请重新提交.</br>' + error.message, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                });
            },

            confirmSetEnable: function (item) {
                this.prepareUpdateItem(item);
                this.setEnableDialog = true;
            },

            saveSetEnable: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.getAxios('/api/aa/backend/roleaa/setenable', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.setEnableDialog = false;
                        this.$toast.success(this.updateItem.Enable ? '禁用成功.' : '启用成功', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + data.errormsg : '启用失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + error.message : '启用失败,请重新提交.</br>' + error.message, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                });
            },

            // treeSelectChanged: function (item, checked, isLeaf) {
            //     if (this.isInitTree) {
            //         return;
            //     }
            //     let itemChecked = checked;
            //     if (item.Childs && item.Childs.length > 0) {
            //         item.Childs.forEach((currentValue) => {
            //             currentValue.IsSelected = itemChecked;
            //         });
            //     }
            // },

            getSelectedItemFromModules: function (arr, modules) {
                if (modules && modules.length > 0) {
                    modules.forEach((currentValue) => {
                        if (currentValue.IsSelected) {
                            arr.push(currentValue);
                            if (currentValue.Childs && currentValue.Childs.length > 0) {
                                this.getSelectedItemFromModules(arr, currentValue.Childs);
                            }
                        }
                    });
                }
            },

        },
    }
</script>

<style scoped>
    .page-wrapper {
        min-height: calc(100vh - 64px - 50px - 81px);
    }

    .custom-tree-node {
        flex: 1;
        display: flex;
        align-items: center;
        justify-content: space-between;
        font-size: 14px;
        padding-right: 8px;
    }
</style>

<style>
    .el-tree-node__content {
        height: 40px;
    }
</style>