<template>
    <div id="lessonCatetory" class="page-wrapper">
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
                        <el-table fixed-header class="pl-4 pr-4" row-key="Id" :data="searchResult.list" size="small"
                            header-row-class-name="table-header-row"
                            :tree-props="{children: 'Childs', hasChildren: 'Childs.length > 0'}">
                            <el-table-column prop="Id" label="Id" align="center" min-width="60"></el-table-column>
                            <el-table-column prop="Title" label="标题"></el-table-column>
                            <el-table-column prop="DisplayOrder" label="排序" min-width="20"></el-table-column>
                            <el-table-column prop="Enable" label="状态" min-width="30">
                                <template slot-scope="scope">
                                    <v-icon size="20" v-if="!scope.row.Enable" @click="confirmSetEnable(scope.row)"
                                        color="red lighten-2">
                                        mdi-cancel
                                    </v-icon>
                                    <v-icon size="20" v-else @click="confirmSetEnable(scope.row)"
                                        color="green lighten-2">
                                        mdi-checkbox-marked-circle
                                    </v-icon>
                                </template>
                            </el-table-column>
                            <el-table-column align="left" label="操作">
                                <template slot-scope="scope">
                                    <v-icon size="20" class="mr-4" @click="openCreate(scope.row)">
                                        add_box
                                    </v-icon>
                                    <v-icon size="20" class="mr-4" @click="openEdit(scope.row)">
                                        edit
                                    </v-icon>
                                    <v-icon size="20" color="deep-orange" @click="confirmDelete(scope.row)">
                                        mdi-delete-forever</v-icon>
                                </template>
                            </el-table-column>

                        </el-table>
                    </div>


                </div>
            </div>

            <!--创建/更新-->
            <v-dialog v-model="updateDialog.isShow" persistent fullscreen hide-overlay transition="dialog-bottom-transition">
                <v-card ref="form">
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="updateDialog.isShow = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title>
                            <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span>
                            <span>知识点</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <v-row>
                                <v-col v-if="updateItem.ParentId > 0 && updateItem.ParentItem" cols="12" md="12">
                                    <v-expansion-panels>
                                        <v-expansion-panel>
                                            <v-expansion-panel-header>父节点：{{updateItem.ParentItem.FullName}}
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <p class="mb-1 grey--text text--darken-1">Id：{{updateItem.ParentItem.Id}}
                                                </p>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-text-field v-model="updateItem.Title" dense label="名称" placeholder="请输入知识点名称"
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_Title">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-text-field :value="kFullName" dense label="全名称" readonly 
                                        :error-messages="errorMessages"  ref="EntityFullName">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.DisplayOrder" label="序号" ref="DisplayOrder"
                                        :error-messages="errorMessages" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                                </v-col>
                            </v-row>

                            <!--难度(C,B,A)-->
                            <!--所占分数-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Level" label="难度(C,B,A)" ref="Level"
                                    :error-messages="errorMessages" >
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="6">
                                    <v-text-field v-model="updateItem.Score" label="所占分数" ref="Score"
                                    :error-messages="errorMessages" type="number">
                                </v-text-field>
                                </v-col>
                            </v-row>

                            <!--封面-->
                            <v-row>
                                <v-col cols="12" md="12">
                                    <v-card outlined class="pr-4 pl-4 pb-4">
                                        <v-card-title>
                                            封面
                                        </v-card-title>
                                        <template>
                                            <template
                                                v-if="updateItem.ImageThumb_PictureUrl && updateItem.ImageThumb_PictureUrl !== ''">
                                                <v-img width="100%" height="200" contain
                                                    :src="updateItem.ImageThumb_PictureUrl" aspect-ratio="1"
                                                    ref="Entity_ImageThumb_PictureUrl">
                                                </v-img>
                                            </template>
                                            <template v-else>
                                                <div class="d-flex justify-center align-center"
                                                    style="width: 100%; height: 200px;">
                                                    <span class="subtitle-1">请选择图片</span>
                                                </div>
                                            </template>
                                            <input type="hidden" v-model="updateItem.ImageThumb_PictureId"
                                                ref="Entity_ImageThumb_PictureId" />
                                            <div class="d-flex justify-center mt-2">
                                                <v-btn
                                                    @click="pictureSelectorShow('ImageThumb_PictureId', 'ImageThumb_PictureUrl')"
                                                    class="mr-12" small color="light-blue darken-1" dark>
                                                    选择图片
                                                </v-btn>
                                                <v-btn
                                                    @click="updateItem.ImageThumb_PictureId=0;updateItem.ImageThumb_PictureUrl=''"
                                                    small color="light-blue darken-1" dark>
                                                    删除图片
                                                </v-btn>
                                            </div>
                                        </template>

                                    </v-card>
                                </v-col>
                            </v-row>

                            <!--内容-->
                            <v-subheader class="mt-3">知识点详情</v-subheader>
                            <v-divider></v-divider>
                            <v-row>
                                <v-col cols="12" md="12">
                                    <tinymce ref="editor" v-model="updateItem.Content" />
                                </v-col>
                            </v-row>
                            
                        </v-container>
                    </v-card-text>
                    
                    
                </v-card>

                <!--选择图片-->
                <picture-selector :isShow="imgSelectorSetting.show" v-on:on-show-change="pictureSelectorShowChange"
                    :multiple="false" :pictureField="imgSelectorSetting.pictureField" platformName="course"
                    :pictureUrlField="imgSelectorSetting.pictureUrlField" v-on:on-confirm="pictureSelectorConfirm">
                </picture-selector>
            </v-dialog>


            <!--删除-->
            <v-dialog v-model="deleteDialog" persistent max-width="640">
                <v-card>
                    <v-card-title class="headline"><span class="red--text">警告</span></v-card-title>
                    <v-card-text>
                        <p class="mb-1 subtitle-1 font-weight-bold">是否删除该项目?</p>
                        <p class="mb-1">Id：{{updateItem.Id}}</p>
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
                        <p class="mb-1">Id：{{updateItem.Id}}</p>
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
    import PictureSelector from '../../components/common/PictureSelector.vue';
    import tinymce from '../../components/common/TinyMce.vue';

    export default {
        components: {
            PictureSelector,
            tinymce,
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
                    ParentId: 0,
                    DisplayOrder: 0,
                    Title: '',
                    FullName: '',
                    TmpFullName: '',
                    ImageThumb_PictureId: 0,
                    ImageThumb_PictureUrl: '',
                    Content: '',
                    Level: '',
                    Score: 0,

                    ParentItem: null,
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

                //图片选择控件参数
                imgSelectorSetting: {
                    show: false,
                    selectedPictures: [],
                    pictureField: '',
                    pictureUrlField: '',
                },

                
            }
        },

        mounted() {
            this.search(0);
        },

        computed: {
            kFullName: function() {
                //console.log(this.updateItem.Parent);
                if(this.updateItem.ParentId > 0 && this.updateItem.ParentItem) {
                    return this.updateItem.ParentItem.FullName + ' - ' + this.updateItem.Title;
                } else {
                    return this.updateItem.Title;
                }
            },
        },

        methods: {
            search: function (pageIndex) {

                this.loadingDialog.isShow = true;

                this.getAxios('/api/course/backend/knowledgepoints/list', {
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchResult.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchResult.totalCount = data.result.TotalCount;

                        this.searchResult.list = data.result.Data;
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
                this.updateItem.Enable = item.Enable;
                this.updateItem.Description = item.Description;
                this.updateItem.ParentId = item.ParentId;
                this.updateItem.DisplayOrder = item.DisplayOrder;
                this.updateItem.Title = item.Title;
                this.updateItem.FullName = item.FullName;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.ImageThumb_PictureUrl =item.ImageThumb_PictureUrl;
                this.updateItem.Content = item.Content;
                this.updateItem.Level = item.Level;
                this.updateItem.Score = item.Score;
            },

            openCreate: function (item) {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Enable = true;
                this.updateItem.Description = '';
                this.updateItem.ParentId = 0;
                this.updateItem.DisplayOrder = 1;
                this.updateItem.Title = '';
                this.updateItem.FullName = '';
                //this.updateItem.TmpFullName = '';
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.Content = '';
                this.updateItem.Level = '';
                this.updateItem.Score = 0;

                if (item) {
                    this.updateItem.ParentItem = item;
                    this.updateItem.ParentId = item.Id;
                } else {
                    this.updateItem.ParentItem = null;
                    this.updateItem.ParentId = 0;
                }

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                this.prepareUpdateItem(item);

                if (item.ParentId > 0) {
                    let parent = this.getParentNode(this.searchResult.list, item.ParentId);
                    if (parent) {
                        this.updateItem.ParentItem = parent;
                    } else {
                        this.updateItem.ParentItem = null;
                    }
                } else {
                    this.updateItem.ParentItem = null;
                }

                this.updateDialog.isShow = true;
            },

            getParentNode: function (treelist, parentId) {
                let result = null

                for (let i = 0; i < treelist.length; i++) {
                    let obj = treelist[i];
                    if (obj && obj.Id === parentId) {
                        return obj;
                    } else {
                        if (obj.Childs && obj.Childs.length > 0) {
                            result = this.getParentNode(obj.Childs, parentId);
                            if (result) {
                                break;
                            }
                        } else {
                            continue;
                        }
                    }
                }

                return result;
            },

            saveUpdate: function () {
                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                if (this.updateItem.ParentItem) {
                    this.updateItem.ParentItem = null;
                }

                if(this.pageLayout) {
                    this.updateItem.PageLayoutId = this.pageLayout.Id;
                }

                this.updateItem.FullName = this.$refs.EntityFullName.value;

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/course/backend/knowledgepoints/create', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.loadingDialog.isShow = false;
                            this.updateDialog.isShow = false;
                            this.$toast.success('新增成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                            this.search(0);
                        } else {
                            this.loadingDialog.isShow = false;
                            this.$toast.error('新增失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                            //console.log(data);
                        }
                    }).catch((error) => {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('新增失败,请重新提交.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                    });
                } else if (this.updateItem.Id > 0) {
                    this.postAxios('/api/course/backend/knowledgepoints/edit', JSON.stringify(this.updateItem)).then((data) => {
                        if (data.errorcode === 0) {
                            this.loadingDialog.isShow = false;
                            this.updateDialog.isShow = false;
                            this.$toast.success('修改成功.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                            this.search(0);
                        } else {
                            this.loadingDialog.isShow = false;
                            this.$toast.error('修改失败,请重新提交.</br>' + data.errormsg, { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
                        }
                    }).catch((error) => {
                        this.loadingDialog.isShow = false;
                        this.$toast.error('新增失败,请重新提交.', { x: 'right', y: 'bottom', timeout: 2000, showClose: true, });
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

                this.getAxios('/api/course/backend/knowledgepoints/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/course/backend/knowledgepoints/setenable', { id: this.updateItem.Id, }).then((data) => {
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

            //封面图片选择 Begin
            pictureSelectorShowChange: function (val) {
                this.imgSelectorSetting.show = val;
            },

            pictureSelectorShow: function (pictureField, pictureUrlField) {
                this.imgSelectorSetting.pictureField = pictureField;
                this.imgSelectorSetting.pictureUrlField = pictureUrlField;
                this.imgSelectorSetting.show = true;
            },

            pictureSelectorConfirm: function (selectedItems, pictureField, pictureUrlField) {
                if (!pictureField || pictureField === '' || !pictureUrlField || pictureUrlField === '') {
                    return;
                }
                let selectItem = selectedItems[0];
                this.updateItem[pictureField] = selectItem.Id;
                this.updateItem[pictureUrlField] = selectItem.ImageUrl;
            },
            //封面图片选择 End

        },
    }
</script>

<style scoped>

</style>