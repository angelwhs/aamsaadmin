<template>
    <div id="pageArticleTag" class="page-wrapper">
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
                        <v-toolbar-title class="title">查询结果</v-toolbar-title>
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
                                    <th class="text-left">COS平台</th>
                                    <th class="text-left">桶</th>
                                    <th class="text-left">区域</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ item.COSPlatform }}</td>
                                        <td>{{ item.BucketName }}</td>
                                        <td>{{ item.Region }}</td>
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
                                            <v-icon size="20" class="mr-4" @click="openEdit(item)">
                                                edit
                                            </v-icon>
                                            <v-icon size="20" color="deep-orange" @click="confirmDelete(item)">
                                                mdi-delete-forever</v-icon>
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
            <v-dialog v-model="updateDialog.isShow" persistent fullscreen hide-overlay
                transition="dialog-bottom-transition">
                <v-card ref="form">
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="updateDialog.isShow = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title>
                            <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span>
                            <span>COS云</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <!--COSPlatform-->
                            <v-row>
                                <v-col>
                                    <v-select :items="COSPlatformList" dense label="COS平台" item-text="Name"
                                        item-value="Name" placeholder="请选择COS平台" v-model="updateItem.COSPlatform">
                                    </v-select>
                                </v-col>
                            </v-row>

                            <!--SecretKey-->
                            <!--AccessKey-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.SecretKey" dense label="SecretKey"
                                        placeholder="请输入SecretKey" :error-messages="errorMessages"
                                        ref="EntitySecretKey">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.AccessKey" dense label="AccessKey"
                                        placeholder="请输入AccessKey" :error-messages="errorMessages"
                                        ref="EntityAccessKey">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--AppId-->
                            <!--Region-->
                            <!--BucketName-->
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.AppId" dense label="AppId" placeholder="请输入AppId"
                                        :error-messages="errorMessages" ref="EntityAppId">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.Region" dense label="Region"
                                        placeholder="请输入Region" :error-messages="errorMessages" ref="EntityRegion">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.BucketName" dense label="BucketName"
                                        placeholder="请输入BucketName" :error-messages="errorMessages"
                                        ref="EntityBucketName">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--Url-->
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-text-field v-model="updateItem.Url" dense label="Url" placeholder="请输入Url"
                                        :error-messages="errorMessages" ref="EntityUrl">
                                    </v-text-field>
                                </v-col>
                            </v-row>


                            <!--ConnectionTimeoutMs-->
                            <!--ReadWriteTimeoutMs-->
                            <!--DurationSecond-->
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.ConnectionTimeoutMs" label="ConnectionTimeoutMs" dense placeholder="45000"
                                        :error-messages="errorMessages" ref="EntityConnectionTimeoutMs" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.ReadWriteTimeoutMs" label="ReadWriteTimeoutMs" dense placeholder="45000"
                                        :error-messages="errorMessages" ref="EntityReadWriteTimeoutMs" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.DurationSecond" label="DurationSecond" dense placeholder="600"
                                        :error-messages="errorMessages" ref="EntityDurationSecond" type="number">
                                    </v-text-field>
                                </v-col>
                            </v-row>

                            <!--ImagesPrefix-->
                            <!--ThumbsPrefix-->
                            <!--UploadedPrefix-->
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.ImagesPrefix" dense label="ImagesPrefix" placeholder="请输入ImagesPrefix"
                                        :error-messages="errorMessages" ref="EntityImagesPrefix">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.ThumbsPrefix" dense label="ThumbsPrefix"
                                        placeholder="请输入ThumbsPrefix" :error-messages="errorMessages" ref="EntityThumbsPrefix">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-text-field v-model="updateItem.UploadedPrefix" dense label="UploadedPrefix"
                                        placeholder="请输入UploadedPrefix" :error-messages="errorMessages"
                                        ref="EntityUploadedPrefix">
                                    </v-text-field>
                                </v-col>
                            </v-row>


                            <!--IsDefault-->
                            <v-row>
                                <v-col cols="12" md="4">
                                    <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                                </v-col>
                                <v-col cols="12" md="4">
                                    <v-switch v-model="updateItem.IsDefault" label="是否默认"></v-switch>
                                </v-col>
                            </v-row>
                        </v-container>
                    </v-card-text>

                </v-card>

            </v-dialog>

            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">名称：{{updateItem.Name}}</p>
                        <p class="mb-1">描述：{{updateItem.Description}}</p>
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
                        <p class="mb-1">描述：{{updateItem.Description}}</p>
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
        components: {

        },

        data() {
            return {
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

                updateItem: {
                    Id: 0,
                    Name: '',
                    Enable: true,
                    Description: '',
                    DisplayOrder: 0,
                    COSPlatform: '',
                    SecretKey: '',
                    AccessKey: '',
                    Region: '',
                    BucketName: '',
                    Url: '',
                    AppId: '',
                    ConnectionTimeoutMs: 0,
                    ReadWriteTimeoutMs: 0,
                    ImagesPrefix: '',
                    ThumbsPrefix: '',
                    DurationSecond: 0,
                    UploadedPrefix: '',
                    IsDefault: false,
                },

                updateDialog: {
                    isShow: false,
                },

                saveLoading: false,
                errorMessages: '',
                loadingDialog: {
                    isShow: false,
                    message: '数据加载中,请稍后...',
                },
                deleteDialog: false,
                setEnableDialog: false,

                COSPlatformList: [
                    {Name: 'Tencent COS'},
                    {Name: 'Qiniu COS'},
                ],

            }
        },

        mounted() {
            this.search(0);
        },

        methods: {
            search: function (pageIndex) {
                this.loadingDialog.isShow = true;

                this.getAxios('/api/media/backend/cossettings/list', {
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchResult.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchResult.totalCount = data.result.TotalCount;

                        this.searchResult.list = data.result.Data;

                        console.log(data.result.Data);
                    } else {

                    }
                    this.loadingDialog.isShow = false;
                }).catch((error) => {

                    this.loadingDialog.isShow = false;
                });
            },

            prepareUpdateItem: function (item) {
                this.updateItem.Id = item.Id;
                this.updateItem.Name = item.Name;
                this.updateItem.Description = item.Description;
                this.updateItem.Enable = item.Enable;
                this.updateItem.COSPlatform = item.COSPlatform;
                this.updateItem.SecretKey = item.SecretKey;
                this.updateItem.AccessKey = item.AccessKey;
                this.updateItem.Region = item.Region;
                this.updateItem.BucketName = item.BucketName;
                this.updateItem.Url = item.Url;
                this.updateItem.AppId = item.AppId;
                this.updateItem.ConnectionTimeoutMs = item.ConnectionTimeoutMs;
                this.updateItem.ReadWriteTimeoutMs = item.ReadWriteTimeoutMs;
                this.updateItem.ImagesPrefix = item.ImagesPrefix;
                this.updateItem.ThumbsPrefix = item.ThumbsPrefix;
                this.updateItem.DurationSecond = item.DurationSecond;
                this.updateItem.UploadedPrefix = item.UploadedPrefix;
                this.updateItem.IsDefault = item.IsDefault;
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Description = '';
                this.updateItem.Enable = true;
                this.updateItem.COSPlatform = 'Tencent COS';
                this.updateItem.SecretKey = '';
                this.updateItem.AccessKey = '';
                this.updateItem.Region = '';
                this.updateItem.BucketName = '';
                this.updateItem.Url = '';
                this.updateItem.AppId = '';
                this.updateItem.ConnectionTimeoutMs = 45000;
                this.updateItem.ReadWriteTimeoutMs = 45000;
                this.updateItem.ImagesPrefix = 'images';
                this.updateItem.ThumbsPrefix = 'thumbs';
                this.updateItem.DurationSecond = 600;
                this.updateItem.UploadedPrefix = 'uploaded';
                this.updateItem.IsDefault = true;

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                this.prepareUpdateItem(item);

                this.updateDialog.isShow = true;
            },

            saveUpdate: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                console.log(this.updateItem);

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/media/backend/cossettings/create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.loadingDialog.isShow = false;
                            this.updateDialog.isShow = false;
                            this.$toast.success('新增成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                            this.search(0);
                        } else {
                            this.loadingDialog.isShow = false;
                            this.$toast.error('新增失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                            //console.log(data);
                        }
                    }).catch((error) => {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('新增失败,请重新提交.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    });
                } else if (this.updateItem.Id > 0) {
                    this.postAxios('/api/media/backend/cossettings/edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.loadingDialog.isShow = false;
                            this.updateDialog.isShow = false;
                            this.$toast.success('修改成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                            this.search(0);
                        } else {
                            this.loadingDialog.isShow = false;
                            this.$toast.error('修改失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        }
                    }).catch((error) => {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('修改失败,请重新提交.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    });
                } else {
                    this.loadingDialog.isShow = false;
                }
            },

            closeUpdate: function () {
                this.updateDialog.isShow = false;
            },

            confirmDelete: function (item) {
                this.prepareUpdateItem(item);
                this.deleteDialog = true;
            },

            saveDelete: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.getAxios('/api/media/backend/cossettings/delete', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.deleteDialog = false;
                        this.$toast.success('删除成功.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('删除失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error('删除失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },

            confirmSetEnable: function (item) {
                this.prepareUpdateItem(item);
                this.setEnableDialog = true;
            },

            saveSetEnable: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.getAxios('/api/media/backend/cossettings/setenable', { id: this.updateItem.Id, }).then((data) => {
                    if (data.errorcode === 0) {
                        this.loadingDialog.isShow = false;
                        this.setEnableDialog = false;
                        this.$toast.success(this.updateItem.Enable ? '禁用成功.' : '启用成功', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                        this.search(0);
                    } else {
                        this.loadingDialog.isShow = false;
                        this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + data.errormsg : '启用失败,请重新提交.</br>' + data.errormsg, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                    }
                }).catch((error) => {
                    this.loadingDialog.isShow = false;
                    this.$toast.error(this.updateItem.Enable ? '禁用失败,请重新提交.</br>' + error.message : '启用失败,请重新提交.</br>' + error.message, { x: 'center', y: 'top', timeout: 2000, showClose: true, });
                });
            },



            getStatusName: function (status) {
                return GetAuditStatusName(status);
            },

        },
    }
</script>

<style scoped>
</style>