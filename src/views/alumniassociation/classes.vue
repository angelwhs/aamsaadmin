<template>
    <div id="pageArticleTag" class="page-wrapper">
        <v-container grid-list-xl fluid>
            <!--学校-->
                <v-card class="mx-auto mb-4">
                    <v-row class="mx-auto ">
                        <v-col cols="12" md="6">
                            <v-select hide-details :items="schoolSelector.list" item-text="Title" item-value="Id"
                                label="选择学校" v-model="schoolSelector.selectedId" @change="loadGrades"
                                class="ml-4 mr-4 mb-2"></v-select>
                        </v-col>
                        <v-col cols="12" md="6">
                            <v-select hide-details :items="gradesSelector.list" item-text="Title" item-value="Id"
                                label="选择届" v-model="gradesSelector.selectedId" clearable
                                class="ml-4 mr-4 mb-2"></v-select>
                        </v-col>
                    </v-row>
                </v-card>

            <!--查询条件-->
            <div>
                <v-card class="mx-auto">
                    <v-row class="mx-auto ">
                        <v-col cols="12" md="10" class="d-flex justify-center align-center">
                            <v-text-field class="subtitle-2 ml-4 mb-2" v-model="searchModel.searchName" label="搜索条件" 
                                placeholder="请输入搜索条件" hide-details>
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
                                    <th class="text-left">班级</th>
                                    <th class="text-left">届</th>
                                    <th class="text-left">审核状态</th>
                                    <th class="text-left">状态</th>
                                    <th class="text-left">操作</th>
                                </tr>
                            </thead>
                            <tbody>
                                <template v-if="searchResult.list && searchResult.list.length > 0">
                                    <tr v-for="item in searchResult.list" :key="item.Id">
                                        <td>{{ item.Id }}</td>
                                        <td>{{ item.Title }}</td>
                                        <td>{{ item.GradesTitle }}</td>
                                        <td>{{ getStatusName(item.Status) }}</td>
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
            <v-dialog v-model="updateDialog.isShow" persistent fullscreen hide-overlay transition="dialog-bottom-transition">
                <v-card ref="form">
                    <v-toolbar dark color="primary">
                        <v-btn icon dark @click="updateDialog.isShow = false">
                            <v-icon>mdi-close</v-icon>
                        </v-btn>
                        <v-toolbar-title>
                            <span class="headline mr-4">{{updateItem.Id === 0 ? '新建' : '编辑'}}</span>
                            <span>班级</span>
                        </v-toolbar-title>
                        <v-spacer></v-spacer>
                        <v-toolbar-items>
                            <v-btn class="title" dark text @click="saveUpdate">保存</v-btn>
                        </v-toolbar-items>
                    </v-toolbar>

                    <v-card-text>
                        <v-container>
                            <!--学校信息-->
                            <v-row>
                                <v-col v-if="schoolSelector.selectedId" cols="12" md="12">
                                    <v-expansion-panels>
                                        <v-expansion-panel>
                                            <v-expansion-panel-header>学校：{{getSchoolById(schoolSelector.selectedId).Title}}
                                            </v-expansion-panel-header>
                                            <v-expansion-panel-content>
                                                <p class="mb-1 grey--text text--darken-1">Id：{{getSchoolById(schoolSelector.selectedId).Id}}
                                                </p>
                                            </v-expansion-panel-content>
                                        </v-expansion-panel>
                                    </v-expansion-panels>
                                </v-col>
                            </v-row>

                            <!--选择届-->
                            <v-row>
                                <v-col cols="12" md="6">
                                    <v-select hide-details :items="gradesSelector.list" item-text="Title" item-value="Id"
                                        label="选择届" v-model="gradesSelector.selectedId" clearable
                                        class=" mb-2"></v-select>
                                </v-col>
                            </v-row>

                            <v-row>
                                <v-col cols="12" md="9">
                                    <v-text-field v-model="updateItem.Title" dense label="名称" placeholder="请输入名称"
                                        :rules="[() => !!updateItem.Title || '不能为空.']" :error-messages="errorMessages"
                                        ref="Entity_Title">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-select :items="statusList" dense label="审核状态" item-text="Name" item-value="Id" placeholder="请选择审核状态"
                                    v-model="updateItem.Status"></v-select>
                                </v-col>
                            </v-row>
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
                            <v-row>
                                <v-col cols="12" md="3">
                                    <v-switch v-model="updateItem.Enable" label="是否启用"></v-switch>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.DisplayOrder" label="序号" ref="DisplayOrder"
                                        :error-messages="errorMessages" type="number">
                                    </v-text-field>
                                </v-col>
                                <v-col cols="12" md="3">
                                    <v-text-field v-model="updateItem.NumberOfPeople" label="班级人数（总）" ref="NumberOfPeople"
                                        :error-messages="errorMessages" type="number">
                                    </v-text-field>
                                </v-col>
                            </v-row>
                            <v-subheader class="mt-3">届简介</v-subheader>
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
                        <p class="mb-1">名称：{{updateItem.Title}}</p>
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
                        <p class="mb-1">名称：{{updateItem.Title}}</p>
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
    import tinymce from '../../components/common/TinyMce.vue';
    import PictureSelector from '../../components/common/PictureSelector.vue';
    import { AuditStatus, GetAuditStatusName } from '../../global/globalValue.js';

    export default {
        components: {
            tinymce,
            PictureSelector,
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
                    Title: '',
                    Description: '',
                    DisplayOrder: 0,
                    Content: '',
                    ImageThumb_PictureId: 0,
                    ImageThumb_PictureUrl: '',
                    Status: 1,
                    SchoolId: 0,
                    GradesId: 0,
                    NumberOfPeople: 0,

                    Created: '',
                    SchoolTitle: '',
                    GradesTitle: '',
                    MajorId: 0,
                    MajorTitle: '',
                    
                    Students: [],
                    Teachers: [],
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

                statusList: AuditStatus,

                schoolSelector: {
                    list: [],
                    selectedId: null,
                },

                gradesSelector: {
                    list: [],
                    selectedId: null,
                },
            }
        },

        mounted() {
            this.loadSchool();

            //this.search(0);
        },

        methods: {
            search: function (pageIndex) {
                //判断是否已选择学校
                if(!this.schoolSelector.selectedId || this.schoolSelector.selectedId <= 0) {
                    this.$toast.error('请选择学校。', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    return;
                }

                this.loadingDialog.isShow = true;

                this.getAxios('/api/aa/backend/classes/list', {
                    schoolId: this.schoolSelector.selectedId ? this.schoolSelector.selectedId : 0,
                    gradesId: this.gradesSelector.selectedId ? this.gradesSelector.selectedId : 0,
                    majorId: 0,
                    searchName: this.searchModel.searchName,
                    pageIndex: pageIndex,
                    pageSize: this.searchResult.pageSize,
                }).then((data) => {
                    if (data.errorcode === 0) {
                        this.pageSetting.page = data.result.PageIndex + 1;
                        this.pageSetting.length = data.result.TotalPages;

                        this.searchResult.totalCount = data.result.TotalCount;

                        this.searchResult.list = data.result.Data;

                        //console.log(data.result.Data);
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
                this.updateItem.Title = item.Title;
                this.updateItem.Content = item.Content;
                this.updateItem.ImageThumb_PictureId = item.ImageThumb_PictureId;
                this.updateItem.DisplayOrder = item.DisplayOrder;
                this.updateItem.ImageThumb_PictureUrl = item.ImageThumb_PictureUrl;
                this.updateItem.Status = item.Status;
                this.updateItem.SchoolId = item.SchoolId;
                this.updateItem.GradesId = item.GradesId;
                this.updateItem.NumberOfPeople = item.NumberOfPeople;
                this.updateItem.Created = item.Created;
                this.updateItem.SchoolTitle = item.SchoolTitle;
                this.updateItem.GradesTitle = item.GradesTitle;
                this.updateItem.MajorId = item.MajorId;
                this.updateItem.MajorTitle = item.MajorTitle;

                this.gradesSelector.selectedId = item.GradesId;
            },

            openCreate: function () {
                this.updateItem.Id = 0;
                this.updateItem.Name = '';
                this.updateItem.Description = '';
                this.updateItem.Enable = true;
                this.updateItem.Title = '';
                this.updateItem.Content = '';
                this.updateItem.ImageThumb_PictureId = 0;
                this.updateItem.DisplayOrder = 0;
                this.updateItem.ImageThumb_PictureUrl = '';
                this.updateItem.Status = 1;
                this.updateItem.SchoolId = 0;
                this.updateItem.GradesId = 0;
                this.updateItem.NumberOfPeople = 0;
                this.updateItem.Created = '';
                this.updateItem.SchoolTitle = '';
                this.updateItem.GradesTitle = '';
                this.updateItem.MajorId = 0;
                this.updateItem.MajorTitle = '';

                this.updateDialog.isShow = true;
            },

            openEdit: function (item) {
                this.prepareUpdateItem(item);

                this.updateDialog.isShow = true;
            },

            saveUpdate: function () {
                if(!this.schoolSelector.selectedId || this.schoolSelector.selectedId <= 0) {
                    this.$toast.error('请选择学校。', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    return;
                }

                if(!this.gradesSelector.selectedId || this.gradesSelector.selectedId <= 0) {
                    this.$toast.error('请选择届。', { x:'center',  y: 'top', timeout: 3000, showClose: true, });
                    return;
                }

                this.loadingDialog.message = '正在提交数据...';
                this.loadingDialog.isShow = true;

                this.updateItem.SchoolId = this.schoolSelector.selectedId;
                this.updateItem.GradesId = this.gradesSelector.selectedId;

                if (this.updateItem.Id === 0) {
                    this.postAxios('/api/aa/backend/classes/create', JSON.stringify(this.updateItem)).then((data) => {
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
                    this.postAxios('/api/aa/backend/classes/edit', JSON.stringify(this.updateItem)).then((data) => {
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
                        this.$toast.error('新增失败,请重新提交.', { x: 'center', y: 'top', timeout: 2000, showClose: true, });
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

                this.getAxios('/api/aa/backend/classes/delete', { id: this.updateItem.Id, }).then((data) => {
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

                this.getAxios('/api/aa/backend/classes/setenable', { id: this.updateItem.Id, }).then((data) => {
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

            //封面图片选择
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
                // console.log(pictureUrlField);
                // console.log(selectItem);
                this.updateItem[pictureField] = selectItem.Id;
                this.updateItem[pictureUrlField] = selectItem.ImageUrl;
            },

            getStatusName: function(status) {
                return GetAuditStatusName(status);
            },


            //加载学校列表
            loadSchool() {
                this.schoolSelector.list = [];
                this.schoolSelector.selected = null;
                this.getAxios('/api/aa/backend/school/GetAllEnable', {
                    searchName: '',
                }).then(res => {
                    if(res.errorcode === 0) {
                        if(res.result && res.result.Data && res.result.Data.length > 0) {
                            this.schoolSelector.list = res.result.Data;
                            this.schoolSelector.selectedId = this.schoolSelector.list[0].Id;

                            this.loadGrades();
                        }
                    }
                });
            },

            getSchoolById(id) {
                if(id <= 0) { return null; }

                let school = null;

                if(this.schoolSelector.list && this.schoolSelector.list.length > 0) {
                    this.schoolSelector.list.forEach(v => {
                        if(v.Id == id) {
                            school = v;
                            return;
                        }
                    })
                }

                return school;
            },

            loadGrades() {
                if(!this.schoolSelector.selectedId || this.schoolSelector.selectedId <= 0) {
                    return;
                }

                this.gradesSelector.list = [];
                this.gradesSelector.selected = null;

                let schoolId = this.schoolSelector.selectedId;

                this.getAxios('/api/aa/backend/grades/GetAllEnable', {
                    schoolId: schoolId,
                    searchName: ''
                }).then(res => {
                    if(res.errorcode === 0) {
                        if(res.result && res.result.Data && res.result.Data.length > 0) {
                            this.gradesSelector.list = res.result.Data;
                        }
                    }
                });
            },

        },
    }
</script>

<style scoped>
</style>