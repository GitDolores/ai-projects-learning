export default [
    {
        path: '/profile',
        redirect: '/profile/userinfo',
        meta: {
            icon: 'ep/user',
            title: '基本设置',
            rank: 1,
        },
        children: [
            {
                path: '/profile/userinfo',
                name: 'Xprofileuserinfo',
                component: 'mpa/profile/userinfo.vue',
                meta: {
                    icon: 'ep/user',
                    title: '个人信息',
                },
            },
        ],
    },
    {
        path: '/org',
        func_code: ['org', 'super'],
        redirect: 'mpa/org',
        meta: {
            icon: 'ep/office-building',
            title: '组织机构',
            rank: 2,
        },
        children: [
            {
                path: '/org/org',
                func_code: ['org', 'super'],
                name: 'Xorgorg',
                component: 'mpa/org/org.vue',
                meta: {
                    icon: 'ep/office-building',
                    title: '组织机构',
                },
            },
            {
                path: '/org/position',
                func_code: ['org', 'super'],
                name: 'Xorgposition',
                component: 'mpa/org/position.vue',
                meta: {
                    icon: 'ep/medal',
                    title: '职位维护',
                },
            },
        ],
    },
    {
        path: '/super',
        func_code: ['super'],
        redirect: 'mpa/super',
        meta: {
            icon: 'ep/key',
            title: '超级管理',
            rank: 3,
        },
        children: [
            {
                path: '/super/func',
                func_code: ['super'],
                name: 'Xsuperfunc',
                component: 'mpa/super/func.vue',
                meta: {
                    icon: 'ep/lock',
                    title: '权限管理',
                },
            },
            {
                path: '/super/menu',
                func_code: ['super'],
                name: 'Xsupermenu',
                component: 'mpa/super/menu.vue',
                meta: {
                    icon: 'ep/menu',
                    title: '菜单管理',
                },
            },
            {
                path: '/super/apis',
                func_code: ['super'],
                name: 'Xsuperapis',
                component: 'mpa/super/apis.vue',
                meta: {
                    icon: 'ep/connection',
                    title: '接口管理',
                },
            },
            {
                path: '/super/alluser',
                func_code: ['super'],
                name: 'Xsuperalluser',
                component: 'mpa/super/alluser.vue',
                meta: {
                    icon: 'ep/user',
                    title: '全用户查看',
                },
            },
            {
                path: '/super/company',
                func_code: ['super'],
                name: 'Xsupercompany',
                component: 'mpa/super/company.vue',
                meta: {
                    icon: 'ep/office-building',
                    title: '企业管理',
                },
            },
            {
                path: '/super/cmpconfig',
                func_code: ['super'],
                name: 'Xsupercmpconfig',
                component: 'mpa/super/cmpconfig.vue',
                meta: {
                    icon: 'ep/setting',
                    title: '企业配置',
                },
            },
            {
                path: '/super/outerproject',
                func_code: ['super'],
                name: 'Xsuperouterproject',
                component: 'mpa/super/outerproject.vue',
                meta: {
                    icon: 'ep/folder',
                    title: '外部项目',
                },
            },
            {
                path: '/super/outercompany',
                func_code: ['super'],
                name: 'Xsuperoutercompany',
                component: 'mpa/super/outercompany.vue',
                meta: {
                    icon: 'ep/tickets',
                    title: '外部企业',
                },
            },
            {
                path: '/super/outerrole',
                func_code: ['super'],
                name: 'Xsuperouterrole',
                component: 'mpa/super/outerrole.vue',
                meta: {
                    icon: 'ep/coordinate',
                    title: '外部角色',
                },
            },
            {
                path: '/super/third',
                func_code: ['super'],
                name: 'Xsuperthird',
                component: 'mpa/super/third.vue',
                meta: {
                    icon: 'ep/link',
                    title: '接入用户',
                },
            },
            {
                path: '/network-check',
                func_code: ['super'],
                name: 'NetworkCheck',
                component: 'mpa/super/network-check.vue',
                meta: {
                    icon: 'ep/monitor',
                    title: '网络检查',
                },
            },
        ],
    },
    {
        path: '/admin',
        func_code: ['admin'],
        redirect: '/admin',
        meta: {
            icon: 'ep/user-filled',
            title: '管理员',
            rank: 4,
        },
        children: [
            {
                path: '/admin/user',
                func_code: ['admin'],
                name: 'MpaAdminUser',
                component: 'mpa/admin/user.vue',
                meta: {
                    icon: 'ep/user',
                    title: '用户管理',
                },
            },
            {
                path: '/admin/role',
                func_code: ['admin'],
                name: 'MpaAdminRole',
                component: 'mpa/admin/role.vue',
                meta: {
                    icon: 'ep/coordinate',
                    title: '角色管理',
                },
            },
            {
                path: '/admin/cmpchain',
                func_code: ['admin'],
                name: 'MpaAdminCmpChain',
                component: 'mpa/admin/cmpchain.vue',
                meta: {
                    icon: 'ep/tickets',
                    title: '企业从属管理',
                },
            },
            {
                path: '/admin/sys-log',
                func_code: ['super', 'admin'],
                name: 'SysLog',
                component: 'mpa/admin/sys-log.vue',
                meta: {
                    icon: 'ri/file-ppt-2-line',
                    title: '系统日志',
                },
            },
        ],
    },
    {
        path: '/superjob',
        name: 'SuperJob',
        redirect: '/superjob/dashboard',
        meta: {
            icon: 'ep/alarm-clock',
            title: '协同任务',
            rank: 5,
        },
        children: [
            {
                path: '/superjob/dashboard',
                name: 'SuperJobDashboard',
                component: '/views/mpa/superjob/Dashboard.vue',
                meta: {
                    icon: 'ep/monitor',
                    title: '任务看板',
                },
            },
            {
                path: '/superjob/status',
                name: 'SuperJobStatus',
                component: '/views/mpa/superjob/StatusList.vue',
                meta: {
                    icon: 'ep/list',
                    title: '任务状态',
                },
            },
            {
                path: '/superjob/log',
                name: 'SuperJobLog',
                component: '/views/mpa/superjob/LogList.vue',
                meta: {
                    icon: 'ep/document',
                    title: '任务日志',
                },
            },
            {
                path: '/superjob/config',
                name: 'SuperJobConfig',
                component: '/views/mpa/superjob/ConfigList.vue',
                meta: {
                    icon: 'ep/setting',
                    title: '任务配置',
                },
            },
        ],
    },
]
