"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
var util_1 = require("../shared/util");
var constants_1 = require("../shared/constants");
var config = {
    // 选用合并策略
    optionsMergeStrategies: Object.create(null),
    // 是否显示警告
    silent: false,
    /**
     * Show production mode tip message on boot?
     */
    productionTip: process.env.NODE_ENV !== 'production',
    /**
     * Whether to enable devtools
     */
    devtools: process.env.NODE_ENV !== 'production',
    /**
     * Whether to record perf
     */
    performance: false,
    /**
     * Error handler for watcher errors
     */
    errorHandler: null,
    /**
     * Ignore certain custom elements
     */
    ignoredElements: [],
    /**
     * Custom user key aliases for v-on
     */
    keyCodes: Object.create(null),
    /**
     * Check if a tag is reserved so that it cannot be registered as a
     * component. This is platform-dependent and may be overwritten.
     */
    isReservedTag: util_1.no,
    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: util_1.no,
    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: util_1.no,
    /**
     * Get the namespace of an element
     */
    getTagNamespace: util_1.noop,
    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: util_1.identity,
    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: util_1.no,
    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: constants_1.LIFECYCLE_HOOKS
};
exports.default = config;
