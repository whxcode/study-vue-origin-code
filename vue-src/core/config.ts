// @ts-ignore
import {
    no,
    noop,
    identity
} from '../shared/util'
import { LIFECYCLE_HOOKS } from '../shared/constants'

export type Config = {
    // user
    optionsMergeStrategies: { [key: string]: Function }
    silent: boolean
    productionTip: boolean
    performance: boolean
    devtools: boolean
    errorHandler?: (err: Error,vm: any,info: string) => void
    ignoredElements: Array<string>
    keyCodes: { [key: string]: number | Array<number> }
    // platform
    isReservedTag: (x?: string) => boolean
    isReservedAttr: (x?: string) => boolean
    parsePlatformTagName: (x?: string) => string
    isUnknownElement: (x?: string) => boolean
    getTagNamespace: (x?: string) => boolean
    mustUseProp: (tag: string,name: string,type?: string) => boolean
    // legacy
    _lifecycleHooks: Array<string>
}
const config: Config = {
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
    isReservedTag: no,

    /**
     * Check if an attribute is reserved so that it cannot be used as a component
     * prop. This is platform-dependent and may be overwritten.
     */
    isReservedAttr: no,

    /**
     * Check if a tag is an unknown element.
     * Platform-dependent.
     */
    isUnknownElement: no,

    /**
     * Get the namespace of an element
     */
    getTagNamespace: noop,

    /**
     * Parse the real tag name for the specific platform.
     */
    parsePlatformTagName: identity,

    /**
     * Check if an attribute must be bound using property, e.g. value
     * Platform-dependent.
     */
    mustUseProp: no,

    /**
     * Exposed for legacy reasons
     */
    _lifecycleHooks: LIFECYCLE_HOOKS
}
export default config
