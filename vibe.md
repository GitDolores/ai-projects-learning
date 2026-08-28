根据下面的任务信息，在 src\views\xos\inner-data\sc-base.vue 文件中完成页面开发：

# 任务名称
基础字典功能开发

# 任务类型
页面开发

# 任务描述
## 前端页面
- **页面名称**: Xinnerdatabicbase
- **路由地址**: /mpa/inner-data/bic-base
- **菜单名称**: 内置字典/基础字典
- **组件结构**: BicBase
- **页面文件位置**：src/views/mpa/BicBase.vue
- **权限代码**: super,admin,org
- **交互流程**: 根据SKILL的内容以及下面接口文件中引用的数据类的结构，进行优质的设计与布局。

后端接口文件：......\Controllers\mpa\BicBaseController.cs。
类型编码由后台接口 get api/mpa/BicBaseType/list 提供，在编辑或新增时使用其作为下拉列表数据源，字段如下：
```
类别代码:base_type_code
类别名称:base_type_name
备注:remarks
```
