"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LIFECYCLE_HOOKS = exports.ASSET_TYPES = exports.SSR_ATTR = void 0;
//是否位服务端渲染
exports.SSR_ATTR = 'data-server-rendered';
// 选项/资源 集合
exports.ASSET_TYPES = ['component', 'directive', 'filter'];
// 钩子函数集合
exports.LIFECYCLE_HOOKS = [
    'beforeCreate',
    'created',
    'beforeMount',
    'mounted',
    'beforeUpdate',
    'updated',
    'beforeDestroy',
    'destroyed',
    'activated',
    'deactivated'
];
